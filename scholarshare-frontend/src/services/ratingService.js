import httpClient from "./api/httpClient";

/**
 * Star ratings on a research item (students only).
 *   GET    /ratings        -> [{ researchId, rating }]   what the signed-in student rated (1-5)
 *   PUT    /ratings/{id}   { rating }                    add or change the rating
 *   DELETE /ratings/{id}                                 remove it
 * The average and the number of ratings are part of every research item:
 * research.ratingAverage (null when nobody rated yet) and research.ratingCount.
 */
export async function getMyRatings() {
  const { data } = await httpClient.get("/ratings");
  return data;
}

export async function rateResearch(researchId, rating) {
  await httpClient.put(`/ratings/${researchId}`, { rating });
}

export async function removeRating(researchId) {
  await httpClient.delete(`/ratings/${researchId}`);
}
