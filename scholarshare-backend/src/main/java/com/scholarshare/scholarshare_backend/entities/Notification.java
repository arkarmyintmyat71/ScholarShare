package com.scholarshare.scholarshare_backend.entities;

import com.scholarshare.scholarshare_backend.entities.enums.NotificationType;
import com.scholarshare.scholarshare_backend.entities.enums.RelatedEntityType;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/** One row per recipient. Created in the same transaction as the event that caused it. */
@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40, columnDefinition = "VARCHAR(40)")
    private NotificationType type;

    @Column(nullable = false, length = 255)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "related_entity_type", length = 30, columnDefinition = "VARCHAR(30)")
    private RelatedEntityType relatedEntityType;

    @Column(name = "related_entity_id")
    private Long relatedEntityId;

    /** Column is is_read; the field is called "read" so JSON and getters stay simple. */
    @Column(name = "is_read", nullable = false)
    private boolean read;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }
}
