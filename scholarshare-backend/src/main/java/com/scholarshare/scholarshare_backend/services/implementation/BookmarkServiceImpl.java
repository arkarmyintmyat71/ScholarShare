package com.scholarshare.scholarshare_backend.services.implementation;

import com.scholarshare.scholarshare_backend.dto.responses.ResearchResponse;
import com.scholarshare.scholarshare_backend.entities.Bookmark;
import com.scholarshare.scholarshare_backend.entities.User;
import com.scholarshare.scholarshare_backend.entities.enums.ResearchStatus;
import com.scholarshare.scholarshare_backend.exceptions.NotFoundException;
import com.scholarshare.scholarshare_backend.repositories.BookmarkRepo;
import com.scholarshare.scholarshare_backend.repositories.ResearchFileRepo;
import com.scholarshare.scholarshare_backend.securities.CurrentUser;
import com.scholarshare.scholarshare_backend.services.BookmarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookmarkServiceImpl implements BookmarkService {

    private final BookmarkRepo bookmarkRepo;
    private final ResearchFileRepo researchRepo;
    private final CurrentUser currentUser;

    @Override
    @Transactional(readOnly = true)
    public List<ResearchResponse> list() {
        return researchRepo.findSavedBy(currentUser.require().getId(), ResearchStatus.APPROVED);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> ids() {
        return bookmarkRepo.findResearchIdsByUser(currentUser.require().getId());
    }

    @Override
    @Transactional
    public void save(Long researchId) {
        User user = currentUser.require();
        boolean visible = researchRepo.findResponseById(researchId)
                .filter(r -> r.status() == ResearchStatus.APPROVED).isPresent();
        if (!visible) {
            throw new NotFoundException("Research not found");
        }
        if (!bookmarkRepo.existsByUserIdAndResearchFileId(user.getId(), researchId)) {   // saving twice is harmless
            bookmarkRepo.save(Bookmark.builder()
                    .user(user)
                    .researchFile(researchRepo.getReferenceById(researchId))
                    .build());
        }
    }

    @Override
    @Transactional
    public void remove(Long researchId) {
        bookmarkRepo.deleteByUserAndResearch(currentUser.require().getId(), researchId);
    }
}
