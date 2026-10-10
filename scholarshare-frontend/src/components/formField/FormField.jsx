import "./FormField.css";

function FormField({ label, id, error, ...inputProps }) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} name={id} {...inputProps} />
      {error && <span className="form-field-error">{error}</span>}
    </div>
  );
}

export default FormField;
