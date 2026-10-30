package com.scholarshare.scholarshare_backend.services;

import com.scholarshare.scholarshare_backend.dto.requests.CommentRequest;
import com.scholarshare.scholarshare_backend.dto.requests.TopicRequest;
import com.scholarshare.scholarshare_backend.dto.responses.CommentResponse;
import com.scholarshare.scholarshare_backend.dto.responses.PageResponse;
import com.scholarshare.scholarshare_backend.dto.responses.TopicDetailResponse;
import com.scholarshare.scholarshare_backend.dto.responses.TopicResponse;

public interface TopicService {
    PageResponse<TopicResponse> list(String q, int page, int size);

    TopicDetailResponse get(Long id);

    TopicResponse create(TopicRequest request);

    /** Adds a comment and notifies the topic's creator (unless they wrote it themselves). */
    CommentResponse addComment(Long topicId, CommentRequest request);

    // ---- admin moderation ----
    void deleteTopic(Long id);

    void deleteComment(Long id);
}
