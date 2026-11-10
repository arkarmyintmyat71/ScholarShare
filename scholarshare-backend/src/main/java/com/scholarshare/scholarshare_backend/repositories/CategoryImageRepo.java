package com.scholarshare.scholarshare_backend.repositories;

import com.scholarshare.scholarshare_backend.entities.CategoryImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryImageRepo extends JpaRepository<CategoryImage, Long> {
}
