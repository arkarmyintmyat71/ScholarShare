package com.scholarshare.scholarshare_backend.services;

import com.scholarshare.scholarshare_backend.dto.requests.CategoryRequest;
import com.scholarshare.scholarshare_backend.dto.responses.CategoryResponse;
import com.scholarshare.scholarshare_backend.dto.responses.ImageDownload;
import com.scholarshare.scholarshare_backend.entities.Category;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CategoryService {
    /** Public list with the number of approved files in each category. */
    List<CategoryResponse> list();

    CategoryResponse create(CategoryRequest request);

    CategoryResponse rename(Long id, CategoryRequest request);

    /** Refused with 409 while research files still use the category. */
    void delete(Long id);

    /** Admin: set or replace the category photo. */
    CategoryResponse setImage(Long id, MultipartFile file);

    CategoryResponse removeImage(Long id);

    /** Public: the category photo. */
    ImageDownload image(Long id);

    /**
     * Used when a student picks "Other" while submitting research: returns the category with that name
     * (case-insensitive), creating it - with the optional photo - when it does not exist yet.
     */
    Category findOrCreate(String name, MultipartFile image);
}
