package com.scholarshare.scholarshare_backend.services;

import com.scholarshare.scholarshare_backend.dto.requests.ReviewRequest;
import com.scholarshare.scholarshare_backend.dto.responses.FileDownload;
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

    /** Saves the file as PENDING and notifies every admin. */
    ResearchResponse upload(String title, String description, Long categoryId, Integer academicYear, MultipartFile file);

    /** The signed-in student's own uploads with their status. */
    List<ResearchResponse> mine();

    // ---- admin ----
    List<ResearchResponse> listPending();

    ResearchResponse approve(Long id);

    ResearchResponse reject(Long id, ReviewRequest request);
}
