package com.scholarshare.scholarshare_backend.configs;

import com.scholarshare.scholarshare_backend.entities.Category;
import com.scholarshare.scholarshare_backend.repositories.CategoryRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/** On a brand-new database there are no categories, so nobody could upload. Adds a starter set once. */
@Component
@RequiredArgsConstructor
public class CategorySeeder implements ApplicationRunner {

    private static final List<String> DEFAULTS = List.of(
            "Computer Science", "Information Technology", "Artificial Intelligence",
            "Cybersecurity", "Data Science", "Business & Management");

    private final CategoryRepo categoryRepo;

    @Override
    public void run(ApplicationArguments args) {
        if (categoryRepo.count() == 0) {
            categoryRepo.saveAll(DEFAULTS.stream().map(name -> Category.builder().name(name).build()).toList());
        }
    }
}
