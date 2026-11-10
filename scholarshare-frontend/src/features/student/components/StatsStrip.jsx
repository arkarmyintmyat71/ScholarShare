import Icon from "../../../components/shell/Icons";
import { countText } from "../../../utils/format";

// Four number tiles under the welcome card.
//   counts = { PENDING, APPROVED, REJECTED }  (from useUploads)
function StatsStrip({ uploadCount, savedCount, counts = {} }) {
  const stats = [
    { value: uploadCount, label: "My uploads", icon: "book", tone: "blue" },
    { value: counts.PENDING ?? 0, label: "Waiting for review", icon: "clock", tone: "warn" },
    { value: counts.APPROVED ?? 0, label: "Published", icon: "check", tone: "green" },
    { value: savedCount, label: "Saved research", icon: "bookmark", tone: "pink" },
  ];

  return (
    <section className="ui-stats four" aria-label="Student overview">
      {stats.map(({ value, label, icon, tone }) => (
        <div key={label} className="ui-stat">
          <span className={`ui-stat-icon ${tone}`}><Icon name={icon} /></span>
          <strong>{countText(value)}</strong>
          <span>{label}</span>
        </div>
      ))}
    </section>
  );
}

export default StatsStrip;
