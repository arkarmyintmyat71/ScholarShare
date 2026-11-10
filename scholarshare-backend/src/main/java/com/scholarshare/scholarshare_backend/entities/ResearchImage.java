package com.scholarshare.scholarshare_backend.entities;

import jakarta.persistence.*;
import lombok.*;

/** The research cover picture bytes (separate table so research lists never load them). */
@Entity
@Table(name = "research_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResearchImage {

    /** Same value as research_files.id. */
    @Id
    @Column(name = "research_file_id")
    private Long researchFileId;

    @Column(name = "content_type", nullable = false, length = 50)
    private String contentType;

    @Lob
    @Column(nullable = false, columnDefinition = "LONGBLOB")
    private byte[] data;
}
