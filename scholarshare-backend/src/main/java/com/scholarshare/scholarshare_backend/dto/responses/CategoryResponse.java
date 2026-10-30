package com.scholarshare.scholarshare_backend.dto.responses;

/** researchCount = number of APPROVED files in the category. */
public record CategoryResponse(Long id, String name, Long researchCount) {
}
