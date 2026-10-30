package com.scholarshare.scholarshare_backend.services.implementation;

import com.scholarshare.scholarshare_backend.dto.requests.CommentRequest;
import com.scholarshare.scholarshare_backend.dto.requests.TopicRequest;
import com.scholarshare.scholarshare_backend.dto.responses.CommentResponse;
import com.scholarshare.scholarshare_backend.dto.responses.PageResponse;
import com.scholarshare.scholarshare_backend.dto.responses.TopicDetailResponse;
import com.scholarshare.scholarshare_backend.dto.responses.TopicResponse;
import com.scholarshare.scholarshare_backend.entities.Comment;
import com.scholarshare.scholarshare_backend.entities.Topic;
import com.scholarshare.scholarshare_backend.entities.User;
import com.scholarshare.scholarshare_backend.entities.enums.NotificationType;
import com.scholarshare.scholarshare_backend.entities.enums.RelatedEntityType;
import com.scholarshare.scholarshare_backend.exceptions.NotFoundException;
import com.scholarshare.scholarshare_backend.repositories.CommentRepo;
import com.scholarshare.scholarshare_backend.repositories.NotificationRepo;
import com.scholarshare.scholarshare_backend.repositories.TopicRepo;
import com.scholarshare.scholarshare_backend.securities.CurrentUser;
import com.scholarshare.scholarshare_backend.services.NotificationPublisher;
import com.scholarshare.scholarshare_backend.services.TopicService;
import com.scholarshare.scholarshare_backend.utils.Paging;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TopicServiceImpl implements TopicService {

    private final TopicRepo topicRepo;
    private final CommentRepo commentRepo;
    private final NotificationRepo notificationRepo;
    private final CurrentUser currentUser;
    private final NotificationPublisher notifications;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TopicResponse> list(String q, int page, int size) {
        return PageResponse.from(topicRepo.search(Paging.likePattern(q), Paging.of(page, size)));
    }

    @Override
    @Transactional(readOnly = true)
    public TopicDetailResponse get(Long id) {
        TopicResponse topic = topicRepo.findResponseById(id).orElseThrow(() -> new NotFoundException("Topic not found"));
        return new TopicDetailResponse(topic, commentRepo.findByTopic(id));
    }

    @Override
    @Transactional
    public TopicResponse create(TopicRequest request) {
        Topic saved = topicRepo.save(Topic.builder()
                .title(request.title().trim())
                .body(request.body().trim())
                .createdBy(currentUser.require())
                .build());
        return topicRepo.findResponseById(saved.getId()).orElseThrow();
    }

    @Override
    @Transactional
    public CommentResponse addComment(Long topicId, CommentRequest request) {
        Topic topic = topicRepo.findById(topicId).orElseThrow(() -> new NotFoundException("Topic not found"));
        User author = currentUser.require();

        Comment comment = commentRepo.save(Comment.builder()
                .topic(topic)
                .body(request.body().trim())
                .createdBy(author)
                .build());

        // Tell the topic's creator, but not when they comment on their own topic.
        if (!topic.getCreatedBy().getId().equals(author.getId())) {
            notifications.toUser(topic.getCreatedBy(), NotificationType.NEW_COMMENT,
                    author.getName() + " commented on your topic \"" + topic.getTitle() + "\".",
                    RelatedEntityType.TOPIC, topic.getId());
        }

        return new CommentResponse(comment.getId(), topic.getId(), comment.getBody(),
                author.getId(), author.getName(), comment.getCreatedAt());
    }

    @Override
    @Transactional
    public void deleteTopic(Long id) {
        if (!topicRepo.existsById(id)) {
            throw new NotFoundException("Topic not found");
        }
        commentRepo.deleteByTopicId(id);                                   // comments first (foreign key)
        notificationRepo.deleteByRelated(RelatedEntityType.TOPIC, id);     // no dead links in inboxes
        topicRepo.deleteById(id);
    }

    @Override
    @Transactional
    public void deleteComment(Long id) {
        if (!commentRepo.existsById(id)) {
            throw new NotFoundException("Comment not found");
        }
        commentRepo.deleteById(id);
    }
}
