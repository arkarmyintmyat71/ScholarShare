package com.scholarshare.scholarshare_backend.repositories;

import com.scholarshare.scholarshare_backend.entities.ResearchRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResearchRatingRepo extends JpaRepository<ResearchRating, Long> {

    Optional<ResearchRating> findByUserIdAndResearchFileId(Long userId, Long researchFileId);

    @Query("select r from ResearchRating r where r.user.id = :userId")
    List<ResearchRating> findByUser(@Param("userId") Long userId);

    @Modifying
    @Query("delete from ResearchRating r where r.user.id = :userId and r.researchFile.id = :researchId")
    void deleteByUserAndResearch(@Param("userId") Long userId, @Param("researchId") Long researchId);

    @Modifying
    @Query("delete from ResearchRating r where r.researchFile.id = :researchId")
    void deleteByResearch(@Param("researchId") Long researchId);
}
