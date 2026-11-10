import { useState } from "react";

import ResearchBrowser from "../../research/ResearchBrowser";
import StudentResearchCard from "./StudentResearchCard";
import "./ExploreSection.css";

const NO_FILTERS = { q: "", categoryId: "", year: "", page: 0 };

// "Explore research": the same search box, category and year filters, result count and pager as the home page,
// but every card also has Rate / Comment / Save.
//   bookmarks = useBookmarks()   engagement = useEngagement()   onOpenComments(research) opens the comments window
function ExploreSection({ bookmarks, engagement, onOpenComments }) {
  const [filters, setFilters] = useState(NO_FILTERS);

  return (
    <section className="sd-section" id="explore">
      <div className="sd-section-heading">
        <div>
          <span className="sd-eyebrow">EXPLORE SCHOLARSHARE</span>
          <h2>Find research that helps you move forward</h2>
        </div>
      </div>

      <ResearchBrowser
        filters={filters}
        onChange={setFilters}
        gridClassName="sd-research-grid"
        renderCard={(research) => (
          <StudentResearchCard
            key={research.id}
            research={research}
            isSaved={bookmarks.isSaved(research.id)}
            rating={engagement.ratingOf(research.id)}
            ratingAverage={engagement.ratingSummary(research).average}
            ratingCount={engagement.ratingSummary(research).count}
            commentCount={engagement.commentCount(research)}
            onToggleSave={() => bookmarks.toggle(research)}
            onRate={(stars) => engagement.rate(research, stars)}
            onClearRating={() => engagement.clearRating(research)}
            onOpenComments={() => onOpenComments(research)}
          />
        )}
      />
    </section>
  );
}

export default ExploreSection;
