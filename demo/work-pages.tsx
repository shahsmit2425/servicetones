import { useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  MapPin,
  Plus,
  Search,
  Star,
  Wallet,
} from "lucide-react";
import { useDemo } from "./context";
import { Avatar, Badge, Empty, Jump, Panel } from "./ui";
import { dateLabel, day, money } from "./model";
import { PageHead } from "./core-pages";
export function Quotes() {
  const { state, role, go, open, id } = useDemo();
  const [filter, setFilter] = useState("All");
  const quotes =
    id === "empty"
      ? []
      : state.quotes.filter(
          (q) =>
            (role !== "pro" || q.proId === "marcus") &&
            (filter === "All" || q.status === filter.toLowerCase()),
        );
  return (
    <>
      <PageHead
        title={
          role === "pro"
            ? "Clear estimates. Great beginnings."
            : "A good fit starts with a clear estimate."
        }
        description={
          role === "pro"
            ? "See which estimates are waiting, accepted, or declined."
            : "Review the scope, price, and timing before you book."
        }
      />
      <div className="d-filters">
        {["All", "Pending", "Accepted", "Declined"].map((f) => (
          <button
            className={filter === f ? "active" : ""}
            onClick={() => setFilter(f)}
            key={f}
          >
            {f}
          </button>
        ))}
      </div>
      {quotes.length ? (
        <div className="d-estimate-grid">
          {quotes.map((q) => {
            const p = state.projects.find((p) => p.id === q.projectId)!,
              pro = state.pros.find((p) => p.id === q.proId)!;
            return (
              <Panel key={q.id}>
                <div className="d-padded">
                  <div className="d-flex">
                    <span className="d-overline">
                      ESTIMATE #{q.id.slice(0, 9).toUpperCase()}
                    </span>
                    <Badge status={q.status} />
                  </div>
                  <h3>{p.title}</h3>
                  <div className="d-person-line">
                    <Avatar
                      name={role === "pro" ? state.customer.name : pro.name}
                      color={pro.color}
                    />
                    <div>
                      <strong>
                        {role === "pro" ? state.customer.name : pro.business}
                      </strong>
                      <small>
                        {dateLabel(p.date)} · {p.category}
                      </small>
                    </div>
                  </div>
                  <p className="d-muted">{q.details}</p>
                  <div className="d-estimate-footer">
                    <strong>{money(q.amount)}</strong>
                    {q.status === "pending" && role === "customer" ? (
                      <button
                        className="d-primary"
                        onClick={() => open({ kind: "accept", id: q.id })}
                      >
                        Review estimate
                      </button>
                    ) : (
                      <button
                        className="d-link"
                        onClick={() => go("project", p.id)}
                      >
                        View project <ArrowRight size={15} />
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
          title="No estimates in this view"
          text="Your next project estimate will appear here."
          action={
            <Jump page={role === "pro" ? "leads" : "discover"}>
              {role === "pro" ? "Explore opportunities" : "Find a pro"}
            </Jump>
          }
        />
      )}
    </>
  );
}
export function Leads() {
  const { state, open, go } = useDemo();
  const [category, setCategory] = useState("All"),
    [dismissed, setDismissed] = useState<string[]>([]);
  const projects = state.projects.filter(
    (p) =>
      p.status === "requested" &&
      !p.proId &&
      !dismissed.includes(p.id) &&
      (category === "All" || p.category === category),
  );
  return (
    <>
      <PageHead
        title="Your next great job is nearby."
        description="Review the details, ask questions, and send a thoughtful estimate."
      />
      <div className="d-info-note">
        <Check size={18} />
        <span>
          This demo has no lead fees. Submitting an estimate updates the
          customer’s preview instantly.
        </span>
      </div>
      <div className="d-filters">
        {["All", "Handyman", "Plumbing", "Cleaning"].map((c) => (
          <button
            className={category === c ? "active" : ""}
            onClick={() => setCategory(c)}
            key={c}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="d-lead-grid">
        {projects.map((p) => (
          <Panel key={p.id}>
            <div className="d-padded">
              <div className="d-flex">
                <span className="d-overline">{p.category}</span>
                <Badge status="New opportunity" />
              </div>
              <h3>{p.title}</h3>
              <p className="d-muted">{p.description}</p>
              <div className="d-lead-details">
                <span>
                  <MapPin size={15} /> Chelsea · 1.2 mi
                </span>
                <span>
                  <CalendarDays size={15} />
                  {dateLabel(p.date)}
                </span>
                <span>Budget {money(p.budget)}</span>
              </div>
              <div className="d-person-line">
                <Avatar name={state.customer.name} color="peach" />
                <div>
                  <strong>{state.customer.name}</strong>
                  <small>Homeowner · Demo request</small>
                </div>
              </div>
              <div className="d-buttons">
                <button
                  className="d-primary"
                  onClick={() => open({ kind: "quote", id: p.id })}
                >
                  Send an estimate
                </button>
                <button
                  className="d-secondary"
                  onClick={() => go("messages", "marcus")}
                >
                  Ask a question
                </button>
                <button
                  className="d-link muted"
                  onClick={() => setDismissed([...dismissed, p.id])}
                >
                  Not a fit
                </button>
              </div>
            </div>
          </Panel>
        ))}
      </div>
      {!projects.length && (
        <Empty
          title="You’re caught up."
          text="Try another service filter or explore your existing estimates."
          action={<Jump page="quotes">View estimates</Jump>}
        />
      )}
    </>
  );
}
export function Schedule() {
  const { state, role, go, open } = useDemo();
  const [offset, setOffset] = useState(0),
    [selected, setSelected] = useState<string | null>(null);
  const anchor = new Date(day(0) + "T12:00:00");
  anchor.setDate(1);
  anchor.setMonth(anchor.getMonth() + offset);
  const first = (anchor.getDay() + 6) % 7,
    total = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate();
  const key = (n: number) =>
    `${anchor.getFullYear()}-${String(anchor.getMonth() + 1).padStart(2, "0")}-${String(n).padStart(2, "0")}`;
  const jobs = state.projects.filter(
    (p) =>
      (role !== "pro" || p.proId === "marcus") &&
      ["booked", "in_progress", "completed"].includes(p.status),
  );
  const visible = jobs
    .filter((p) =>
      selected ? p.date === selected : p.date.startsWith(key(1).slice(0, 7)),
    )
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  return (
    <>
      <PageHead
        title={
          role === "pro"
            ? "A little structure for a busy week."
            : "Good things are on the calendar."
        }
        description="See your appointments and give each project the time it needs."
      />
      <div className="d-calendar-layout">
        <Panel>
          <div className="d-calendar-head">
            <h2>
              {anchor.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <div className="d-buttons">
              <button
                className="d-secondary"
                onClick={() => {
                  setOffset(0);
                  setSelected(day(0));
                }}
              >
                Today
              </button>
              <button
                className="d-icon-button"
                aria-label="Previous month"
                onClick={() => {
                  setOffset(offset - 1);
                  setSelected(null);
                }}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                className="d-icon-button"
                aria-label="Next month"
                onClick={() => {
                  setOffset(offset + 1);
                  setSelected(null);
                }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div className="d-calendar-week">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="d-calendar-grid">
            {Array.from({ length: first }, (_, i) => (
              <div className="d-calendar-cell outside" key={"blank" + i} />
            ))}
            {Array.from({ length: total }, (_, i) => {
              const date = key(i + 1),
                events = jobs.filter((p) => p.date === date);
              return (
                <button
                  key={date}
                  className={
                    "d-calendar-cell " +
                    (date === day(0) ? "today " : "") +
                    (selected === date ? "selected" : "")
                  }
                  onClick={() => setSelected(selected === date ? null : date)}
                >
                  <span>{i + 1}</span>
                  {events.map((p) => (
                    <small key={p.id} className={p.status}>
                      {p.time} {p.title}
                    </small>
                  ))}
                </button>
              );
            })}
          </div>
          <p className="d-calendar-caption">
            Select a day to see its appointments. Click it again to show the
            whole month.
          </p>
        </Panel>
        <Panel title={selected ? dateLabel(selected) : "This month"}>
          {visible.length ? (
            visible.map((p) => (
              <div className="d-agenda-item" key={p.id}>
                <span className="d-overline">
                  {dateLabel(p.date)} · {p.time}
                </span>
                <h3>{p.title}</h3>
                <p className="d-muted">
                  {role === "pro"
                    ? state.customer.name
                    : state.pros.find((pro) => pro.id === p.proId)?.name}
                </p>
                <Badge status={p.status} />
                <div className="d-buttons">
                  <button
                    className="d-link"
                    onClick={() => go("project", p.id)}
                  >
                    Details <ArrowRight size={14} />
                  </button>
                  {p.status === "booked" && (
                    <button
                      className="d-link"
                      onClick={() => open({ kind: "schedule", id: p.id })}
                    >
                      Reschedule
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <Empty
              title="A little breathing room."
              text="No appointments on these dates."
            />
          )}
        </Panel>
      </div>
    </>
  );
}
export function Payments() {
  const { state, role, open, go } = useDemo();
  const provider = role === "pro";
  const jobs = state.projects.filter((p) => !provider || p.proId === "marcus");
  const transactions = state.payments.filter((t) =>
    jobs.some((p) => p.id === t.projectId),
  );
  const unpaid = jobs.filter(
    (p) =>
      p.status === "completed" &&
      !state.payments.some((t) => t.projectId === p.id),
  );
  const total = transactions
    .filter((t) => t.status === "paid")
    .reduce((sum, t) => sum + t.amount, 0);
  return (
    <>
      <PageHead
        title={
          provider
            ? "Good work deserves a clear picture."
            : role === "admin"
              ? "Every transaction, accounted for."
              : "The details, down to the dollar."
        }
        description={
          provider
            ? "Track demo earnings and see which jobs are awaiting payment."
            : "Review project totals, demo payments, and receipts in one place."
        }
      />
      <div className="d-info-note">
        <Wallet size={19} />
        <span>
          <strong>Payment simulation.</strong> No card details are collected and
          no money is charged, transferred, or refunded.
        </span>
      </div>
      <section className="d-stats three">
        <div className="d-stat">
          <span>{provider ? "Total earned" : "Total paid"}</span>
          <strong>{money(total)}</strong>
          <small>Demo payments, excluding refunds</small>
        </div>
        <div className="d-stat">
          <span>{provider ? "Awaiting payment" : "Ready to pay"}</span>
          <strong>{money(unpaid.reduce((n, p) => n + p.budget, 0))}</strong>
          <small>
            {unpaid.length} completed project{unpaid.length === 1 ? "" : "s"}
          </small>
        </div>
        <div className="d-stat">
          <span>Refunded</span>
          <strong>
            {money(
              transactions
                .filter((t) => t.status === "refunded")
                .reduce((n, t) => n + t.amount, 0),
            )}
          </strong>
          <small>Resolved demo support cases</small>
        </div>
      </section>
      {unpaid.length > 0 && (
        <Panel
          title={
            provider ? "Customer payments pending" : "Ready for a final check"
          }
        >
          {unpaid.map((p) => (
            <div className="d-payment-due" key={p.id}>
              <div>
                <strong>{p.title}</strong>
                <small>Work completed · {dateLabel(p.date)}</small>
              </div>
              <strong>{money(p.budget)}</strong>
              {role === "customer" ? (
                <button
                  className="d-primary"
                  onClick={() => open({ kind: "pay", id: p.id })}
                >
                  Review & pay
                </button>
              ) : (
                <button
                  className="d-secondary"
                  onClick={() => go("project", p.id)}
                >
                  View job
                </button>
              )}
            </div>
          ))}
        </Panel>
      )}
      <Panel title={provider ? "Earnings history" : "Payment history"}>
        <div className="d-table-scroll">
          <table className="d-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td>
                    <strong>
                      {state.projects.find((p) => p.id === t.projectId)?.title}
                    </strong>
                    <small>#{t.id}</small>
                  </td>
                  <td>{dateLabel(t.date)}</td>
                  <td>
                    <strong>{money(t.amount)}</strong>
                  </td>
                  <td>
                    <Badge status={t.status} />
                  </td>
                  <td>
                    <button
                      className="d-link"
                      onClick={() => open({ kind: "receipt", id: t.id })}
                    >
                      <FileText size={16} /> View receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!transactions.length && (
          <Empty
            title="No payments yet"
            text="Completed demo payments will appear here."
          />
        )}
      </Panel>
      {provider && (
        <div className="d-info-note">
          <ShieldIcon />
          <span>
            Bank connections and actual payouts are outside this preview.
            Earnings here are fictional job totals.
          </span>
        </div>
      )}
    </>
  );
}
function ShieldIcon() {
  return <Check size={18} />;
}
export function Reviews() {
  const { state, role, open } = useDemo();
  const provider = role === "pro";
  const reviews = state.reviews.filter(
    (r) => !provider || r.proId === "marcus",
  );
  const eligible = state.projects.filter(
    (p) =>
      p.status === "completed" &&
      p.proId &&
      !state.reviews.some((r) => r.projectId === p.id),
  );
  return (
    <>
      <PageHead
        title={
          provider
            ? "Your reputation, one good job at a time."
            : "A little feedback goes a long way."
        }
        description={
          provider
            ? "Read customer feedback and leave a thoughtful reply."
            : "Help other homeowners find the right professional."
        }
      />
      {!provider && eligible.length > 0 && (
        <Panel title="How did it go?">
          {eligible.map((p) => (
            <div className="d-payment-due" key={p.id}>
              <Avatar
                name={state.pros.find((pro) => pro.id === p.proId)!.name}
              />
              <div className="d-grow">
                <strong>{p.title}</strong>
                <small>
                  {state.pros.find((pro) => pro.id === p.proId)?.business} ·
                  Completed {dateLabel(p.date)}
                </small>
              </div>
              <button
                className="d-primary"
                onClick={() => open({ kind: "review", id: p.id })}
              >
                <Star size={16} /> Leave a review
              </button>
            </div>
          ))}
        </Panel>
      )}
      <Panel
        title={provider ? "Customer reviews" : "Your published demo reviews"}
      >
        {reviews.length ? (
          reviews.map((r) => (
            <div className="d-review-card" key={r.id}>
              <div className="d-flex">
                <div className="d-person-line">
                  <Avatar name={state.customer.name} color="peach" />
                  <div>
                    <strong>
                      {provider
                        ? state.customer.name
                        : state.pros.find((p) => p.id === r.proId)?.business}
                    </strong>
                    <small>
                      {state.projects.find((p) => p.id === r.projectId)?.title}
                    </small>
                  </div>
                </div>
                <span className="d-stars">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </span>
              </div>
              <p>{r.text}</p>
              {r.reply ? (
                <blockquote>
                  <strong>Professional’s reply</strong>
                  {r.reply}
                </blockquote>
              ) : (
                provider && (
                  <button
                    className="d-link"
                    onClick={() => open({ kind: "reply", id: r.id })}
                  >
                    Write a reply <ArrowRight size={14} />
                  </button>
                )
              )}
            </div>
          ))
        ) : (
          <Empty
            title={
              provider ? "Your next review is on its way." : "No reviews yet."
            }
            text={
              provider
                ? "Switch to the customer demo and review the completed front-door project to see it here."
                : "Your feedback on completed projects will appear here."
            }
          />
        )}
      </Panel>
    </>
  );
}
