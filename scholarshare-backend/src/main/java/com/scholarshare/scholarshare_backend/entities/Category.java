package com.scholarshare.scholarshare_backend.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    /** Relative URL of the category photo ("/categories/3/image?v=..."), or null. The bytes live in category_images. */
    @Column(name = "image_url", length = 255)
    private String imageUrl;
}
