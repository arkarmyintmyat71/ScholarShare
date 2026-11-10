package com.scholarshare.scholarshare_backend.dto.responses;

/** researchCount = number of APPROVED files in the category. imageUrl is relative to the API ("/categories/3/image?v=..."), or null. */
public record CategoryResponse(Long id, String name, Long researchCount, String imageUrl) {
}
