package com.scholarshare.scholarshare_backend.services;

import com.scholarshare.scholarshare_backend.dto.responses.ResearchResponse;

import java.util.List;

public interface BookmarkService {
    List<ResearchResponse> list();

    /** Ids only, so cards can show the saved state without loading everything. */
    List<Long> ids();

    void save(Long researchId);

    void remove(Long researchId);
}
