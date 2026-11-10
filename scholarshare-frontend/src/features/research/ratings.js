// Text helpers for star ratings.

// "4.3 average from 12 ratings" / "No ratings yet"
export function ratingText(average, count) {
  if (!count) return "No ratings yet";
  return `${average.toFixed(1)} average from ${count} ${count === 1 ? "rating" : "ratings"}`;
}
