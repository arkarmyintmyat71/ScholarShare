import httpClient from "./api/httpClient";

/**
 * research = { id, title, description, categoryId, categoryName, academicYear, status,
 *              fileName, contentType, fileSize, uploadedById, uploadedByName, uploadedAt, reviewedAt }
 *
 * GET  /research?q&categoryId&year&page&size  -> { content, page, size, totalElements, totalPages }   (public, approved only)
 * GET  /research/{id}                         -> research
 * GET  /research/{id}/download                -> the file (signed in only)
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

// Builds the multipart body shared by "submit" and "edit".
//   category: pass categoryId for an existing category, or newCategoryName (+ optional categoryImage) for "Other".
function researchForm({ title, description, categoryId, newCategoryName, categoryImage, academicYear, file, image, removeImage }) {
  const form = new FormData();
  form.append("title", title);
  form.append("description", description);
  form.append("academicYear", academicYear);
  if (newCategoryName) {
    form.append("newCategoryName", newCategoryName);
    if (categoryImage) form.append("categoryImage", categoryImage);
  } else {
    form.append("categoryId", categoryId);
  }
  if (file) form.append("file", file);
  if (image) form.append("image", image);                    // optional cover picture of the research
  if (removeImage) form.append("removeImage", "true");        // edit only: delete the current picture
  return form;
}

// No Content-Type header below: the browser adds multipart/form-data with its boundary.
export async function uploadResearch(details) {
  const { data } = await httpClient.post("/research", researchForm(details));
  return data;
}

// Owner only. The file is optional (keeps the old one); the research goes back to PENDING for review.
export async function updateResearch(id, details) {
  const { data } = await httpClient.put(`/research/${id}`, researchForm(details));
  return data;
}

// Owner or admin.
export const deleteResearch = (id) => httpClient.delete(`/research/${id}`);

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

/**
 * GET    /research/{id}/comments            -> [comment]   (signed in only)
 * POST   /research/{id}/comments { body }   -> comment     (students)
 * PUT    /research-comments/{id}/like       -> comment     (students)    DELETE removes the like
 * comment = { id, researchId, body, createdById, createdByName, createdByPictureUrl, createdAt, likeCount, likedByMe }
 */
export async function getResearchComments(researchId) {
  const { data } = await httpClient.get(`/research/${researchId}/comments`);
  return data;
}

export async function addResearchComment(researchId, body) {
  const { data } = await httpClient.post(`/research/${researchId}/comments`, { body });
  return data;
}

export async function likeResearchComment(commentId) {
  const { data } = await httpClient.put(`/research-comments/${commentId}/like`);
  return data;
}

export async function unlikeResearchComment(commentId) {
  const { data } = await httpClient.delete(`/research-comments/${commentId}/like`);
  return data;
}
