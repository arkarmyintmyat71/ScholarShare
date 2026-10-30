package com.scholarshare.scholarshare_backend.dto.responses;

import com.scholarshare.scholarshare_backend.entities.enums.ResearchStatus;

import java.time.Instant;

/**
 * Everything about a research file EXCEPT the file bytes. Built directly by a JPQL
 * "select new" query in ResearchFileRepo, so the blob is never loaded for lists.
 * (Wrapper types on purpose: JPQL constructor matching works best with them.)
 */
public record ResearchResponse(
        Long id,
        String title,
        String description,
        Long categoryId,
        String categoryName,
        Integer academicYear,
        ResearchStatus status,
        String fileName,
        String contentType,
        Long fileSize,
        Long uploadedById,
        String uploadedByName,
        Instant uploadedAt,
        Instant reviewedAt
) {
}
