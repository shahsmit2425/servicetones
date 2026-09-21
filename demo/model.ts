export type Role = "customer" | "pro" | "admin";
export type Status =
  | "requested"
  | "quoted"
  | "booked"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "disputed";
export type DemoPro = {
  id: string;
  name: string;
  business: string;
  category: string;
  bio: string;
  rate: number;
  rating: number;
  reviews: number;
  jobs: number;
  color: string;
  skills: string[];
  available: boolean;
  suspended?: boolean;
};
export type Project = {
  id: string;
  title: string;
  category: string;
  description: string;
  status: Status;
  proId: string | null;
  address: string;
  date: string;
  time: string;
  budget: number;
  history: { text: string; date: string }[];
};
export type Quote = {
  id: string;
  projectId: string;
  proId: string;
  amount: number;
  details: string;
  status: "pending" | "accepted" | "declined";
};
export type Payment = {
  id: string;
  projectId: string;
  amount: number;
  status: "paid" | "refunded";
  date: string;
};
export type Review = {
  id: string;
  projectId: string;
  proId: string;
  rating: number;
  text: string;
  reply?: string;
};
export type Chat = {
  id: string;
  proId: string;
  sender: "customer" | "pro";
  text: string;
  date: string;
};
export type Notice = {
  id: string;
  title: string;
  text: string;
  read: boolean;
  page: string;
};
export type Ticket = {
  id: string;
  subject: string;
  message: string;
  status: "open" | "resolved";
  projectId?: string;
  previousStatus?: Status;
};
export type State = {
  version: 1;
  pros: DemoPro[];
  projects: Project[];
  quotes: Quote[];
  payments: Payment[];
  reviews: Review[];
  messages: Chat[];
  notices: Notice[];
  tickets: Ticket[];
  saved: string[];
  customer: { name: string; email: string; phone: string; address: string };
  availability: string[];
  notifications: { email: boolean; messages: boolean; reminders: boolean };
  blocked: string[];
};
export const services = [
  "Handyman",
  "Cleaning",
  "Plumbing",
  "Electrical",
  "Painting",
  "Landscaping",
];
export const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
export function day(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function dateLabel(date: string) {
  return new Date(date + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
export const uid = () => crypto.randomUUID();
export function seed(): State {
  const pros: DemoPro[] = [
    {
      id: "marcus",
      name: "Marcus Johnson",
      business: "The Handy Neighbor",
      category: "Handyman",
      bio: "Small fixes, thoughtful improvements, and a to-do list that finally gets done. I bring 8 years of experience and treat every home like my own.",
      rate: 75,
      rating: 4.9,
      reviews: 128,
      jobs: 214,
      color: "blue",
      skills: ["Furniture assembly", "Wall mounting", "Minor repairs"],
      available: true,
    },
    {
      id: "sofia",
      name: "Sofia Martinez",
      business: "Fresh Start Cleaning",
      category: "Cleaning",
      bio: "A fresh home and a lighter day. Detailed cleaning with a thoughtful approach to your space.",
      rate: 55,
      rating: 4.9,
      reviews: 96,
      jobs: 186,
      color: "peach",
      skills: ["Deep cleaning", "Recurring cleaning", "Move-out cleaning"],
      available: true,
    },
    {
      id: "daniel",
      name: "Daniel Kim",
      business: "Flow Right Plumbing",
      category: "Plumbing",
      bio: "Reliable help for leaks, fixtures, and the unexpected. Clear estimates and careful work.",
      rate: 95,
      rating: 4.8,
      reviews: 84,
      jobs: 168,
      color: "mint",
      skills: ["Faucets", "Leak repairs", "Fixtures"],
      available: true,
    },
    {
      id: "alex",
      name: "Alex Rivera",
      business: "Brightline Electric",
      category: "Electrical",
      bio: "Lighting, switches, and everyday electrical projects, with clear communication at every step.",
      rate: 90,
      rating: 4.9,
      reviews: 72,
      jobs: 143,
      color: "violet",
      skills: ["Lighting", "Outlets", "Ceiling fans"],
      available: false,
    },
    {
      id: "taylor",
      name: "Taylor Brooks",
      business: "Color & Co.",
      category: "Painting",
      bio: "Fresh color, careful preparation, and a clean finish for your favorite spaces.",
      rate: 65,
      rating: 4.8,
      reviews: 61,
      jobs: 107,
      color: "yellow",
      skills: ["Interior painting", "Trim", "Wall preparation"],
      available: true,
    },
    {
      id: "jordan",
      name: "Jordan Lee",
      business: "Yard Theory",
      category: "Landscaping",
      bio: "Seasonal cleanups and garden care that help your outdoor space feel like home.",
      rate: 70,
      rating: 4.9,
      reviews: 53,
      jobs: 91,
      color: "green",
      skills: ["Garden care", "Seasonal cleanup", "Lawn care"],
      available: true,
    },
  ];
  const rows: [
    string,
    string,
    string,
    Status,
    string | null,
    number,
    number,
    string,
  ][] = [
    [
      "hallway",
      "Refresh the entryway",
      "Handyman",
      "quoted",
      "marcus",
      2,
      240,
      "Patch two small wall holes, install a coat rack, and hang a hallway mirror.",
    ],
    [
      "shelves",
      "Build our reading corner",
      "Handyman",
      "booked",
      "marcus",
      1,
      180,
      "Install three floating oak shelves in the living room. Shelves and hardware are ready.",
    ],
    [
      "cleaning",
      "A fresh start for the apartment",
      "Cleaning",
      "completed",
      "sofia",
      -4,
      165,
      "A one-time deep clean for our two-bedroom apartment.",
    ],
    [
      "garden",
      "Get the garden ready",
      "Landscaping",
      "in_progress",
      "jordan",
      0,
      280,
      "Trim hedges, remove weeds, and refresh the planters on the patio.",
    ],
    [
      "faucet",
      "Fix the kitchen faucet",
      "Plumbing",
      "requested",
      "daniel",
      4,
      150,
      "The kitchen faucet has a slow drip. Looking for a repair or replacement estimate.",
    ],
    [
      "outlet",
      "Add a home office outlet",
      "Electrical",
      "cancelled",
      "alex",
      -2,
      210,
      "Install an extra outlet near the desk. Plans changed; this project was cancelled.",
    ],
    [
      "bedroom",
      "A new color for the bedroom",
      "Painting",
      "completed",
      "taylor",
      -1,
      420,
      "Paint the bedroom walls in a light blue. The work is finished and ready for payment.",
    ],
    [
      "cabinet",
      "Repair the kitchen cabinet",
      "Handyman",
      "disputed",
      "marcus",
      -6,
      120,
      "A cabinet hinge still needs adjustment after the original repair. Support is helping.",
    ],
    [
      "door",
      "Fix the sticking front door",
      "Handyman",
      "completed",
      "marcus",
      -3,
      95,
      "Adjust and lubricate the front door so it closes smoothly.",
    ],
    [
      "tv",
      "Mount a living room TV",
      "Handyman",
      "requested",
      null,
      5,
      130,
      "Mount a 55-inch TV on the living room wall. Bracket is supplied.",
    ],
    [
      "wardrobe",
      "Assemble a wardrobe",
      "Handyman",
      "requested",
      null,
      6,
      160,
      "Assemble a flat-pack wardrobe and anchor it to the bedroom wall.",
    ],
  ];
  const projects: Project[] = rows.map(
    ([id, title, category, status, proId, offset, budget, description]) => ({
      id,
      title,
      category,
      status,
      proId,
      date: day(offset),
      time: id === "shelves" ? "10:00" : "14:00",
      budget,
      description,
      address: "124 West 24th Street, New York, NY 10011",
      history: [
        { text: "Project request created", date: day(-7) },
        {
          text:
            status === "quoted"
              ? "Estimate received"
              : status === "booked"
                ? "Appointment confirmed"
                : status === "completed"
                  ? "Work marked complete"
                  : status === "disputed"
                    ? "Support case opened"
                    : status === "in_progress"
                      ? "Your pro started the work"
                      : status === "cancelled"
                        ? "Cancelled by customer"
                        : "Waiting for a professional",
          date: day(Math.min(offset, 0)),
        },
      ],
    }),
  );
  const quotes: Quote[] = projects
    .filter(
      (p) => p.proId && p.status !== "requested" && p.status !== "cancelled",
    )
    .map((p) => ({
      id: "q-" + p.id,
      projectId: p.id,
      proId: p.proId!,
      amount: p.budget,
      details:
        p.id === "hallway"
          ? "Includes labor, wall anchors, and cleanup. Estimated time: 3 hours."
          : "Labor and standard materials as discussed. No additional fees without your approval.",
      status: p.status === "quoted" ? "pending" : "accepted",
    }));
  return {
    version: 1,
    pros,
    projects,
    quotes,
    payments: [
      {
        id: "ST-1024",
        projectId: "cleaning",
        amount: 165,
        status: "paid",
        date: day(-4),
      },
      {
        id: "ST-1025",
        projectId: "cabinet",
        amount: 120,
        status: "paid",
        date: day(-6),
      },
      {
        id: "ST-1026",
        projectId: "door",
        amount: 95,
        status: "paid",
        date: day(-3),
      },
    ],
    reviews: [
      {
        id: "r-cleaning",
        projectId: "cleaning",
        proId: "sofia",
        rating: 5,
        text: "The apartment feels brand new. Sofia was punctual and noticed all the little details.",
        reply: "Thank you, Olivia! It was a pleasure helping with your home.",
      },
    ],
    messages: [
      {
        id: "m1",
        proId: "marcus",
        sender: "customer",
        text: "Hi Marcus! The shelves arrived. Are we still set for tomorrow?",
        date: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "m2",
        proId: "marcus",
        sender: "pro",
        text: "Absolutely! I’ll be there at 10. I’ll bring the level and wall anchors. See you then!",
        date: new Date(Date.now() - 3300000).toISOString(),
      },
      {
        id: "m3",
        proId: "sofia",
        sender: "pro",
        text: "Thanks for having me, Olivia. Everything is all set. Let me know if you’d like a recurring clean!",
        date: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "m4",
        proId: "daniel",
        sender: "customer",
        text: "I’ve added the details about the kitchen faucet. Let me know what else you need.",
        date: new Date(Date.now() - 7200000).toISOString(),
      },
    ],
    notices: [
      {
        id: "n1",
        title: "Your entryway estimate is ready",
        text: "Marcus sent a $240 estimate. Review the scope before accepting.",
        read: false,
        page: "quotes",
      },
      {
        id: "n2",
        title: "Your reading corner is on the calendar",
        text: "Marcus is scheduled for tomorrow at 10:00 AM.",
        read: false,
        page: "schedule",
      },
      {
        id: "n3",
        title: "How did the door repair go?",
        text: "Your feedback helps the next neighbor find the right pro.",
        read: true,
        page: "reviews",
      },
    ],
    tickets: [
      {
        id: "HELP-104",
        subject: "Cabinet hinge follow-up",
        message:
          "The hinge needs another adjustment. I would like help arranging a return visit.",
        status: "open",
        projectId: "cabinet",
      },
    ],
    saved: ["marcus", "sofia", "jordan"],
    customer: {
      name: "Olivia Parker",
      email: "olivia@example.com",
      phone: "(212) 555-0142",
      address: "124 West 24th Street, New York, NY 10011",
    },
    availability: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    notifications: { email: true, messages: true, reminders: true },
    blocked: [],
  };
}
export type Action =
  | {
      type: "create";
      title: string;
      category: string;
      description: string;
      date: string;
      time: string;
      budget: number;
      proId: string | null;
    }
  | { type: "quote"; projectId: string; amount: number; details: string }
  | { type: "accept"; quoteId: string }
  | { type: "decline"; quoteId: string }
  | {
      type: "status";
      projectId: string;
      status: "in_progress" | "completed" | "cancelled" | "disputed";
    }
  | { type: "schedule"; projectId: string; date: string; time: string }
  | { type: "pay"; projectId: string }
  | { type: "refund"; projectId: string }
  | { type: "review"; projectId: string; rating: number; text: string }
  | { type: "reply"; reviewId: string; text: string }
  | {
      type: "message";
      proId: string;
      text: string;
      sender?: "customer" | "pro";
    }
  | { type: "save"; proId: string }
  | { type: "read"; id?: string }
  | { type: "ticket"; subject: string; message: string }
  | { type: "resolve"; ticketId: string }
  | {
      type: "profile";
      business: string;
      bio: string;
      rate: number;
      available: boolean;
    }
  | { type: "customer"; name: string; phone: string; address: string }
  | { type: "availability"; days: string[] }
  | { type: "notifications"; settings: State["notifications"] }
  | { type: "block"; proId: string }
  | { type: "suspend"; proId: string };
export function transition(input: State, role: Role, action: Action): State {
  const s = structuredClone(input),
    a = action;
  const requireRole = (expected: Role) => {
    if (role !== expected)
      throw new Error(
        `Switch to the ${expected === "pro" ? "provider" : expected} demo to do this.`,
      );
  };
  const project = (id: string) => {
    const p = s.projects.find((p) => p.id === id);
    if (!p) throw new Error("Project not found.");
    return p;
  };
  const pro = (id: string) => {
    const p = s.pros.find((p) => p.id === id);
    if (!p) throw new Error("Professional not found.");
    return p;
  };
  const positive = (n: number) => {
    if (!Number.isFinite(n) || n <= 0 || n > 100000)
      throw new Error("Enter an amount between $1 and $100,000.");
  };
  const text = (t: string, min = 1, max = 3000) => {
    if (t.trim().length < min || t.length > max)
      throw new Error(`Enter between ${min} and ${max} characters.`);
    return t.trim();
  };
  const future = (d: string) => {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(d) ||
      !Number.isFinite(Date.parse(d)) ||
      d < day(0)
    )
      throw new Error("Choose today or a future date.");
  };
  const history = (p: Project, t: string) =>
    p.history.push({ text: t, date: day(0) });
  const notice = (title: string, message: string, page: string) =>
    s.notices.unshift({ id: uid(), title, text: message, page, read: false });
  if (a.type === "create") {
    requireRole("customer");
    positive(a.budget);
    future(a.date);
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(a.time))
      throw new Error("Choose a valid appointment time.");
    if (!services.includes(a.category)) throw new Error("Choose a service.");
    if (a.proId && pro(a.proId).suspended)
      throw new Error("This professional is unavailable.");
    if (a.proId && pro(a.proId).category !== a.category)
      throw new Error("Choose a professional who offers this service.");
    const title = text(a.title, 4, 100);
    s.projects.unshift({
      id: uid(),
      title,
      category: a.category,
      description: text(a.description, 10),
      date: a.date,
      time: a.time,
      budget: a.budget,
      proId: a.proId,
      status: "requested",
      address: s.customer.address,
      history: [{ text: "Project request created", date: day(0) }],
    });
    notice("Project request sent", title, "projects");
  }
  if (a.type === "quote") {
    requireRole("pro");
    const p = project(a.projectId);
    if (p.category !== pro("marcus").category)
      throw new Error("Choose an opportunity in your service category.");
    if (
      !["requested", "quoted"].includes(p.status) ||
      (p.proId && p.proId !== "marcus")
    )
      throw new Error("This project is not accepting your estimates.");
    positive(a.amount);
    if (
      s.quotes.some(
        (q) =>
          q.projectId === p.id &&
          q.proId === "marcus" &&
          q.status === "pending",
      )
    )
      throw new Error("An estimate is already waiting for a response.");
    s.quotes.push({
      id: uid(),
      projectId: p.id,
      proId: "marcus",
      amount: a.amount,
      details: text(a.details, 10),
      status: "pending",
    });
    p.proId = "marcus";
    p.status = "quoted";
    history(p, "Marcus sent an estimate");
    notice("A new estimate is ready", p.title, "quotes");
  }
  if (a.type === "accept" || a.type === "decline") {
    requireRole("customer");
    const q = s.quotes.find((q) => q.id === a.quoteId);
    if (!q || q.status !== "pending")
      throw new Error("This estimate has already been handled.");
    const p = project(q.projectId);
    if (p.status !== "quoted")
      throw new Error("This project is no longer accepting estimates.");
    q.status = a.type === "accept" ? "accepted" : "declined";
    if (a.type === "accept") {
      p.status = "booked";
      p.proId = q.proId;
      p.budget = q.amount;
      s.quotes
        .filter(
          (other) =>
            other.projectId === p.id &&
            other.id !== q.id &&
            other.status === "pending",
        )
        .forEach((other) => (other.status = "declined"));
      history(p, "Estimate accepted · appointment booked");
      notice("You’re on the calendar", p.title, "schedule");
    } else {
      p.status = "requested";
      history(p, "Estimate declined · request reopened");
    }
  }
  if (a.type === "status") {
    const p = project(a.projectId);
    if (a.status === "cancelled") {
      requireRole("customer");
      if (!["requested", "quoted", "booked"].includes(p.status))
        throw new Error("Contact support for work that has already started.");
      s.quotes
        .filter((q) => q.projectId === p.id && q.status === "pending")
        .forEach((q) => (q.status = "declined"));
    } else if (a.status === "disputed") {
      requireRole("customer");
      if (!["completed", "in_progress"].includes(p.status))
        throw new Error(
          "Support requests apply to work in progress or completed work.",
        );
      s.tickets.push({
        id: "HELP-" + uid().slice(0, 6),
        subject: p.title,
        message: "Customer requested support for this project.",
        status: "open",
        projectId: p.id,
        previousStatus: p.status,
      });
    } else {
      requireRole("pro");
      if (p.proId !== "marcus")
        throw new Error("This job belongs to another professional.");
      if (
        (a.status === "in_progress" && p.status !== "booked") ||
        (a.status === "completed" && p.status !== "in_progress")
      )
        throw new Error("Complete the previous project step first.");
    }
    p.status = a.status;
    history(
      p,
      {
        cancelled: "Customer cancelled the request",
        disputed: "Support case opened",
        in_progress: "Marcus started the work",
        completed: "Marcus marked the work complete",
      }[a.status],
    );
    notice("Project updated", p.title, "projects");
  }
  if (a.type === "schedule") {
    const p = project(a.projectId);
    if (role === "admin" || (role === "pro" && p.proId !== "marcus"))
      throw new Error("Only the customer or assigned provider can reschedule.");
    if (!["booked", "quoted", "requested"].includes(p.status))
      throw new Error("Only upcoming projects can be rescheduled.");
    future(a.date);
    if (!/^\d{2}:\d{2}$/.test(a.time))
      throw new Error("Choose an appointment time.");
    p.date = a.date;
    p.time = a.time;
    history(p, `Rescheduled for ${dateLabel(a.date)} at ${a.time}`);
  }
  if (a.type === "pay") {
    requireRole("customer");
    const p = project(a.projectId);
    if (p.status !== "completed")
      throw new Error("Payment is available after completion.");
    if (s.payments.some((t) => t.projectId === p.id))
      throw new Error("This project already has a payment record.");
    s.payments.push({
      id: "ST-" + uid().slice(0, 6).toUpperCase(),
      projectId: p.id,
      amount: p.budget,
      status: "paid",
      date: day(0),
    });
    history(p, "Demo payment recorded · no money moved");
    notice("Your demo receipt is ready", p.title, "payments");
  }
  if (a.type === "refund") {
    requireRole("admin");
    const p = project(a.projectId),
      payment = s.payments.find(
        (t) => t.projectId === p.id && t.status === "paid",
      );
    if (!payment || p.status !== "disputed")
      throw new Error("Only paid, disputed projects can be refunded.");
    payment.status = "refunded";
    p.status = "cancelled";
    s.tickets
      .filter((t) => t.projectId === p.id)
      .forEach((t) => (t.status = "resolved"));
    history(p, "Demo refund approved · support case resolved");
  }
  if (a.type === "review") {
    requireRole("customer");
    const p = project(a.projectId);
    if (p.status !== "completed" || !p.proId)
      throw new Error("Only completed projects can be reviewed.");
    if (s.reviews.some((r) => r.projectId === p.id))
      throw new Error("You already reviewed this project.");
    if (!Number.isInteger(a.rating) || a.rating < 1 || a.rating > 5)
      throw new Error("Choose a rating from 1 to 5.");
    s.reviews.push({
      id: uid(),
      projectId: p.id,
      proId: p.proId,
      rating: a.rating,
      text: text(a.text, 10, 1000),
    });
  }
  if (a.type === "reply") {
    requireRole("pro");
    const r = s.reviews.find(
      (r) => r.id === a.reviewId && r.proId === "marcus",
    );
    if (!r) throw new Error("Review not found.");
    r.reply = text(a.text, 2, 1000);
  }
  if (a.type === "message") {
    if (role === "admin") throw new Error("Open a customer or provider inbox.");
    pro(a.proId);
    if (s.blocked.includes(a.proId))
      throw new Error("Unblock this conversation in settings first.");
    s.messages.push({
      id: uid(),
      proId: a.proId,
      sender: a.sender || role,
      text: text(a.text, 1, 4000),
      date: new Date().toISOString(),
    });
  }
  if (a.type === "save") {
    requireRole("customer");
    pro(a.proId);
    s.saved = s.saved.includes(a.proId)
      ? s.saved.filter((id) => id !== a.proId)
      : [...s.saved, a.proId];
  }
  if (a.type === "read")
    s.notices.forEach((n) => {
      if (!a.id || a.id === n.id) n.read = true;
    });
  if (a.type === "ticket") {
    s.tickets.unshift({
      id: "HELP-" + uid().slice(0, 6),
      subject: text(a.subject, 4, 100),
      message: text(a.message, 10),
      status: "open",
    });
  }
  if (a.type === "resolve") {
    requireRole("admin");
    const t = s.tickets.find((t) => t.id === a.ticketId);
    if (!t) throw new Error("Case not found.");
    t.status = "resolved";
    if (t.projectId) {
      const p = project(t.projectId);
      if (p.status === "disputed") {
        p.status = t.previousStatus || "completed";
        history(p, "Support case resolved without a refund");
      }
    }
  }
  if (a.type === "profile") {
    requireRole("pro");
    positive(a.rate);
    Object.assign(pro("marcus"), {
      business: text(a.business, 2, 100),
      bio: text(a.bio, 10, 1000),
      rate: a.rate,
      available: a.available,
    });
  }
  if (a.type === "customer") {
    requireRole("customer");
    s.customer = {
      ...s.customer,
      name: text(a.name, 2, 80),
      phone: text(a.phone, 7, 30),
      address: text(a.address, 10, 200),
    };
  }
  if (a.type === "availability") {
    requireRole("pro");
    s.availability = [...new Set(a.days)].filter((d) =>
      [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ].includes(d),
    );
  }
  if (a.type === "notifications") s.notifications = a.settings;
  if (a.type === "block") {
    pro(a.proId);
    s.blocked = s.blocked.includes(a.proId)
      ? s.blocked.filter((id) => id !== a.proId)
      : [...s.blocked, a.proId];
  }
  if (a.type === "suspend") {
    requireRole("admin");
    const p = pro(a.proId);
    p.suspended = !p.suspended;
  }
  return s;
}
