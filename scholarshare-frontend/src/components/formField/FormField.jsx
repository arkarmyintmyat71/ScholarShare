import { useState } from "react";
import Icon from "../shell/Icons";
import "./FormField.css";

const EYE = "M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z";
const EYE_OFF =
  "M3 3 21 21M10 6.2A10 10 0 0 1 12 6c6.5 0 10 6 10 6a16 16 0 0 1-3 3.5M6.1 7.2C3.3 9.1 2 12 2 12s3.5 6 10 6a10 10 0 0 0 4.5-1M10 10a3 3 0 0 0 4 4";

/**
 * A labelled input. Every `type="password"` field automatically gets an eye button
 * to show or hide what is typed, so no page has to remember to add one.
 */
function FormField({ label, id, error, icon, type = "text", ...inputProps }) {
  const [isVisible, setIsVisible] = useState(false);
  const isPassword = type === "password";

  const input = (
    <input id={id} name={id} type={isPassword && isVisible ? "text" : type} {...inputProps} />
  );

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      {isPassword ? (
        <div className={`form-field-password ${icon ? "has-icon" : ""}`}>
          {icon && <Icon name={icon} size={18} />}
          {input}
          <button
            type="button"
            className="form-field-eye"
            aria-label={isVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
            aria-pressed={isVisible}
            onClick={() => setIsVisible((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={isVisible ? EYE_OFF : EYE} />
            </svg>
          </button>
        </div>
      ) : icon ? (
        <div className="form-field-icon">
          <Icon name={icon} size={18} />
          {input}
        </div>
      ) : (
        input
      )}
      {error && <span className="form-field-error">{error}</span>}
    </div>
  );
}

export default FormField;
