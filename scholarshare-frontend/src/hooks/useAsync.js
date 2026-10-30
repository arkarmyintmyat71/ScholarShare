import { useCallback, useEffect, useState } from "react";

/**
 * Runs an async loader and tracks { data, error, isLoading }.
 *
 *   const { data, error, isLoading, reload } = useAsync(() => getCategories(), []);
 *
 * - Re-runs whenever a value in `deps` changes (like useEffect) and when you call reload().
 *   Keep `deps` to simple values (strings, numbers, booleans): they are compared by value.
 * - The previous `data` stays on screen while a new page loads (no flicker).
 * - Ignores the answer of a request that was replaced by a newer one.
 * - `setData` lets a component update the list locally (e.g. after a delete) without refetching.
 * - Pass `enabled: false` to skip loading for now.
 */
export function useAsync(loader, deps, { enabled = true } = {}) {
  const [version, setVersion] = useState(0);
  // `key` says which request produced `data`/`error`; while it differs from the current key we are loading.
  const [state, setState] = useState({ data: null, error: null, key: null });
  const key = `${version}|${JSON.stringify(deps)}`;

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;

    loader()
      .then((data) => {
        if (!cancelled) setState({ data, error: null, key });
      })
      .catch((err) => {
        if (!cancelled) {
          setState((prev) => ({ ...prev, error: err?.message ?? "Something went wrong.", key }));
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  const setData = useCallback(
    (update) =>
      setState((prev) => ({ ...prev, data: typeof update === "function" ? update(prev.data) : update })),
    []
  );

  const isCurrent = state.key === key;
  return {
    data: state.data,
    error: isCurrent ? state.error : null,
    isLoading: enabled && !isCurrent,
    reload,
    setData,
  };
}
