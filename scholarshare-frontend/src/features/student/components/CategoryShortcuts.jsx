import { CATEGORY_ICONS } from "../data/studentContent";
import "./CategoryShortcuts.css";

// Navy block like the main site's "browse by subject": each row filters Explore by that category.
function CategoryShortcuts({ categories, onSelect }) {
  return (
    <section className="sd-section sd-section-flush" id="categories">
      <div className="sd-path">
        <div>
          <span className="sd-eyebrow">BROWSE BY SUBJECT</span>
          <h2>Explore academic areas</h2>
          <p>Pick a subject to filter the research library above.</p>
        </div>

        <div className="sd-subject-list">
          {categories.map(({ id, name, researchCount }, index) => (
            <button key={id} type="button" onClick={() => onSelect(String(id))}>
              <span>
                <i aria-hidden="true">{CATEGORY_ICONS[index % CATEGORY_ICONS.length]}</i> {name}{" "}
                <small>{researchCount}</small>
              </span>
              <span aria-hidden="true">→</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategoryShortcuts;
