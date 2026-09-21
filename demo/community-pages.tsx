import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  HelpCircle,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Star,
  Video,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useDemo } from "./context";
import { Avatar, Badge, Empty, Jump, Panel } from "./ui";
import { money } from "./model";
import { PageHead } from "./core-pages";
export function Messages() {
  const { state, role, id, go, act, open } = useDemo();
  const [draft, setDraft] = useState(""),
    [search, setSearch] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const proId = role === "pro" ? "marcus" : id || "marcus";
  const pro = state.pros.find((p) => p.id === proId) || state.pros[0];
  const conversation = state.messages.filter((m) => m.proId === pro.id);
  const people = (
    role === "pro" ? state.pros.filter((p) => p.id === "marcus") : state.pros
  ).filter((p) =>
    `${p.name} ${p.business}`.toLowerCase().includes(search.toLowerCase()),
  );
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [conversation.length]);
  function send(e: FormEvent) {
    e.preventDefault();
    if (act({ type: "message", proId: pro.id, text: draft })) setDraft("");
  }
  return (
    <>
      <PageHead
        title="Good work starts with a conversation."
        description="Keep questions, project details, and updates together."
      />
      <div className="d-inbox">
        <aside className="d-inbox-list">
          <label className="d-search">
            <Search size={16} />
            <input
              placeholder="Search conversations"
              aria-label="Search conversations"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          {people.map((p) => {
            const last = state.messages.filter((m) => m.proId === p.id).at(-1);
            return (
              <button
                className={"d-thread " + (pro.id === p.id ? "active" : "")}
                key={p.id}
                onClick={() => {
                  go("messages", p.id);
                  setDraft("");
                }}
              >
                <Avatar
                  name={role === "pro" ? state.customer.name : p.name}
                  color={p.color}
                />
                <span>
                  <strong>
                    {role === "pro" ? state.customer.name : p.name}
                  </strong>
                  <small>{last?.text || "Start a conversation"}</small>
                </span>
              </button>
            );
          })}
        </aside>
        <section className="d-chat-pane">
          <header>
            <Avatar
              name={role === "pro" ? state.customer.name : pro.name}
              color={pro.color}
            />
            <div className="d-grow">
              <strong>{role === "pro" ? state.customer.name : pro.name}</strong>
              <small>
                Demo conversation ·{" "}
                {role === "pro" ? "Homeowner" : pro.business}
              </small>
            </div>
            <button
              className="d-icon-button"
              aria-label="Preview audio call"
              onClick={() => open({ kind: "audio-call", id: pro.id })}
            >
              <Phone size={20} />
            </button>
            <button
              className="d-icon-button"
              aria-label="Preview video call"
              onClick={() => open({ kind: "video-call", id: pro.id })}
            >
              <Video size={21} />
            </button>
            <button
              className="d-icon-button"
              aria-label="Conversation safety options"
              onClick={() => open({ kind: "block", id: pro.id })}
            >
              <ShieldCheck size={19} />
            </button>
          </header>
          <div className="d-conversation-banner">
            <ShieldCheck size={14} /> Messages in this preview stay in this
            browser. No one is contacted.
          </div>
          <div
            className="d-chat-messages"
            role="log"
            aria-label="Demo messages"
          >
            {conversation.length ? (
              conversation.map((m) => (
                <div
                  className={"d-bubble " + (m.sender === role ? "mine" : "")}
                  key={m.id}
                >
                  <p>{m.text}</p>
                  <small>
                    {new Date(m.date).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </small>
                </div>
              ))
            ) : (
              <Empty
                title="Say a little hello."
                text="Ask about availability or share a few project details."
              />
            )}
            <div ref={end} />
          </div>
          {state.blocked.includes(pro.id) ? (
            <div className="d-blocked">
              This conversation is blocked.
              <button
                className="d-link"
                onClick={() =>
                  act(
                    { type: "block", proId: pro.id },
                    "Conversation unblocked.",
                  )
                }
              >
                Unblock
              </button>
            </div>
          ) : (
            <>
              <div className="d-quick-replies">
                {[
                  "What time works for you?",
                  "Thanks for the update!",
                  "Can you share an estimate?",
                ].map((t) => (
                  <button key={t} onClick={() => setDraft(t)}>
                    {t}
                  </button>
                ))}
              </div>
              <form className="d-chat-composer" onSubmit={send}>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  aria-label="Write a demo message"
                  placeholder="Write a message…"
                  maxLength={4000}
                />
                <button
                  className="d-primary"
                  disabled={!draft.trim()}
                  aria-label="Send demo message"
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          )}
          <div className="d-reply-simulator">
            <span>Explore both sides:</span>
            <button
              onClick={() =>
                act(
                  {
                    type: "message",
                    proId: pro.id,
                    sender: role === "pro" ? "customer" : "pro",
                    text:
                      role === "pro"
                        ? "That works for me. Thanks for keeping me updated!"
                        : "Happy to help! I’ll check the details and follow up with you.",
                  },
                  "A fictional reply was added.",
                )
              }
            >
              Simulate {role === "pro" ? "customer" : "provider"} reply
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
export function Notifications() {
  const { state, act, go } = useDemo();
  const [unread, setUnread] = useState(false);
  const list = state.notices.filter((n) => !unread || !n.read);
  return (
    <>
      <PageHead
        title="The updates that matter."
        description="A quieter way to keep up with your home and your projects."
        action={
          <button
            className="d-secondary"
            onClick={() => act({ type: "read" }, "All updates marked as read.")}
          >
            <Check size={16} /> Mark all as read
          </button>
        }
      />
      <div className="d-filters">
        <button
          className={!unread ? "active" : ""}
          onClick={() => setUnread(false)}
        >
          All updates
        </button>
        <button
          className={unread ? "active" : ""}
          onClick={() => setUnread(true)}
        >
          Unread ({state.notices.filter((n) => !n.read).length})
        </button>
      </div>
      <Panel>
        {list.length ? (
          list.map((n) => (
            <button
              className={"d-notification " + (!n.read ? "unread" : "")}
              key={n.id}
              onClick={() => {
                act({ type: "read", id: n.id });
                go(n.page);
              }}
            >
              <span className="d-small-icon">
                <Bell size={19} />
              </span>
              <span className="d-grow">
                <strong>{n.title}</strong>
                <small>{n.text}</small>
              </span>
              {!n.read && <i />}
              <ChevronRight size={18} />
            </button>
          ))
        ) : (
          <Empty
            title="You’re all caught up."
            text="We’ll keep your next updates right here."
          />
        )}
      </Panel>
    </>
  );
}
const questions = [
  [
    "How do estimates work?",
    "Describe your project and a professional can send a written estimate. Review what is included, the total, and the timing before accepting. In this demo, accepting an estimate updates the schedule and both dashboards.",
  ],
  [
    "Can I change an appointment?",
    "Open the project and choose “Change date or time” while it is upcoming. The demo updates the appointment immediately. In a live service, confirm changes with your professional.",
  ],
  [
    "How do audio and video calls work?",
    "The demo lets you preview ringing, connected, declined, and failed states without camera or microphone access. The separate live app uses WebRTC and requires both participants to be online.",
  ],
  [
    "What if something goes wrong?",
    "Open your project and choose “Get help with this project.” You can then switch to the admin demo to inspect and resolve the case or simulate a refund.",
  ],
  [
    "Does this demo charge my card?",
    "No. Every payment, receipt, and refund is a simulation. Do not enter real financial or sensitive information in preview forms.",
  ],
  [
    "How do I become a professional?",
    "Switch to Provider demo and open Business setup. Explore your profile, services, availability, and estimates. The live app has a separate professional signup flow.",
  ],
];
export function Help() {
  const { state, open, go } = useDemo();
  const [search, setSearch] = useState("");
  return (
    <>
      <PageHead
        title="A little help, whenever you need it."
        description="Clear answers, useful tips, and a human path when things get complicated."
      />
      <label className="d-search d-help-search">
        <Search size={20} />
        <input
          placeholder="Search help topics"
          aria-label="Search help topics"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      <div className="d-three-col">
        {[
          ["Your projects", "Booking, estimates, and scheduling", "projects"],
          [
            "Conversations",
            "Messaging, calls, and staying connected",
            "messages",
          ],
          ["Payments", "Receipts and demo payment states", "payments"],
        ].map(([title, copy, page]) => (
          <button className="d-help-tile" key={title} onClick={() => go(page)}>
            <HelpCircle size={22} />
            <strong>{title}</strong>
            <span>{copy}</span>
            <ArrowRight size={17} />
          </button>
        ))}
      </div>
      <div className="d-content-sidebar">
        <Panel title="A few common questions">
          <div className="d-faq">
            {questions
              .filter(([q, a]) =>
                `${q} ${a}`.toLowerCase().includes(search.toLowerCase()),
              )
              .map(([q, a]) => (
                <details key={q}>
                  <summary>
                    {q}
                    <Plus size={16} />
                  </summary>
                  <p>{a}</p>
                </details>
              ))}
          </div>
        </Panel>
        <aside>
          <Panel title="Need a hand?">
            <div className="d-padded">
              <p className="d-muted">
                Tell us what happened and we’ll keep the details in a support
                case.
              </p>
              <button
                className="d-primary full"
                onClick={() => open({ kind: "support" })}
              >
                <MessageCircle size={16} /> Open a demo support case
              </button>
              <p className="d-disclaimer">
                Simulated support. No message is sent to an actual team.
              </p>
            </div>
          </Panel>
          <Panel title="Your support cases">
            {state.tickets.map((t) => (
              <div className="d-ticket-mini" key={t.id}>
                <strong>{t.subject}</strong>
                <small>#{t.id}</small>
                <Badge status={t.status} />
              </div>
            ))}
          </Panel>
        </aside>
      </div>
      <Panel title="Feel comfortable before work begins">
        <div className="d-safety-grid">
          <div>
            <ShieldCheck />
            <h3>Keep it in the conversation</h3>
            <p>
              Agree on the scope and price in writing. Keep sensitive
              information private.
            </p>
          </div>
          <div>
            <FileText />
            <h3>Ask the right questions</h3>
            <p>
              Discuss experience, materials, and any licensing or insurance
              needed for your job.
            </p>
          </div>
          <div>
            <Phone />
            <h3>Talk before the visit</h3>
            <p>
              A quick call can help clear up details and set expectations for
              both people.
            </p>
          </div>
        </div>
      </Panel>
    </>
  );
}
export function Settings() {
  const { state, role, act, open } = useDemo();
  const customer = role === "customer";
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    act(
      {
        type: "customer",
        name: String(f.get("name")),
        phone: String(f.get("phone")),
        address: String(f.get("address")),
      },
      "Demo profile saved.",
    );
  }
  return (
    <>
      <PageHead
        title="Make yourself at home."
        description="Manage your profile, preferences, and the way you stay connected."
      />
      <div className="d-content-sidebar">
        <div>
          <Panel title="Profile details">
            {customer ? (
              <form className="d-form d-padded" onSubmit={save}>
                <div className="d-person-line">
                  <Avatar name={state.customer.name} color="peach" large />
                  <span>Customer demo profile</span>
                </div>
                <div className="d-form-row">
                  <label>
                    Full name
                    <input
                      name="name"
                      defaultValue={state.customer.name}
                      required
                      minLength={2}
                      maxLength={80}
                    />
                  </label>
                  <label>
                    Email
                    <input value={state.customer.email} readOnly />
                    <small>Example address · no emails are sent</small>
                  </label>
                </div>
                <label>
                  Phone number
                  <input
                    name="phone"
                    defaultValue={state.customer.phone}
                    required
                    minLength={7}
                    maxLength={30}
                  />
                </label>
                <label>
                  Home address
                  <input
                    name="address"
                    defaultValue={state.customer.address}
                    required
                    minLength={10}
                    maxLength={200}
                  />
                </label>
                <button className="d-primary fit">Save changes</button>
              </form>
            ) : (
              <div className="d-padded">
                <div className="d-person-line">
                  <Avatar
                    name={role === "pro" ? "Marcus Johnson" : "Alex Morgan"}
                    color="mint"
                    large
                  />
                  <div>
                    <strong>
                      {role === "pro" ? "Marcus Johnson" : "Alex Morgan"}
                    </strong>
                    <small>
                      {role === "pro"
                        ? "marcus@example.com"
                        : "admin@example.com"}{" "}
                      · fictional account
                    </small>
                  </div>
                </div>
                <p className="d-muted">
                  {role === "pro"
                    ? "Business details can be changed on your business profile page."
                    : "This preview account can inspect fictional professionals and resolve demo support cases."}
                </p>
              </div>
            )}
          </Panel>
          <Panel title="Notification preferences">
            <div className="d-padded">
              {(
                [
                  [
                    "email",
                    "Email updates",
                    "Project updates and useful reminders.",
                  ],
                  ["messages", "New messages", "Know when someone replies."],
                  [
                    "reminders",
                    "Appointment reminders",
                    "A little heads-up before the visit.",
                  ],
                ] as const
              ).map(([key, title, description]) => (
                <div className="d-setting-row" key={key}>
                  <div>
                    <strong>{title}</strong>
                    <small>{description}</small>
                  </div>
                  <Switch
                    aria-label={title}
                    checked={state.notifications[key]}
                    onCheckedChange={(checked) =>
                      act({
                        type: "notifications",
                        settings: { ...state.notifications, [key]: checked },
                      })
                    }
                  />
                </div>
              ))}
              <p className="d-disclaimer">
                Preferences are saved only for this browser’s demo.
              </p>
            </div>
          </Panel>
          <Panel title="Blocked conversations">
            <div className="d-padded">
              {state.blocked.length ? (
                state.blocked.map((id) => (
                  <div className="d-setting-row" key={id}>
                    <strong>{state.pros.find((p) => p.id === id)?.name}</strong>
                    <button
                      className="d-secondary"
                      onClick={() =>
                        act(
                          { type: "block", proId: id },
                          "Conversation unblocked.",
                        )
                      }
                    >
                      Unblock
                    </button>
                  </div>
                ))
              ) : (
                <p className="d-muted">
                  You haven’t blocked any conversations.
                </p>
              )}
            </div>
          </Panel>
        </div>
        <aside>
          <Panel title="Privacy & account">
            <div className="d-padded d-action-stack">
              <p className="d-muted">
                Your preview data stays on this device. Resetting removes your
                demo edits and restores the original examples.
              </p>
              <button
                className="d-secondary"
                onClick={() => open({ kind: "reset" })}
              >
                Reset demo data
              </button>
              <button
                className="d-secondary"
                onClick={() => open({ kind: "privacy" })}
              >
                Privacy information
              </button>
              <button
                className="d-secondary"
                onClick={() => open({ kind: "delete-demo" })}
              >
                Remove demo changes
              </button>
            </div>
          </Panel>
        </aside>
      </div>
    </>
  );
}
export function BusinessProfile() {
  const { state, act, go } = useDemo();
  const p = state.pros.find((p) => p.id === "marcus")!;
  const [available, setAvailable] = useState(p.available);
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    act(
      {
        type: "profile",
        business: String(f.get("business")),
        bio: String(f.get("bio")),
        rate: Number(f.get("rate")),
        available,
      },
      "Your demo business profile is updated.",
    );
  }
  return (
    <>
      <PageHead
        title="Let your work make the introduction."
        description="A thoughtful profile helps the right customers find you."
        action={
          <button
            className="d-secondary"
            onClick={() => go("professional", "marcus", "customer")}
          >
            Preview customer view <ArrowRight size={16} />
          </button>
        }
      />
      <div className="d-content-sidebar">
        <Panel title="Your business">
          <form className="d-form d-padded" onSubmit={save}>
            <div className="d-person-line">
              <Avatar name={p.name} color="blue" large />
              <div>
                <strong>{p.name}</strong>
                <small>{p.category} · New York</small>
              </div>
            </div>
            <label>
              Business name
              <input
                name="business"
                defaultValue={p.business}
                required
                minLength={2}
                maxLength={100}
              />
            </label>
            <label>
              About your work
              <textarea
                name="bio"
                defaultValue={p.bio}
                required
                minLength={10}
                maxLength={1000}
              />
            </label>
            <label>
              Starting hourly rate ($)
              <input
                name="rate"
                type="number"
                defaultValue={p.rate}
                min={1}
                max={100000}
                required
              />
            </label>
            <div className="d-setting-row">
              <div>
                <strong>Accepting new requests</strong>
                <small>Let customers know you’re open for business.</small>
              </div>
              <Switch
                aria-label="Accepting new requests"
                checked={available}
                onCheckedChange={setAvailable}
              />
            </div>
            <button className="d-primary fit">Save business profile</button>
          </form>
        </Panel>
        <aside>
          <Panel title="Your services">
            <div className="d-padded d-action-stack">
              {p.skills.map((skill) => (
                <span key={skill} className="d-info-line">
                  <CheckCircle2 size={17} />
                  {skill}
                </span>
              ))}
            </div>
          </Panel>
          <Panel title="Finish your business setup">
            <div className="d-padded">
              <p className="d-muted">
                See how your profile, availability, and onboarding fit together.
              </p>
              <Jump page="onboarding">View setup checklist</Jump>
            </div>
          </Panel>
        </aside>
      </div>
    </>
  );
}
export function Availability() {
  const { state, act } = useDemo();
  const [days, setDays] = useState(state.availability);
  const [start, setStart] = useState("09:00"),
    [end, setEnd] = useState("17:00");
  return (
    <>
      <PageHead
        title="Make work fit your week."
        description="Choose the days you’re available for new appointments."
      />
      <Panel title="Weekly availability">
        <div className="d-padded">
          <p className="d-muted">
            Customers can discuss exact appointment times with you before
            booking.
          </p>
          <div className="d-availability">
            {[
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ].map((d) => (
              <div className="d-setting-row" key={d}>
                <strong>{d}</strong>
                <span>{days.includes(d) ? "Available" : "Not available"}</span>
                <Switch
                  aria-label={d + " availability"}
                  checked={days.includes(d)}
                  onCheckedChange={(checked) =>
                    setDays(
                      checked ? [...days, d] : days.filter((x) => x !== d),
                    )
                  }
                />
              </div>
            ))}
          </div>
          <button
            className="d-primary"
            onClick={() =>
              act(
                { type: "availability", days },
                "Your available days are saved.",
              )
            }
          >
            Save availability
          </button>
          <p className="d-disclaimer">
            Weekly availability is a demo preference. It does not automatically
            reject or move existing appointments.
          </p>
        </div>
      </Panel>
    </>
  );
}
export function Onboarding() {
  const { go, state } = useDemo();
  const steps = [
    [
      "Introduce your business",
      "Your name, story, and the services you offer.",
      "profile",
      true,
    ],
    [
      "Set your starting rate",
      "Help customers know what to expect.",
      "profile",
      true,
    ],
    [
      "Choose your working days",
      "Make room for the right projects.",
      "availability",
      state.availability.length > 0,
    ],
    [
      "Explore your first opportunity",
      "Read a request and send a clear estimate.",
      "leads",
      state.quotes.some((q) => q.proId === "marcus"),
    ],
  ];
  return (
    <>
      <PageHead
        eyebrow="BUSINESS SETUP"
        title="Welcome to the neighborhood, Marcus."
        description="A few thoughtful details are all it takes to make a good first impression."
      />
      <div className="d-onboarding">
        <Panel title="Your business, ready to meet its next customer">
          <div className="d-padded">
            <div className="d-completion-bar">
              <span
                style={{
                  width: `${(steps.filter((s) => s[3]).length / steps.length) * 100}%`,
                }}
              />
            </div>
            <p className="d-muted">
              {steps.filter((s) => s[3]).length} of {steps.length} demo setup
              steps ready
            </p>
            {steps.map(([title, description, page, done], i) => (
              <button
                className="d-onboarding-row"
                key={String(title)}
                onClick={() => go(String(page))}
              >
                <span className={done ? "complete" : ""}>
                  {done ? <Check size={19} /> : i + 1}
                </span>
                <div>
                  <strong>{String(title)}</strong>
                  <small>{String(description)}</small>
                </div>
                <ArrowRight size={17} />
              </button>
            ))}
          </div>
        </Panel>
        <div className="d-info-note">
          <ShieldCheck size={20} />
          <p>
            Identity checks, license verification, insurance review, and payout
            onboarding require real services before a public launch. This demo
            does not claim those checks are complete.
          </p>
        </div>
      </div>
    </>
  );
}
