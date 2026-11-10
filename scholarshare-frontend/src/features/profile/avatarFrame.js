import { useCallback, useState } from "react";

// The look of the ring around the profile photo. It is a personal choice, so it is kept in this browser
// (localStorage, per user); the photo itself is stored on the server.
export const FRAME_COLORS = [
  { id: "pink", label: "Rose", value: "#b34172" },
  { id: "blue", label: "Blue", value: "#2f6fd6" },
  { id: "navy", label: "Navy", value: "#15325b" },
  { id: "gold", label: "Gold", value: "#e0a100" },
  { id: "green", label: "Green", value: "#2a9d68" },
  { id: "violet", label: "Violet", value: "#7c4dcc" },
];

export const FRAME_WIDTHS = [
  { id: "thin", label: "Thin", px: 3 },
  { id: "medium", label: "Medium", px: 6 },
  { id: "bold", label: "Bold", px: 10 },
];

export const FRAME_STYLES = [
  { id: "solid", label: "Solid" },
  { id: "gradient", label: "Gradient" },
  { id: "dashed", label: "Dashed" },
  { id: "none", label: "No frame" },
];

export const DEFAULT_FRAME = { color: "pink", width: "medium", style: "solid" };

// CSS variables the profile page puts on the photo frame.
export function frameCssVars(frame) {
  const color = (FRAME_COLORS.find((c) => c.id === frame.color) ?? FRAME_COLORS[0]).value;
  const px = (FRAME_WIDTHS.find((w) => w.id === frame.width) ?? FRAME_WIDTHS[1]).px;
  return {
    "--frame-color": color,
    "--frame-width": frame.style === "none" ? "0px" : `${px}px`,
    "--frame-border": frame.style === "gradient" ? "transparent" : color,
    "--frame-style": frame.style === "dashed" ? "dashed" : "solid",
    "--frame-gradient": frame.style === "gradient" ? `conic-gradient(from 200deg, ${color}, #f2b84b, #5ab0f0, ${color})` : "none",
  };
}

const storageKey = (userId) => `scholarshare_avatar_frame_${userId}`;

function readFrame(userId) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(userId)));
    return saved ? { ...DEFAULT_FRAME, ...saved } : DEFAULT_FRAME;
  } catch {
    return DEFAULT_FRAME;
  }
}

// [frame, updateFrame(changes), resetFrame()] for the signed-in user.
export function useAvatarFrame(userId) {
  const [frame, setFrame] = useState(() => readFrame(userId));

  const save = useCallback(
    (next) => {
      setFrame(next);
      try {
        localStorage.setItem(storageKey(userId), JSON.stringify(next));
      } catch {
        /* private window / blocked storage: the choice just is not remembered */
      }
    },
    [userId]
  );

  const update = useCallback((changes) => save({ ...frame, ...changes }), [frame, save]);
  const reset = useCallback(() => save(DEFAULT_FRAME), [save]);
  return [frame, update, reset];
}
