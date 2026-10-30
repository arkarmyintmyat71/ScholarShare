import { useCallback, useState } from "react";
import { useAsync } from "../../../hooks/useAsync";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { searchResearch } from "../../../services/researchService";
import { PAGE_SIZE } from "../../../config/constants";

// Search box + category filter + page number for "Explore research", answered by GET /research.
export function useExploreResearch() {
  const [query, setQueryState] = useState("");
  const [categoryId, setCategoryIdState] = useState("");
  const [page, setPage] = useState(0);
  const debouncedQuery = useDebouncedValue(query);

  // Any change of filter starts again from the first page.
  const setQuery = useCallback((value) => {
    setQueryState(value);
    setPage(0);
  }, []);
  const setCategoryId = useCallback((value) => {
    setCategoryIdState(value);
    setPage(0);
  }, []);

  const result = useAsync(
    () => searchResearch({ q: debouncedQuery, categoryId, page, size: PAGE_SIZE.explore }),
    [debouncedQuery, categoryId, page]
  );

  return { query, setQuery, categoryId, setCategoryId, page, setPage, ...result };
}
