import { useCallback, useMemo } from "react";
import { useAsync } from "../../../hooks/useAsync";
import { getMyResearch, uploadResearch } from "../../../services/researchService";
import { UPLOAD_STATUSES } from "../data/studentContent";

// The student's own submissions (GET /research/mine). New ones start PENDING;
// only an administrator can approve or reject them.
export function useUploads() {
  const { data, setData, isLoading, error } = useAsync(getMyResearch, []);
  const uploads = useMemo(() => data ?? [], [data]);

  // Throws on failure so the upload form can show the server's message.
  const upload = useCallback(
    async (details) => {
      const created = await uploadResearch(details);
      setData((prev) => [created, ...(prev ?? [])]);
      return created;
    },
    [setData]
  );

  const counts = useMemo(
    () =>
      Object.fromEntries(
        UPLOAD_STATUSES.map((status) => [status, uploads.filter((u) => u.status === status).length])
      ),
    [uploads]
  );

  return { uploads, upload, counts, isLoading, error };
}
