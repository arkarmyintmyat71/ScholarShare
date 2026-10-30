import "./DashboardFooter.css";

function DashboardFooter({ label }) {
  return (
    <footer className="sd-footer">
      <strong>ScholarShare</strong>
      <p>Learn • Share • Grow</p>
      <span className="sd-footer-label">{label}</span>
      <small>© 2026 ScholarShare</small>
    </footer>
  );
}

export default DashboardFooter;
