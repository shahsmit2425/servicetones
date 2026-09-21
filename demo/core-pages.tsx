import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Heart,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Wallet,
  Wrench,
} from "lucide-react";
import { useDemo } from "./context";
import { Avatar, Badge, Empty, Jump, Panel, ProCard, ProjectRow } from "./ui";
import { day, dateLabel, money, services } from "./model";
export function PageHead({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="d-page-head">
      <div>
        {eyebrow && <p className="d-overline">{eyebrow}</p>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
export function Dashboard() {
  const { state, role, go, open } = useDemo();
  const provider = role === "pro",
    admin = role === "admin";
  const jobs = state.projects.filter((p) => !provider || p.proId === "marcus");
  const active = jobs.filter((p) =>
    ["requested", "quoted", "booked", "in_progress"].includes(p.status),
  );
  const upcoming = jobs
    .filter((p) => p.status === "booked")
    .sort((a, b) => a.date.localeCompare(b.date));
  const payments = state.payments.filter(
    (t) => !provider || jobs.some((p) => p.id === t.projectId),
  );
  const paid = payments
    .filter((p) => p.status === "paid")
    .reduce((n, p) => n + p.amount, 0);
  const quotes = state.quotes.filter(
    (q) => q.status === "pending" && (!provider || q.proId === "marcus"),
  );
  const stats = admin
    ? [
        [
          "Projects",
          state.projects.length,
          "Across the demo marketplace",
          Wrench,
        ],
        [
          "Professionals",
          state.pros.length,
          "6 home service categories",
          ShieldCheck,
        ],
        ["Payment volume", money(paid), "Recorded demo payments", Wallet],
        [
          "Open cases",
          state.tickets.filter((t) => t.status === "open").length,
          "Ready for your attention",
          FileText,
        ],
      ]
    : provider
      ? [
          ["Active jobs", active.length, "Let’s keep things moving", Wrench],
          [
            "Upcoming visits",
            upcoming.length,
            "Your next appointments",
            CalendarDays,
          ],
          ["Earned so far", money(paid), "Demo revenue, before fees", Wallet],
          ["Your rating", "4.9", "128 illustrative reviews", Star],
        ]
      : [
          [
            "Active projects",
            active.length,
            "A little progress every day",
            Wrench,
          ],
          [
            "Estimates to review",
            quotes.length,
            "Find the right fit",
            FileText,
          ],
          [
            "Upcoming visits",
            upcoming.length,
            "Already on your calendar",
            CalendarDays,
          ],
          [
            "Saved professionals",
            state.saved.length,
            "Your home’s go-to people",
            Heart,
          ],
        ];
  return (
    <>
      <PageHead
        eyebrow={
          admin
            ? "THE BIG PICTURE"
            : provider
              ? "GOOD WORK STARTS HERE"
              : "A LITTLE LESS TO-DO"
        }
        title={
          admin
            ? "A pulse on your marketplace."
            : `Good morning, ${provider ? "Marcus" : state.customer.name.split(" ")[0]}.`
        }
        description={
          admin
            ? "Manage professionals, projects, and the moments that need a human touch."
            : provider
              ? "Here’s what’s happening with your business today."
              : "Your home projects, all coming together."
        }
        action={
          <button
            className="d-primary"
            onClick={() =>
              admin
                ? go("reports")
                : provider
                  ? go("leads")
                  : open({ kind: "new-project" })
            }
          >
            {admin ? <ShieldCheck size={17} /> : <Plus size={17} />}{" "}
            {admin
              ? "Review open cases"
              : provider
                ? "Find opportunities"
                : "Start a project"}
          </button>
        }
      />
      <section className="d-stats">
        {stats.map(([label, value, detail, Icon]) => {
          const I = Icon as typeof Wrench;
          return (
            <div className="d-stat" key={String(label)}>
              <div>
                <span>{String(label)}</span>
                <I size={18} />
              </div>
              <strong>{String(value)}</strong>
              <small>{String(detail)}</small>
            </div>
          );
        })}
      </section>
      <div className="d-dashboard-grid">
        <div>
          <section className={"d-welcome " + (provider ? "provider" : "")}>
            <div>
              <span className="d-mini-pill">
                <Sparkles size={13} />
                {provider
                  ? "YOUR NEXT OPPORTUNITY"
                  : "GOOD PEOPLE. GREAT WORK."}
              </span>
              <h2>
                {admin ? (
                  <>
                    Keep every project moving.
                    <br />
                    Help every neighbor feel heard.
                  </>
                ) : provider ? (
                  <>
                    Turn a neighbor’s to-do
                    <br />
                    into your next great review.
                  </>
                ) : (
                  <>
                    A happier home starts
                    <br />
                    with the right people.
                  </>
                )}
              </h2>
              <p>
                {admin
                  ? "A clear view of support cases, project activity, and your professional community."
                  : provider
                    ? "A few local projects are looking for someone just like you."
                    : "From quick fixes to fresh starts, find your next go-to pro."}
              </p>
              <button
                onClick={() =>
                  go(admin ? "reports" : provider ? "leads" : "discover")
                }
              >
                {admin
                  ? "Review support cases"
                  : provider
                    ? "Explore local opportunities"
                    : "Find the right pro"}
                <ArrowRight size={17} />
              </button>
            </div>
            <img src="/home.jpg" alt="Sunlit living room with a blue sofa" />
          </section>
          <Panel
            title={
              provider
                ? "Your active jobs"
                : admin
                  ? "Recent projects"
                  : "Your projects"
            }
            action={<Jump page="projects">View all</Jump>}
          >
            {jobs.slice(0, 4).map((p) => (
              <ProjectRow key={p.id} project={p} />
            ))}
          </Panel>
          <div className="d-two-col">
            <Panel
              title={
                admin
                  ? "Your professional community"
                  : provider
                    ? "Ready to grow?"
                    : "A little inspiration"
              }
            >
              <div className="d-padded">
                <span className="d-small-icon">
                  <Sparkles size={23} />
                </span>
                <h3>
                  {admin
                    ? "Good people make it work."
                    : provider
                      ? "Let your work do the talking."
                      : "Make your space feel like you."}
                </h3>
                <p className="d-muted">
                  {admin
                    ? "Review fictional listings and explore how moderation affects the directory."
                    : provider
                      ? "Keep your business profile up to date and help the right customers find you."
                      : "A new coat of paint or a well-placed shelf can make a big difference."}
                </p>
                <Jump
                  page={admin ? "people" : provider ? "profile" : "discover"}
                >
                  {admin
                    ? "Manage professionals"
                    : provider
                      ? "Update your profile"
                      : "Explore services"}
                </Jump>
              </div>
            </Panel>
            <Panel title="Try the whole experience">
              <div className="d-padded">
                <span className="d-small-icon mint">
                  <CheckCircle2 size={23} />
                </span>
                <h3>Every step, ready to explore.</h3>
                <p className="d-muted">
                  Follow a project from request to review, or try a cancellation
                  and support case.
                </p>
                <Jump page="scenarios">Explore all scenarios</Jump>
              </div>
            </Panel>
          </div>
        </div>
        <aside>
          <Panel
            title="Coming up next"
            action={<Jump page="schedule">Calendar</Jump>}
          >
            {upcoming[0] ? (
              <div className="d-next-visit">
                <div className="d-date-tile">
                  <span>
                    {new Date(
                      upcoming[0].date + "T12:00:00",
                    ).toLocaleDateString("en-US", { month: "short" })}
                  </span>
                  <strong>
                    {new Date(upcoming[0].date + "T12:00:00").getDate()}
                  </strong>
                </div>
                <span className="d-overline">
                  {upcoming[0].time} · CONFIRMED
                </span>
                <h3>{upcoming[0].title}</h3>
                <p className="d-muted">
                  {provider
                    ? state.customer.name
                    : state.pros.find((p) => p.id === upcoming[0].proId)?.name}
                </p>
                <p className="d-location">
                  <MapPin size={14} /> Chelsea, New York
                </p>
                <button
                  className="d-secondary full"
                  onClick={() => go("project", upcoming[0].id)}
                >
                  View appointment <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <Empty
                title="Your calendar is clear"
                text="Your next confirmed visit will appear here."
              />
            )}
          </Panel>
          <Panel title="Needs your attention">
            <div className="d-attention-list">
              <button onClick={() => go(admin ? "reports" : "quotes")}>
                <span className="d-small-icon peach">
                  <FileText size={18} />
                </span>
                <span>
                  <strong>
                    {admin
                      ? "A neighbor needs support"
                      : `${quotes.length} estimate${quotes.length === 1 ? "" : "s"} ${provider ? "awaiting a reply" : "to review"}`}
                  </strong>
                  <small>
                    {admin
                      ? "Review the cabinet repair case"
                      : "Keep your next project moving"}
                  </small>
                </span>
                <ArrowRight size={15} />
              </button>
              <button
                onClick={() =>
                  go(
                    admin ? "people" : "messages",
                    admin ? undefined : "marcus",
                  )
                }
              >
                <span className="d-small-icon blue">
                  <MessageCircle size={18} />
                </span>
                <span>
                  <strong>
                    {admin
                      ? "Your professional community"
                      : provider
                        ? "Check in with Olivia"
                        : "A note from Marcus"}
                  </strong>
                  <small>
                    {admin
                      ? "Review accounts and listing status"
                      : "Talk through the little details"}
                  </small>
                </span>
                <ArrowRight size={15} />
              </button>
              <button
                onClick={() =>
                  go(admin ? "payments" : provider ? "onboarding" : "reviews")
                }
              >
                <span className="d-small-icon mint">
                  <Star size={18} />
                </span>
                <span>
                  <strong>
                    {admin
                      ? "Payment records at a glance"
                      : provider
                        ? "Make your profile shine"
                        : "How did your project go?"}
                  </strong>
                  <small>
                    {admin
                      ? "Inspect demo transactions and refunds"
                      : provider
                        ? "Review your business setup"
                        : "Share a little feedback"}
                  </small>
                </span>
                <ArrowRight size={15} />
              </button>
            </div>
          </Panel>
          <div className="d-tip">
            <ShieldCheck size={21} />
            <h3>A good connection starts here.</h3>
            <p>
              Keep project details, estimates, and conversations in one place.
            </p>
            <Jump page="help">Visit the help center</Jump>
          </div>
        </aside>
      </div>
    </>
  );
}
export function Directory() {
  const { state, page, go } = useDemo();
  const [search, setSearch] = useState(""),
    [category, setCategory] = useState("All services"),
    [available, setAvailable] = useState(false),
    [sort, setSort] = useState("recommended");
  const saved = page === "saved";
  const pros = state.pros
    .filter(
      (p) =>
        !p.suspended &&
        (!saved || state.saved.includes(p.id)) &&
        (!available || p.available) &&
        (category === "All services" || p.category === category) &&
        `${p.business} ${p.name} ${p.category}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "price"
        ? a.rate - b.rate
        : sort === "rating"
          ? b.rating - a.rating
          : b.jobs - a.jobs,
    );
  return (
    <>
      <PageHead
        title={
          saved ? "Your home’s go-to people." : "Find someone who gets it done."
        }
        description={
          saved
            ? "A little list of professionals you’d love to work with."
            : "Explore local professionals, compare their work, and start a conversation."
        }
      />
      <div className="d-directory-toolbar">
        <label className="d-search">
          <Search size={19} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by service, business, or name"
            aria-label="Search professionals"
          />
        </label>
        <span className="d-location">
          <MapPin size={16} /> New York, NY
        </span>
        <label className="d-native-select">
          Sort
          <select
            aria-label="Sort professionals"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="recommended">Recommended</option>
            <option value="price">Price: low to high</option>
            <option value="rating">Highest rated</option>
          </select>
        </label>
      </div>
      <div className="d-filters">
        {["All services", ...services].map((c) => (
          <button
            aria-pressed={category === c}
            className={category === c ? "active" : ""}
            onClick={() => setCategory(c)}
            key={c}
          >
            {c}
          </button>
        ))}
        <label className="d-check">
          <input
            type="checkbox"
            checked={available}
            onChange={(e) => setAvailable(e.target.checked)}
          />{" "}
          Accepting requests
        </label>
      </div>
      <div className="d-results-label">
        <strong>
          {pros.length}{" "}
          {saved ? "saved professionals" : "professionals to meet"}
        </strong>
        <span>All profiles, ratings, and rates are fictional demo data.</span>
      </div>
      {pros.length ? (
        <div className="d-pro-grid">
          {pros.map((p) => (
            <ProCard pro={p} key={p.id} />
          ))}
        </div>
      ) : (
        <Empty
          title="No matches just yet"
          text="Try another service, save a professional, or clear your filters."
          action={
            <button
              className="d-secondary"
              onClick={() => {
                setCategory("All services");
                setSearch("");
                setAvailable(false);
                if (saved) go("discover");
              }}
            >
              Explore professionals
            </button>
          }
        />
      )}
    </>
  );
}
export function Professional() {
  const { state, id, go, open, act, role } = useDemo();
  const p = state.pros.find((p) => p.id === (id || "marcus"));
  if (!p)
    return (
      <Empty
        title="Professional not found"
        action={<Jump page="discover">Back to directory</Jump>}
      />
    );
  return (
    <>
      <button className="d-back" onClick={() => go("discover")}>
        ← Back to professionals
      </button>
      <div className="d-profile-banner">
        <Avatar name={p.name} color={p.color} large />
        <div>
          <p className="d-overline">{p.category} · NEW YORK</p>
          <h1>{p.business}</h1>
          <p>
            {p.name} <span className="d-divider">|</span>
            <Star size={15} fill="currentColor" /> {p.rating} · {p.reviews}{" "}
            sample reviews
          </p>
        </div>
        <button
          className="d-secondary"
          onClick={() => act({ type: "save", proId: p.id })}
        >
          <Heart size={16} />
          {state.saved.includes(p.id) ? "Saved" : "Save pro"}
        </button>
      </div>
      <div className="d-content-sidebar">
        <div>
          <Panel title="A little about me">
            <div className="d-padded">
              <p className="d-readable">{p.bio}</p>
              <div className="d-trust-row">
                <span>
                  <CheckCircle2 size={17} /> {p.jobs} example projects
                </span>
                <span>
                  <Clock size={17} /> Usually replies within 1 hour
                </span>
              </div>
              <p className="d-disclaimer">
                Credentials and activity shown in this demo are illustrative,
                not verified claims.
              </p>
            </div>
          </Panel>
          <Panel title="How I can help">
            <div className="d-service-list">
              {p.skills.map((skill) => (
                <div key={skill}>
                  <Wrench size={19} />
                  <strong>{skill}</strong>
                  <span>From {money(p.rate)} / hr</span>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Recent work · sample portfolio">
            <div className="d-portfolio">
              <img
                src="/home.jpg"
                alt="Illustrative living room inspiration, not a photograph of this professional’s work"
              />
              <div>
                <span className="d-overline">
                  SMALL CHANGES, BIG DIFFERENCE
                </span>
                <h3>A space that feels like home.</h3>
                <p>
                  Sample portfolio presentation. Professionals can showcase
                  their work here.
                </p>
                <p className="d-disclaimer">
                  Illustrative image by Clay Banks / Unsplash.
                </p>
              </div>
            </div>
          </Panel>
          <Panel title="What neighbors are saying">
            <div className="d-padded">
              <div className="d-stars">★★★★★</div>
              <p>
                “Clear communication, thoughtful work, and everything left
                clean. Exactly the help we needed.”
              </p>
              <small className="d-muted">
                Jamie R. · Fictional sample review
              </small>
              {state.reviews
                .filter((r) => r.proId === p.id)
                .map((r) => (
                  <div className="d-review" key={r.id}>
                    <strong>{state.customer.name}</strong>
                    <span>{"★".repeat(r.rating)}</span>
                    <p>{r.text}</p>
                    {r.reply && <blockquote>{r.reply}</blockquote>}
                  </div>
                ))}
            </div>
          </Panel>
        </div>
        <aside>
          <Panel>
            <div className="d-padded">
              <p className="d-muted">Starting rate</p>
              <div className="d-big-price">
                {money(p.rate)}
                <small> / hour</small>
              </div>
              <p className="d-muted">
                Your final estimate depends on the project. Talk through the
                details first.
              </p>
              <button
                className="d-primary full"
                onClick={() => open({ kind: "new-project", id: p.id })}
              >
                Request an estimate <ArrowRight size={16} />
              </button>
              <button
                className="d-secondary full"
                onClick={() => go("messages", p.id)}
              >
                <MessageCircle size={17} /> Message {p.name.split(" ")[0]}
              </button>
              <p className="d-disclaimer">
                Free to ask. No commitment until you accept.
              </p>
            </div>
          </Panel>
          <Panel title="Service area">
            <div className="d-padded">
              <MapPin size={22} />
              <h3>New York & nearby</h3>
              <p className="d-muted">
                Chelsea, West Village, Flatiron, and surrounding neighborhoods.
              </p>
              <Jump page="help">Questions before booking?</Jump>
            </div>
          </Panel>
        </aside>
      </div>
    </>
  );
}
export function Projects() {
  const { state, role, go, open, id } = useDemo();
  const [filter, setFilter] = useState("All projects"),
    [search, setSearch] = useState("");
  const jobs =
    id === "empty"
      ? []
      : state.projects.filter((p) => role !== "pro" || p.proId === "marcus");
  const shown = jobs.filter(
    (p) =>
      (filter === "All projects" ||
        (filter === "Active" &&
          ["requested", "quoted", "booked", "in_progress"].includes(
            p.status,
          )) ||
        (filter === "Completed" && p.status === "completed") ||
        (filter === "Cancelled" && p.status === "cancelled") ||
        (filter === "Needs attention" && p.status === "disputed")) &&
      p.title.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHead
        title={
          role === "pro"
            ? "Good work, in progress."
            : role === "admin"
              ? "Every project, in one place."
              : "From to-do to done."
        }
        description={
          role === "pro"
            ? "Manage your jobs, keep customers informed, and make each visit count."
            : "All the details and next steps for your home projects."
        }
        action={
          role === "customer" ? (
            <button
              className="d-primary"
              onClick={() => open({ kind: "new-project" })}
            >
              <Plus size={17} /> New project
            </button>
          ) : undefined
        }
      />
      <div className="d-page-tools">
        <div className="d-filters">
          {[
            "All projects",
            "Active",
            "Completed",
            "Cancelled",
            "Needs attention",
          ].map((f) => (
            <button
              className={filter === f ? "active" : ""}
              onClick={() => setFilter(f)}
              key={f}
            >
              {f}
            </button>
          ))}
        </div>
        <label className="d-search compact">
          <Search size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects"
            aria-label="Search projects"
          />
        </label>
      </div>
      {shown.length ? (
        <div className="d-job-grid">
          {shown.map((p) => (
            <article key={p.id} className="d-job-card">
              <div className="d-flex">
                <span className="d-overline">{p.category}</span>
                <Badge status={p.status} />
              </div>
              <h3>{p.title}</h3>
              <p>{p.description}</p>
              <div className="d-job-person">
                <Avatar
                  name={
                    role === "pro"
                      ? state.customer.name
                      : state.pros.find((pro) => pro.id === p.proId)?.name ||
                        "New project"
                  }
                  color="blue"
                />
                <div>
                  <strong>
                    {role === "pro"
                      ? state.customer.name
                      : state.pros.find((pro) => pro.id === p.proId)?.name ||
                        "Finding your pro"}
                  </strong>
                  <small>
                    {dateLabel(p.date)} · {p.time}
                  </small>
                </div>
                <strong>{money(p.budget)}</strong>
              </div>
              <button
                className="d-secondary full"
                onClick={() => go("project", p.id)}
              >
                View project <ArrowRight size={15} />
              </button>
            </article>
          ))}
        </div>
      ) : (
        <Empty
          title={
            id === "empty"
              ? "Your first project starts here."
              : "No projects match this view."
          }
          text={
            id === "empty"
              ? "Describe what you need and connect with a local professional."
              : "Try another status or search term."
          }
          action={
            <button
              className="d-primary"
              onClick={() =>
                role === "customer"
                  ? open({ kind: "new-project" })
                  : go("leads")
              }
            >
              {role === "customer"
                ? "Start a project"
                : "Explore opportunities"}
            </button>
          }
        />
      )}
    </>
  );
}
export function ProjectDetail() {
  const { state, id, role, go, open, act } = useDemo();
  const p = state.projects.find((p) => p.id === id);
  if (!p)
    return (
      <Empty
        title="This project couldn’t be found"
        action={<Jump page="projects">All projects</Jump>}
      />
    );
  const pro = state.pros.find((pro) => pro.id === p.proId),
    quote = state.quotes.find(
      (q) => q.projectId === p.id && q.status === "pending",
    ),
    payment = state.payments.find((t) => t.projectId === p.id),
    review = state.reviews.find((r) => r.projectId === p.id);
  const steps = [
    "Requested",
    "Estimated",
    "Booked",
    "In progress",
    "Completed",
  ];
  const current = (
    {
      requested: 0,
      quoted: 1,
      booked: 2,
      in_progress: 3,
      completed: 4,
      cancelled: -1,
      disputed: 3,
    } as const
  )[p.status];
  return (
    <>
      <button className="d-back" onClick={() => go("projects")}>
        ← Back to projects
      </button>
      <PageHead
        eyebrow={p.category}
        title={p.title}
        description={`Project #${p.id.slice(0, 8).toUpperCase()} · ${state.customer.name}`}
        action={<Badge status={p.status} />}
      />
      {p.status !== "cancelled" && (
        <div className="d-progress-steps">
          {steps.map((step, i) => (
            <div key={step} className={i <= current ? "done" : ""}>
              <span>{i < current ? <Check size={14} /> : i + 1}</span>
              {step}
            </div>
          ))}
        </div>
      )}
      <div className="d-content-sidebar">
        <div>
          <Panel title="Project details">
            <div className="d-padded">
              <p className="d-readable">{p.description}</p>
              <div className="d-detail-grid">
                <div>
                  <span>Appointment</span>
                  <strong>
                    {dateLabel(p.date)} at {p.time}
                  </strong>
                </div>
                <div>
                  <span>{quote ? "Estimate" : "Project total"}</span>
                  <strong>{money(p.budget)}</strong>
                </div>
                <div className="wide">
                  <span>Service address · fictional</span>
                  <strong>{p.address}</strong>
                </div>
              </div>
            </div>
          </Panel>
          {quote && (
            <Panel title="Your estimate is ready">
              <div className="d-padded">
                <div className="d-quote-total">
                  {money(quote.amount)}
                  <Badge status={quote.status} />
                </div>
                <p>{quote.details}</p>
                {role === "customer" && (
                  <div className="d-buttons">
                    <button
                      className="d-primary"
                      onClick={() => open({ kind: "accept", id: quote.id })}
                    >
                      Review & accept
                    </button>
                    <button
                      className="d-secondary"
                      onClick={() => open({ kind: "decline", id: quote.id })}
                    >
                      Decline estimate
                    </button>
                  </div>
                )}
              </div>
            </Panel>
          )}
          <Panel title="Project timeline">
            <ol className="d-timeline">
              {[...p.history].reverse().map((event, i) => (
                <li key={i}>
                  <span />
                  <div>
                    <strong>{event.text}</strong>
                    <small>{dateLabel(event.date)}</small>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>
          {p.status === "disputed" && (
            <Panel title="We’re helping sort this out">
              <div className="d-padded">
                <p>
                  A support case is open for this project. Keep the details in
                  your conversation so everyone has the same information.
                </p>
                <Jump page={role === "admin" ? "reports" : "help"}>
                  View support
                </Jump>
              </div>
            </Panel>
          )}
        </div>
        <aside>
          <Panel title="Your next step">
            <div className="d-padded d-action-stack">
              {role === "customer" && (
                <>
                  {p.status === "quoted" && quote ? (
                    <>
                      <p>
                        Review the work, price, and timing before you accept.
                      </p>
                      <button
                        className="d-primary"
                        onClick={() => open({ kind: "accept", id: quote.id })}
                      >
                        Accept estimate
                      </button>
                    </>
                  ) : p.status === "completed" && !payment ? (
                    <>
                      <p>
                        The work is complete. Review the total and try a demo
                        payment.
                      </p>
                      <button
                        className="d-primary"
                        onClick={() => open({ kind: "pay", id: p.id })}
                      >
                        Pay {money(p.budget)} · demo
                      </button>
                    </>
                  ) : p.status === "completed" && !review ? (
                    <>
                      <p>
                        How did it go? Your feedback helps the next neighbor.
                      </p>
                      <button
                        className="d-primary"
                        onClick={() => open({ kind: "review", id: p.id })}
                      >
                        Leave a review
                      </button>
                    </>
                  ) : (
                    <p>
                      {p.status === "requested"
                        ? "Your request is out. You’ll see an estimate here when your pro replies."
                        : p.status === "cancelled"
                          ? "This project is closed. You can start a new request whenever you’re ready."
                          : p.status === "disputed"
                            ? "Support is reviewing your project."
                            : "You’re all set. Message your pro if anything changes."}
                    </p>
                  )}
                  {["booked", "quoted", "requested"].includes(p.status) && (
                    <button
                      className="d-secondary"
                      onClick={() => open({ kind: "schedule", id: p.id })}
                    >
                      Change date or time
                    </button>
                  )}
                  {["booked", "quoted", "requested"].includes(p.status) && (
                    <button
                      className="d-text-danger"
                      onClick={() => open({ kind: "cancel", id: p.id })}
                    >
                      Cancel project
                    </button>
                  )}
                  {["completed", "in_progress"].includes(p.status) && (
                    <button
                      className="d-secondary"
                      onClick={() => open({ kind: "dispute", id: p.id })}
                    >
                      Get help with this project
                    </button>
                  )}
                </>
              )}
              {role === "pro" && p.proId === "marcus" && (
                <>
                  {p.status === "booked" && (
                    <button
                      className="d-primary"
                      onClick={() =>
                        act(
                          {
                            type: "status",
                            projectId: p.id,
                            status: "in_progress",
                          },
                          "Job started. The customer’s view is updated.",
                        )
                      }
                    >
                      Start job
                    </button>
                  )}
                  {p.status === "in_progress" && (
                    <button
                      className="d-primary"
                      onClick={() => open({ kind: "complete", id: p.id })}
                    >
                      Mark work complete
                    </button>
                  )}
                  {p.status === "requested" && (
                    <button
                      className="d-primary"
                      onClick={() => open({ kind: "quote", id: p.id })}
                    >
                      Send an estimate
                    </button>
                  )}
                  {p.status === "quoted" && (
                    <p>
                      Your estimate is with Olivia. We’ll update the project
                      when she responds.
                    </p>
                  )}
                  {["completed", "cancelled", "disputed"].includes(
                    p.status,
                  ) && (
                    <p>
                      No work actions are needed right now. Keep in touch
                      through the project conversation.
                    </p>
                  )}
                </>
              )}
              {role === "admin" && (
                <Jump page="reports">Review support cases</Jump>
              )}
              {payment && (
                <button
                  className="d-secondary"
                  onClick={() => open({ kind: "receipt", id: payment.id })}
                >
                  View receipt
                </button>
              )}
            </div>
          </Panel>
          {pro && (
            <Panel
              title={role === "pro" ? "Your customer" : "Your professional"}
            >
              <div className="d-padded">
                <div className="d-person-line">
                  <Avatar
                    name={role === "pro" ? state.customer.name : pro.name}
                    color={pro.color}
                  />
                  <div>
                    <strong>
                      {role === "pro" ? state.customer.name : pro.name}
                    </strong>
                    <small>{role === "pro" ? "Customer" : pro.business}</small>
                  </div>
                </div>
                <button
                  className="d-secondary full"
                  onClick={() => go("messages", pro.id)}
                >
                  <MessageCircle size={16} /> Open conversation
                </button>
              </div>
            </Panel>
          )}
          {p.proId === "marcus" && role !== "admin" && (
            <div className="d-preview-tip">
              <Sparkles size={18} />
              <p>See the other side of this project.</p>
              <button
                className="d-link"
                onClick={() =>
                  go("project", p.id, role === "customer" ? "pro" : "customer")
                }
              >
                View as {role === "customer" ? "provider" : "customer"}{" "}
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
