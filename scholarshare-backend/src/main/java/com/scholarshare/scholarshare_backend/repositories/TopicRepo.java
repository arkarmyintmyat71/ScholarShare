package com.scholarshare.scholarshare_backend.repositories;

import com.scholarshare.scholarshare_backend.dto.responses.TopicResponse;
import com.scholarshare.scholarshare_backend.entities.Topic;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TopicRepo extends JpaRepository<Topic, Long> {

    String SELECT_RESPONSE = "select new com.scholarshare.scholarshare_backend.dto.responses.TopicResponse("
            + "t.id, t.title, t.body, u.id, u.name, t.createdAt, "
            + "(select count(c) from Comment c where c.topic = t)) "
            + "from Topic t join t.createdBy u ";

    /** Newest first. q is optional and must already be lower-case "%text%". */
    @Query(value = SELECT_RESPONSE
            + "where (:q is null or lower(t.title) like :q or lower(t.body) like :q) order by t.createdAt desc",
            countQuery = "select count(t) from Topic t where (:q is null or lower(t.title) like :q or lower(t.body) like :q)")
    Page<TopicResponse> search(@Param("q") String q, Pageable pageable);

    @Query(SELECT_RESPONSE + "where t.id = :id")
    Optional<TopicResponse> findResponseById(@Param("id") Long id);
}
