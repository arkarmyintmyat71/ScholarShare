import { useEffect } from "react";
import { createPortal } from "react-dom";
import Icon from "./Icon";

// A centred window (a bottom sheet on phones) used by "Edit profile" and "Account settings".
// Esc, the X button and a click on the dark background all close it.
function Modal({ eyebrow, title, onClose, wide = false, children }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return createPortal(
    <div className="fp-modal-layer" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`fp-modal ${wide ? "wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <header className="fp-modal-header">
          <div>
            <span className="fp-eyebrow">{eyebrow}</span>
            <h2>{title}</h2>
          </div>
          <button type="button" className="fp-icon-button" aria-label="Close" onClick={onClose}>
            <Icon name="close" />
          </button>
        </header>
        {children}
      </section>
    </div>,
    document.body
  );
}

export default Modal;
