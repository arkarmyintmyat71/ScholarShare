import { Link } from "react-router-dom";
import { ROUTES } from "../../../config/constants";
import "./Footer.css";

// `to` is a router path. Hash links ("/#explore") work from any page.
const FOOTER_COLUMNS = [
  {
    heading: "Explore",
    links: [
      { label: "Research", to: "/#explore" },
      { label: "Topics", to: ROUTES.topics },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Sign In", to: ROUTES.login },
      { label: "Register", to: ROUTES.register },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", to: "/privacy" },
      { label: "Terms", to: "/terms" },
    ],
  },
];

const Footer = () => (
  <footer className="footer">
    <div className="footer-brand">
      <img className="brand-mark" src="/logo-mark.svg" alt="" width="44" height="44" />
      <h3>ScholarShare</h3>
      <p>A research resource and topic sharing platform for university students.</p>
    </div>

    {FOOTER_COLUMNS.map((column) => (
      <div key={column.heading} className="footer-col">
        <b>{column.heading}</b>
        {column.links.map((link) => (
          <Link key={link.label} to={link.to}>
            {link.label}
          </Link>
        ))}
      </div>
    ))}

    <p className="copyright">© 2026 ScholarShare. All rights reserved.</p>
  </footer>
);

export default Footer;
