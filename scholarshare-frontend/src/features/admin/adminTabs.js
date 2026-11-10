// The sections of the admin dashboard. `id` is the ?tab= value in the URL.
// `icon` is a name from components/Icons.jsx and `hint` is the short sentence under the page title.
export const ADMIN_TABS = [
  { id: "overview", label: "Overview", icon: "grid", hint: "A quick look at your library and what needs your attention." },
  { id: "accounts", label: "Accounts", icon: "users", hint: "See every student and disable or enable an account." },
  { id: "research", label: "Research review", icon: "check", hint: "Read new uploads, then approve or reject them." },
  { id: "categories", label: "Categories", icon: "tag", hint: "Add, rename and decorate the research categories." },
  { id: "topics", label: "Topics", icon: "chat", hint: "Keep the student discussions clean and friendly." },
];

export const DEFAULT_TAB = "overview";
