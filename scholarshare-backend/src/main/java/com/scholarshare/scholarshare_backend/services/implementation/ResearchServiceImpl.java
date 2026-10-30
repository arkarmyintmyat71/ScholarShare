package com.scholarshare.scholarshare_backend.services.implementation;

import com.scholarshare.scholarshare_backend.dto.requests.ReviewRequest;
import com.scholarshare.scholarshare_backend.dto.responses.FileDownload;
import com.scholarshare.scholarshare_backend.dto.responses.PageResponse;
import com.scholarshare.scholarshare_backend.dto.responses.ResearchResponse;
import com.scholarshare.scholarshare_backend.entities.Category;
import com.scholarshare.scholarshare_backend.entities.ResearchFile;
import com.scholarshare.scholarshare_backend.entities.User;
import com.scholarshare.scholarshare_backend.entities.enums.NotificationType;
import com.scholarshare.scholarshare_backend.entities.enums.RelatedEntityType;
import com.scholarshare.scholarshare_backend.entities.enums.ResearchStatus;
import com.scholarshare.scholarshare_backend.entities.enums.Role;
import com.scholarshare.scholarshare_backend.exceptions.ApiException;
import com.scholarshare.scholarshare_backend.exceptions.NotFoundException;
import com.scholarshare.scholarshare_backend.repositories.CategoryRepo;
import com.scholarshare.scholarshare_backend.repositories.ResearchFileRepo;
import com.scholarshare.scholarshare_backend.repositories.UserRepo;
import com.scholarshare.scholarshare_backend.securities.CurrentUser;
import com.scholarshare.scholarshare_backend.services.NotificationPublisher;
import com.scholarshare.scholarshare_backend.services.ResearchService;
import com.scholarshare.scholarshare_backend.utils.Paging;
import com.scholarshare.scholarshare_backend.utils.UploadValidator;
import com.scholarshare.scholarshare_backend.utils.UploadValidator.ValidatedFile;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.time.Year;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResearchServiceImpl implements ResearchService {

    private static final int MIN_YEAR = 1990;

    private final ResearchFileRepo researchRepo;
    private final CategoryRepo categoryRepo;
    private final UserRepo userRepo;
    private final CurrentUser currentUser;
    private final NotificationPublisher notifications;

    // ------------------------------------------------------------------ public reads

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ResearchResponse> search(String q, Long categoryId, Integer year, int page, int size) {
        return PageResponse.from(researchRepo.search(
                ResearchStatus.APPROVED, categoryId, year, Paging.likePattern(q), Paging.of(page, size)));
    }

    @Override
    @Transactional(readOnly = true)
    public ResearchResponse get(Long id) {
        ResearchResponse research = researchRepo.findResponseById(id)
                .orElseThrow(() -> new NotFoundException("Research not found"));
        // A hidden file answers "not found", so its existence is not revealed.
        if (!canView(research)) {
            throw new NotFoundException("Research not found");
        }
        return research;
    }

    @Override
    @Transactional(readOnly = true)
    public FileDownload download(Long id) {
        get(id);   // same visibility rules as the detail page
        return researchRepo.findFile(id).orElseThrow(() -> new NotFoundException("Research not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResearchResponse> mine() {
        return researchRepo.findByUploader(currentUser.require().getId());
    }

    // ------------------------------------------------------------------ upload

    @Override
    @Transactional
    public ResearchResponse upload(String title, String description, Long categoryId,
                                   Integer academicYear, MultipartFile file) {
        User uploader = currentUser.require();

        String cleanTitle = required(title, "Title", 255);
        String cleanDescription = required(description, "Description", 1000);
        if (academicYear == null || academicYear < MIN_YEAR || academicYear > Year.now().getValue() + 1) {
            throw bad("Academic year must be between " + MIN_YEAR + " and " + (Year.now().getValue() + 1) + ".");
        }
        if (categoryId == null) {
            throw bad("Category is required.");
        }
        Category category = categoryRepo.findById(categoryId).orElseThrow(() -> bad("Category not found."));
        ValidatedFile validated = UploadValidator.validate(file);

        ResearchFile saved = researchRepo.save(ResearchFile.builder()
                .title(cleanTitle)
                .description(cleanDescription)
                .category(category)
                .academicYear(academicYear)
                .status(ResearchStatus.PENDING)             // hidden until an admin approves
                .fileName(validated.fileName())
                .contentType(validated.contentType())
                .fileSize((long) validated.data().length)
                .fileData(validated.data())
                .uploadedBy(uploader)
                .build());

        notifications.toAdmins(NotificationType.FILE_SUBMITTED,
                uploader.getName() + " submitted \"" + cleanTitle + "\" for review.",
                RelatedEntityType.RESEARCH_FILE, saved.getId());

        return researchRepo.findResponseById(saved.getId()).orElseThrow();
    }

    // ------------------------------------------------------------------ admin

    @Override
    @Transactional(readOnly = true)
    public List<ResearchResponse> listPending() {
        return researchRepo.findByStatus(ResearchStatus.PENDING);
    }

    @Override
    @Transactional
    public ResearchResponse approve(Long id) {
        ResearchResponse research = review(id, ResearchStatus.APPROVED);
        notifications.toUser(userRepo.getReferenceById(research.uploadedById()), NotificationType.FILE_RESULT,
                "Your file \"" + research.title() + "\" was approved and is now published.",
                RelatedEntityType.RESEARCH_FILE, id);
        return researchRepo.findResponseById(id).orElseThrow();
    }

    @Override
    @Transactional
    public ResearchResponse reject(Long id, ReviewRequest request) {
        ResearchResponse research = review(id, ResearchStatus.REJECTED);
        String reason = request == null || request.reason() == null || request.reason().isBlank()
                ? "" : " Reason: " + request.reason().trim();
        notifications.toUser(userRepo.getReferenceById(research.uploadedById()), NotificationType.FILE_RESULT,
                "Your file \"" + research.title() + "\" was not approved." + reason,
                RelatedEntityType.RESEARCH_FILE, id);
        return researchRepo.findResponseById(id).orElseThrow();
    }

    // ------------------------------------------------------------------ helpers

    /** Moves a PENDING file to APPROVED/REJECTED and returns it as it was before. */
    private ResearchResponse review(Long id, ResearchStatus result) {
        User admin = currentUser.require();
        ResearchResponse before = researchRepo.findResponseById(id)
                .orElseThrow(() -> new NotFoundException("Research not found"));
        if (researchRepo.review(id, result, admin, Instant.now()) == 0) {
            throw new ApiException(HttpStatus.CONFLICT, "This file has already been reviewed");
        }
        return before;
    }

    private boolean canView(ResearchResponse research) {
        if (research.status() == ResearchStatus.APPROVED) {
            return true;
        }
        return currentUser.find()
                .map(user -> user.getRole() == Role.ADMIN || user.getId().equals(research.uploadedById()))
                .orElse(false);
    }

    private static String required(String value, String label, int max) {
        if (value == null || value.isBlank()) {
            throw bad(label + " is required.");
        }
        String trimmed = value.trim();
        if (trimmed.length() > max) {
            throw bad(label + " must be at most " + max + " characters.");
        }
        return trimmed;
    }

    private static ApiException bad(String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, message);
    }
}
