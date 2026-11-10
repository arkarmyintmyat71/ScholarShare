package com.scholarshare.scholarshare_backend.repositories;

import com.scholarshare.scholarshare_backend.entities.ResearchImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ResearchImageRepo extends JpaRepository<ResearchImage, Long> {
}
