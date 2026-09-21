import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  ShieldCheck,
  Star,
  Video,
  VideoOff,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useDemo, type Modal } from "./context";
import { Avatar, Badge } from "./ui";
import { day, dateLabel, money, services, type Action } from "./model";
const titles: Record<string, [string, string]> = {
  "new-project": [
    "What’s on your list?",
    "A few details help the right professional understand your project.",
  ],
  quote: [
    "Send a thoughtful estimate.",
    "Make the work, price, and expectations clear.",
  ],
  accept: [
    "Good work starts with a clear plan.",
    "Review the details before confirming the demo booking.",
  ],
  decline: [
    "Decline this estimate?",
    "The request will reopen so you can discuss a different approach.",
  ],
  schedule: [
    "Find a time that works.",
    "Update the appointment in both demo workspaces.",
  ],
  cancel: [
    "Plans changed?",
    "Cancel this demo project. You can always create a new request.",
  ],
  complete: [
    "All done with the work?",
    "Marking complete makes the demo payment and review steps available to the customer.",
  ],
  dispute: ["Let’s help sort it out.", "Open a support case for this project."],
  pay: [
    "One last look, then you’re all set.",
    "Simulated checkout. No real payment will be made.",
  ],
  receipt: [
    "Your project receipt.",
    "A fictional receipt for your demo records.",
  ],
  review: [
    "How did it go?",
    "Share the details that will help the next homeowner.",
  ],
  reply: [
    "A thoughtful reply goes a long way.",
    "Respond to your customer’s demo review.",
  ],
  support: [
    "Tell us what happened.",
    "Create a local demo support case. No external team is contacted.",
  ],
  refund: [
    "Review this demo refund.",
    "This updates the fictional transaction and resolves its support case.",
  ],
  block: [
    "Conversation safety.",
    "Manage messages from this professional in your demo.",
  ],
  suspend: [
    "Manage this professional.",
    "Changes affect only the fictional preview directory.",
  ],
  reset: [
    "A fresh start for the demo?",
    "Your preview edits will be replaced with the original example data.",
  ],
  privacy: [
    "Your demo, your device.",
    "What this preview stores and what it doesn’t.",
  ],
  "delete-demo": [
    "Remove your demo changes?",
    "Restore fictional defaults. Your real ServiceTones account is not affected.",
  ],
  "audio-call": [
    "Audio call preview",
    "A simulation only. No microphone is accessed and no person is called.",
  ],
  "video-call": [
    "Video call preview",
    "A simulation only. No camera or microphone is accessed.",
  ],
};
export function DemoDialogs({
  modal,
  close,
  reset,
}: {
  modal: Modal;
  close: () => void;
  reset: () => void;
}) {
  const pair = titles[modal?.kind || ""] || [
    "Project details",
    "Explore this demo step.",
  ];
  return (
    <Dialog open={!!modal} onOpenChange={(v) => !v && close()}>
      <DialogContent
        className={
          "d-dialog " + (modal?.kind.includes("call") ? "d-call-dialog" : "")
        }
      >
        <DialogTitle>{pair[0]}</DialogTitle>
        <DialogDescription>{pair[1]}</DialogDescription>
        {modal && (
          <Body
            key={modal.kind + modal.id}
            modal={modal}
            close={close}
            reset={reset}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
function Body({
  modal,
  close,
  reset,
}: {
  modal: NonNullable<Modal>;
  close: () => void;
  reset: () => void;
}) {
  const { state, role, go, act, open } = useDemo();
  const { kind, id } = modal;
  const p = state.projects.find((p) => p.id === id),
    quote = state.quotes.find((q) => q.id === id),
    quoteProject = state.projects.find((p) => p.id === quote?.projectId),
    payment = state.payments.find((t) => t.id === id);
  const initialPro = state.pros.find((p) => p.id === id);
  const [category, setCategory] = useState(initialPro?.category || "Handyman"),
    [proId, setProId] = useState(initialPro?.id || ""),
    [rating, setRating] = useState(5),
    [callState, setCallState] = useState("ringing"),
    [muted, setMuted] = useState(false),
    [camera, setCamera] = useState(true);
  const perform = (action: Action, message: string) => {
    if (act(action, message)) close();
  };
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const value = (k: string) => String(f.get(k) || "");
    let action: Action | undefined;
    if (kind === "new-project")
      action = {
        type: "create",
        title: value("title"),
        category,
        description: value("description"),
        date: value("date"),
        time: value("time"),
        budget: Number(f.get("budget")),
        proId: proId || null,
      };
    if (kind === "quote")
      action = {
        type: "quote",
        projectId: id!,
        amount: Number(f.get("amount")),
        details: value("details"),
      };
    if (kind === "schedule")
      action = {
        type: "schedule",
        projectId: id!,
        date: value("date"),
        time: value("time"),
      };
    if (kind === "review")
      action = { type: "review", projectId: id!, rating, text: value("text") };
    if (kind === "reply")
      action = { type: "reply", reviewId: id!, text: value("text") };
    if (kind === "support")
      action = {
        type: "ticket",
        subject: value("subject"),
        message: value("message"),
      };
    if (
      action &&
      act(
        action,
        kind === "new-project"
          ? "Your demo project is created."
          : kind === "quote"
            ? "Estimate sent. Switch to customer to review it."
            : kind === "review"
              ? "Your demo review is published."
              : "Your demo changes are saved.",
      )
    ) {
      close();
      if (kind === "new-project") go("projects");
      if (kind === "quote") go("quotes");
    }
  }
  if (kind === "new-project")
    return (
      <form className="d-form" onSubmit={submit}>
        <label>
          What would you like help with?
          <input
            name="title"
            placeholder="e.g. Mount a TV in the living room"
            required
            minLength={4}
            maxLength={100}
          />
        </label>
        <label>
          Service
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setProId("");
            }}
          >
            {services.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          A few details
          <textarea
            name="description"
            placeholder="Tell your pro what you have in mind, what’s ready, and anything they should know."
            minLength={10}
            maxLength={3000}
            required
          />
        </label>
        <div className="d-form-row">
          <label>
            Preferred date
            <input
              name="date"
              type="date"
              min={day(0)}
              defaultValue={day(3)}
              required
            />
          </label>
          <label>
            Preferred time
            <input name="time" type="time" defaultValue="10:00" required />
          </label>
        </div>
        <div className="d-form-row">
          <label>
            Estimated budget ($)
            <input
              name="budget"
              type="number"
              min={1}
              max={100000}
              defaultValue={150}
              required
            />
          </label>
          <label>
            Send to
            <select value={proId} onChange={(e) => setProId(e.target.value)}>
              <option value="">Find a professional later</option>
              {state.pros
                .filter((p) => p.category === category && !p.suspended)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.business}
                  </option>
                ))}
            </select>
          </label>
        </div>
        <p className="d-disclaimer">
          Demo address: {state.customer.address}. No real professional is
          contacted.
        </p>
        <button className="d-primary">
          Send demo request <ArrowRight size={17} />
        </button>
      </form>
    );
  if (kind === "quote")
    return (
      <form className="d-form" onSubmit={submit}>
        <div className="d-dialog-summary">
          <strong>{p?.title}</strong>
          <p>{p?.description}</p>
        </div>
        <label>
          Project total ($)
          <input
            name="amount"
            type="number"
            min={1}
            max={100000}
            defaultValue={p?.budget}
            required
          />
        </label>
        <label>
          What’s included?
          <textarea
            name="details"
            minLength={10}
            maxLength={3000}
            placeholder="Labor, materials, expected time, and any exclusions…"
            required
            defaultValue="Includes labor, standard supplies, and cleanup. Any extra work will be discussed before it starts."
          />
        </label>
        <button className="d-primary">
          Send demo estimate <ArrowRight size={17} />
        </button>
      </form>
    );
  if (kind === "accept" && quote)
    return (
      <div className="d-dialog-stack">
        <div className="d-dialog-summary">
          <h3>{quoteProject?.title}</h3>
          <p>{quote.details}</p>
          <div>
            <span>Total estimate</span>
            <strong>{money(quote.amount)}</strong>
          </div>
          <div>
            <span>Appointment</span>
            <strong>
              {dateLabel(quoteProject!.date)} · {quoteProject?.time}
            </strong>
          </div>
        </div>
        <p className="d-muted">
          Accepting updates the project to Upcoming and adds it to the calendar.
          Nothing is charged.
        </p>
        <button
          className="d-primary"
          onClick={() =>
            perform(
              { type: "accept", quoteId: id! },
              "Estimate accepted. Your demo appointment is booked.",
            )
          }
        >
          Accept & book · demo
        </button>
        <button
          className="d-secondary"
          onClick={() => open({ kind: "decline", id })}
        >
          Not the right fit? Decline
        </button>
      </div>
    );
  if (kind === "schedule")
    return (
      <form className="d-form" onSubmit={submit}>
        <h3>{p?.title}</h3>
        <label>
          New date
          <input
            type="date"
            name="date"
            min={day(0)}
            defaultValue={p?.date}
            required
          />
        </label>
        <label>
          New time
          <input name="time" type="time" defaultValue={p?.time} required />
        </label>
        <p className="d-disclaimer">
          This demo updates the date immediately. Confirm schedule changes with
          the other person in a real project.
        </p>
        <button className="d-primary">Update appointment</button>
      </form>
    );
  if (kind === "pay" && p)
    return (
      <div className="d-dialog-stack">
        <div className="d-dialog-summary">
          <h3>{p.title}</h3>
          <div>
            <span>Agreed project amount</span>
            <strong>{money(p.budget)}</strong>
          </div>
          <div>
            <span>Additional demo fees</span>
            <strong>$0</strong>
          </div>
          <div className="total">
            <strong>Total</strong>
            <strong>{money(p.budget)}</strong>
          </div>
        </div>
        <div className="d-test-card">
          <CreditCard size={24} />
          <div>
            <strong>Test payment method</strong>
            <small>Demo Visa · 4242 · No real card</small>
          </div>
          <CheckCircle2 size={20} />
        </div>
        <p className="d-disclaimer">
          Clicking below creates a fictional receipt. No payment processor is
          connected.
        </p>
        <button
          className="d-primary"
          onClick={() => {
            if (
              act(
                { type: "pay", projectId: p.id },
                "Demo payment complete. No money was charged.",
              )
            ) {
              close();
              go("payments");
            }
          }}
        >
          Simulate payment of {money(p.budget)}
        </button>
      </div>
    );
  if (kind === "receipt" && payment) {
    const project = state.projects.find((p) => p.id === payment.projectId)!;
    const receipt = `SERVICETONES — DEMO RECEIPT\nReceipt: ${payment.id}\nProject: ${project.title}\nCustomer: ${state.customer.name}\nAmount: ${money(payment.amount)}\nStatus: ${payment.status}\nDate: ${payment.date}\nFictional transaction. No money was moved.`;
    return (
      <div className="d-dialog-stack">
        <div className="d-receipt">
          <CheckCircle2 size={38} />
          <h3>
            {payment.status === "refunded"
              ? "Demo refund recorded"
              : "Thanks for taking care of the details."}
          </h3>
          <p>
            #{payment.id} · {dateLabel(payment.date)}
          </p>
          <strong className="d-receipt-amount">{money(payment.amount)}</strong>
          <Badge status={payment.status} />
          <hr />
          <p>{project.title}</p>
          <p>{state.customer.name}</p>
          <p className="d-disclaimer">
            Fictional receipt · no real transaction
          </p>
        </div>
        <button
          className="d-secondary"
          onClick={() => {
            const link = document.createElement("a");
            const url = URL.createObjectURL(
              new Blob([receipt], { type: "text/plain" }),
            );
            link.href = url;
            link.download = `demo-receipt-${payment.id}.txt`;
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }}
        >
          <FileText size={16} /> Download demo receipt
        </button>
      </div>
    );
  }
  if (kind === "review" || kind === "reply")
    return (
      <form className="d-form" onSubmit={submit}>
        {kind === "review" && (
          <>
            <h3>{p?.title}</h3>
            <fieldset className="d-rating-input">
              <legend>Your rating</legend>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`Rate ${n} star${n === 1 ? "" : "s"}`}
                  aria-pressed={rating === n}
                  onClick={() => setRating(n)}
                >
                  <Star
                    size={30}
                    fill={n <= rating ? "currentColor" : "none"}
                  />
                </button>
              ))}
            </fieldset>
          </>
        )}
        <label>
          {kind === "reply"
            ? "Your reply"
            : "What would you like others to know?"}
          <textarea
            name="text"
            minLength={kind === "reply" ? 2 : 10}
            maxLength={1000}
            required
            placeholder={
              kind === "reply"
                ? "Thank your customer and respond to their feedback…"
                : "The little details make a big difference…"
            }
          />
        </label>
        <button className="d-primary">
          Publish demo {kind === "reply" ? "reply" : "review"}
        </button>
      </form>
    );
  if (kind === "support")
    return (
      <form className="d-form" onSubmit={submit}>
        <label>
          What can we help with?
          <input
            name="subject"
            minLength={4}
            maxLength={100}
            required
            placeholder="A short summary"
          />
        </label>
        <label>
          Tell us a little more
          <textarea
            name="message"
            minLength={10}
            maxLength={3000}
            required
            placeholder="What happened, and what would help?"
          />
        </label>
        <p className="d-disclaimer">
          Avoid real personal details. This fictional case appears in the admin
          demo.
        </p>
        <button className="d-primary">Create demo support case</button>
      </form>
    );
  if (kind.includes("call")) {
    const video = kind === "video-call";
    const pro = state.pros.find((p) => p.id === id)!;
    const name = role === "pro" ? state.customer.name : pro.name;
    return (
      <div className="d-dialog-stack">
        <div className="d-call-scene">
          <span className="d-call-sim-label">
            SIMULATED {video ? "VIDEO" : "AUDIO"} CALL
          </span>
          <Avatar name={name} color="blue" large />
          <h3>{name}</h3>
          <p>
            {
              (
                {
                  ringing: "Calling…",
                  connected: "Connected · preview only",
                  declined: "Call declined",
                  missed: "No answer · missed call",
                  failed: "Connection lost",
                } as Record<string, string>
              )[callState]
            }
          </p>
          {video && callState === "connected" && (
            <div className="d-call-self">
              {camera ? <Video size={20} /> : <VideoOff size={20} />}You ·
              preview
            </div>
          )}
        </div>
        {callState === "connected" && (
          <div className="d-call-actions">
            <button
              className="d-secondary"
              aria-label={muted ? "Unmute preview" : "Mute preview"}
              onClick={() => setMuted(!muted)}
            >
              {muted ? <MicOff size={19} /> : <Mic size={19} />}
            </button>
            {video && (
              <button
                className="d-secondary"
                aria-label={
                  camera ? "Turn preview camera off" : "Turn preview camera on"
                }
                onClick={() => setCamera(!camera)}
              >
                {camera ? <Video size={19} /> : <VideoOff size={19} />}
              </button>
            )}
            <button className="d-danger" onClick={close}>
              <PhoneOff size={18} /> End preview
            </button>
          </div>
        )}
        <div className="d-call-scenarios">
          {callState === "ringing" ? (
            <>
              <button
                className="d-primary"
                onClick={() => setCallState("connected")}
              >
                Simulate answer
              </button>
              <button
                className="d-secondary"
                onClick={() => setCallState("declined")}
              >
                Decline
              </button>
              <button
                className="d-secondary"
                onClick={() => setCallState("missed")}
              >
                No answer
              </button>
            </>
          ) : callState === "connected" ? (
            <button className="d-link" onClick={() => setCallState("failed")}>
              Simulate connection loss
            </button>
          ) : (
            <button
              className="d-primary"
              onClick={() => setCallState("ringing")}
            >
              Try again
            </button>
          )}
        </div>
        <p className="d-disclaimer">
          No camera, microphone, network call, or recording is used.
        </p>
      </div>
    );
  }
  if (kind === "privacy")
    return (
      <div className="d-dialog-stack">
        <ShieldCheck size={32} />
        <p>
          This interactive preview saves fictional projects, messages, settings,
          and transactions in your browser’s local storage so you can move
          between pages.
        </p>
        <p>
          It does not send demo messages, connect a payment processor, place
          actual calls, or send recovery emails. Use fictional information only.
        </p>
        <p>
          The live account application is separate and uses the ServiceTones
          backend. Reset demo affects only preview data.
        </p>
        <button className="d-primary" onClick={close}>
          Got it
        </button>
      </div>
    );
  const config: Record<
    string,
    { label: string; copy: string; run: () => void }
  > = {
    reset: {
      label: "Reset demo",
      copy: "Your real accounts and backend data are not affected.",
      run: reset,
    },
    "delete-demo": {
      label: "Remove demo changes",
      copy: "Your changes will be replaced with the original fictional examples.",
      run: reset,
    },
    cancel: {
      label: "Cancel this project",
      copy: p?.title || "",
      run: () =>
        perform(
          { type: "status", projectId: id!, status: "cancelled" },
          "Project cancelled in the demo.",
        ),
    },
    complete: {
      label: "Mark work complete",
      copy: p?.title || "",
      run: () =>
        perform(
          { type: "status", projectId: id!, status: "completed" },
          "Work marked complete. Switch to customer to pay and review.",
        ),
    },
    decline: {
      label: "Decline estimate",
      copy: quoteProject?.title || "",
      run: () =>
        perform(
          { type: "decline", quoteId: id! },
          "Estimate declined. The request is open again.",
        ),
    },
    dispute: {
      label: "Open support case",
      copy: p?.title || "",
      run: () =>
        perform(
          { type: "status", projectId: id!, status: "disputed" },
          "A demo support case is open. View it in the admin workspace.",
        ),
    },
    refund: {
      label: "Simulate full refund",
      copy: `${p?.title} · ${money(p?.budget || 0)}. No money will move.`,
      run: () =>
        perform(
          { type: "refund", projectId: id! },
          "Demo refund recorded and support case resolved.",
        ),
    },
    block: {
      label: state.blocked.includes(id!)
        ? "Unblock conversation"
        : "Block conversation",
      copy: "You can unblock it anytime from Settings. No one is notified.",
      run: () =>
        perform(
          { type: "block", proId: id! },
          "Demo conversation preference updated.",
        ),
    },
    suspend: {
      label: initialPro?.suspended ? "Restore listing" : "Suspend listing",
      copy: initialPro?.suspended
        ? "This professional will appear in the preview directory again."
        : "This fictional listing will be hidden from discovery. Existing demo projects stay in place.",
      run: () =>
        perform({ type: "suspend", proId: id! }, "Demo listing updated."),
    },
  };
  const confirmation = config[kind];
  return confirmation ? (
    <div className="d-dialog-stack">
      <p>{confirmation.copy}</p>
      <div className="d-buttons">
        <button
          className={
            [
              "cancel",
              "suspend",
              "reset",
              "delete-demo",
              "block",
              "refund",
            ].includes(kind)
              ? "d-danger"
              : "d-primary"
          }
          onClick={confirmation.run}
        >
          {confirmation.label}
        </button>
        <button className="d-secondary" onClick={close}>
          Keep as is
        </button>
      </div>
    </div>
  ) : (
    <p>
      This item is no longer available. Close this window and refresh the page.
    </p>
  );
}
