package com.scholarshare.scholarshare_backend.services.implementation;

import com.scholarshare.scholarshare_backend.dto.requests.CategoryRequest;
import com.scholarshare.scholarshare_backend.dto.responses.CategoryResponse;
import com.scholarshare.scholarshare_backend.entities.Category;
import com.scholarshare.scholarshare_backend.entities.enums.ResearchStatus;
import com.scholarshare.scholarshare_backend.exceptions.ApiException;
import com.scholarshare.scholarshare_backend.exceptions.NotFoundException;
import com.scholarshare.scholarshare_backend.repositories.CategoryRepo;
import com.scholarshare.scholarshare_backend.repositories.ResearchFileRepo;
import com.scholarshare.scholarshare_backend.services.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepo categoryRepo;
    private final ResearchFileRepo researchRepo;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> list() {
        return categoryRepo.findAllWithCounts(ResearchStatus.APPROVED);
    }

    @Override
    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        String name = request.name().trim();
        if (categoryRepo.existsByNameIgnoreCase(name)) {
            throw new ApiException(HttpStatus.CONFLICT, "A category with this name already exists");
        }
        Category saved = categoryRepo.save(Category.builder().name(name).build());
        return new CategoryResponse(saved.getId(), saved.getName(), 0L);
    }

    @Override
    @Transactional
    public CategoryResponse rename(Long id, CategoryRequest request) {
        Category category = categoryRepo.findById(id).orElseThrow(() -> new NotFoundException("Category not found"));
        String name = request.name().trim();
        if (categoryRepo.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new ApiException(HttpStatus.CONFLICT, "A category with this name already exists");
        }
        category.setName(name);
        return categoryRepo.findAllWithCounts(ResearchStatus.APPROVED).stream()
                .filter(c -> c.id().equals(id)).findFirst()
                .orElse(new CategoryResponse(id, name, 0L));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!categoryRepo.existsById(id)) {
            throw new NotFoundException("Category not found");
        }
        if (researchRepo.existsByCategoryId(id)) {
            throw new ApiException(HttpStatus.CONFLICT, "This category is used by research files and cannot be deleted");
        }
        categoryRepo.deleteById(id);
    }
}
