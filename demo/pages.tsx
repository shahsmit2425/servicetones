import { useDemo } from "./context";
import {
  Dashboard,
  Directory,
  Professional,
  Projects,
  ProjectDetail,
} from "./core-pages";
import { Quotes, Leads, Schedule, Payments, Reviews } from "./work-pages";
import {
  Messages,
  Notifications,
  Help,
  Settings,
  BusinessProfile,
  Availability,
  Onboarding,
} from "./community-pages";
import { People, Reports, Scenarios, AuthPreview } from "./explore-pages";
import { Empty, Jump } from "./ui";
export function DemoPages() {
  const { page } = useDemo();
  const pages: Record<string, React.ComponentType> = {
    dashboard: Dashboard,
    discover: Directory,
    saved: Directory,
    professional: Professional,
    projects: Projects,
    project: ProjectDetail,
    quotes: Quotes,
    leads: Leads,
    schedule: Schedule,
    payments: Payments,
    earnings: Payments,
    reviews: Reviews,
    messages: Messages,
    notifications: Notifications,
    help: Help,
    settings: Settings,
    profile: BusinessProfile,
    availability: Availability,
    onboarding: Onboarding,
    people: People,
    reports: Reports,
    scenarios: Scenarios,
    login: AuthPreview,
    register: AuthPreview,
    recovery: AuthPreview,
  };
  const Page = pages[page];
  return Page ? (
    <Page key={page} />
  ) : (
    <Empty
      title="This page isn’t in the demo"
      action={<Jump page="scenarios">Explore all pages</Jump>}
    />
  );
}
