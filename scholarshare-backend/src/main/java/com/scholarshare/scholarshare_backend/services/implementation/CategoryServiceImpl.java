package com.scholarshare.scholarshare_backend.services.implementation;

import com.scholarshare.scholarshare_backend.dto.requests.CategoryRequest;
import com.scholarshare.scholarshare_backend.dto.responses.CategoryResponse;
import com.scholarshare.scholarshare_backend.dto.responses.ImageDownload;
import com.scholarshare.scholarshare_backend.entities.Category;
import com.scholarshare.scholarshare_backend.entities.CategoryImage;
import com.scholarshare.scholarshare_backend.entities.enums.ResearchStatus;
import com.scholarshare.scholarshare_backend.exceptions.ApiException;
import com.scholarshare.scholarshare_backend.exceptions.NotFoundException;
import com.scholarshare.scholarshare_backend.repositories.CategoryImageRepo;
import com.scholarshare.scholarshare_backend.repositories.CategoryRepo;
import com.scholarshare.scholarshare_backend.repositories.ResearchFileRepo;
import com.scholarshare.scholarshare_backend.services.CategoryService;
import com.scholarshare.scholarshare_backend.utils.ImageValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepo categoryRepo;
    private final ResearchFileRepo researchRepo;
    private final CategoryImageRepo imageRepo;

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
        return new CategoryResponse(saved.getId(), saved.getName(), 0L, null);
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
                .orElse(new CategoryResponse(id, name, 0L, category.getImageUrl()));
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
        if (imageRepo.existsById(id)) {
            imageRepo.deleteById(id);
        }
        categoryRepo.deleteById(id);
    }

    @Override
    @Transactional
    public CategoryResponse setImage(Long id, MultipartFile file) {
        Category category = categoryRepo.findById(id).orElseThrow(() -> new NotFoundException("Category not found"));
        saveImage(category, file);
        return view(category);
    }

    @Override
    @Transactional
    public CategoryResponse removeImage(Long id) {
        Category category = categoryRepo.findById(id).orElseThrow(() -> new NotFoundException("Category not found"));
        if (imageRepo.existsById(id)) {
            imageRepo.deleteById(id);
        }
        category.setImageUrl(null);
        return view(category);
    }

    @Override
    @Transactional(readOnly = true)
    public ImageDownload image(Long id) {
        return imageRepo.findById(id)
                .map(i -> new ImageDownload(i.getContentType(), i.getData()))
                .orElseThrow(() -> new NotFoundException("Photo not found"));
    }

    @Override
    @Transactional
    public Category findOrCreate(String rawName, MultipartFile image) {
        String name = rawName == null ? "" : rawName.trim().replaceAll("\\s+", " ");
        if (name.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Please type the name of your category.");
        }
        if (name.length() > 100) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Category name must be at most 100 characters.");
        }
        boolean hasImage = image != null && !image.isEmpty();
        Category category = categoryRepo.findByNameIgnoreCase(name).orElse(null);
        if (category == null) {
            category = categoryRepo.save(Category.builder().name(name).build());
            if (hasImage) {
                saveImage(category, image);
            }
        } else if (hasImage && category.getImageUrl() == null) {   // never replace a photo somebody else set
            saveImage(category, image);
        }
        return category;
    }

    private void saveImage(Category category, MultipartFile file) {
        ImageValidator.ValidatedImage image = ImageValidator.validate(file);
        imageRepo.save(CategoryImage.builder().categoryId(category.getId())
                .contentType(image.contentType()).data(image.data()).build());
        category.setImageUrl("/categories/" + category.getId() + "/image?v=" + System.currentTimeMillis());
    }

    private CategoryResponse view(Category category) {
        return categoryRepo.findAllWithCounts(ResearchStatus.APPROVED).stream()
                .filter(c -> c.id().equals(category.getId())).findFirst()
                .orElse(new CategoryResponse(category.getId(), category.getName(), 0L, category.getImageUrl()));
    }
}
