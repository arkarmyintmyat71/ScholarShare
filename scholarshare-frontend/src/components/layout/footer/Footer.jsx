import { Link } from "react-router-dom";
import "./Footer.css";

const FOOTER_COLUMNS = [
    {
        heading: "Explore",
        links: [
            { label: "Research", href: "#explore" },
            { label: "Categories", href: "#categories" },
            { label: "Topics", href: "#topics" },
        ],
    },
    {
        heading: "Account",
        links: [
            { label: "Sign In", to: "/login" },
            { label: "Register", to: "/register" },
            { label: "Forgot Password", to: "/forgot-password" },
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

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-brand">
                <span className="brand-mark">S</span>
                <h3>ScholarShare</h3>
                <p>
                    A research resource and topic sharing platform for university
                    students.
                </p>
            </div>

            {FOOTER_COLUMNS.map((column) => (
                <div key={column.heading} className="footer-col">
                    <b>{column.heading}</b>

                    {column.links.map((link) =>
                        link.to ? (
                            <Link key={link.label} to={link.to}>
                                {link.label}
                            </Link>
                        ) : (
                            <a key={link.label} href={link.href}>
                                {link.label}
                            </a>
                        )
                    )}
                </div>
            ))}

            <p className="copyright">© 2026 ScholarShare. All rights reserved.</p>
        </footer>
    );
};

export default Footer;