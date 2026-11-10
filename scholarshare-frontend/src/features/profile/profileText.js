// Small text helpers for the profile page.

export function monthYear(isoDate) {
  return isoDate ? new Date(isoDate).toLocaleDateString(undefined, { month: "long", year: "numeric" }) : "";
}
