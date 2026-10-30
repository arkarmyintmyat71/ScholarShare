package com.scholarshare.scholarshare_backend.repositories;

import com.scholarshare.scholarshare_backend.dto.responses.FileDownload;
import com.scholarshare.scholarshare_backend.dto.responses.ResearchResponse;
import com.scholarshare.scholarshare_backend.entities.ResearchFile;
import com.scholarshare.scholarshare_backend.entities.User;
import com.scholarshare.scholarshare_backend.entities.enums.ResearchStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Every read here returns a ResearchResponse built by "select new", so the LONGBLOB column is
 * not loaded. The only query that reads file_data is findFile (download).
 */
@Repository
public interface ResearchFileRepo extends JpaRepository<ResearchFile, Long> {

    String SELECT_RESPONSE = "select new com.scholarshare.scholarshare_backend.dto.responses.ResearchResponse("
            + "r.id, r.title, r.description, c.id, c.name, r.academicYear, r.status, r.fileName, "
            + "r.contentType, r.fileSize, u.id, u.name, r.uploadedAt, r.reviewedAt) "
            + "from ResearchFile r join r.category c join r.uploadedBy u ";

    /** Public search: filters are optional (null = all). q must already be lower-case "%text%". */
    @Query(value = SELECT_RESPONSE
            + "where r.status = :status "
            + "and (:categoryId is null or c.id = :categoryId) "
            + "and (:year is null or r.academicYear = :year) "
            + "and (:q is null or lower(r.title) like :q or lower(r.description) like :q or lower(c.name) like :q) "
            + "order by r.uploadedAt desc",
            countQuery = "select count(r) from ResearchFile r join r.category c "
                    + "where r.status = :status "
                    + "and (:categoryId is null or c.id = :categoryId) "
                    + "and (:year is null or r.academicYear = :year) "
                    + "and (:q is null or lower(r.title) like :q or lower(r.description) like :q or lower(c.name) like :q)")
    Page<ResearchResponse> search(@Param("status") ResearchStatus status,
                                  @Param("categoryId") Long categoryId,
                                  @Param("year") Integer year,
                                  @Param("q") String q,
                                  Pageable pageable);

    @Query(SELECT_RESPONSE + "where r.id = :id")
    Optional<ResearchResponse> findResponseById(@Param("id") Long id);

    /** A student's own uploads, any status. */
    @Query(SELECT_RESPONSE + "where u.id = :userId order by r.uploadedAt desc")
    List<ResearchResponse> findByUploader(@Param("userId") Long userId);

    /** Admin review queue (or any status), oldest first. */
    @Query(SELECT_RESPONSE + "where r.status = :status order by r.uploadedAt asc")
    List<ResearchResponse> findByStatus(@Param("status") ResearchStatus status);

    /** The files a student saved (only the ones that are still public). */
    @Query(SELECT_RESPONSE
            + "where r.status = :status and r.id in "
            + "(select b.researchFile.id from Bookmark b where b.user.id = :userId) "
            + "order by r.uploadedAt desc")
    List<ResearchResponse> findSavedBy(@Param("userId") Long userId, @Param("status") ResearchStatus status);

    @Query("select new com.scholarshare.scholarshare_backend.dto.responses.FileDownload(r.fileName, r.contentType, r.fileData) "
            + "from ResearchFile r where r.id = :id")
    Optional<FileDownload> findFile(@Param("id") Long id);

    /** Sets the review result without loading the file bytes. Returns 1 when a PENDING file was updated. */
    @Modifying(clearAutomatically = true)
    @Query("update ResearchFile r set r.status = :status, r.reviewedBy = :admin, r.reviewedAt = :now "
            + "where r.id = :id and r.status = com.scholarshare.scholarshare_backend.entities.enums.ResearchStatus.PENDING")
    int review(@Param("id") Long id, @Param("status") ResearchStatus status,
               @Param("admin") User admin, @Param("now") Instant now);

    boolean existsByCategoryId(Long categoryId);

    long countByStatus(ResearchStatus status);
}
