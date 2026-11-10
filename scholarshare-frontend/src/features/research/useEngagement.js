import { useCallback, useMemo, useState } from "react";
import { useAsync } from "../../hooks/useAsync";
import { getMyRatings, rateResearch, removeRating } from "../../services/ratingService";

// The star ratings and comment numbers on research cards.
//
// The server sends `ratingAverage` / `ratingCount` / `commentCount` inside every research item, and what this
// student rated (GET /ratings). When the student rates or comments the screen changes at once (an "override");
// if the server refuses, it is put back. Pass enabled=false for visitors who are not students (they cannot rate).
export function useEngagement(enabled = true) {
  const mine = useAsync(getMyRatings, [], { enabled });
  const serverRatings = useMemo(
    () => new Map((mine.data ?? []).map((r) => [r.researchId, r.rating])),
    [mine.data]
  );

  const [overrides, setOverrides] = useState({}); // { [id]: { rating: 1-5 | null, average, count } }
  const [commentDeltas, setCommentDeltas] = useState({}); // { [id]: comments added/removed in this session }

  const ratingOf = useCallback(
    (id) => (id in overrides ? overrides[id].rating : serverRatings.get(id) ?? null),
    [overrides, serverRatings]
  );
  // { average, count } of everyone's ratings for this research
  const ratingSummary = useCallback(
    (research) => overrides[research.id] ?? { average: research.ratingAverage, count: research.ratingCount },
    [overrides]
  );
  const commentCount = useCallback(
    (research) => research.commentCount + (commentDeltas[research.id] ?? 0),
    [commentDeltas]
  );

  const change = useCallback(
    async (research, next) => {
      const previous = ratingOf(research.id);
      const before = { rating: previous, ...ratingSummary(research) };
      // Rebuild the average with this student's old rating swapped for the new one.
      const total = (before.average ?? 0) * before.count - (previous ?? 0) + (next ?? 0);
      const count = before.count + (next && !previous ? 1 : 0) - (!next && previous ? 1 : 0);
      setOverrides((prev) => ({ ...prev, [research.id]: { rating: next, count, average: count ? total / count : null } }));
      try {
        await (next ? rateResearch(research.id, next) : removeRating(research.id));
      } catch {
        setOverrides((prev) => ({ ...prev, [research.id]: before }));
      }
    },
    [ratingOf, ratingSummary]
  );

  const rate = useCallback((research, stars) => change(research, stars), [change]);
  const clearRating = useCallback((research) => change(research, null), [change]);

  // Called by the comments window when a comment is added (+1) or removed (-1).
  const changeCommentCount = useCallback((id, delta) => {
    setCommentDeltas((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + delta }));
  }, []);

  return { ratingOf, ratingSummary, commentCount, rate, clearRating, changeCommentCount };
}
