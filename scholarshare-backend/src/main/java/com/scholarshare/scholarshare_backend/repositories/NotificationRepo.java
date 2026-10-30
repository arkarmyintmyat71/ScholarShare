package com.scholarshare.scholarshare_backend.repositories;

import com.scholarshare.scholarshare_backend.entities.Notification;
import com.scholarshare.scholarshare_backend.entities.enums.RelatedEntityType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepo extends JpaRepository<Notification, Long> {

    List<Notification> findTop50ByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    long countByRecipientIdAndReadFalse(Long recipientId);

    /** Returns 0 when the notification does not exist or belongs to someone else. */
    @Modifying(clearAutomatically = true)
    @Query("update Notification n set n.read = true where n.id = :id and n.recipient.id = :userId")
    int markRead(@Param("id") Long id, @Param("userId") Long userId);

    @Modifying(clearAutomatically = true)
    @Query("update Notification n set n.read = true where n.recipient.id = :userId and n.read = false")
    int markAllRead(@Param("userId") Long userId);

    /** Removes notifications that point at something that was deleted (e.g. a moderated topic). */
    @Modifying
    @Query("delete from Notification n where n.relatedEntityType = :type and n.relatedEntityId = :entityId")
    void deleteByRelated(@Param("type") RelatedEntityType type, @Param("entityId") Long entityId);
}
