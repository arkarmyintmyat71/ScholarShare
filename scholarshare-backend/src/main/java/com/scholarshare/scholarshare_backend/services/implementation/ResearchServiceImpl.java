package com.scholarshare.scholarshare_backend.services.implementation;

import com.scholarshare.scholarshare_backend.dto.requests.ReviewRequest;
import com.scholarshare.scholarshare_backend.dto.responses.FileDownload;
import com.scholarshare.scholarshare_backend.dto.responses.ImageDownload;
import com.scholarshare.scholarshare_backend.dto.responses.PageResponse;
import com.scholarshare.scholarshare_backend.dto.responses.ResearchResponse;
import com.scholarshare.scholarshare_backend.entities.Category;
import com.scholarshare.scholarshare_backend.entities.ResearchFile;
import com.scholarshare.scholarshare_backend.entities.ResearchImage;
import com.scholarshare.scholarshare_backend.entities.User;
import com.scholarshare.scholarshare_backend.entities.enums.NotificationType;
import com.scholarshare.scholarshare_backend.entities.enums.RelatedEntityType;
import com.scholarshare.scholarshare_backend.entities.enums.ResearchStatus;
import com.scholarshare.scholarshare_backend.entities.enums.Role;
import com.scholarshare.scholarshare_backend.exceptions.ApiException;
import com.scholarshare.scholarshare_backend.exceptions.NotFoundException;
import com.scholarshare.scholarshare_backend.repositories.BookmarkRepo;
import com.scholarshare.scholarshare_backend.repositories.CategoryRepo;
import com.scholarshare.scholarshare_backend.repositories.ResearchCommentLikeRepo;
import com.scholarshare.scholarshare_backend.repositories.ResearchCommentRepo;
import com.scholarshare.scholarshare_backend.repositories.ResearchRatingRepo;
import com.scholarshare.scholarshare_backend.services.CategoryService;
import com.scholarshare.scholarshare_backend.repositories.ResearchFileRepo;
import com.scholarshare.scholarshare_backend.repositories.ResearchImageRepo;
import com.scholarshare.scholarshare_backend.repositories.UserRepo;
import com.scholarshare.scholarshare_backend.securities.CurrentUser;
import com.scholarshare.scholarshare_backend.services.NotificationPublisher;
import com.scholarshare.scholarshare_backend.services.ResearchService;
import com.scholarshare.scholarshare_backend.utils.ImageValidator;
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
    private final CategoryService categoryService;
    private final ResearchRatingRepo ratingRepo;
    private final ResearchCommentRepo commentRepo;
    private final ResearchCommentLikeRepo commentLikeRepo;
    private final BookmarkRepo bookmarkRepo;
    private final ResearchImageRepo imageRepo;
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
    public ImageDownload image(Long id) {
        return imageRepo.findById(id)
                .map(i -> new ImageDownload(i.getContentType(), i.getData()))
                .orElseThrow(() -> new NotFoundException("Picture not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResearchResponse> mine() {
        return researchRepo.findByUploader(currentUser.require().getId());
    }

    // ------------------------------------------------------------------ upload

    @Override
    @Transactional
    public ResearchResponse upload(String title, String description, Long categoryId, String newCategoryName,
                                   MultipartFile categoryImage, Integer academicYear, MultipartFile file,
                                   MultipartFile image) {
        User uploader = currentUser.require();

        String cleanTitle = required(title, "Title", 255);
        String cleanDescription = required(description, "Description", 1000);
        checkYear(academicYear);
        ValidatedFile validated = UploadValidator.validate(file);
        ImageValidator.ValidatedImage picture = image == null || image.isEmpty() ? null : ImageValidator.validate(image);
        Category category = resolveCategory(categoryId, newCategoryName, categoryImage);

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
        if (picture != null) {
            saveImage(saved, picture);
        }

        notifications.toAdmins(NotificationType.FILE_SUBMITTED,
                uploader.getName() + " submitted \"" + cleanTitle + "\" for review.",
                RelatedEntityType.RESEARCH_FILE, saved.getId());

        return researchRepo.findResponseById(saved.getId()).orElseThrow();
    }

    @Override
    @Transactional
    public ResearchResponse update(Long id, String title, String description, Long categoryId, String newCategoryName,
                                   MultipartFile categoryImage, Integer academicYear, MultipartFile file,
                                   MultipartFile image, boolean removeImage) {
        User user = currentUser.require();
        ResearchFile research = researchRepo.findById(id).orElseThrow(() -> new NotFoundException("Research not found"));
        // Someone else's file answers "not found", exactly like a hidden file.
        if (!research.getUploadedBy().getId().equals(user.getId())) {
            throw new NotFoundException("Research not found");
        }

        String cleanTitle = required(title, "Title", 255);
        String cleanDescription = required(description, "Description", 1000);
        checkYear(academicYear);
        ValidatedFile validated = file == null || file.isEmpty() ? null : UploadValidator.validate(file);
        ImageValidator.ValidatedImage picture = image == null || image.isEmpty() ? null : ImageValidator.validate(image);
        Category category = resolveCategory(categoryId, newCategoryName, categoryImage);

        research.setTitle(cleanTitle);
        research.setDescription(cleanDescription);
        research.setCategory(category);
        research.setAcademicYear(academicYear);
        if (validated != null) {
            research.setFileName(validated.fileName());
            research.setContentType(validated.contentType());
            research.setFileSize((long) validated.data().length);
            research.setFileData(validated.data());
        }
        if (picture != null) {
            saveImage(research, picture);
        } else if (removeImage) {
            imageRepo.deleteById(id);
            research.setImageUrl(null);
        }
        // An edited file must be checked again before it is public.
        research.setStatus(ResearchStatus.PENDING);
        research.setReviewedBy(null);
        research.setReviewedAt(null);
        researchRepo.saveAndFlush(research);

        notifications.toAdmins(NotificationType.FILE_SUBMITTED,
                user.getName() + " updated \"" + cleanTitle + "\" and sent it for review again.",
                RelatedEntityType.RESEARCH_FILE, id);

        return researchRepo.findResponseById(id).orElseThrow();
    }

    @Override
    @Transactional
    public void delete(Long id) {
        User user = currentUser.require();
        ResearchResponse research = researchRepo.findResponseById(id)
                .orElseThrow(() -> new NotFoundException("Research not found"));
        if (user.getRole() != Role.ADMIN && !research.uploadedById().equals(user.getId())) {
            throw new NotFoundException("Research not found");
        }
        commentLikeRepo.deleteByResearch(id);
        commentRepo.deleteByResearch(id);
        ratingRepo.deleteByResearch(id);
        bookmarkRepo.deleteByResearch(id);
        imageRepo.deleteById(id);
        researchRepo.deleteById(id);
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

    private Category resolveCategory(Long categoryId, String newCategoryName, MultipartFile categoryImage) {
        if (newCategoryName != null && !newCategoryName.isBlank()) {       // the student chose "Other"
            return categoryService.findOrCreate(newCategoryName, categoryImage);
        }
        if (categoryId == null) {
            throw bad("Category is required.");
        }
        return categoryRepo.findById(categoryId).orElseThrow(() -> bad("Category not found."));
    }

    /** Stores (or replaces) the cover picture and remembers its address; the ?v= makes browsers reload a new one. */
    private void saveImage(ResearchFile research, ImageValidator.ValidatedImage picture) {
        imageRepo.save(ResearchImage.builder().researchFileId(research.getId())
                .contentType(picture.contentType()).data(picture.data()).build());
        research.setImageUrl("/research/" + research.getId() + "/image?v=" + System.currentTimeMillis());
        researchRepo.saveAndFlush(research);
    }

    private static void checkYear(Integer academicYear) {
        if (academicYear == null || academicYear < MIN_YEAR || academicYear > Year.now().getValue() + 1) {
            throw bad("Academic year must be between " + MIN_YEAR + " and " + (Year.now().getValue() + 1) + ".");
        }
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
