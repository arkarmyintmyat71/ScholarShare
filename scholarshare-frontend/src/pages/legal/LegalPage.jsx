import { Link } from "react-router-dom";
import "./LegalPage.css";

/**
 * Shared layout for the Terms & Conditions and Privacy Policy pages.
 *   sections = [{ title, body: [paragraph, ...], list?: [item, ...] }]
 */
function LegalPage({ title, updated, intro, sections, otherLink }) {
  return (
    <main className="legal-page">
      <article className="legal-card">
        <p className="kicker dark">LEGAL</p>
        <h1>{title}</h1>
        <p className="legal-updated">Last updated: {updated}</p>
        <p className="legal-intro">{intro}</p>

        <nav className="legal-toc" aria-label="On this page">
          {sections.map((section, index) => (
            <a key={section.title} href={`#s${index + 1}`}>
              {index + 1}. {section.title}
            </a>
          ))}
        </nav>

        {sections.map((section, index) => (
          <section key={section.title} id={`s${index + 1}`}>
            <h2>
              {index + 1}. {section.title}
            </h2>
            {section.body?.map((text) => (
              <p key={text}>{text}</p>
            ))}
            {section.list && (
              <ul>
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <p className="legal-footer">
          See also: <Link to={otherLink.to}>{otherLink.label}</Link> · <Link to="/">Back to home</Link>
        </p>
      </article>
    </main>
  );
}

export default LegalPage;
