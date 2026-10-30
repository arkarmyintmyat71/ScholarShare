package com.scholarshare.scholarshare_backend.dto.responses;

import org.springframework.data.domain.Page;

import java.util.List;

/** Our own page shape, so the JSON does not depend on Spring Data's internal Page format. */
public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(page.getContent(), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }
}
