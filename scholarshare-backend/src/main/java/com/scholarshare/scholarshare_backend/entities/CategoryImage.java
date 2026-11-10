package com.scholarshare.scholarshare_backend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** The category photo bytes (separate table so the category list never loads them). */
@Entity
@Table(name = "category_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryImage {

    /** Same value as categories.id. */
    @Id
    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "content_type", nullable = false, length = 50)
    private String contentType;

    @Lob
    @Column(nullable = false, columnDefinition = "LONGBLOB")
    private byte[] data;
}
