import { useRef, useState } from "react";

const STAGE = 260; // size of the square crop area on screen (px)
const OUTPUT = 512; // size of the saved square photo (px)

/**
 * Lets the student place a chosen photo inside the round frame before it is saved:
 * drag to move, slider to zoom, button to turn it, then "Use this photo".
 *
 *   file      the image the student picked        onApply(file)   the cropped square JPEG
 *   onCancel  go back without saving              isBusy          true while it uploads
 */
function PhotoCropper({ file, onApply, onCancel, isBusy }) {
  const [url] = useState(() => URL.createObjectURL(file)); // one address per picked photo
  const [natural, setNatural] = useState(null); // { w, h } once the image has loaded
  const [zoom, setZoom] = useState(1);
  const [turns, setTurns] = useState(0); // quarter turns
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef(null);


  // Size of the picture after the turn, scaled so it always covers the circle at zoom 1.
  const rotated = turns % 2 === 1;
  const w = natural ? (rotated ? natural.h : natural.w) : 1;
  const h = natural ? (rotated ? natural.w : natural.h) : 1;
  const scale = Math.max(STAGE / w, STAGE / h) * zoom;

  const clamp = (x, y, s = scale, width = w, height = h) => {
    const maxX = Math.max(0, (width * s - STAGE) / 2);
    const maxY = Math.max(0, (height * s - STAGE) / 2);
    return { x: Math.min(maxX, Math.max(-maxX, x)), y: Math.min(maxY, Math.max(-maxY, y)) };
  };

  const changeZoom = (value) => {
    const nextScale = Math.max(STAGE / w, STAGE / h) * value;
    setZoom(value);
    setOffset((o) => clamp(o.x, o.y, nextScale));
  };

  const turn = () => {
    setTurns((t) => (t + 1) % 4);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const onPointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX - offset.x, y: event.clientY - offset.y };
  };
  const onPointerMove = (event) => {
    if (drag.current) setOffset(clamp(event.clientX - drag.current.x, event.clientY - drag.current.y));
  };
  const onPointerUp = () => {
    drag.current = null;
  };
  const onKeyDown = (event) => {
    const step = 12;
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (moves[event.key]) {
      event.preventDefault();
      setOffset((o) => clamp(o.x + moves[event.key][0], o.y + moves[event.key][1]));
    }
  };

  const apply = async () => {
    const img = new Image();
    img.src = url;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, OUTPUT, OUTPUT);
    const ratio = OUTPUT / STAGE;
    ctx.translate(OUTPUT / 2 + offset.x * ratio, OUTPUT / 2 + offset.y * ratio);
    ctx.rotate((turns * Math.PI) / 2);
    ctx.scale(scale * ratio, scale * ratio);
    ctx.drawImage(img, -natural.w / 2, -natural.h / 2);
    canvas.toBlob(
      (blob) => {
        URL.revokeObjectURL(url);
        if (blob) onApply(new File([blob], "profile-photo.jpg", { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.9
    );
  };

  return (
    <div className="fp-cropper">
      <div
        className="fp-crop-stage"
        style={{ width: STAGE, height: STAGE }}
        tabIndex={0}
        role="img"
        aria-label="Drag the photo to position it inside the circle. Arrow keys also move it."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        <img
          src={url}
          alt=""
          draggable={false}
          onLoad={(event) => {
            setNatural({ w: event.target.naturalWidth, h: event.target.naturalHeight });
          }}
          style={
            natural
              ? {
                  width: natural.w,
                  height: natural.h,
                  transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) rotate(${turns * 90}deg) scale(${scale})`,
                }
              : { visibility: "hidden" }
          }
        />
        <span className="fp-crop-ring" aria-hidden="true" />
      </div>

      <div className="fp-crop-controls">
        <label className="fp-crop-zoom">
          <span>Zoom</span>
          <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={(event) => changeZoom(Number(event.target.value))} />
        </label>
        <button type="button" className="fp-btn secondary" onClick={turn}>⟳ Turn</button>
      </div>
      <p className="fp-muted fp-crop-hint">Drag the photo to move it.</p>

      <div className="fp-photo-actions">
        <button type="button" className="fp-btn primary" disabled={!natural || isBusy} onClick={apply}>
          {isBusy ? "Saving…" : "Use this photo"}
        </button>
        <button type="button" className="fp-btn secondary" disabled={isBusy} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

export default PhotoCropper;
