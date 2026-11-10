import { useState } from "react";
import Icon from "./Icon";

// A password box with an eye button to show or hide what is typed.
function PasswordField({ id, label, value, onChange, autoComplete, minLength, placeholder }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="fp-field">
      <label htmlFor={id}>{label}</label>
      <div className="fp-password">
        <input
          id={id}
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          minLength={minLength}
          maxLength={72}
          placeholder={placeholder}
          required
        />
        <button
          type="button"
          className="fp-eye"
          aria-label={isVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={isVisible}
          onClick={() => setIsVisible((v) => !v)}
        >
          <Icon name={isVisible ? "eyeoff" : "eye"} size={20} />
        </button>
      </div>
    </div>
  );
}

export default PasswordField;
