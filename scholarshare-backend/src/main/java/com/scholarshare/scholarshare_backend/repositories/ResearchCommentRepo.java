package com.scholarshare.scholarshare_backend.repositories;

import com.scholarshare.scholarshare_backend.dto.responses.ResearchCommentResponse;
import com.scholarshare.scholarshare_backend.entities.ResearchComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResearchCommentRepo extends JpaRepository<ResearchComment, Long> {

    String SELECT_RESPONSE = "select new com.scholarshare.scholarshare_backend.dto.responses.ResearchCommentResponse("
            + "c.id, c.researchFile.id, c.body, u.id, u.name, u.pictureUrl, c.createdAt, "
            + "(select count(cl) from ResearchCommentLike cl where cl.comment = c), "
            + "(select count(my) from ResearchCommentLike my where my.comment = c and my.user.id = :userId)) "
            + "from ResearchComment c join c.createdBy u ";

    /** Oldest first; the React app re-sorts for "Most relevant" / "Newest". */
    @Query(SELECT_RESPONSE + "where c.researchFile.id = :researchId order by c.createdAt asc")
    List<ResearchCommentResponse> findByResearch(@Param("researchId") Long researchId, @Param("userId") Long userId);

    @Query(SELECT_RESPONSE + "where c.id = :id")
    Optional<ResearchCommentResponse> findResponseById(@Param("id") Long id, @Param("userId") Long userId);

    @Modifying
    @Query("delete from ResearchComment c where c.researchFile.id = :researchId")
    void deleteByResearch(@Param("researchId") Long researchId);
}
