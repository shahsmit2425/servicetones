import { test } from "node:test";
import assert from "node:assert/strict";
import { seed, transition, day } from "../model.ts";

test("customer booking flows through provider completion, payment and review", () => {
  let s = seed();
  s = transition(s, "customer", { type: "accept", quoteId: "q-hallway" });
  assert.equal(s.projects.find((p) => p.id === "hallway").status, "booked");
  s = transition(s, "pro", {
    type: "status",
    projectId: "hallway",
    status: "in_progress",
  });
  s = transition(s, "pro", {
    type: "status",
    projectId: "hallway",
    status: "completed",
  });
  s = transition(s, "customer", { type: "pay", projectId: "hallway" });
  assert.equal(s.payments.find((p) => p.projectId === "hallway").amount, 240);
  s = transition(s, "customer", {
    type: "review",
    projectId: "hallway",
    rating: 5,
    text: "Clear communication and excellent work on our entryway.",
  });
  const review = s.reviews.find((r) => r.projectId === "hallway");
  s = transition(s, "pro", {
    type: "reply",
    reviewId: review.id,
    text: "Thank you! It was a pleasure helping with your home.",
  });
  assert.match(s.reviews.find((r) => r.id === review.id).reply, /Thank you/);
  assert.throws(
    () => transition(s, "customer", { type: "pay", projectId: "hallway" }),
    /already/,
  );
  assert.throws(
    () =>
      transition(s, "customer", {
        type: "review",
        projectId: "hallway",
        rating: 5,
        text: "Duplicate review should be rejected.",
      }),
    /already/,
  );
});
test("new requests and estimates share state across roles", () => {
  const before = seed();
  let s = transition(before, "customer", {
    type: "create",
    title: "Hang family pictures",
    category: "Handyman",
    description: "Hang five framed pictures along the hallway wall.",
    date: day(4),
    time: "10:00",
    budget: 100,
    proId: null,
  });
  assert.equal(before.projects.length, 11);
  const project = s.projects[0];
  s = transition(s, "pro", {
    type: "quote",
    projectId: project.id,
    amount: 110,
    details: "Includes hanging hardware, labor, and clean-up.",
  });
  const quote = s.quotes.find((q) => q.projectId === project.id);
  assert.equal(s.projects[0].status, "quoted");
  assert.equal(quote.proId, "marcus");
  s = transition(s, "customer", { type: "accept", quoteId: quote.id });
  assert.equal(s.projects[0].budget, 110);
  s = transition(s, "customer", {
    type: "schedule",
    projectId: project.id,
    date: day(7),
    time: "13:30",
  });
  assert.equal(s.projects[0].date, day(7));
});
test("invalid transitions preserve the original state", () => {
  const s = seed(),
    before = JSON.stringify(s);
  assert.throws(
    () =>
      transition(s, "customer", {
        type: "status",
        projectId: "shelves",
        status: "completed",
      }),
    /provider/,
  );
  assert.throws(
    () =>
      transition(s, "pro", {
        type: "status",
        projectId: "shelves",
        status: "completed",
      }),
    /previous/,
  );
  assert.throws(
    () =>
      transition(s, "pro", {
        type: "status",
        projectId: "garden",
        status: "completed",
      }),
    /another/,
  );
  assert.throws(
    () => transition(s, "customer", { type: "pay", projectId: "shelves" }),
    /after completion/,
  );
  assert.throws(
    () =>
      transition(s, "customer", {
        type: "schedule",
        projectId: "shelves",
        date: day(-1),
        time: "10:00",
      }),
    /future/,
  );
  assert.throws(
    () =>
      transition(s, "pro", {
        type: "quote",
        projectId: "tv",
        amount: -1,
        details: "This must not be accepted.",
      }),
    /amount/,
  );
  assert.throws(
    () =>
      transition(s, "customer", {
        type: "review",
        projectId: "door",
        rating: 6,
        text: "This must not be accepted.",
      }),
    /rating/,
  );
  assert.equal(JSON.stringify(s), before);
});
test("cancellation closes pending estimates and cannot complete work", () => {
  let s = transition(seed(), "customer", {
    type: "status",
    projectId: "hallway",
    status: "cancelled",
  });
  assert.equal(s.quotes.find((q) => q.id === "q-hallway").status, "declined");
  assert.throws(
    () => transition(s, "customer", { type: "accept", quoteId: "q-hallway" }),
    /handled/,
  );
  assert.throws(
    () =>
      transition(s, "pro", {
        type: "status",
        projectId: "hallway",
        status: "in_progress",
      }),
    /previous/,
  );
});
test("admin refund resolves paid disputes without a second refund", () => {
  let s = seed();
  assert.throws(
    () => transition(s, "customer", { type: "refund", projectId: "cabinet" }),
    /admin/,
  );
  s = transition(s, "admin", { type: "refund", projectId: "cabinet" });
  assert.equal(
    s.payments.find((p) => p.projectId === "cabinet").status,
    "refunded",
  );
  assert.equal(
    s.tickets.find((t) => t.projectId === "cabinet").status,
    "resolved",
  );
  assert.equal(s.projects.find((p) => p.id === "cabinet").status, "cancelled");
  assert.throws(
    () => transition(s, "admin", { type: "refund", projectId: "cabinet" }),
    /paid, disputed/,
  );
});
test("messages, blocking and demo replies use local shared history", () => {
  let s = transition(seed(), "customer", {
    type: "message",
    proId: "marcus",
    text: "Hello Marcus, can we talk about the shelves?",
  });
  assert.equal(s.messages.at(-1).sender, "customer");
  s = transition(s, "pro", {
    type: "message",
    proId: "marcus",
    text: "Yes! Tomorrow at ten works.",
  });
  assert.equal(s.messages.at(-1).sender, "pro");
  s = transition(s, "customer", { type: "block", proId: "marcus" });
  assert.throws(
    () =>
      transition(s, "customer", {
        type: "message",
        proId: "marcus",
        text: "Blocked message",
      }),
    /Unblock/,
  );
  s = transition(s, "customer", { type: "block", proId: "marcus" });
  assert.equal(s.blocked.length, 0);
});
test("demo moderation and profile updates do not mutate the seed", () => {
  const original = seed();
  let s = transition(original, "admin", { type: "suspend", proId: "marcus" });
  assert.equal(s.pros[0].suspended, true);
  assert.equal(original.pros[0].suspended, undefined);
  s = transition(s, "admin", { type: "suspend", proId: "marcus" });
  assert.equal(s.pros[0].suspended, false);
  s = transition(s, "pro", {
    type: "profile",
    business: "Neighbor Workshop",
    bio: "Careful help for your next home improvement project.",
    rate: 85,
    available: false,
  });
  assert.equal(s.pros[0].business, "Neighbor Workshop");
  assert.equal(s.pros[0].rate, 85);
  s = transition(s, "customer", {
    type: "customer",
    name: "Demo Neighbor",
    phone: "212-555-0100",
    address: "123 Example Street, New York",
  });
  assert.equal(s.customer.name, "Demo Neighbor");
  assert.equal(seed().customer.name, "Olivia Parker");
});

test("resolving support during ongoing work restores that stage", () => {
  let s = transition(seed(), "customer", {
    type: "status",
    projectId: "garden",
    status: "disputed",
  });
  const ticket = s.tickets.find((t) => t.projectId === "garden");
  s = transition(s, "admin", { type: "resolve", ticketId: ticket.id });
  assert.equal(s.projects.find((p) => p.id === "garden").status, "in_progress");
  assert.throws(
    () =>
      transition(seed(), "customer", {
        type: "create",
        title: "Invalid time",
        category: "Handyman",
        description: "This request contains an invalid time.",
        date: day(2),
        time: "29:99",
        budget: 100,
        proId: "marcus",
      }),
    /valid appointment/,
  );
});
