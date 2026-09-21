import type { Role } from "./model";
export const navigation: Record<
  Role,
  { id: string; label: string; icon: string }[]
> = {
  customer: [
    { id: "dashboard", label: "Overview", icon: "home" },
    { id: "discover", label: "Find a pro", icon: "search" },
    { id: "projects", label: "My projects", icon: "projects" },
    { id: "quotes", label: "Estimates", icon: "quotes" },
    { id: "schedule", label: "Schedule", icon: "calendar" },
    { id: "messages", label: "Messages", icon: "messages" },
    { id: "saved", label: "Saved pros", icon: "heart" },
    { id: "payments", label: "Payments & receipts", icon: "wallet" },
    { id: "reviews", label: "My reviews", icon: "star" },
  ],
  pro: [
    { id: "dashboard", label: "Overview", icon: "home" },
    { id: "leads", label: "Opportunities", icon: "search" },
    { id: "projects", label: "My jobs", icon: "projects" },
    { id: "quotes", label: "My estimates", icon: "quotes" },
    { id: "schedule", label: "Schedule", icon: "calendar" },
    { id: "messages", label: "Messages", icon: "messages" },
    { id: "earnings", label: "Earnings", icon: "wallet" },
    { id: "profile", label: "Business profile", icon: "user" },
    { id: "availability", label: "Availability", icon: "clock" },
    { id: "reviews", label: "Reviews", icon: "star" },
  ],
  admin: [
    { id: "dashboard", label: "Platform overview", icon: "home" },
    { id: "people", label: "Professionals", icon: "users" },
    { id: "projects", label: "All projects", icon: "projects" },
    { id: "reports", label: "Support & disputes", icon: "shield" },
    { id: "payments", label: "Transactions", icon: "wallet" },
  ],
};
export const utilities = [
  { id: "notifications", label: "Notifications", icon: "bell" },
  { id: "settings", label: "Settings", icon: "settings" },
  { id: "help", label: "Help & safety", icon: "help" },
  { id: "scenarios", label: "Explore all pages", icon: "grid" },
];
