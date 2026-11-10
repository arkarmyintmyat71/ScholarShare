package com.scholarshare.scholarshare_backend.controllers;

import com.scholarshare.scholarshare_backend.dto.requests.CategoryRequest;
import com.scholarshare.scholarshare_backend.dto.responses.ApiResponse;
import com.scholarshare.scholarshare_backend.dto.responses.CategoryResponse;
import com.scholarshare.scholarshare_backend.services.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> create(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Category created", categoryService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> rename(@PathVariable Long id,
                                                                @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Category updated", categoryService.rename(id, request)));
    }

    /** multipart/form-data with one field: file. Replaces the category photo. */
    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CategoryResponse>> setImage(@PathVariable Long id,
                                                                  @RequestParam(value = "file", required = false) MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.ok("Photo updated", categoryService.setImage(id, file)));
    }

    @DeleteMapping("/{id}/image")
    public ResponseEntity<ApiResponse<CategoryResponse>> removeImage(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Photo removed", categoryService.removeImage(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Category deleted"));
    }
}
