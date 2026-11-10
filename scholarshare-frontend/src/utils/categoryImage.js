import computerScience from "../assets/images/research/computer-science.jpg";
import artificialIntelligence from "../assets/images/research/artificial-intelligence.jpg";
import cybersecurity from "../assets/images/research/cybersecurity.jpg";
import dataScience from "../assets/images/research/data-science.jpg";
import heroResearch from "../assets/images/research/hero-research.jpg";
import { mediaUrl } from "./media";

// A category's own photo (uploaded by a student or an admin) always wins. Without one, the well-known
// categories use a bundled photo and everything else gets the default photo.
const IMAGES = {
  "computer science": computerScience,
  "artificial intelligence": artificialIntelligence,
  cybersecurity,
  "data science": dataScience,
};

export function categoryImage(categoryName, imageUrl) {
  return (
    mediaUrl(imageUrl) ??
    IMAGES[String(categoryName ?? "").trim().toLowerCase()] ??
    heroResearch
  );
}

// The picture of one research: the cover picture the student added wins, then the category picture.
export function researchImage(research) {
  return mediaUrl(research.imageUrl) ?? categoryImage(research.categoryName, research.categoryImageUrl);
}

export { heroResearch };
