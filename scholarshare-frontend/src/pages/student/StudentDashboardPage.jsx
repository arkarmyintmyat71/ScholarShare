import { useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { useAsync } from "../../hooks/useAsync";
import { getCategories } from "../../services/categoryService";
import { ROUTES } from "../../config/constants";
import { firstName } from "../../utils/format";
import { useBookmarks } from "../../features/student/hooks/useBookmarks";
import { useExploreResearch } from "../../features/student/hooks/useExploreResearch";
import { useUploads } from "../../features/student/hooks/useUploads";

import WelcomeBanner from "../../features/student/components/WelcomeBanner";
import StatsStrip from "../../features/student/components/StatsStrip";
import ExploreSection from "../../features/student/components/ExploreSection";
import CategoryShortcuts from "../../features/student/components/CategoryShortcuts";
import MyLibrarySection from "../../features/student/components/MyLibrarySection";
import UploadSection from "../../features/student/components/UploadSection";

/**
 * The student dashboard page. It loads the data (categories, research, uploads, saved items)
 * through hooks and hands it to the section components in features/student.
 */
function StudentDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const categories = useAsync(getCategories, []);
  const explore = useExploreResearch();
  const bookmarks = useBookmarks();
  const uploads = useUploads();

  const categoryList = categories.data ?? [];

  const handleCategorySelect = (categoryId) => {
    explore.setCategoryId(categoryId);
    navigate({ pathname: ROUTES.student, hash: "#explore" });
  };

  return (
    <>
      <WelcomeBanner name={firstName(user)} />
      <StatsStrip uploadCount={uploads.uploads.length} savedCount={bookmarks.saved.length} />

      <ExploreSection explore={explore} categories={categoryList} bookmarks={bookmarks} />

      <CategoryShortcuts categories={categoryList} onSelect={handleCategorySelect} />

      <MyLibrarySection
        uploads={uploads.uploads}
        counts={uploads.counts}
        isLoading={uploads.isLoading}
        saved={bookmarks.saved}
        onRemoveSaved={bookmarks.remove}
      />

      <UploadSection categories={categoryList} onSubmit={uploads.upload} />
    </>
  );
}

export default StudentDashboardPage;
