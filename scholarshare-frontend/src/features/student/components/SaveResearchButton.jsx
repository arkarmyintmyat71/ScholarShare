import { useBookmarks } from "../hooks/useBookmarks";

// "Save" / "Saved" for one research item, used on the research detail page (students only).
function SaveResearchButton({ research }) {
  const { isSaved, toggle } = useBookmarks();
  const saved = isSaved(research.id);

  return (
    <button
      type="button"
      className="pg-btn secondary"
      aria-pressed={saved}
      onClick={() => toggle(research)}
    >
      {saved ? "★ Saved" : "☆ Save"}
    </button>
  );
}

export default SaveResearchButton;
