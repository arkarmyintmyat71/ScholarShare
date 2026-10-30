import { useEffect, useState } from "react";

/**
 * Tells which section of the page is currently being read, so the top bar can
 * highlight the matching link as you scroll. `sectionIds` must be a constant
 * array (declared outside the component).
 */
export function useActiveSection(sectionIds) {
  const [activeId, setActiveId] = useState(sectionIds[0]);

  useEffect(() => {
    const elements = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
    if (elements.length === 0 || !("IntersectionObserver" in window)) return;

    const visible = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        });
        // Several sections can touch the reading line: the top-most one wins.
        const current = elements.find((el) => visible.has(el.id));
        if (current) setActiveId(current.id);
      },
      // A thin "reading line" about a third of the way down the screen.
      { rootMargin: "-30% 0px -60% 0px" }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sectionIds]);

  return activeId;
}
