import httpClient from "./api/httpClient";

/**
 * research = { id, title, description, categoryId, categoryName, academicYear, status,
 *              fileName, contentType, fileSize, uploadedById, uploadedByName, uploadedAt, reviewedAt }
 *
 * GET  /research?q&categoryId&year&page&size  -> { content, page, size, totalElements, totalPages }   (public, approved only)
 * GET  /research/{id}                         -> research
 * GET  /research/{id}/download                -> the file
 * GET  /research/mine                         -> [research]   (the signed-in student's uploads, any status)
 * POST /research (multipart)                  -> research     (status PENDING)
 */

// Empty filters are not sent at all.
function clean(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value != null)
  );
}

export async function searchResearch({ q, categoryId, year, page = 0, size } = {}) {
  const { data } = await httpClient.get("/research", {
    params: clean({ q: q?.trim(), categoryId, year, page, size }),
  });
  return data;
}

export async function getResearch(id) {
  const { data } = await httpClient.get(`/research/${id}`);
  return data;
}

export async function getMyResearch() {
  const { data } = await httpClient.get("/research/mine");
  return data;
}

export async function uploadResearch({ title, description, categoryId, academicYear, file }) {
  const form = new FormData();
  form.append("title", title);
  form.append("description", description);
  form.append("categoryId", categoryId);
  form.append("academicYear", academicYear);
  form.append("file", file);
  // No Content-Type header: the browser adds multipart/form-data with its boundary.
  const { data } = await httpClient.post("/research", form);
  return data;
}

// Downloads the file and makes the browser save it under its real name.
export async function downloadResearch({ id, fileName }) {
  const { data } = await httpClient.get(`/research/${id}/download`, { responseType: "blob" });
  const url = URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
