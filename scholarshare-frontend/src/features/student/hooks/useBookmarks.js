import { useCallback, useMemo } from "react";
import { useAsync } from "../../../hooks/useAsync";
import { getBookmarks, removeBookmark, saveBookmark } from "../../../services/bookmarkService";

// The student's saved research (GET /bookmarks). Saving/removing updates the screen
// straight away and is undone if the server refuses.
export function useBookmarks() {
  const { data, setData, error } = useAsync(getBookmarks, []);
  const saved = useMemo(() => data ?? [], [data]);
  const savedIds = useMemo(() => new Set(saved.map((r) => r.id)), [saved]);

  const isSaved = useCallback((id) => savedIds.has(id), [savedIds]);

  const remove = useCallback(
    async (id) => {
      const before = saved;
      setData(before.filter((r) => r.id !== id));
      try {
        await removeBookmark(id);
      } catch {
        setData(before);
      }
    },
    [saved, setData]
  );

  const add = useCallback(
    async (research) => {
      const before = saved;
      setData([research, ...before]);
      try {
        await saveBookmark(research.id);
      } catch {
        setData(before);
      }
    },
    [saved, setData]
  );

  const toggle = useCallback(
    (research) => (savedIds.has(research.id) ? remove(research.id) : add(research)),
    [savedIds, add, remove]
  );

  return { saved, isSaved, toggle, remove, error };
}
