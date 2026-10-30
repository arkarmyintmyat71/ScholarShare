package com.scholarshare.scholarshare_backend.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/** "Save" button on the student dashboard (extra table, not in thesis Table 3.6). */
@Entity
@Table(name = "bookmarks", uniqueConstraints = @UniqueConstraint(name = "uk_bookmark", columnNames = {"user_id", "research_file_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bookmark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "research_file_id", nullable = false)
    private ResearchFile researchFile;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }
}
