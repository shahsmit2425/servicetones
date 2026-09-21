"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { Toaster, toast } from "sonner";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Heart,
  House,
  LayoutGrid,
  MessageCircle,
  Paintbrush,
  Search,
  Sparkles,
  Sprout,
  Star,
  Wrench,
  Zap,
  Droplets,
  Plus,
  Check,
  MapPin,
  Phone,
  Video,
  Send,
  LogOut,
  UserRound,
  Bookmark,
  LoaderCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  categories,
  samplePros,
  type Pro,
  type Project,
  type User,
  type Conversation,
  type Message,
} from "@/shared/catalog";
import { api, API_URL, getToken, setToken, type AuthResult } from "@/lib/api";
import { useCalls } from "@/hooks/use-calls";
import { CallPanel } from "@/components/call-panel";
const icons = [LayoutGrid, Wrench, Sparkles, Droplets, Zap, Paintbrush, Sprout];
const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
function Choice({
  value,
  onChange,
  items,
  label,
}: {
  value: string;
  onChange: (s: string) => void;
  items: readonly string[];
  label: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="choice">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem value={item} key={item}>
            {item}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
function Empty({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="empty">
      <BriefcaseBusiness size={32} />
      <h3>{title}</h3>
      {children}
    </div>
  );
}
export default function Marketplace() {
  const [tab, setTab] = useState("discover"),
    [category, setCategory] = useState("All services"),
    [query, setQuery] = useState(""),
    [zip, setZip] = useState(""),
    [savedOnly, setSavedOnly] = useState(false);
  const [saved, setSaved] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("st-saved") || "[]");
    } catch {
      return [];
    }
  });
  const [user, setUser] = useState<User | null>(null),
    [pros, setPros] = useState<Pro[]>([]),
    [projects, setProjects] = useState<Project[]>([]),
    [conversations, setConversations] = useState<Conversation[]>([]),
    [activeId, setActiveId] = useState(""),
    [messages, setMessages] = useState<Message[]>([]),
    [draft, setDraft] = useState("");
  const [online, setOnline] = useState<boolean | null>(null),
    [socket, setSocket] = useState<Socket | null>(null),
    [connected, setConnected] = useState(false),
    [busy, setBusy] = useState(false),
    [loadingMessages, setLoadingMessages] = useState(false),
    [threadError, setThreadError] = useState("");
  const [modal, setModal] = useState<
      "auth" | "project" | "profile" | "account" | null
    >(null),
    [authMode, setAuthMode] = useState<"login" | "register">("login"),
    [role, setRole] = useState("customer"),
    [formCategory, setFormCategory] = useState("Handyman"),
    [selectedPro, setSelectedPro] = useState<Pro | null>(null),
    [projectPro, setProjectPro] = useState("none");
  const endOfMessages = useRef<HTMLDivElement>(null),
    activeRef = useRef(activeId),
    socketRef = useRef<Socket | null>(null);
  activeRef.current = activeId;
  socketRef.current = socket;
  const calls = useCalls(socket);
  const loadPros = useCallback(async () => {
    try {
      const data = await api<Pro[]>("/pros");
      if (!Array.isArray(data)) throw new Error("Unavailable");
      setPros(data);
      setOnline(true);
    } catch {
      setOnline(false);
    }
  }, []);
  const refresh = useCallback(async () => {
    const [p, c] = await Promise.all([
      api<Project[]>("/projects"),
      api<Conversation[]>("/conversations"),
    ]);
    setProjects(p);
    setConversations(c);
  }, []);
  useEffect(() => {
    void loadPros();
    if (getToken())
      void api<User>("/me")
        .then(setUser)
        .catch(() => setToken(""));
  }, [loadPros]);
  useEffect(() => {
    try {
      localStorage.setItem("st-saved", JSON.stringify(saved));
    } catch {}
  }, [saved]);
  useEffect(() => {
    if (!user) return;
    void refresh().catch((e) => toast.error(e.message));
    const s = io(API_URL || undefined, {
      auth: { token: getToken() },
      transports: ["websocket", "polling"],
    });
    setSocket(s);
    s.on("connect", () => {
      setConnected(true);
      void refresh().catch(() => {});
      if (activeRef.current) {
        const current = activeRef.current;
        void api<Message[]>(`/conversations/${current}/messages`)
          .then((m) => {
            if (activeRef.current === current) setMessages(m);
          })
          .catch(() => {});
      }
    });
    s.on("disconnect", () => setConnected(false));
    s.on("connect_error", () => setConnected(false));
    s.on("message", (m: Message) => {
      if (m.conversation_id === activeRef.current)
        setMessages((old) =>
          old.some((x) => x.id === m.id) ? old : [...old, m],
        );
      else if (m.sender_id !== user.id) toast.info("You have a new message.");
      void refresh().catch(() => {});
    });
    s.on("conversation", () => void refresh().catch(() => {}));
    s.on("project", () => void refresh().catch(() => {}));
    return () => {
      s.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [user, refresh]);
  useEffect(() => {
    if (!activeId || !user) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    setMessages([]);
    setThreadError("");
    setLoadingMessages(true);
    void api<Message[]>(`/conversations/${activeId}/messages`)
      .then((m) => {
        if (!cancelled)
          setMessages((old) => [
            ...m,
            ...old.filter((x) => !m.some((y) => y.id === x.id)),
          ]);
      })
      .catch((e) => {
        if (!cancelled) setThreadError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoadingMessages(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeId, user]);
  useEffect(
    () =>
      endOfMessages.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      }),
    [messages],
  );
  useEffect(() => {
    const context = (
      document as unknown as {
        modelContext?: {
          registerTool: (t: unknown, o: unknown) => Promise<void>;
        };
      }
    ).modelContext;
    if (!context) return;
    const controller = new AbortController();
    void Promise.resolve(
      context.registerTool(
        {
          name: "search_professionals",
          title: "Search professionals",
          description:
            "Filter the visible professional directory by service or business name.",
          inputSchema: {
            type: "object",
            properties: { query: { type: "string", maxLength: 100 } },
            required: ["query"],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false },
          execute: (input: unknown) => {
            const value = input as { query: unknown };
            if (typeof value?.query !== "string" || value.query.length > 100)
              throw new Error(
                "Provide a search query of 100 characters or fewer.",
              );
            setQuery(value.query);
            setCategory("All services");
            setSavedOnly(false);
            setTab("discover");
            return { query: value.query };
          },
        },
        { signal: controller.signal },
      ),
    ).catch(() => {});
    return () => controller.abort();
  }, []);
  const sample = pros.length === 0;
  const shown = (sample ? samplePros : pros).filter(
    (p) =>
      (category === "All services" || p.category === category) &&
      `${p.business} ${p.category} ${p.name}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (!zip || p.zip.startsWith(zip)) &&
      (!savedOnly || saved.includes(p.id)),
  );
  const active = conversations.find((c) => c.id === activeId);
  function requireUser() {
    if (user) return true;
    setAuthMode("login");
    setModal("auth");
    return false;
  }
  function openProject(p?: Pro) {
    if (!requireUser()) return;
    if (user?.role !== "customer") {
      toast.info(
        "Customer accounts can request projects. Your pro account receives requests.",
      );
      return;
    }
    setProjectPro(p?.id || "none");
    setFormCategory(p?.category || "Handyman");
    setModal("project");
  }
  async function contact(p: Pro) {
    if (p.id.startsWith("sample-")) {
      toast.info(
        "This is a sample profile. Registered professionals appear here when they join.",
      );
      return;
    }
    if (!requireUser()) return;
    if (user?.role !== "customer") {
      toast.info("Customer accounts start conversations with pros.");
      return;
    }
    setBusy(true);
    try {
      const c = await api<Conversation>("/conversations", { pro_id: p.id });
      await refresh();
      setActiveId(c.id);
      setTab("messages");
      setModal(null);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function submitAuth(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const f = new FormData(e.currentTarget);
    try {
      const data =
        authMode === "login"
          ? { email: f.get("email"), password: f.get("password") }
          : {
              name: f.get("name"),
              email: f.get("email"),
              password: f.get("password"),
              role,
              ...(role === "pro"
                ? {
                    business: f.get("business"),
                    category: formCategory,
                    bio: f.get("bio"),
                    zip: f.get("zip"),
                    rate: Number(f.get("rate")),
                  }
                : {}),
            };
      const result = await api<AuthResult>(`/auth/${authMode}`, data);
      setToken(result.token);
      setUser(result.user);
      setModal(null);
      await loadPros();
      toast.success(
        authMode === "login" ? "Welcome back." : "Your account is ready.",
      );
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function submitProject(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const f = new FormData(e.currentTarget);
    try {
      await api("/projects", {
        title: f.get("title"),
        description: f.get("description"),
        zip: f.get("zip"),
        category: formCategory,
        pro_id: projectPro === "none" ? null : projectPro,
      });
      await refresh();
      setTab("projects");
      setModal(null);
      toast.success("Project created.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !activeId) return;
    const text = draft;
    const thread = activeId;
    setBusy(true);
    try {
      const m = await api<Message>(`/conversations/${thread}/messages`, {
        body: text,
      });
      if (activeRef.current === thread) {
        setMessages((old) =>
          old.some((x) => x.id === m.id) ? old : [...old, m],
        );
        setDraft("");
      }
      await refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function changeStatus(p: Project, status: string) {
    setBusy(true);
    try {
      await api(`/projects/${p.id}`, { status }, "PATCH");
      await refresh();
      toast.success("Project updated.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function assignPro(project: Project, proId: string) {
    setBusy(true);
    try {
      await api(`/projects/${project.id}/pro`, { pro_id: proId }, "PATCH");
      await refresh();
      toast.success("Request sent to your pro.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    try {
      await api("/auth/logout", {});
    } catch {
    } finally {
      calls.end();
      socketRef.current?.disconnect();
      setToken("");
      setUser(null);
      setProjects([]);
      setConversations([]);
      setMessages([]);
      setActiveId("");
      setModal(null);
      setTab("discover");
      setBusy(false);
    }
  }
  return (
    <div className="shell">
      <Toaster richColors position="top-center" />
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-icon">
            <House size={22} />
          </span>
          service<span>tones</span>
          <i />
        </a>
        <Tabs value={tab} onValueChange={setTab} className="nav-tabs">
          <TabsList className="nav-list">
            <TabsTrigger value="discover">Find a pro</TabsTrigger>
            <TabsTrigger value="projects">My projects</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>
        </Tabs>
        <button
          className="outline"
          onClick={() => {
            if (user) setModal("account");
            else {
              setRole("pro");
              setAuthMode("register");
              setModal("auth");
            }
          }}
        >
          {user ? user.name.split(" ")[0] : "Join as a pro"}{" "}
          {user ? <UserRound size={16} /> : <ArrowUpRight size={16} />}
        </button>
        <button
          className="avatar"
          aria-label={user ? "My account" : "Sign in"}
          onClick={() => {
            setAuthMode("login");
            setModal(user ? "account" : "auth");
          }}
        >
          {user ? initials(user.name) : "ST"}
        </button>
      </header>
      <main>
        {tab === "discover" ? (
          <>
            <div className="page-heading">
              <div>
                <p className="eyebrow">YOUR HOME, IN GOOD HANDS</p>
                <h1>A little help. A happier home.</h1>
                <p>Find the right local pro for whatever’s on your list.</p>
              </div>
              <button
                className="primary"
                aria-label="Start a project"
                onClick={() => openProject()}
              >
                <Plus size={18} /> Start a project
              </button>
            </div>
            <section className="hero">
              <img
                src="/home.jpg"
                alt="A bright living room with a blue sofa and large windows"
              />
              <div className="hero-content">
                <span className="pill">
                  <Sparkles size={14} /> Make room for what matters
                </span>
                <h2>
                  Great projects start
                  <br />
                  with great people.
                </h2>
                <p>Small fix or a fresh start. Find your person.</p>
                <form
                  className="searchbox"
                  onSubmit={(e) => {
                    e.preventDefault();
                    document
                      .getElementById("results")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <Search size={20} />
                  <input
                    aria-label="Search services"
                    placeholder="What can we help with?"
                    maxLength={100}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <span className="search-divider" />
                  <MapPin size={17} />
                  <input
                    className="zip-input"
                    aria-label="Filter by ZIP code"
                    placeholder="ZIP code"
                    inputMode="numeric"
                    maxLength={5}
                    value={zip}
                    onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
                  />
                  <button aria-label="Search">
                    <ArrowRight size={20} />
                  </button>
                </form>
              </div>
            </section>
            <section className="categories" aria-label="Service categories">
              {categories.map((c, i) => {
                const Icon = icons[i];
                return (
                  <button
                    key={c}
                    className={category === c ? "active" : ""}
                    aria-pressed={category === c}
                    onClick={() => setCategory(c)}
                  >
                    <span>
                      <Icon size={23} />
                    </span>
                    {c}
                  </button>
                );
              })}
            </section>
            <div className="results-layout" id="results">
              <section>
                <div className="section-heading">
                  <div>
                    <h2>Meet your next go-to pro</h2>
                    <p>
                      {sample
                        ? "Explore sample profiles while our community gets started."
                        : "Good people. Great work. Right in your neighborhood."}
                    </p>
                  </div>
                  <button
                    className={
                      "outline saved-filter " + (savedOnly ? "selected" : "")
                    }
                    onClick={() => setSavedOnly(!savedOnly)}
                    aria-pressed={savedOnly}
                  >
                    <Bookmark size={15} /> Saved
                  </button>
                </div>
                {online === false && (
                  <p className="notice">
                    Browsing preview · Accounts, projects, and messages need the
                    connected ServiceTones server.
                  </p>
                )}
                {online === null ? (
                  <Empty title="Finding professionals…">
                    <LoaderCircle className="animate-spin" />
                  </Empty>
                ) : (
                  <div className="pro-grid">
                    {shown.map((p, i) => (
                      <article className="pro-card" key={p.id}>
                        <div className="pro-top">
                          <span className={"pro-avatar color-" + (i % 6)}>
                            {initials(p.name)}
                          </span>
                          <button
                            aria-label={
                              (saved.includes(p.id) ? "Unsave " : "Save ") +
                              p.business
                            }
                            aria-pressed={saved.includes(p.id)}
                            className={
                              "icon-btn " +
                              (saved.includes(p.id) ? "saved" : "")
                            }
                            onClick={() =>
                              setSaved((s) =>
                                s.includes(p.id)
                                  ? s.filter((x) => x !== p.id)
                                  : [...s, p.id],
                              )
                            }
                          >
                            <Heart
                              size={19}
                              fill={
                                saved.includes(p.id) ? "currentColor" : "none"
                              }
                            />
                          </button>
                        </div>
                        <p className="category-label">{p.category}</p>
                        <h3>{p.business}</h3>
                        <p className="pro-name">{p.name}</p>
                        <div className="rating">
                          <Star size={14} fill="currentColor" />{" "}
                          <strong>{p.reviews ? p.rating : "New"}</strong>
                          <span>
                            {p.reviews
                              ? `(${p.reviews} sample reviews)`
                              : "On ServiceTones"}
                          </span>
                        </div>
                        <p className="pro-bio">
                          {p.bio ||
                            "Get in touch to talk about your next home project."}
                        </p>
                        <div className="card-bottom">
                          <span>
                            <strong>${p.rate}</strong> / hour
                          </span>
                          <button
                            className="text-btn"
                            onClick={() => {
                              setSelectedPro(p);
                              setModal("profile");
                            }}
                          >
                            View profile <ArrowUpRight size={15} />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
                {online !== null && shown.length === 0 && (
                  <Empty title="No matches just yet">
                    <p>Try another service or ZIP code.</p>
                    <button
                      className="outline"
                      onClick={() => {
                        setQuery("");
                        setZip("");
                        setCategory("All services");
                        setSavedOnly(false);
                      }}
                    >
                      Clear filters
                    </button>
                  </Empty>
                )}
              </section>
              <aside>
                <div className="project-prompt">
                  <span className="small-icon">
                    <BriefcaseBusiness size={22} />
                  </span>
                  <h3>
                    Let’s get that
                    <br />
                    project started.
                  </h3>
                  <p>Tell us what you need. Connect with a pro who gets it.</p>
                  <button onClick={() => openProject()}>
                    Post a project <ArrowRight size={17} />
                  </button>
                  <div className="fine">
                    <Check size={14} /> Free to post. No commitment.
                  </div>
                </div>
                <div className="how">
                  <h3>A better way to get it done</h3>
                  <p>
                    <MessageCircle size={18} />
                    <span>
                      <strong>Talk it through</strong>Chat before you commit.
                    </span>
                  </p>
                  <p>
                    <Phone size={18} />
                    <span>
                      <strong>A real conversation</strong>Connect by voice or
                      video.
                    </span>
                  </p>
                  <a
                    href="https://unsplash.com/photos/nL2CbhdingE"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Photo by Clay Banks / Unsplash
                  </a>
                </div>
              </aside>
            </div>
          </>
        ) : null}
        {tab === "projects" && (
          <>
            <div className="page-heading">
              <div>
                <p className="eyebrow">FROM TO-DO TO DONE</p>
                <h1>
                  {user?.role === "pro"
                    ? "Your project requests"
                    : "My projects"}
                </h1>
                <p>Keep the details and the next steps in one place.</p>
              </div>
              {user?.role !== "pro" && (
                <button className="primary" onClick={() => openProject()}>
                  <Plus size={18} /> New project
                </button>
              )}
            </div>
            {!user ? (
              <Empty title="Your next project starts here">
                <p>Sign in to manage your home projects.</p>
                <button className="primary" onClick={requireUser}>
                  Sign in
                </button>
              </Empty>
            ) : projects.length === 0 ? (
              <Empty
                title={
                  user.role === "pro"
                    ? "Ready for your first request"
                    : "A fresh start for your home"
                }
              >
                <p>
                  {user.role === "pro"
                    ? "Your profile is listed. Customer requests will appear here."
                    : "Tell us what you have in mind, and choose a pro to help."}
                </p>
              </Empty>
            ) : (
              <div className="project-grid">
                {projects.map((p) => (
                  <article className="project-card" key={p.id}>
                    <div className="section-heading">
                      <span className="category-label">{p.category}</span>
                      <span className={"status " + p.status}>{p.status}</span>
                    </div>
                    <h3>{p.title}</h3>
                    <p>{p.description}</p>
                    <div className="project-meta">
                      <MapPin size={15} />
                      {p.zip}
                      <span>{new Date(p.created_at).toLocaleDateString()}</span>
                    </div>
                    {!p.pro_id && (
                      <div className="notice">
                        <p>Choose a professional for this request.</p>
                        {p.status === "requested" && (
                          <Select
                            disabled={busy}
                            onValueChange={(id) => void assignPro(p, id)}
                          >
                            <SelectTrigger
                              className="choice"
                              aria-label="Assign professional"
                            >
                              <SelectValue placeholder="Choose a pro" />
                            </SelectTrigger>
                            <SelectContent>
                              {pros
                                .filter((pro) => pro.category === p.category)
                                .map((pro) => (
                                  <SelectItem key={pro.id} value={pro.id}>
                                    {pro.business}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        )}
                        {!pros.some((pro) => pro.category === p.category) && (
                          <p>No registered pros for this service yet.</p>
                        )}
                      </div>
                    )}
                    <div className="project-actions">
                      {user.role === "pro" && p.status === "requested" && (
                        <button
                          className="primary"
                          disabled={busy}
                          onClick={() => void changeStatus(p, "accepted")}
                        >
                          Accept request
                        </button>
                      )}
                      {user.role === "pro" && p.status === "accepted" && (
                        <button
                          className="primary"
                          disabled={busy}
                          onClick={() => void changeStatus(p, "completed")}
                        >
                          Mark completed
                        </button>
                      )}
                      {user.role === "customer" &&
                        !["completed", "cancelled"].includes(p.status) && (
                          <button
                            className="outline"
                            disabled={busy}
                            onClick={() => void changeStatus(p, "cancelled")}
                          >
                            Cancel request
                          </button>
                        )}
                      {p.pro_id && (
                        <button
                          className="text-btn"
                          onClick={() => {
                            const conversation = conversations.find(
                              (c) =>
                                c.customer_id === p.customer_id &&
                                c.pro_id === p.pro_id,
                            );
                            if (conversation) {
                              setActiveId(conversation.id);
                              setTab("messages");
                            } else {
                              const pro = pros.find((x) => x.id === p.pro_id);
                              if (pro && user.role === "customer")
                                void contact(pro);
                              else
                                toast.info(
                                  "Refresh to load this conversation.",
                                );
                            }
                          }}
                        >
                          Open conversation <MessageCircle size={15} />
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
        {tab === "messages" && (
          <>
            <div className="page-heading">
              <div>
                <p className="eyebrow">LET’S TALK IT THROUGH</p>
                <h1>Messages</h1>
                <p>
                  A quick question. A project update. A little peace of mind.
                </p>
              </div>
              {user && (
                <span className="connection-status">
                  {connected ? "Chat connected" : "Reconnecting…"}
                </span>
              )}
            </div>
            {!user ? (
              <Empty title="Stay in touch with your pro">
                <p>Sign in to send messages and make audio or video calls.</p>
                <button className="primary" onClick={requireUser}>
                  Sign in
                </button>
              </Empty>
            ) : (
              <div className="inbox">
                <div className="thread-list">
                  <h3>
                    Conversations <span>{conversations.length}</span>
                  </h3>
                  {conversations.length === 0 && (
                    <p className="thread-empty">
                      Find a pro and send your first hello.
                    </p>
                  )}
                  {conversations.map((c) => (
                    <button
                      key={c.id}
                      className={
                        "thread " + (activeId === c.id ? "active" : "")
                      }
                      onClick={() => {
                        setActiveId(c.id);
                        setDraft("");
                      }}
                    >
                      <span className="pro-avatar">{initials(c.name)}</span>
                      <span>
                        <strong>{c.name}</strong>
                        <small>
                          {c.last_message || "Start the conversation"}
                        </small>
                      </span>
                    </button>
                  ))}
                </div>
                <div className="chat">
                  {active ? (
                    <>
                      <div className="chat-header">
                        <div>
                          <strong>{active.name}</strong>
                          <p>Private conversation</p>
                        </div>
                        <button
                          className="icon-btn"
                          aria-label="Audio call"
                          disabled={!connected || !!calls.call}
                          onClick={() =>
                            void calls.start(active.id, active.name, false)
                          }
                        >
                          <Phone size={21} />
                        </button>
                        <button
                          className="icon-btn"
                          aria-label="Video call"
                          disabled={!connected || !!calls.call}
                          onClick={() =>
                            void calls.start(active.id, active.name, true)
                          }
                        >
                          <Video size={22} />
                        </button>
                      </div>
                      <div
                        className="message-list"
                        role="log"
                        aria-live="polite"
                        aria-label="Conversation messages"
                      >
                        {loadingMessages && (
                          <p className="thread-empty">Loading messages…</p>
                        )}
                        {threadError && <p className="notice">{threadError}</p>}
                        {!loadingMessages && messages.length === 0 && (
                          <p className="thread-empty">
                            Say hello and share a little about your project.
                          </p>
                        )}
                        {messages.map((m) => (
                          <div
                            key={m.id}
                            className={
                              "message " +
                              (m.sender_id === user.id ? "mine" : "")
                            }
                          >
                            <p>{m.body}</p>
                            <time>
                              {new Date(m.created_at).toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </time>
                          </div>
                        ))}
                        <div ref={endOfMessages} />
                      </div>
                      <form className="composer" onSubmit={sendMessage}>
                        <input
                          aria-label="Message"
                          placeholder="Write a message…"
                          value={draft}
                          maxLength={4000}
                          onChange={(e) => setDraft(e.target.value)}
                        />
                        <button
                          className="primary"
                          aria-label="Send message"
                          disabled={busy || !draft.trim()}
                        >
                          <Send size={19} />
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="chat-empty">
                      <MessageCircle size={40} />
                      <h3>Good work starts with a conversation.</h3>
                      <p>Choose a conversation to get started.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
        <footer>
          <span>© {new Date().getFullYear()} ServiceTones</span>
          <span>
            {sample
              ? "Sample profiles · Illustrative rates and reviews"
              : "Connect. Plan. Get it done."}
          </span>
          <span>Home feels better with a little help.</span>
        </footer>
      </main>
      <Dialog
        open={modal !== null}
        onOpenChange={(v) => !v && !busy && setModal(null)}
      >
        <DialogContent className="app-dialog">
          <DialogTitle>
            {modal === "auth"
              ? authMode === "login"
                ? "Welcome back."
                : "Make yourself at home."
              : modal === "project"
                ? "What’s on your list?"
                : modal === "account"
                  ? "Your account"
                  : selectedPro?.business}
          </DialogTitle>
          <DialogDescription>
            {modal === "auth"
              ? "Connect with good people and get your next project going."
              : modal === "project"
                ? "Share a few details so your pro can understand the job."
                : modal === "account"
                  ? `${user?.role === "pro" ? "Professional" : "Customer"} account`
                  : selectedPro?.category}
          </DialogDescription>
          {modal === "auth" && (
            <form onSubmit={submitAuth} className="form-stack">
              {online === false && (
                <p className="notice">
                  This browsing preview is not connected to the account server.
                  Run the repository locally or connect a deployed API to use
                  accounts.
                </p>
              )}
              {authMode === "register" && (
                <>
                  <label>
                    Full name
                    <input
                      name="name"
                      autoComplete="name"
                      required
                      minLength={2}
                      maxLength={80}
                    />
                  </label>
                  <label>
                    I’m here to
                    <Choice
                      label="Account type"
                      value={role}
                      onChange={setRole}
                      items={["customer", "pro"]}
                    />
                  </label>
                </>
              )}
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                />
              </label>
              <label>
                Password
                <input
                  name="password"
                  type="password"
                  required
                  minLength={authMode === "register" ? 12 : 1}
                  maxLength={128}
                  autoComplete={
                    authMode === "register"
                      ? "new-password"
                      : "current-password"
                  }
                />
                {authMode === "register" && (
                  <small>Use at least 12 characters.</small>
                )}
              </label>
              {authMode === "register" && role === "pro" && (
                <>
                  <label>
                    Business name
                    <input
                      name="business"
                      required
                      minLength={2}
                      maxLength={100}
                    />
                  </label>
                  <label>
                    Primary service
                    <Choice
                      label="Primary service"
                      value={formCategory}
                      onChange={setFormCategory}
                      items={categories.slice(1)}
                    />
                  </label>
                  <div className="form-row">
                    <label>
                      Business ZIP
                      <input
                        name="zip"
                        required
                        inputMode="numeric"
                        pattern="[0-9]{5}"
                        maxLength={5}
                      />
                    </label>
                    <label>
                      Hourly rate ($)
                      <input
                        name="rate"
                        required
                        type="number"
                        min="1"
                        max="10000"
                        step="0.01"
                      />
                    </label>
                  </div>
                  <label>
                    About your work
                    <textarea
                      name="bio"
                      maxLength={1000}
                      placeholder="Tell customers what you do best."
                    />
                  </label>
                </>
              )}
              <button className="primary" disabled={busy || online === false}>
                {busy
                  ? "Please wait…"
                  : authMode === "login"
                    ? "Sign in"
                    : "Create account"}
              </button>
              <button
                type="button"
                className="text-btn"
                onClick={() => {
                  setAuthMode(authMode === "login" ? "register" : "login");
                  setRole("customer");
                }}
              >
                {authMode === "login"
                  ? "New here? Create an account"
                  : "Already have an account? Sign in"}
              </button>
            </form>
          )}
          {modal === "project" && (
            <form className="form-stack" onSubmit={submitProject}>
              <label>
                Project title
                <input
                  name="title"
                  placeholder="e.g. Fix a leaking kitchen faucet"
                  required
                  minLength={4}
                  maxLength={100}
                />
              </label>
              <label>
                Service
                <Choice
                  label="Service"
                  value={formCategory}
                  onChange={(s) => {
                    setFormCategory(s);
                    setProjectPro("none");
                  }}
                  items={categories.slice(1)}
                />
              </label>
              <label>
                What do you need?
                <textarea
                  name="description"
                  placeholder="A few details about the work and your preferred timing…"
                  required
                  minLength={10}
                  maxLength={3000}
                />
              </label>
              <label>
                Project ZIP code
                <input
                  name="zip"
                  required
                  pattern="[0-9]{5}"
                  maxLength={5}
                  inputMode="numeric"
                  defaultValue={zip}
                />
              </label>
              <label>
                Send request to
                <Select value={projectPro} onValueChange={setProjectPro}>
                  <SelectTrigger className="choice">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Choose a pro later</SelectItem>
                    {pros
                      .filter((p) => p.category === formCategory)
                      .map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.business}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </label>
              <button className="primary" disabled={busy}>
                {busy ? "Saving…" : "Create project"}
                <ArrowRight size={18} />
              </button>
            </form>
          )}
          {modal === "profile" && selectedPro && (
            <div className="profile-detail">
              <div className="profile-identity">
                <span className="pro-avatar">{initials(selectedPro.name)}</span>
                <div>
                  <strong>{selectedPro.name}</strong>
                  <p>
                    <MapPin size={14} /> ZIP {selectedPro.zip}
                  </p>
                </div>
              </div>
              <p>{selectedPro.bio}</p>
              <div className="profile-rate">
                <strong>${selectedPro.rate}</strong> / hour · starting rate
              </div>
              {selectedPro.id.startsWith("sample-") ? (
                <p className="notice">
                  Sample professional. This profile, price, and reviews
                  illustrate the experience and are not a bookable listing.
                </p>
              ) : (
                <>
                  <button
                    className="primary"
                    disabled={busy}
                    onClick={() => void contact(selectedPro)}
                  >
                    <MessageCircle size={18} /> Message{" "}
                    {selectedPro.name.split(" ")[0]}
                  </button>
                  <button
                    className="outline"
                    onClick={() => openProject(selectedPro)}
                  >
                    <Plus size={18} /> Request a project
                  </button>
                  <p className="muted">
                    Start a conversation to make an audio or video call.
                  </p>
                </>
              )}
            </div>
          )}
          {modal === "account" && user && (
            <div className="profile-detail">
              <div className="profile-identity">
                <span className="pro-avatar">{initials(user.name)}</span>
                <div>
                  <strong>{user.name}</strong>
                  <p>{user.email}</p>
                </div>
              </div>
              <p>
                {user.role === "pro"
                  ? "Your professional profile appears in the directory. New requests and customer conversations arrive in My projects and Messages."
                  : "Your projects and conversations are private to you and the professionals you contact."}
              </p>
              <p className="muted">
                Calls work while both people have the app open. Camera and
                microphone access is requested when you connect.
              </p>
              <button
                className="outline"
                onClick={() => void logout()}
                disabled={busy}
              >
                <LogOut size={17} /> Sign out
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <CallPanel calls={calls} />
    </div>
  );
}
