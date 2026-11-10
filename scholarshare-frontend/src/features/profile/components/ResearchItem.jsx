import { Link } from "react-router-dom";
import { researchEditPath, researchPath } from "../../../config/constants";
import { capitalize, dateText, fileSizeText } from "../../../utils/format";
import Icon from "./Icon";

// One of the student's own research files: status, title, details and View / Edit / Delete.
function ResearchItem({ research, onDelete }) {
  const status = research.status.toLowerCase();
  return (
    <article className="fp-card fp-research">
      <div className="fp-research-top">
        <span className="fp-research-icon"><Icon name="file" size={24} /></span>
        <span className={`fp-status ${status}`}>{capitalize(status)}</span>
      </div>
      <h3>{research.title}</h3>
      <p>{research.categoryName} · {research.academicYear} · {research.fileName}</p>
      <div className="fp-research-footer">
        <span>{fileSizeText(research.fileSize)} · {dateText(research.uploadedAt)}</span>
        <span className="fp-research-actions">
          <Link className="fp-btn soft small" to={researchPath(research.id)}>View</Link>
          <Link className="fp-btn soft small" to={researchEditPath(research.id)}>Edit</Link>
          <button type="button" className="fp-btn danger-soft small" onClick={() => onDelete(research)}>Delete</button>
        </span>
      </div>
    </article>
  );
}

export default ResearchItem;
