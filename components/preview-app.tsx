import { useEffect, useRef, useState, lazy, Suspense } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  Clock,
  CreditCard,
  FileText,
  Grid2X2,
  Heart,
  HelpCircle,
  House,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Plus,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { Toaster, toast } from "sonner";
const Marketplace = lazy(() => import("./marketplace"));
import { DemoContext, type Modal } from "@/demo/context";
import { navigation, utilities } from "@/demo/navigation";
import {
  seed,
  transition,
  type Action,
  type Role,
  type State,
} from "@/demo/model";
import { DemoPages } from "@/demo/pages";
import { DemoDialogs } from "@/demo/dialogs";
import { Avatar } from "@/demo/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import "@/demo/preview.css";
const icons: Record<string, typeof House> = {
  home: LayoutDashboard,
  search: Search,
  projects: BriefcaseBusiness,
  quotes: FileText,
  calendar: CalendarDays,
  messages: MessageCircle,
  heart: Heart,
  wallet: CreditCard,
  star: Sparkles,
  user: UserRound,
  clock: Clock,
  users: Users,
  shield: ShieldCheck,
  bell: Bell,
  settings: Settings,
  help: HelpCircle,
  grid: Grid2X2,
};
function parseRoute() {
  const [role, page, id] = location.hash.replace(/^#\/?/, "").split("/");
  return {
    role: (["customer", "pro", "admin"].includes(role)
      ? role
      : "customer") as Role,
    page: page || "dashboard",
    id,
  };
}
const storageKey = "servicetones-preview-v1";
export default function PreviewApp() {
  const [hash, setHash] = useState(location.hash),
    [route, setRoute] = useState(parseRoute),
    [state, setState] = useState<State>(() => {
      try {
        const data = JSON.parse(localStorage.getItem(storageKey) || "null");
        if (
          data?.version === 1 &&
          Array.isArray(data.projects) &&
          Array.isArray(data.pros) &&
          data.customer
        )
          return data;
      } catch {}
      return seed();
    }),
    [modal, setModal] = useState<Modal>(null),
    [mobile, setMobile] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;
  useEffect(() => {
    const changed = () => {
      setHash(location.hash);
      setRoute(parseRoute());
      setModal(null);
      setMobile(false);
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", changed);
    if (!location.hash) location.hash = "/customer/dashboard";
    return () => window.removeEventListener("hashchange", changed);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      toast.info("Demo changes will last for this session only.");
    }
  }, [state]);
  function go(page: string, id?: string, role: Role = route.role) {
    location.hash = `/${role}/${page}${id ? "/" + encodeURIComponent(id) : ""}`;
    setMobile(false);
  }
  function act(action: Action, message?: string) {
    try {
      const next = transition(stateRef.current, route.role, action);
      stateRef.current = next;
      setState(next);
      if (message) toast.success(message);
      return true;
    } catch (e) {
      toast.error((e as Error).message);
      return false;
    }
  }
  const reset = () => {
    const next = seed();
    stateRef.current = next;
    setState(next);
    setModal(null);
    go("dashboard");
    toast.success("The demo is back to its starting state.");
  };
  if (hash === "#live")
    return (
      <>
        <div className="d-live-return">
          <button onClick={() => go("dashboard", undefined, "customer")}>
            <ArrowLeft size={16} /> Back to interactive demo
          </button>
          <span>Live app · real account backend</span>
        </div>
        <Suspense
          fallback={
            <div className="d-empty">Opening your live application…</div>
          }
        >
          <Marketplace />
        </Suspense>
      </>
    );
  const role = route.role,
    isPro = role === "pro",
    isAdmin = role === "admin",
    person = isPro
      ? "Marcus Johnson"
      : isAdmin
        ? "Alex Morgan"
        : state.customer.name;
  const nav = (drawer = false) => (
    <>
      <a className="d-brand" href="#/customer/dashboard">
        <span>
          <House size={22} />
        </span>
        service<b>tones</b>
        <i />
      </a>
      <div className="d-workspace-label">
        {isPro
          ? "YOUR BUSINESS"
          : isAdmin
            ? "PLATFORM OPERATIONS"
            : "YOUR HOME, ORGANIZED"}
      </div>
      <nav aria-label={drawer ? "Mobile navigation" : "Main navigation"}>
        {navigation[role].map((item) => {
          const Icon = icons[item.icon];
          return (
            <button
              className={route.page === item.id ? "active" : ""}
              onClick={() => go(item.id)}
              key={item.id}
            >
              <Icon size={19} />
              {item.label}
              {item.id === "messages" && (
                <span className="d-nav-count">
                  {
                    new Set(
                      state.messages
                        .filter((m) => !isPro || m.proId === "marcus")
                        .map((m) => m.proId),
                    ).size
                  }
                </span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="d-nav-bottom">
        <nav aria-label="Resources">
          {utilities.map((item) => {
            const Icon = icons[item.icon];
            return (
              <button
                key={item.id}
                className={route.page === item.id ? "active" : ""}
                onClick={() => go(item.id)}
              >
                <Icon size={18} />
                {item.label}
                {item.id === "scenarios" && <span className="d-new">DEMO</span>}
              </button>
            );
          })}
        </nav>
        <div className="d-sidebar-person">
          <Avatar
            name={person}
            color={isPro ? "mint" : isAdmin ? "violet" : "peach"}
          />
          <div>
            <strong>{person}</strong>
            <small>
              {isPro ? "Professional" : isAdmin ? "Administrator" : "Homeowner"}{" "}
              · Demo account
            </small>
          </div>
        </div>
      </div>
    </>
  );
  const activeLabel =
    [...navigation[role], ...utilities].find((n) => n.id === route.page)
      ?.label ||
    (
      {
        project: "Project details",
        professional: "Professional profile",
        onboarding: "Business setup",
        login: "Sign in",
        register: "Create account",
        recovery: "Password recovery",
      } as Record<string, string>
    )[route.page] ||
    "Explore";
  return (
    <DemoContext.Provider
      value={{
        state,
        role,
        page: route.page,
        id: route.id ? decodeURIComponent(route.id) : undefined,
        go,
        act,
        open: setModal,
      }}
    >
      <div className="d-app">
        <Toaster richColors position="top-center" />
        <aside className="d-sidebar">{nav()}</aside>
        <div className="d-body">
          <div className="d-demo-bar">
            <span>
              <span className="d-demo-dot" />
              <strong>Interactive demo</strong>
              <span className="d-demo-detail">
                Fictional people. Safe to explore. No real payments or calls.
              </span>
            </span>
            <button onClick={() => setModal({ kind: "reset" })}>
              <RotateCcw size={13} /> Reset demo
            </button>
          </div>
          <header className="d-topbar">
            <button
              className="d-menu"
              aria-label="Open navigation"
              onClick={() => setMobile(true)}
            >
              <Menu />
            </button>
            <div className="d-breadcrumb">
              {isPro
                ? "Provider workspace"
                : isAdmin
                  ? "Admin workspace"
                  : "Customer workspace"}
              <span>/</span>
              <strong>{activeLabel}</strong>
            </div>
            <div className="d-top-actions">
              <Select
                value={role}
                onValueChange={(r) => go("dashboard", undefined, r as Role)}
              >
                <SelectTrigger
                  className="d-role-select"
                  aria-label="Preview role"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer demo</SelectItem>
                  <SelectItem value="pro">Provider demo</SelectItem>
                  <SelectItem value="admin">Admin demo</SelectItem>
                </SelectContent>
              </Select>
              <button
                className="d-icon-button"
                aria-label="All pages and scenarios"
                title="All pages and scenarios"
                onClick={() => go("scenarios")}
              >
                <Grid2X2 size={19} />
              </button>
              <button
                className="d-icon-button"
                aria-label="View notifications"
                onClick={() => go("notifications")}
              >
                <Bell size={19} />
                {state.notices.some((n) => !n.read) && <i />}
              </button>
              <button
                className="d-person-button"
                aria-label="Account settings"
                onClick={() => go("settings")}
              >
                <Avatar name={person} color={isPro ? "mint" : "peach"} />
              </button>
            </div>
          </header>
          <main className="d-main">
            <DemoPages />
          </main>
          <footer className="d-footer">
            <span>
              © {new Date().getFullYear()} ServiceTones · Built around your
              home.
            </span>
            <button onClick={() => go("scenarios")}>
              All pages & scenarios <ArrowUpRight size={13} />
            </button>
            <a href="#live">Open live app</a>
          </footer>
        </div>
        <Dialog open={mobile} onOpenChange={setMobile}>
          <DialogContent className="d-mobile-nav">
            <DialogTitle className="sr-only">Navigation</DialogTitle>
            <DialogDescription className="sr-only">
              Choose a page to explore.
            </DialogDescription>
            {nav(true)}
          </DialogContent>
        </Dialog>
        <DemoDialogs modal={modal} close={() => setModal(null)} reset={reset} />
      </div>
    </DemoContext.Provider>
  );
}
