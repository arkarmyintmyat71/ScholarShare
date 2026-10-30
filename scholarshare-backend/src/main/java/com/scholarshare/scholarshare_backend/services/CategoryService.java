package com.scholarshare.scholarshare_backend.services;

import com.scholarshare.scholarshare_backend.dto.requests.CategoryRequest;
import com.scholarshare.scholarshare_backend.dto.responses.CategoryResponse;

import java.util.List;

public interface CategoryService {
    /** Public list with the number of approved files in each category. */
    List<CategoryResponse> list();

    CategoryResponse create(CategoryRequest request);

    CategoryResponse rename(Long id, CategoryRequest request);

    /** Refused with 409 while research files still use the category. */
    void delete(Long id);
}
