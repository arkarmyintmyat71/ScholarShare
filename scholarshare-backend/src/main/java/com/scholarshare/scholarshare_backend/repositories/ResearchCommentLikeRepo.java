package com.scholarshare.scholarshare_backend.repositories;

import com.scholarshare.scholarshare_backend.entities.ResearchCommentLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ResearchCommentLikeRepo extends JpaRepository<ResearchCommentLike, Long> {

    boolean existsByUserIdAndCommentId(Long userId, Long commentId);

    @Modifying
    @Query("delete from ResearchCommentLike l where l.user.id = :userId and l.comment.id = :commentId")
    void deleteByUserAndComment(@Param("userId") Long userId, @Param("commentId") Long commentId);

    @Modifying
    @Query("delete from ResearchCommentLike l where l.comment.id = :commentId")
    void deleteByComment(@Param("commentId") Long commentId);

    @Modifying
    @Query("delete from ResearchCommentLike l where l.comment.researchFile.id = :researchId")
    void deleteByResearch(@Param("researchId") Long researchId);
}
