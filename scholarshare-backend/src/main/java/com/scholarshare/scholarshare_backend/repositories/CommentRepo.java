package com.scholarshare.scholarshare_backend.repositories;

import com.scholarshare.scholarshare_backend.dto.responses.CommentResponse;
import com.scholarshare.scholarshare_backend.entities.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepo extends JpaRepository<Comment, Long> {

    @Query("select new com.scholarshare.scholarshare_backend.dto.responses.CommentResponse(c.id, c.topic.id, c.body, u.id, u.name, c.createdAt) "
            + "from Comment c join c.createdBy u where c.topic.id = :topicId order by c.createdAt asc")
    List<CommentResponse> findByTopic(@Param("topicId") Long topicId);

    @Modifying
    @Query("delete from Comment c where c.topic.id = :topicId")
    void deleteByTopicId(@Param("topicId") Long topicId);
}
