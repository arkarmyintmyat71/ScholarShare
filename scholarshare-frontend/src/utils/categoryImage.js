import computerScience from "../assets/images/research/computer-science.jpg";
import artificialIntelligence from "../assets/images/research/artificial-intelligence.jpg";
import cybersecurity from "../assets/images/research/cybersecurity.jpg";
import dataScience from "../assets/images/research/data-science.jpg";
import heroResearch from "../assets/images/research/hero-research.jpg";

// The database stores no pictures, so each category name maps to one of the
// bundled photos. Any category an admin creates later gets the default photo.
const IMAGES = {
  "computer science": computerScience,
  "artificial intelligence": artificialIntelligence,
  cybersecurity,
  "data science": dataScience,
};

export function categoryImage(categoryName) {
  return IMAGES[String(categoryName ?? "").trim().toLowerCase()] ?? heroResearch;
}

export { heroResearch };
