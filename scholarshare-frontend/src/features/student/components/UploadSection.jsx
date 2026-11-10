import ResearchForm from "./ResearchForm";
import "./UploadSection.css";

// "Submit your research": the form + its heading. `onSubmit` sends a multipart request to POST /research.
function UploadSection({ categories, onSubmit }) {
  return (
    <section className="sd-section" id="upload">
      <div className="sd-section-heading">
        <div>
          <span className="sd-eyebrow">CONTRIBUTE KNOWLEDGE</span>
          <h2>Submit your research</h2>
          <p>Upload your academic work for administrator review before publication.</p>
        </div>
      </div>

      <ResearchForm
        categories={categories}
        onSubmit={onSubmit}
        submitLabel="Submit for review →"
        successMessage="Submitted! Your research is Pending review. You'll get a notification when an administrator decides."
      />
    </section>
  );
}

export default UploadSection;
