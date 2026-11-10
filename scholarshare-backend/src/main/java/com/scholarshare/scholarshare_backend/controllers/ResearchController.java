package com.scholarshare.scholarshare_backend.controllers;

import com.scholarshare.scholarshare_backend.dto.responses.ApiResponse;
import com.scholarshare.scholarshare_backend.dto.responses.FileDownload;
import com.scholarshare.scholarshare_backend.dto.responses.ImageDownload;
import com.scholarshare.scholarshare_backend.dto.responses.PageResponse;
import com.scholarshare.scholarshare_backend.dto.responses.ResearchResponse;
import com.scholarshare.scholarshare_backend.services.ResearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;

@RestController
@RequestMapping("/research")
@RequiredArgsConstructor
public class ResearchController {

    private final ResearchService researchService;

    /** Public. GET /research?q=web&categoryId=1&year=2025&page=0&size=9 */
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ResearchResponse>>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Integer year,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size) {
        return ResponseEntity.ok(ApiResponse.ok("OK", researchService.search(q, categoryId, year, page, size)));
    }

    /** The signed-in student's uploads (any status). Declared before /{id} on purpose. */
    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<List<ResearchResponse>>> mine() {
        return ResponseEntity.ok(ApiResponse.ok("OK", researchService.mine()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResearchResponse>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("OK", researchService.get(id)));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(@PathVariable Long id) {
        FileDownload file = researchService.download(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(file.fileName(), StandardCharsets.UTF_8).build().toString())
                .contentLength(file.data().length)
                .body(file.data());
    }

    /** Public: the cover picture the student added to this research (the ?v= in imageUrl changes when it is replaced). */
    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> image(@PathVariable Long id) {
        ImageDownload image = researchService.image(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(image.contentType()))
                .cacheControl(CacheControl.maxAge(Duration.ofDays(30)).cachePublic())
                .body(image.data());
    }

    /**
     * multipart/form-data: title, description, academicYear, file, and EITHER categoryId OR newCategoryName
     * (+ optional categoryImage) when the student chose "Other". Optional "image" = the research cover picture.
     * The file starts as PENDING.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ResearchResponse>> upload(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String newCategoryName,
            @RequestParam(value = "categoryImage", required = false) MultipartFile categoryImage,
            @RequestParam(required = false) Integer academicYear,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        ResearchResponse saved = researchService.upload(title, description, categoryId, newCategoryName,
                categoryImage, academicYear, file, image);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Uploaded. An administrator will review your file.", saved));
    }

    /** Same fields as the upload, but "file" is optional; removeImage=true deletes the cover picture. Owner only; the research goes back to PENDING. */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ResearchResponse>> update(
            @PathVariable Long id,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String newCategoryName,
            @RequestParam(value = "categoryImage", required = false) MultipartFile categoryImage,
            @RequestParam(required = false) Integer academicYear,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(defaultValue = "false") boolean removeImage) {
        ResearchResponse saved = researchService.update(id, title, description, categoryId, newCategoryName,
                categoryImage, academicYear, file, image, removeImage);
        return ResponseEntity.ok(ApiResponse.ok("Saved. An administrator will review the changes.", saved));
    }

    /** Owner or admin. */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        researchService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Research deleted"));
    }
}
