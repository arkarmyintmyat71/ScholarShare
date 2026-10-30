package com.scholarshare.scholarshare_backend.dto.responses;

import java.util.List;

public record TopicDetailResponse(TopicResponse topic, List<CommentResponse> comments) {
}
