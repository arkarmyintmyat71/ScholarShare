import "./ResearchCard.css";

/**
 * A single research summary card. Presentational only — the parent
 * page decides where the data (`tag`, `title`, etc.) comes from,
 * whether that's the static homeContent data file today or a
 * `researchService.getFeatured()` API call later.
 */
function ResearchCard({ tag, title, description, image }) {
  return (
    <article className="research-card">
      <div className="card-top photo-top">
        <img src={image} alt="" loading="lazy" />
      </div>

      <div className="card-body">
        <span>{tag}</span>
        <h3>{title}</h3>
        <p>{description}</p>

        <footer>
          Research Resource <b aria-hidden="true">→</b>
        </footer>
      </div>
    </article>
  );
}

export default ResearchCard;
