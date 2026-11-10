import { useEffect, useRef, useState } from "react";

import { useDismiss } from "../../hooks/useDismiss";
import { ratingText } from "./ratings";
import "./RatingButton.css";

const STARS = [1, 2, 3, 4, 5];
const STAR_PATH = "m12 2.8 2.85 5.78 6.38.93-4.62 4.5 1.09 6.36L12 17.37l-5.7 3 1.09-6.36-4.62-4.5 6.38-.93L12 2.8Z";

function Star({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path d={STAR_PATH} /></svg>
  );
}

/**
 * "Rate" button with a five-star popover:
 *   - click the button (or hover / keyboard focus) -> the five stars open above it
 *   - click a star  -> your rating (1-5); click your own star again, or "Remove", to take it back
 *
 *   rating    the student's current rating (1-5) or null
 *   average   average of everyone's ratings (null when none)      count   how many ratings
 *   onRate(stars)   onClear()
 */
function RatingButton({ rating, average, count = 0, onRate, onClear }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hover, setHover] = useState(0);
  const rootRef = useRef(null);
  const timer = useRef(null);

  useDismiss(rootRef, () => setIsOpen(false), isOpen);
  useEffect(() => () => clearTimeout(timer.current), []);

  const openSoon = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setIsOpen(true), 200);
  };
  const closeSoon = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { setIsOpen(false); setHover(0); }, 250);
  };

  const choose = (stars) => {
    setIsOpen(false);
    setHover(0);
    if (stars === rating) onClear();
    else onRate(stars);
  };

  const lit = hover || rating || 0;
  const summary = ratingText(average, count);

  return (
    <div
      className="rx"
      ref={rootRef}
      onMouseEnter={openSoon}
      onMouseLeave={closeSoon}
      onBlur={(event) => !rootRef.current.contains(event.relatedTarget) && setIsOpen(false)}
    >
      {isOpen && (
        <div className="rx-picker" role="group" aria-label="Rate this research" onMouseLeave={() => setHover(0)}>
          {STARS.map((stars) => (
            <button
              key={stars}
              type="button"
              className={`rx-star ${stars <= lit ? "is-lit" : ""}`}
              aria-label={`${stars} ${stars === 1 ? "star" : "stars"}`}
              aria-pressed={stars === rating}
              title={`${stars} ${stars === 1 ? "star" : "stars"}`}
              onMouseEnter={() => setHover(stars)}
              onFocus={() => setHover(stars)}
              onClick={() => choose(stars)}
            >
              <Star />
            </button>
          ))}
          {rating && <button type="button" className="rx-remove" onClick={onClear}>Remove</button>}
        </div>
      )}

      <button
        type="button"
        className={`ra-btn ${rating ? "is-rated" : ""}`}
        aria-expanded={isOpen}
        aria-label={rating ? `You rated ${rating} of 5. ${summary}` : `Rate this research. ${summary}`}
        onClick={() => setIsOpen((open) => !open)}
      >
        <Star className="ra-star" />
        <span>{rating ? `${rating}/5` : "Rate"}</span>
        {count > 0 && <small title={summary}>{average.toFixed(1)} ({count})</small>}
      </button>
    </div>
  );
}

export default RatingButton;
