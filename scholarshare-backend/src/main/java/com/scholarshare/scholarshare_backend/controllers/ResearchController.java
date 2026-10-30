package com.scholarshare.scholarshare_backend.controllers;

import com.scholarshare.scholarshare_backend.dto.responses.ApiResponse;
import com.scholarshare.scholarshare_backend.dto.responses.FileDownload;
import com.scholarshare.scholarshare_backend.dto.responses.PageResponse;
import com.scholarshare.scholarshare_backend.dto.responses.ResearchResponse;
import com.scholarshare.scholarshare_backend.services.ResearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
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

    /** multipart/form-data: title, description, categoryId, academicYear, file. The file starts as PENDING. */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ResearchResponse>> upload(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Integer academicYear,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        ResearchResponse saved = researchService.upload(title, description, categoryId, academicYear, file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Uploaded. An administrator will review your file.", saved));
    }
}
