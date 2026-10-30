package com.scholarshare.scholarshare_backend.repositories;

import com.scholarshare.scholarshare_backend.entities.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookmarkRepo extends JpaRepository<Bookmark, Long> {

    boolean existsByUserIdAndResearchFileId(Long userId, Long researchFileId);

    @Query("select b.researchFile.id from Bookmark b where b.user.id = :userId")
    List<Long> findResearchIdsByUser(@Param("userId") Long userId);

    @Modifying
    @Query("delete from Bookmark b where b.user.id = :userId and b.researchFile.id = :researchId")
    void deleteByUserAndResearch(@Param("userId") Long userId, @Param("researchId") Long researchId);
}
