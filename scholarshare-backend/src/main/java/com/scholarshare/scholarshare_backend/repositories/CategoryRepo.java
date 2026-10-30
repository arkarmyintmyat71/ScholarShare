package com.scholarshare.scholarshare_backend.repositories;

import com.scholarshare.scholarshare_backend.dto.responses.CategoryResponse;
import com.scholarshare.scholarshare_backend.entities.Category;
import com.scholarshare.scholarshare_backend.entities.enums.ResearchStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepo extends JpaRepository<Category, Long> {

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    /** Every category with the number of research files of the given status (APPROVED for the public). */
    @Query("select new com.scholarshare.scholarshare_backend.dto.responses.CategoryResponse(c.id, c.name, "
            + "(select count(r) from ResearchFile r where r.category = c and r.status = :status)) "
            + "from Category c order by c.name")
    List<CategoryResponse> findAllWithCounts(@Param("status") ResearchStatus status);
}
