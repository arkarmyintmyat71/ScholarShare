import { Link, useNavigate, useParams } from "react-router-dom";

import StatusBlock from "../../components/StatusBlock";
import ResearchForm from "../../features/student/components/ResearchForm";
import { researchPath, ROUTES } from "../../config/constants";
import { useAsync } from "../../hooks/useAsync";
import { useAuth } from "../../hooks/useAuth";
import { getCategories } from "../../services/categoryService";
import { getResearch, updateResearch } from "../../services/researchService";

// /research/:id/edit - a student changes their own research (title, category, description, year, file).
// Saving sends it back to "Pending" so an administrator reviews the new version.
function EditResearchPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const research = useAsync(() => getResearch(id), [id]);
  const categories = useAsync(getCategories, []);

  const isOwner = research.data && research.data.uploadedById === user.id;

  return (
    <section className="sd-section">
      <div className="sd-section-heading">
        <div>
          <span className="sd-eyebrow">YOUR RESEARCH</span>
          <h2>Edit research</h2>
          <p>
            After you save, the research is <strong>Pending</strong> again until an administrator approves it.{" "}
            <Link to={research.data ? researchPath(id) : ROUTES.student}>Cancel</Link>
          </p>
        </div>
      </div>

      <StatusBlock
        isLoading={(research.isLoading && !research.data) || (categories.isLoading && !categories.data)}
        error={research.error || categories.error}
        onRetry={() => {
          research.reload();
          categories.reload();
        }}
      />

      {research.data && !isOwner && <p className="sd-empty" role="alert">You can only edit your own research.</p>}

      {isOwner && categories.data && (
        <ResearchForm
          categories={categories.data}
          research={research.data}
          submitLabel="Save changes"
          successMessage="Saved. Your research is Pending review again."
          onSubmit={(details) => updateResearch(id, details)}
          onDone={() => navigate({ pathname: ROUTES.student, hash: "#my-research" })}
        />
      )}
    </section>
  );
}

export default EditResearchPage;
