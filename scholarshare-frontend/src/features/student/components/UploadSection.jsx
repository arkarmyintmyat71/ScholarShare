import { useRef, useState } from "react";
import { UPLOAD_RULES } from "../../../config/constants";
import "./UploadSection.css";

const emptyForm = () => ({
  title: "",
  categoryId: "",
  description: "",
  academicYear: String(new Date().getFullYear()),
});

// Returns an error message, or null when the file is acceptable.
// (The server checks again: size, extension AND the real file content.)
function validateFile(file) {
  if (!file) return "Please choose a research file.";
  const extension = file.name.split(".").pop().toLowerCase();
  if (!UPLOAD_RULES.extensions.includes(extension)) {
    return "Choose a PDF, DOC, DOCX, PPT or PPTX file.";
  }
  if (file.size > UPLOAD_RULES.maxSizeBytes) return "Please choose a file under 10 MB.";
  return null;
}

// Submit-research form. `onSubmit` sends a multipart request to POST /research and returns a promise.
function UploadSection({ categories, onSubmit }) {
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState(null); // { type: "success" | "error", text }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formElement = event.target;

    const file = fileInputRef.current?.files[0];
    const fileError = validateFile(file);
    if (fileError) {
      setMessage({ type: "error", text: fileError });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    try {
      await onSubmit({
        title: form.title.trim(),
        description: form.description.trim(),
        categoryId: form.categoryId,
        academicYear: form.academicYear,
        file,
      });
      setForm(emptyForm());
      formElement.reset();
      setMessage({
        type: "success",
        text: "Submitted! Your research is Pending review. You'll get a notification when an administrator decides.",
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="sd-section" id="upload">
      <div className="sd-section-heading">
        <div>
          <span className="sd-eyebrow">CONTRIBUTE KNOWLEDGE</span>
          <h2>Submit your research</h2>
          <p>Upload your academic work for administrator review before publication.</p>
        </div>
      </div>

      <form className="sd-panel sd-form" onSubmit={handleSubmit}>
        <div className="sd-field-row">
          <label>
            Research title
            <input name="title" required maxLength={255} placeholder="Enter your research title"
              value={form.title} onChange={handleChange} />
          </label>

          <label>
            Category
            <select name="categoryId" required value={form.categoryId} onChange={handleChange}>
              <option value="">Select category</option>
              {categories.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Description
          <textarea name="description" required maxLength={1000} rows={3}
            placeholder="Briefly describe your research..."
            value={form.description} onChange={handleChange} />
        </label>

        <div className="sd-field-row">
          <label>
            Academic year
            <input name="academicYear" type="number" min="1990" max="2100" required
              value={form.academicYear} onChange={handleChange} />
          </label>

          <label>
            Research file (PDF, DOC, DOCX, PPT, PPTX · max 10 MB)
            <input type="file" required accept={UPLOAD_RULES.accept} ref={fileInputRef} />
          </label>
        </div>

        <button className="sd-btn sd-btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Uploading…" : "Submit for review →"}
        </button>

        {message && (
          <p className={`sd-feedback ${message.type}`} role="status">
            {message.text}
          </p>
        )}
      </form>
    </section>
  );
}

export default UploadSection;
