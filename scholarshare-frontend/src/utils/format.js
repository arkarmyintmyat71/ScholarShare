// Counters shown in badges: 100+ becomes "99+".
export function countText(n) {
  return n > 99 ? "99+" : String(n);
}

export function firstName(user, fallback = "Student") {
  const name = (user?.name || user?.fullName || "").trim();
  return name ? name.split(" ")[0] : fallback;
}

export function capitalize(text) {
  return text ? text[0].toUpperCase() + text.slice(1) : "";
}

// "Just now", "5 min ago", "3 hours ago", "2 days ago", or a date.
export function timeAgo(isoDate) {
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (Number.isNaN(seconds) || seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(isoDate).toLocaleDateString();
}

// 2.4 MB, 310 KB ...
export function fileSizeText(bytes) {
  if (!Number.isFinite(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function dateText(isoDate) {
  return isoDate ? new Date(isoDate).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "";
}
