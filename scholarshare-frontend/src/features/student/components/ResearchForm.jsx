import { useEffect, useRef, useState } from "react";
import { UPLOAD_RULES } from "../../../config/constants";
import { mediaUrl } from "../../../utils/media";
import "./UploadSection.css";

// The value of the "Category" drop-down for "Other (type your own)".
export const OTHER_CATEGORY = "__other__";
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const IMAGE_ACCEPT = "image/png,image/jpeg,image/gif,image/webp";

const blankForm = () => ({
  title: "",
  categoryId: "",
  newCategoryName: "",
  description: "",
  academicYear: String(new Date().getFullYear()),
});

const formFrom = (research) =>
  research
    ? {
        title: research.title,
        categoryId: String(research.categoryId),
        newCategoryName: "",
        description: research.description,
        academicYear: String(research.academicYear),
      }
    : blankForm();

// Returns an error message, or null when the research file is acceptable.
// (The server checks again: size, extension AND the real file content.)
function validateFile(file, required) {
  if (!file) return required ? "Please choose a research file." : null;
  const extension = file.name.split(".").pop().toLowerCase();
  if (!UPLOAD_RULES.extensions.includes(extension)) return "Choose a PDF, DOC, DOCX, PPT or PPTX file.";
  if (file.size > UPLOAD_RULES.maxSizeBytes) return "Please choose a file under 10 MB.";
  return null;
}

function validatePhoto(file, label = "category photo") {
  if (!file) return null;
  if (!file.type.startsWith("image/")) return `The ${label} must be an image (PNG, JPG, GIF or WebP).`;
  if (file.size > MAX_PHOTO_BYTES) return `Please choose a ${label} under 2 MB.`;
  return null;
}

/**
 * The form used to submit research and to edit it.
 *   categories      [{ id, name }] for the drop-down; "Other" lets the student type a new category
 *                   (and upload a photo for it, which then appears on every card of that category)
 *   research        when editing: the current values (the file becomes optional)
 *   onSubmit(values) must return a promise; it throws with the server's message on failure
 *   onDone(saved)   called after a successful save
 */
function ResearchForm({ categories, research = null, submitLabel, onSubmit, onDone, successMessage }) {
  const isEdit = Boolean(research);
  const [form, setForm] = useState(() => formFrom(research));
  const [photoPreview, setPhotoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);   // the optional research picture
  const [removeCover, setRemoveCover] = useState(false);
  const [message, setMessage] = useState(null); // { type: "success" | "error", text }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const isOther = form.categoryId === OTHER_CATEGORY;

  // Free the temporary preview address when it is replaced or the form closes.
  useEffect(() => () => photoPreview && URL.revokeObjectURL(photoPreview), [photoPreview]);
  useEffect(() => () => coverPreview && URL.revokeObjectURL(coverPreview), [coverPreview]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    const problem = validatePhoto(file);
    if (problem) {
      event.target.value = "";
      setPhotoPreview(null);
      setMessage({ type: "error", text: problem });
      return;
    }
    setMessage(null);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleCoverChange = (event) => {
    const file = event.target.files[0];
    const problem = validatePhoto(file, "research picture");
    if (problem) {
      event.target.value = "";
      setCoverPreview(null);
      setMessage({ type: "error", text: problem });
      return;
    }
    setMessage(null);
    setRemoveCover(false);
    setCoverPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formElement = event.target;

    const file = fileInputRef.current?.files[0];
    const categoryImage = isOther ? photoInputRef.current?.files[0] : undefined;
    const image = coverInputRef.current?.files[0];
    const problem = validateFile(file, !isEdit) ?? validatePhoto(categoryImage) ?? validatePhoto(image, "research picture");
    if (problem) {
      setMessage({ type: "error", text: problem });
      return;
    }
    if (isOther && !form.newCategoryName.trim()) {
      setMessage({ type: "error", text: "Please type the name of your category." });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    try {
      const saved = await onSubmit({
        title: form.title.trim(),
        description: form.description.trim(),
        categoryId: isOther ? "" : form.categoryId,
        newCategoryName: isOther ? form.newCategoryName.trim() : "",
        categoryImage,
        academicYear: form.academicYear,
        file,
        image,
        removeImage: isEdit && removeCover && !image,
      });
      if (!isEdit) {
        setForm(blankForm());
        setPhotoPreview(null);
        setCoverPreview(null);
        formElement.reset();
      }
      setMessage({ type: "success", text: successMessage });
      onDone?.(saved);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
            <option value={OTHER_CATEGORY}>Other (type your own category)</option>
          </select>
        </label>
      </div>

      {isOther && (
        <div className="sd-field-row sd-other-category">
          <label>
            Your category name
            <input name="newCategoryName" maxLength={100} placeholder="e.g. Marine Biology"
              value={form.newCategoryName} onChange={handleChange} autoFocus />
          </label>

          <label>
            Photo for your category (optional · PNG, JPG, GIF, WebP · max 2 MB)
            <span className="sd-photo-pick">
              {photoPreview && <img src={photoPreview} alt="Category photo preview" />}
              <input type="file" accept={IMAGE_ACCEPT}
                ref={photoInputRef} onChange={handlePhotoChange} />
            </span>
          </label>
        </div>
      )}

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
          {isEdit ? "Replace the file (optional)" : "Research file"} (PDF, DOC, DOCX, PPT, PPTX · max 10 MB)
          <input type="file" required={!isEdit} accept={UPLOAD_RULES.accept} ref={fileInputRef} />
          {isEdit && <span className="sd-hint">Current file: {research.fileName}. Leave empty to keep it.</span>}
        </label>
      </div>

      <label>
        Research picture (optional · PNG, JPG, GIF, WebP · max 2 MB)
        <span className="sd-photo-pick">
          {(coverPreview || (isEdit && research.imageUrl && !removeCover)) && (
            <img src={coverPreview ?? mediaUrl(research.imageUrl)} alt="Research picture preview" />
          )}
          <input type="file" name="image" accept={IMAGE_ACCEPT} ref={coverInputRef} onChange={handleCoverChange} />
        </span>
        <span className="sd-hint">
          This picture is shown on the card and the page of your research. Without it, the category picture is used.
        </span>
        {isEdit && research.imageUrl && (
          <span className="sd-hint">
            <input type="checkbox" checked={removeCover} onChange={(e) => setRemoveCover(e.target.checked)} />{" "}
            Remove the current picture
          </span>
        )}
      </label>

      <button className="sd-btn sd-btn-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : submitLabel}
      </button>

      {message && (
        <p className={`sd-feedback ${message.type}`} role="status">
          {message.text}
        </p>
      )}
    </form>
  );
}

export default ResearchForm;
