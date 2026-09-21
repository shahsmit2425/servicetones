import type { ReactNode } from "react";
import { ArrowRight, BriefcaseBusiness, MapPin, Star } from "lucide-react";
import { useDemo } from "./context";
import { dateLabel, money, type DemoPro, type Project } from "./model";
export const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
export function Avatar({
  name,
  color = "blue",
  large = false,
}: {
  name: string;
  color?: string;
  large?: boolean;
}) {
  return (
    <span className={`d-avatar ${color} ${large ? "large" : ""}`}>
      {initials(name)}
    </span>
  );
}
export function Badge({ status }: { status: string }) {
  return (
    <span className={"d-badge " + status}>
      {(
        {
          requested: "Request sent",
          quoted: "Estimate ready",
          booked: "Upcoming",
          in_progress: "In progress",
          completed: "Completed",
          cancelled: "Cancelled",
          disputed: "Needs attention",
          pending: "Awaiting reply",
          accepted: "Accepted",
          declined: "Declined",
          paid: "Paid",
          refunded: "Refunded",
          open: "Open",
          resolved: "Resolved",
        } as Record<string, string>
      )[status] || status}
    </span>
  );
}
export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={"d-panel " + className}>
      {title && (
        <div className="d-panel-head">
          <h2>{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
export function Empty({
  title = "Nothing here just yet",
  text = "Your updates will appear here.",
  action,
}: {
  title?: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="d-empty">
      <BriefcaseBusiness size={32} />
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}
export function Jump({
  page,
  id,
  children,
}: {
  page: string;
  id?: string;
  children: ReactNode;
}) {
  const { go } = useDemo();
  return (
    <button className="d-link" onClick={() => go(page, id)}>
      {children}
      <ArrowRight size={15} />
    </button>
  );
}
export function ProjectRow({ project: p }: { project: Project }) {
  const { state, go } = useDemo();
  const pro = state.pros.find((x) => x.id === p.proId);
  return (
    <button className="d-project-row" onClick={() => go("project", p.id)}>
      <span className="d-project-icon">
        <BriefcaseBusiness size={20} />
      </span>
      <span className="d-grow">
        <strong>{p.title}</strong>
        <small>
          {pro?.business || "Finding your professional"} · {p.category}
        </small>
      </span>
      <span className="d-row-date">{dateLabel(p.date)}</span>
      <Badge status={p.status} />
      <ArrowRight size={16} />
    </button>
  );
}
export function ProCard({ pro: p }: { pro: DemoPro }) {
  const { state, act, go } = useDemo();
  return (
    <article className="d-pro-card">
      <div className="d-flex">
        <Avatar name={p.name} color={p.color} />
        <button
          className={"d-save " + (state.saved.includes(p.id) ? "is-saved" : "")}
          aria-label={
            (state.saved.includes(p.id) ? "Unsave " : "Save ") + p.business
          }
          onClick={() => act({ type: "save", proId: p.id })}
        >
          {state.saved.includes(p.id) ? "♥" : "♡"}
        </button>
      </div>
      <p className="d-overline">{p.category}</p>
      <h3>{p.business}</h3>
      <p className="d-muted">{p.name}</p>
      <div className="d-rating">
        <Star size={15} fill="currentColor" />
        <strong>{p.rating}</strong>
        <span>({p.reviews} demo reviews)</span>
      </div>
      <p className="d-pro-bio">{p.bio}</p>
      <span className="d-meta">
        <MapPin size={14} /> New York ·{" "}
        {p.available ? "Accepting requests" : "Limited availability"}
      </span>
      <div className="d-pro-bottom">
        <span>
          <strong>{money(p.rate)}</strong> / hr
        </span>
        <button className="d-link" onClick={() => go("professional", p.id)}>
          View profile <ArrowRight size={15} />
        </button>
      </div>
    </article>
  );
}
