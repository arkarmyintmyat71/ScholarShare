import { countText } from "../../../utils/format";
import "./StatsStrip.css";

// Gold strip under the hero (same idea as the main site's "quick strip").
function StatsStrip({ uploadCount, savedCount }) {
  const stats = [
    { value: uploadCount, label: "My uploads" },
    { value: savedCount, label: "Saved research" },
  ];

  return (
    <section className="sd-strip" aria-label="Student overview">
      <p>Your research at a glance.</p>

      {stats.map(({ value, label }) => (
        <div key={label} className="sd-strip-stat">
          <strong>{countText(value)}</strong>
          <span>{label}</span>
        </div>
      ))}
    </section>
  );
}

export default StatsStrip;
