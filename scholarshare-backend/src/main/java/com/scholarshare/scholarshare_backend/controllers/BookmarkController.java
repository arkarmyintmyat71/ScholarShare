package com.scholarshare.scholarshare_backend.controllers;

import com.scholarshare.scholarshare_backend.dto.responses.ApiResponse;
import com.scholarshare.scholarshare_backend.dto.responses.ResearchResponse;
import com.scholarshare.scholarshare_backend.services.BookmarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** "Save" for students: GET /bookmarks (library), GET /bookmarks/ids, PUT/DELETE /bookmarks/{researchId}. */
@RestController
@RequestMapping("/bookmarks")
@RequiredArgsConstructor
public class BookmarkController {

    private final BookmarkService bookmarkService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ResearchResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.ok("OK", bookmarkService.list()));
    }

    @GetMapping("/ids")
    public ResponseEntity<ApiResponse<List<Long>>> ids() {
        return ResponseEntity.ok(ApiResponse.ok("OK", bookmarkService.ids()));
    }

    @PutMapping("/{researchId}")
    public ResponseEntity<ApiResponse<Void>> save(@PathVariable Long researchId) {
        bookmarkService.save(researchId);
        return ResponseEntity.ok(ApiResponse.ok("Saved"));
    }

    @DeleteMapping("/{researchId}")
    public ResponseEntity<ApiResponse<Void>> remove(@PathVariable Long researchId) {
        bookmarkService.remove(researchId);
        return ResponseEntity.ok(ApiResponse.ok("Removed"));
    }
}
