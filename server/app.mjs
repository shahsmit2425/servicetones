import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { Server } from "socket.io";
import { createServer } from "node:http";
import { DatabaseSync } from "node:sqlite";
import {
  randomBytes,
  randomUUID,
  scrypt as scryptCallback,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { promisify } from "node:util";
import { z } from "zod";
import path from "node:path";
const scrypt = promisify(scryptCallback);
const categories = [
  "Handyman",
  "Cleaning",
  "Plumbing",
  "Electrical",
  "Painting",
  "Landscaping",
];
const id = () => randomUUID(),
  now = () => new Date().toISOString();
const hashToken = (t) => createHash("sha256").update(t).digest("hex");
export function createApp({
  database = "servicetones.sqlite",
  origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "capacitor://localhost",
    "https://localhost",
  ],
  serveStatic = true,
} = {}) {
  const db = new DatabaseSync(database);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
 CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,password TEXT NOT NULL,role TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id TEXT REFERENCES users(id),expires INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS profiles(id TEXT PRIMARY KEY REFERENCES users(id),business TEXT NOT NULL,category TEXT NOT NULL,bio TEXT NOT NULL,zip TEXT NOT NULL,rate REAL NOT NULL);
 CREATE TABLE IF NOT EXISTS projects(id TEXT PRIMARY KEY,customer_id TEXT REFERENCES users(id),pro_id TEXT REFERENCES users(id),title TEXT NOT NULL,category TEXT NOT NULL,description TEXT NOT NULL,zip TEXT NOT NULL,status TEXT NOT NULL,created_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS conversations(id TEXT PRIMARY KEY,customer_id TEXT REFERENCES users(id),pro_id TEXT REFERENCES users(id),updated_at TEXT NOT NULL,UNIQUE(customer_id,pro_id));
 CREATE TABLE IF NOT EXISTS messages(id TEXT PRIMARY KEY,conversation_id TEXT REFERENCES conversations(id),sender_id TEXT REFERENCES users(id),body TEXT NOT NULL,created_at TEXT NOT NULL);
 CREATE INDEX IF NOT EXISTS message_thread ON messages(conversation_id,created_at);`);
  const app = express(),
    http = createServer(app);
  const origin = (o, cb) => cb(null, !o || origins.includes(o));
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          "connect-src": [
            "'self'",
            ...origins.filter((x) => /^https?:/.test(x)),
          ],
          "img-src": ["'self'", "data:", "https:"],
          "media-src": ["'self'", "blob:"],
        },
      },
    }),
  );
  app.use(cors({ origin }));
  app.use(express.json({ limit: "32kb" }));
  app.use(
    "/api",
    rateLimit({
      windowMs: 60000,
      limit: 180,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  );
  const io = new Server(http, { cors: { origin }, maxHttpBufferSize: 32768 });
  const safeUser = (u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
  });
  const getUser = (t) =>
    typeof t === "string"
      ? db
          .prepare(
            "SELECT u.*,s.expires FROM users u JOIN sessions s ON u.id=s.user_id WHERE s.token=? AND s.expires>?",
          )
          .get(hashToken(t), Date.now())
      : null;
  const auth = (req, res, next) => {
    req.user = getUser(req.headers.authorization?.replace(/^Bearer /, ""));
    if (!req.user)
      return res.status(401).json({ error: "Please sign in to continue." });
    next();
  };
  const member = (cid, uid) =>
    db
      .prepare(
        "SELECT * FROM conversations WHERE id=? AND (customer_id=? OR pro_id=?)",
      )
      .get(cid, uid, uid);
  const fail = (status, message) => {
    throw Object.assign(new Error(message), { status });
  };
  const parse = (schema, data) => {
    const r = schema.safeParse(data);
    if (!r.success) fail(400, r.error.issues[0].message);
    return r.data;
  };
  const text = (min, max) => z.string().trim().min(min).max(max);
  const zip = z.string().regex(/^\d{5}$/, "Enter a five-digit ZIP code.");
  const session = (u) => {
    const token = randomBytes(32).toString("hex");
    db.prepare("DELETE FROM sessions WHERE expires<=?").run(Date.now());
    db.prepare("INSERT INTO sessions VALUES(?,?,?)").run(
      hashToken(token),
      u.id,
      Date.now() + 86400000,
    );
    return { token, user: safeUser(u) };
  };
  const loginLimiter = rateLimit({
    windowMs: 900000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  });
  app.get("/api/health", (_q, r) => r.json({ ok: true }));
  app.post("/api/auth/register", loginLimiter, async (q, r, next) => {
    try {
      const a = parse(
        z.object({
          name: text(2, 80),
          email: z
            .string()
            .email()
            .max(254)
            .transform((x) => x.toLowerCase()),
          password: z.string().min(12).max(128),
          role: z.enum(["customer", "pro"]),
          business: text(2, 100).optional(),
          category: z.enum(categories).optional(),
          bio: text(0, 1000).optional(),
          zip: zip.optional(),
          rate: z.number().min(1).max(10000).optional(),
        }),
        q.body,
      );
      if (a.role === "pro" && (!a.business || !a.category || !a.zip || !a.rate))
        fail(400, "Complete your professional profile.");
      const salt = randomBytes(16).toString("hex"),
        key = await scrypt(a.password, salt, 64),
        uid = id();
      db.exec("BEGIN");
      try {
        db.prepare("INSERT INTO users VALUES(?,?,?,?,?)").run(
          uid,
          a.name,
          a.email,
          `${salt}:${key.toString("hex")}`,
          a.role,
        );
        if (a.role === "pro")
          db.prepare("INSERT INTO profiles VALUES(?,?,?,?,?,?)").run(
            uid,
            a.business,
            a.category,
            a.bio || "",
            a.zip,
            a.rate,
          );
        db.exec("COMMIT");
      } catch (e) {
        db.exec("ROLLBACK");
        if (String(e).includes("UNIQUE"))
          fail(409, "An account already uses this email.");
        throw e;
      }
      r.status(201).json(session({ id: uid, ...a }));
    } catch (e) {
      next(e);
    }
  });
  app.post("/api/auth/login", loginLimiter, async (q, r, next) => {
    try {
      const a = parse(
        z.object({
          email: z
            .string()
            .email()
            .transform((x) => x.toLowerCase()),
          password: z.string().min(1).max(128),
        }),
        q.body,
      );
      const u = db.prepare("SELECT * FROM users WHERE email=?").get(a.email);
      const [salt, stored] = (
        u?.password || `${"0".repeat(32)}:${"0".repeat(128)}`
      ).split(":");
      const key = await scrypt(a.password, salt, 64);
      if (!u || !timingSafeEqual(key, Buffer.from(stored, "hex")))
        fail(401, "Email or password is incorrect.");
      r.json(session(u));
    } catch (e) {
      next(e);
    }
  });
  app.get("/api/me", auth, (q, r) => r.json(safeUser(q.user)));
  app.post("/api/auth/logout", auth, (q, r) => {
    db.prepare("DELETE FROM sessions WHERE token=?").run(
      hashToken(q.headers.authorization.replace(/^Bearer /, "")),
    );
    for (const s of io.sockets.sockets.values())
      if (s.data.token === q.headers.authorization.replace(/^Bearer /, ""))
        s.disconnect(true);
    r.sendStatus(204);
  });
  app.get("/api/pros", (q, r) => {
    const category =
      typeof q.query.category === "string" ? q.query.category : "";
    r.json(
      db
        .prepare(
          "SELECT p.*,u.name,0 AS rating,0 AS reviews FROM profiles p JOIN users u ON u.id=p.id WHERE (?='' OR category=?) ORDER BY business",
        )
        .all(category, category),
    );
  });
  app.get("/api/projects", auth, (q, r) =>
    r.json(
      db
        .prepare(
          "SELECT * FROM projects WHERE customer_id=? OR pro_id=? ORDER BY created_at DESC",
        )
        .all(q.user.id, q.user.id),
    ),
  );
  app.post("/api/projects", auth, (q, r) => {
    if (q.user.role !== "customer")
      fail(403, "Only customers can request a project.");
    const a = parse(
      z.object({
        title: text(4, 100),
        description: text(10, 3000),
        category: z.enum(categories),
        zip,
        pro_id: z.string().uuid().nullable().optional(),
      }),
      q.body,
    );
    if (
      a.pro_id &&
      !db.prepare("SELECT id FROM profiles WHERE id=?").get(a.pro_id)
    )
      fail(404, "Professional not found.");
    const p = {
      id: id(),
      customer_id: q.user.id,
      pro_id: a.pro_id || null,
      title: a.title,
      category: a.category,
      description: a.description,
      zip: a.zip,
      status: "requested",
      created_at: now(),
    };
    db.prepare("INSERT INTO projects VALUES(?,?,?,?,?,?,?,?,?)").run(
      ...Object.values(p),
    );
    if (p.pro_id) {
      db.prepare("INSERT OR IGNORE INTO conversations VALUES(?,?,?,?)").run(
        id(),
        p.customer_id,
        p.pro_id,
        now(),
      );
      io.to(p.pro_id).emit("project", p);
    }
    r.status(201).json(p);
  });
  app.patch("/api/projects/:id", auth, (q, r) => {
    const p = db
      .prepare(
        "SELECT * FROM projects WHERE id=? AND (customer_id=? OR pro_id=?)",
      )
      .get(q.params.id, q.user.id, q.user.id);
    if (!p) fail(404, "Project not found.");
    const { status } = parse(
      z.object({ status: z.enum(["accepted", "completed", "cancelled"]) }),
      q.body,
    );
    const allowed =
      status === "cancelled"
        ? q.user.id === p.customer_id &&
          p.status !== "completed" &&
          p.status !== "cancelled"
        : q.user.id === p.pro_id &&
          ((status === "accepted" && p.status === "requested") ||
            (status === "completed" && p.status === "accepted"));
    if (!allowed) fail(409, "This project cannot make that status change.");
    db.prepare("UPDATE projects SET status=? WHERE id=?").run(status, p.id);
    io.to(p.customer_id)
      .to(p.pro_id || "")
      .emit("project", { ...p, status });
    r.json({ ...p, status });
  });
  app.get("/api/conversations", auth, (q, r) =>
    r.json(
      db
        .prepare(
          `SELECT c.*,u.name,(SELECT body FROM messages WHERE conversation_id=c.id ORDER BY rowid DESC LIMIT 1) AS last_message FROM conversations c JOIN users u ON u.id=CASE WHEN c.customer_id=? THEN c.pro_id ELSE c.customer_id END WHERE c.customer_id=? OR c.pro_id=? ORDER BY c.updated_at DESC`,
        )
        .all(q.user.id, q.user.id, q.user.id),
    ),
  );
  app.patch("/api/projects/:id/pro", auth, (q, r) => {
    const p = db
      .prepare("SELECT * FROM projects WHERE id=? AND customer_id=?")
      .get(q.params.id, q.user.id);
    if (!p) fail(404, "Project not found.");
    if (p.status !== "requested" || p.pro_id)
      fail(409, "This project already has a professional or is closed.");
    const { pro_id } = parse(z.object({ pro_id: z.string().uuid() }), q.body);
    const pro = db.prepare("SELECT * FROM profiles WHERE id=?").get(pro_id);
    if (!pro || pro.category !== p.category)
      fail(400, "Choose a professional for this service.");
    db.prepare("UPDATE projects SET pro_id=? WHERE id=?").run(pro_id, p.id);
    db.prepare("INSERT OR IGNORE INTO conversations VALUES(?,?,?,?)").run(
      id(),
      p.customer_id,
      pro_id,
      now(),
    );
    io.to(pro_id).emit("project", { ...p, pro_id });
    r.json({ ...p, pro_id });
  });
  app.post("/api/conversations", auth, (q, r) => {
    if (q.user.role !== "customer")
      fail(403, "Customers start new conversations.");
    const { pro_id } = parse(z.object({ pro_id: z.string().uuid() }), q.body);
    if (!db.prepare("SELECT id FROM profiles WHERE id=?").get(pro_id))
      fail(404, "Professional not found.");
    db.prepare("INSERT OR IGNORE INTO conversations VALUES(?,?,?,?)").run(
      id(),
      q.user.id,
      pro_id,
      now(),
    );
    const c = db
      .prepare("SELECT * FROM conversations WHERE customer_id=? AND pro_id=?")
      .get(q.user.id, pro_id);
    io.to(pro_id).emit("conversation", c);
    r.json(c);
  });
  app.get("/api/conversations/:id/messages", auth, (q, r) => {
    if (!member(q.params.id, q.user.id)) fail(404, "Conversation not found.");
    r.json(
      db
        .prepare(
          "SELECT * FROM (SELECT rowid,* FROM messages WHERE conversation_id=? ORDER BY rowid DESC LIMIT 200) ORDER BY rowid",
        )
        .all(q.params.id),
    );
  });
  app.post("/api/conversations/:id/messages", auth, (q, r) => {
    const c = member(q.params.id, q.user.id);
    if (!c) fail(404, "Conversation not found.");
    const { body } = parse(z.object({ body: text(1, 4000) }), q.body);
    const m = {
      id: id(),
      conversation_id: c.id,
      sender_id: q.user.id,
      body,
      created_at: now(),
    };
    db.prepare("INSERT INTO messages VALUES(?,?,?,?,?)").run(
      ...Object.values(m),
    );
    db.prepare("UPDATE conversations SET updated_at=? WHERE id=?").run(
      m.created_at,
      c.id,
    );
    io.to(c.customer_id).to(c.pro_id).emit("message", m);
    r.status(201).json(m);
  });
  app.get("/api/ice", auth, (_q, r) => {
    const servers = [{ urls: "stun:stun.l.google.com:19302" }];
    if (process.env.TURN_URL && process.env.TURN_SECRET) {
      const username = `${Math.floor(Date.now() / 1000) + 3600}:servicetones`;
      import("node:crypto").then(({ createHmac }) => {
        servers.push({
          urls: process.env.TURN_URL,
          username,
          credential: createHmac("sha1", process.env.TURN_SECRET)
            .update(username)
            .digest("base64"),
        });
        r.json(servers);
      });
    } else r.json(servers);
  });
  const calls = new Map();
  io.use((s, next) => {
    const u = getUser(s.handshake.auth.token);
    if (!u) return next(new Error("Please sign in."));
    s.data.user = u;
    s.data.token = s.handshake.auth.token;
    next();
  });
  io.on("connection", (s) => {
    const u = s.data.user;
    s.join(u.id);
    s.use((_packet, next) =>
      getUser(s.data.token) ? next() : next(new Error("Session expired.")),
    );
    let count = 0,
      start = Date.now();
    s.on("signal", (raw, ack = () => {}) => {
      try {
        if (Date.now() - start > 60000) {
          start = Date.now();
          count = 0;
        }
        if (++count > 180) fail(429, "Too many call events.");
        const a = parse(
          z.object({
            conversationId: z.string().uuid(),
            callId: z.string().uuid(),
            type: z.enum([
              "invite",
              "accept",
              "reject",
              "offer",
              "answer",
              "ice",
              "end",
            ]),
            video: z.boolean().optional(),
            data: z.unknown().optional(),
          }),
          raw,
        );
        const c = member(a.conversationId, u.id);
        if (!c) fail(403, "Not a conversation member.");
        const peer = c.customer_id === u.id ? c.pro_id : c.customer_id;
        if (a.type === "invite") {
          if (calls.has(a.callId)) fail(409, "Call ID is already in use.");
          if (
            [...calls.values()].some(
              (x) =>
                [x.caller, x.peer].includes(u.id) ||
                [x.caller, x.peer].includes(peer),
            )
          )
            fail(409, "One participant is already on a call.");
          if (!io.sockets.adapter.rooms.get(peer)?.size)
            fail(409, "This person is offline.");
          calls.set(a.callId, {
            caller: u.id,
            peer,
            conversationId: c.id,
            accepted: false,
            expires: Date.now() + 60000,
          });
        } else {
          const call = calls.get(a.callId);
          if (!call || call.conversationId !== c.id)
            fail(409, "Call has ended.");
          if (a.type === "accept") {
            if (u.id !== call.peer || call.accepted)
              fail(403, "Only the recipient can accept.");
            call.accepted = true;
            call.expires = Date.now() + 14400000;
          }
          if (["offer", "answer", "ice"].includes(a.type) && !call.accepted)
            fail(403, "Accept the call first.");
          if (a.type === "end" || a.type === "reject") calls.delete(a.callId);
        }
        io.to(peer).emit("signal", { ...a, from: u.id, name: u.name });
        ack({ ok: true });
      } catch (e) {
        ack({ error: e.message });
      }
    });
    s.on("disconnect", () => {
      for (const [cid, c] of calls)
        if (c.caller === u.id || c.peer === u.id) {
          io.to(c.caller === u.id ? c.peer : c.caller).emit("signal", {
            type: "end",
            callId: cid,
            conversationId: c.conversationId,
          });
          calls.delete(cid);
        }
    });
  });
  const timer = setInterval(() => {
    for (const s of io.sockets.sockets.values())
      if (!getUser(s.data.token)) s.disconnect(true);
    for (const [cid, c] of calls)
      if (c.expires < Date.now()) {
        io.to(c.caller).to(c.peer).emit("signal", {
          type: "end",
          callId: cid,
          conversationId: c.conversationId,
        });
        calls.delete(cid);
      }
  }, 5000);
  timer.unref();
  if (serveStatic) {
    app.use(express.static(path.resolve("dist")));
    app.get("/{*path}", (q, r, next) =>
      q.path.startsWith("/api/")
        ? next()
        : r.sendFile(path.resolve("dist/index.html")),
    );
  }
  app.use("/api", (_q, r) => r.status(404).json({ error: "Not found." }));
  app.use((e, _q, r, _n) => {
    if (e.status && e.status < 500)
      return r.status(e.status).json({ error: e.message });
    console.error(e);
    r.status(500).json({ error: "Something went wrong. Please try again." });
  });
  return {
    app,
    http,
    io,
    db,
    close: async () => {
      clearInterval(timer);
      await new Promise((resolve) => io.close(resolve));
      db.close();
    },
  };
}
