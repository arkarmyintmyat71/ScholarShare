import { useCallback, useMemo } from "react";
import { useAsync } from "../../../hooks/useAsync";
import { deleteResearch, getMyResearch, updateResearch, uploadResearch } from "../../../services/researchService";
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

  // Edit one of the student's own files. It goes back to PENDING, so the list is refreshed from the server's answer.
  const edit = useCallback(
    async (id, details) => {
      const saved = await updateResearch(id, details);
      setData((prev) => (prev ?? []).map((u) => (u.id === id ? saved : u)));
      return saved;
    },
    [setData]
  );

  const remove = useCallback(
    async (id) => {
      await deleteResearch(id);
      setData((prev) => (prev ?? []).filter((u) => u.id !== id));
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

  return { uploads, upload, edit, remove, counts, isLoading, error };
}
