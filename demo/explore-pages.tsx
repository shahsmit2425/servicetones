import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Grid2X2,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useDemo } from "./context";
import { Avatar, Badge, Empty, Jump, Panel } from "./ui";
import { money, type Role } from "./model";
import { navigation, utilities } from "./navigation";
import { PageHead } from "./core-pages";
export function People() {
  const { state, open, go } = useDemo();
  const [search, setSearch] = useState("");
  return (
    <>
      <PageHead
        title="The people behind the good work."
        description="Inspect fictional professional accounts and preview marketplace moderation."
      />
      <label className="d-search d-help-search">
        <Search size={18} />
        <input
          placeholder="Search professional accounts"
          aria-label="Search professional accounts"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      <Panel title="Professional accounts">
        <div className="d-table-scroll">
          <table className="d-table">
            <thead>
              <tr>
                <th>Professional</th>
                <th>Service</th>
                <th>Starting rate</th>
                <th>Status</th>
                <th>Manage</th>
              </tr>
            </thead>
            <tbody>
              {state.pros
                .filter((p) =>
                  `${p.name} ${p.business}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                )
                .map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="d-person-line">
                        <Avatar name={p.name} color={p.color} />
                        <div>
                          <strong>{p.name}</strong>
                          <small>{p.business}</small>
                        </div>
                      </div>
                    </td>
                    <td>{p.category}</td>
                    <td>{money(p.rate)} / hr</td>
                    <td>
                      <Badge status={p.suspended ? "Suspended" : "Active"} />
                    </td>
                    <td>
                      <div className="d-buttons">
                        <button
                          className="d-link"
                          onClick={() => go("professional", p.id, "customer")}
                        >
                          Profile
                        </button>
                        <button
                          className="d-link"
                          onClick={() => open({ kind: "suspend", id: p.id })}
                        >
                          {p.suspended ? "Restore" : "Suspend"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <div className="d-info-note">
        <Users size={18} />
        <span>
          These controls change fictional preview records only. They do not
          grant admin access to real accounts.
        </span>
      </div>
    </>
  );
}
export function Reports() {
  const { state, act, open, go } = useDemo();
  const [filter, setFilter] = useState("open");
  const tickets = state.tickets.filter(
    (t) => filter === "all" || t.status === filter,
  );
  return (
    <>
      <PageHead
        title="Help people find a way forward."
        description="Review support cases and explore resolution or refund scenarios."
      />
      <div className="d-filters">
        {["open", "resolved", "all"].map((f) => (
          <button
            className={filter === f ? "active" : ""}
            key={f}
            onClick={() => setFilter(f)}
          >
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      {tickets.length ? (
        <div className="d-estimate-grid">
          {tickets.map((t) => {
            const p = state.projects.find((p) => p.id === t.projectId),
              payment = state.payments.find((pay) => pay.projectId === p?.id);
            return (
              <Panel key={t.id}>
                <div className="d-padded">
                  <div className="d-flex">
                    <span className="d-overline">#{t.id}</span>
                    <Badge status={t.status} />
                  </div>
                  <h3>{t.subject}</h3>
                  <p>{t.message}</p>
                  <div className="d-person-line">
                    <Avatar name={state.customer.name} color="peach" />
                    <div>
                      <strong>{state.customer.name}</strong>
                      <small>Customer · Fictional support request</small>
                    </div>
                  </div>
                  {p && (
                    <p className="d-muted">
                      Project: {p.title} · {money(p.budget)}
                    </p>
                  )}
                  <div className="d-buttons">
                    {t.status === "open" && (
                      <button
                        className="d-primary"
                        onClick={() =>
                          act(
                            { type: "resolve", ticketId: t.id },
                            "Support case resolved in the demo.",
                          )
                        }
                      >
                        Resolve case
                      </button>
                    )}
                    {t.status === "open" &&
                      p?.status === "disputed" &&
                      payment?.status === "paid" && (
                        <button
                          className="d-secondary"
                          onClick={() => open({ kind: "refund", id: p.id })}
                        >
                          Review demo refund
                        </button>
                      )}
                    {p && (
                      <button
                        className="d-link"
                        onClick={() => go("project", p.id)}
                      >
                        Project details
                      </button>
                    )}
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      ) : (
        <Empty
          title="No cases in this view."
          text="Create a support request from a customer project to see it here."
        />
      )}
    </>
  );
}
export const scenarios: [
  string,
  string,
  string,
  string | undefined,
  Role,
  string,
][] = [
  [
    "Request → estimate → booking",
    "Start with the entryway estimate. Accept it, then find the appointment in your schedule.",
    "project",
    "hallway",
    "customer",
    "Estimate ready",
  ],
  [
    "A day on the job",
    "Start the reading-corner job, mark it complete, then switch to the customer to pay and review.",
    "project",
    "shelves",
    "pro",
    "Upcoming",
  ],
  [
    "Find your next lead",
    "Send an estimate for TV mounting or wardrobe assembly. Switch to customer to review it.",
    "leads",
    undefined,
    "pro",
    "New opportunity",
  ],
  [
    "Finish & pay",
    "Preview the completed bedroom job, simulate a payment, and open the receipt.",
    "project",
    "bedroom",
    "customer",
    "Payment due",
  ],
  [
    "Leave a little feedback",
    "Review the completed front-door repair. Marcus can reply from the provider review page.",
    "project",
    "door",
    "customer",
    "Awaiting review",
  ],
  [
    "Resolve a dispute",
    "Inspect the cabinet case and choose resolution or a simulated refund.",
    "reports",
    undefined,
    "admin",
    "Needs attention",
  ],
  [
    "Cancelled plans",
    "See a closed project and the customer’s next options.",
    "project",
    "outlet",
    "customer",
    "Cancelled",
  ],
  [
    "Work in progress",
    "Check details and contact the pro while your garden project is underway.",
    "project",
    "garden",
    "customer",
    "In progress",
  ],
  [
    "Messages & calling states",
    "Send a local message, simulate a reply, and preview audio/video call outcomes.",
    "messages",
    "marcus",
    "customer",
    "Interactive",
  ],
  [
    "First-time customer",
    "See the empty-project state and create a new request. Existing demo data is preserved.",
    "projects",
    "empty",
    "customer",
    "Empty state",
  ],
  [
    "No estimates yet",
    "Explore an empty estimates page and its next step.",
    "quotes",
    "empty",
    "customer",
    "Empty state",
  ],
  [
    "Professional onboarding",
    "Review business details, starting rate, availability, and your first lead.",
    "onboarding",
    undefined,
    "pro",
    "Business setup",
  ],
  [
    "Account access screens",
    "Explore sign-in, signup, and recovery screens without creating an account.",
    "login",
    undefined,
    "customer",
    "Access flow",
  ],
  [
    "Moderation & safety",
    "Suspend a fictional listing, see it disappear from discovery, then restore it.",
    "people",
    undefined,
    "admin",
    "Admin controls",
  ],
];
export function Scenarios() {
  const { go, open } = useDemo();
  const [search, setSearch] = useState(""),
    [view, setView] = useState("scenarios");
  const extras = [
    { id: "professional", label: "Professional details", icon: "user" },
    { id: "project", label: "Project details & timeline", icon: "projects" },
    { id: "onboarding", label: "Provider onboarding", icon: "grid" },
    { id: "login", label: "Sign in preview", icon: "user" },
    { id: "register", label: "Sign up preview", icon: "user" },
    { id: "recovery", label: "Password recovery preview", icon: "help" },
  ];
  return (
    <>
      <PageHead
        eyebrow="YOUR PRODUCT TOUR"
        title="Every page. Every side of the story."
        description="Switch perspectives, follow a project, and try the moments that matter."
        action={
          <button
            className="d-secondary"
            onClick={() => open({ kind: "reset" })}
          >
            Reset all demo scenarios
          </button>
        }
      />
      <div className="d-tour-banner">
        <Sparkle />
        <div>
          <h2>Go ahead. Make yourself at home.</h2>
          <p>
            Actions update the same fictional data across roles. You can accept
            an estimate as Olivia, start the job as Marcus, and review a dispute
            as Alex. Reset whenever you want a fresh start.
          </p>
        </div>
      </div>
      <div className="d-page-tools">
        <div className="d-filters">
          <button
            className={view === "scenarios" ? "active" : ""}
            onClick={() => setView("scenarios")}
          >
            Guided scenarios
          </button>
          <button
            className={view === "pages" ? "active" : ""}
            onClick={() => setView("pages")}
          >
            All pages
          </button>
        </div>
        <label className="d-search compact">
          <Search size={17} />
          <input
            aria-label="Search pages and scenarios"
            placeholder="Find a page or scenario"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>
      {view === "scenarios" ? (
        <div className="d-scenario-grid">
          {scenarios
            .filter((s) =>
              s.join(" ").toLowerCase().includes(search.toLowerCase()),
            )
            .map(([title, description, page, id, role, status], i) => (
              <button
                className="d-scenario-card"
                key={title}
                onClick={() => go(page, id, role)}
              >
                <div className="d-flex">
                  <span className="d-scenario-number">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Badge status={status} />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
                <span className="d-link">
                  Explore {role === "pro" ? "provider" : role} view{" "}
                  <ArrowRight size={16} />
                </span>
              </button>
            ))}
        </div>
      ) : (
        <div className="d-all-pages">
          {(["customer", "pro", "admin"] as Role[]).map((role) => (
            <Panel
              key={role}
              title={
                role === "pro"
                  ? "Provider pages"
                  : role === "customer"
                    ? "Customer pages"
                    : "Admin pages"
              }
            >
              <div className="d-page-map">
                {[
                  ...navigation[role],
                  ...utilities,
                  ...(role === "customer"
                    ? extras.filter((page) => page.id !== "onboarding")
                    : role === "pro"
                      ? [extras[2]]
                      : []),
                ]
                  .filter((p) =>
                    p.label.toLowerCase().includes(search.toLowerCase()),
                  )
                  .map((p) => (
                    <button
                      key={p.id}
                      onClick={() =>
                        go(
                          p.id,
                          p.id === "professional"
                            ? "marcus"
                            : p.id === "project"
                              ? "hallway"
                              : undefined,
                          role,
                        )
                      }
                    >
                      {p.label}
                      <ArrowRight size={15} />
                    </button>
                  ))}
              </div>
            </Panel>
          ))}
        </div>
      )}
      <div className="d-info-note">
        <ShieldCheck size={20} />
        <span>
          <strong>Preview boundaries:</strong> payments, calls, recovery emails,
          and moderation are simulated. The existing live account/chat
          application is available from “Open live app” in the footer.
        </span>
      </div>
    </>
  );
}
function Sparkle() {
  return <Grid2X2 size={30} />;
}
export function AuthPreview() {
  const { page, go } = useDemo();
  const [sent, setSent] = useState(false),
    [role, setRole] = useState<Role>("customer");
  const signup = page === "register",
    recovery = page === "recovery";
  function submit(e: FormEvent) {
    e.preventDefault();
    if (recovery) setSent(true);
    else
      go(
        signup && role === "pro" ? "onboarding" : "dashboard",
        undefined,
        role,
      );
  }
  return (
    <div className="d-auth-layout">
      <div className="d-auth-story">
        <span className="d-overline">SERVICETONES</span>
        <h1>
          A little help.
          <br />A happier home.
        </h1>
        <p>
          Good people, thoughtful work, and one place to bring it all together.
        </p>
        <img src="/home.jpg" alt="Sunlit home interior" />
      </div>
      <Panel>
        <form className="d-form d-padded" onSubmit={submit}>
          <span className="d-mini-pill">Account flow preview</span>
          <h2>
            {recovery
              ? "Let’s get you back in."
              : signup
                ? "Make yourself at home."
                : "Welcome back."}
          </h2>
          <p className="d-muted">
            {recovery
              ? "Try the recovery confirmation screen. No email will be sent."
              : "Use any fictional details to explore this screen. It does not create or authenticate a real account."}
          </p>
          {sent ? (
            <>
              <CheckCircle2 size={40} className="d-success-icon" />
              <h3>Recovery confirmation preview</h3>
              <p>
                In the live product, this is where you’d check your inbox. No
                email was sent from this demo.
              </p>
              <button
                type="button"
                className="d-primary"
                onClick={() => go("login")}
              >
                Back to sign in
              </button>
            </>
          ) : (
            <>
              {signup && (
                <>
                  <label>
                    Full name
                    <input
                      placeholder="Your demo name"
                      required
                      minLength={2}
                    />
                  </label>
                  <label>
                    I’m here to
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as Role)}
                    >
                      <option value="customer">Find a professional</option>
                      <option value="pro">Offer my services</option>
                    </select>
                  </label>
                </>
              )}
              <label>
                Email
                <input type="email" placeholder="you@example.com" required />
              </label>
              {!recovery && (
                <label>
                  Demo password
                  <input
                    type="password"
                    placeholder="Use a fictional password"
                    required
                    minLength={8}
                  />
                  <small>Do not enter a real password in this preview.</small>
                </label>
              )}
              <button className="d-primary">
                {recovery
                  ? "Preview recovery confirmation"
                  : signup
                    ? "Explore your demo account"
                    : "Enter customer demo"}
              </button>
              {!signup && !recovery && (
                <button
                  className="d-link"
                  type="button"
                  onClick={() => go("recovery")}
                >
                  Forgot password?
                </button>
              )}
              <button
                className="d-link"
                type="button"
                onClick={() => go(signup ? "login" : "register")}
              >
                {signup
                  ? "Already have an account? Sign in"
                  : "New here? Preview signup"}
              </button>
            </>
          )}
          <a className="d-link" href="#live">
            Use the live account application <ArrowRight size={14} />
          </a>
        </form>
      </Panel>
    </div>
  );
}
