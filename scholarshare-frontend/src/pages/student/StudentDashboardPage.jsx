import { useState } from "react";

import { useAuth } from "../../hooks/useAuth";
import { useAsync } from "../../hooks/useAsync";
import { getCategories } from "../../services/categoryService";
import { firstName } from "../../utils/format";
import { useBookmarks } from "../../features/student/hooks/useBookmarks";
import { useEngagement } from "../../features/research/useEngagement";
import { useUploads } from "../../features/student/hooks/useUploads";

import WelcomeBanner from "../../features/student/components/WelcomeBanner";
import StatsStrip from "../../features/student/components/StatsStrip";
import ExploreSection from "../../features/student/components/ExploreSection";
import MyLibrarySection from "../../features/student/components/MyLibrarySection";
import UploadSection from "../../features/student/components/UploadSection";
import CommentsModal from "../../features/research/CommentsModal";

/**
 * The student dashboard page. It loads the data (categories, research, uploads, saved items)
 * through hooks and hands it to the section components in features/student.
 */
function StudentDashboardPage() {
  const { user } = useAuth();

  const categories = useAsync(getCategories, []);
  const bookmarks = useBookmarks();
  const uploads = useUploads();
  const engagement = useEngagement();
  const [commentsFor, setCommentsFor] = useState(null); // the research whose comments window is open

  const categoryList = categories.data ?? [];

  // A student may have just created a new category with "Other", so refresh the category lists afterwards.
  const handleUpload = async (details) => {
    const created = await uploads.upload(details);
    if (details.newCategoryName) categories.reload();
    return created;
  };

  return (
    <>
      <WelcomeBanner name={firstName(user)} />
      <StatsStrip uploadCount={uploads.uploads.length} savedCount={bookmarks.saved.length} counts={uploads.counts} />

      <ExploreSection
        bookmarks={bookmarks}
        engagement={engagement}
        onOpenComments={setCommentsFor}
      />

      <MyLibrarySection
        uploads={uploads.uploads}
        counts={uploads.counts}
        isLoading={uploads.isLoading}
        saved={bookmarks.saved}
        onRemoveSaved={bookmarks.remove}
      />

      <UploadSection categories={categoryList} onSubmit={handleUpload} />

      {commentsFor && (
        <CommentsModal
          research={commentsFor}
          onClose={() => setCommentsFor(null)}
          onCountChange={engagement.changeCommentCount}
        />
      )}
    </>
  );
}

export default StudentDashboardPage;
