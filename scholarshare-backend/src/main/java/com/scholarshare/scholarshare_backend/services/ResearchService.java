package com.scholarshare.scholarshare_backend.services;

import com.scholarshare.scholarshare_backend.dto.requests.ReviewRequest;
import com.scholarshare.scholarshare_backend.dto.responses.FileDownload;
import com.scholarshare.scholarshare_backend.dto.responses.ImageDownload;
import com.scholarshare.scholarshare_backend.dto.responses.PageResponse;
import com.scholarshare.scholarshare_backend.dto.responses.ResearchResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ResearchService {
    /** Public search over APPROVED files. Every filter is optional. */
    PageResponse<ResearchResponse> search(String q, Long categoryId, Integer year, int page, int size);

    /** Visible to everyone when APPROVED; otherwise only to the uploader and admins. */
    ResearchResponse get(Long id);

    FileDownload download(Long id);

    /**
     * Saves the file as PENDING and notifies every admin. The category is either an existing one (categoryId) or,
     * when the student chose "Other", a typed name (newCategoryName) with an optional photo (categoryImage).
     */
    ResearchResponse upload(String title, String description, Long categoryId, String newCategoryName,
                            MultipartFile categoryImage, Integer academicYear, MultipartFile file,
                            MultipartFile image);

    /** Owner only. file is optional (null = keep the current file). The research goes back to PENDING for a new review. */
    ResearchResponse update(Long id, String title, String description, Long categoryId, String newCategoryName,
                            MultipartFile categoryImage, Integer academicYear, MultipartFile file,
                            MultipartFile image, boolean removeImage);

    /** Public: the cover picture a student added to a research (404 when there is none). */
    ImageDownload image(Long id);

    /** Owner or admin. Also removes the research's ratings, comments and saves. */
    void delete(Long id);

    /** The signed-in student's own uploads with their status. */
    List<ResearchResponse> mine();

    // ---- admin ----
    List<ResearchResponse> listPending();

    ResearchResponse approve(Long id);

    ResearchResponse reject(Long id, ReviewRequest request);
}
