import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { io } from "socket.io-client";
import { createApp } from "../app.mjs";
test("accounts, private projects, durable messages and consent-gated call signaling", async (t) => {
  const instance = createApp({ database: ":memory:", serveStatic: false });
  await new Promise((r) => instance.http.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${instance.http.address().port}`;
  t.after(() => instance.close());
  const request = async (path, body, token, method) => {
    const r = await fetch(base + "/api" + path, {
      method: method || (body ? "POST" : "GET"),
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { status: r.status, data: r.status === 204 ? null : await r.json() };
  };
  const register = async (role, name) => {
    const result = await request("/auth/register", {
      name,
      email: `${name}@example.com`,
      password: "test-password-12345",
      role,
      ...(role === "pro"
        ? {
            business: "Test Plumbing",
            category: "Plumbing",
            zip: "10001",
            rate: 80,
            bio: "Fixing leaks and fixtures.",
          }
        : {}),
    });
    assert.equal(result.status, 201);
    return result.data;
  };
  const customer = await register("customer", "Customer"),
    pro = await register("pro", "Professional"),
    stranger = await register("customer", "Stranger");
  await t.test("validates auth and rejects weak passwords", async () => {
    assert.equal(
      (
        await request("/auth/register", {
          name: "Bad",
          email: "bad@example.com",
          password: "123",
          role: "customer",
        })
      ).status,
      400,
    );
    assert.equal((await request("/me")).status, 401);
    assert.equal(
      (
        await request("/auth/login", {
          email: "Customer@example.com",
          password: "wrong-password",
        })
      ).status,
      401,
    );
    assert.equal(
      (
        await request("/auth/login", {
          email: "Customer@example.com",
          password: "test-password-12345",
        })
      ).status,
      200,
    );
    const listing = await request("/pros");
    assert.equal(listing.data.length, 1);
    assert.equal(listing.data[0].password, undefined);
  });
  let project, conversation;
  await t.test(
    "enforces project participants and status transitions",
    async () => {
      const result = await request(
        "/projects",
        {
          title: "Fix faucet",
          description: "The kitchen faucet has been dripping.",
          category: "Plumbing",
          zip: "10001",
          pro_id: pro.user.id,
        },
        customer.token,
      );
      assert.equal(result.status, 201);
      project = result.data;
      assert.equal(
        (await request("/conversations", null, pro.token)).data.length,
        1,
      );
      assert.equal(
        (await request("/projects", null, stranger.token)).data.length,
        0,
      );
      assert.equal(
        (
          await request(
            `/projects/${project.id}`,
            { status: "accepted" },
            customer.token,
            "PATCH",
          )
        ).status,
        409,
      );
      assert.equal(
        (
          await request(
            `/projects/${project.id}`,
            { status: "accepted" },
            stranger.token,
            "PATCH",
          )
        ).status,
        404,
      );
      assert.equal(
        (
          await request(
            `/projects/${project.id}`,
            { status: "completed" },
            pro.token,
            "PATCH",
          )
        ).status,
        409,
      );
      assert.equal(
        (
          await request(
            `/projects/${project.id}`,
            { status: "accepted" },
            pro.token,
            "PATCH",
          )
        ).status,
        200,
      );
      assert.equal(
        (
          await request(
            `/projects/${project.id}`,
            { status: "completed" },
            pro.token,
            "PATCH",
          )
        ).status,
        200,
      );
      assert.equal(
        (
          await request(
            `/projects/${project.id}`,
            { status: "cancelled" },
            customer.token,
            "PATCH",
          )
        ).status,
        409,
      );
    },
  );
  await t.test("keeps conversations private and idempotent", async () => {
    conversation = (
      await request("/conversations", { pro_id: pro.user.id }, customer.token)
    ).data;
    assert.equal(
      (await request("/conversations", { pro_id: pro.user.id }, customer.token))
        .data.id,
      conversation.id,
    );
    assert.equal(
      (
        await request(
          `/conversations/${conversation.id}/messages`,
          null,
          stranger.token,
        )
      ).status,
      404,
    );
    assert.equal(
      (
        await request(
          `/conversations/${conversation.id}/messages`,
          { body: "Sneaking in" },
          stranger.token,
        )
      ).status,
      404,
    );
    assert.equal(
      (
        await request(
          `/conversations/${conversation.id}/messages`,
          { body: "   " },
          customer.token,
        )
      ).status,
      400,
    );
  });
  const connect = async (token) => {
    const socket = io(base, {
      auth: { token },
      transports: ["websocket"],
      reconnection: false,
    });
    await new Promise((resolve, reject) => {
      socket.once("connect", resolve);
      socket.once("connect_error", reject);
    });
    t.after(() => socket.disconnect());
    return socket;
  };
  const cs = await connect(customer.token),
    ps = await connect(pro.token),
    ss = await connect(stranger.token);
  const signal = (s, data) =>
    new Promise((resolve, reject) =>
      s
        .timeout(2000)
        .emit("signal", data, (err, result) =>
          err ? reject(err) : resolve(result),
        ),
    );
  await t.test(
    "delivers realtime messages and persists readable history",
    async () => {
      const received = new Promise((resolve) => ps.once("message", resolve));
      const result = await request(
        `/conversations/${conversation.id}/messages`,
        { body: "Hello! Can you help with a faucet?" },
        customer.token,
      );
      assert.equal(result.status, 201);
      assert.equal((await received).body, result.data.body);
      assert.equal(
        (
          await request(
            `/conversations/${conversation.id}/messages`,
            null,
            pro.token,
          )
        ).data[0].body,
        result.data.body,
      );
      assert.equal(
        (await request("/conversations", null, pro.token)).data[0].name,
        "Customer",
      );
    },
  );
  await t.test(
    "requires membership and recipient consent for calls",
    async () => {
      const call = {
        callId: randomUUID(),
        conversationId: conversation.id,
        video: true,
      };
      assert.ok((await signal(ss, { ...call, type: "invite" })).error);
      assert.deepEqual(await signal(cs, { ...call, type: "invite" }), {
        ok: true,
      });
      assert.ok(
        (
          await signal(cs, {
            ...call,
            type: "offer",
            data: { type: "offer", sdp: "test" },
          })
        ).error,
      );
      assert.ok((await signal(cs, { ...call, type: "accept" })).error);
      assert.deepEqual(await signal(ps, { ...call, type: "accept" }), {
        ok: true,
      });
      const received = new Promise((resolve) => ps.once("signal", resolve));
      assert.deepEqual(
        await signal(cs, {
          ...call,
          type: "offer",
          data: { type: "offer", sdp: "test" },
        }),
        { ok: true },
      );
      assert.equal((await received).type, "offer");
      assert.deepEqual(await signal(ps, { ...call, type: "end" }), {
        ok: true,
      });
      assert.ok(
        (
          await signal(cs, {
            ...call,
            type: "ice",
            data: { candidate: "test" },
          })
        ).error,
      );
    },
  );
  await t.test("logout revokes the session", async () => {
    assert.equal(
      (await request("/auth/logout", {}, customer.token)).status,
      204,
    );
    assert.equal((await request("/me", null, customer.token)).status, 401);
  });
});
