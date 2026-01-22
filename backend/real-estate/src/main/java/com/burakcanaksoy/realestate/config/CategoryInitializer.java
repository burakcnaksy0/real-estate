package com.burakcanaksoy.realestate.config;

import com.burakcanaksoy.realestate.model.Category;
import com.burakcanaksoy.realestate.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import java.util.Arrays;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class CategoryInitializer {

    private final CategoryRepository categoryRepository;

    @Bean
    @Order(2) // Run after other initializers if order matters, though likely independent
    public CommandLineRunner initCategories() {
        return args -> {
            log.info("Checking default categories...");

            List<CategoryData> defaultCategories = Arrays.asList(
                    new CategoryData("Emlak", "emlak"),
                    new CategoryData("İş Yeri", "is-yeri"),
                    new CategoryData("Arsa", "arsa"),
                    new CategoryData("Arac", "arac")
            );

            for (CategoryData data : defaultCategories) {
                if (!categoryRepository.existsBySlug(data.slug)) {
                    log.info("Creating category: {}", data.name);
                    Category category = new Category();
                    category.setName(data.name);
                    category.setSlug(data.slug);
                    category.setActive(true);
                    categoryRepository.save(category);
                } else {
                    log.info("Category already exists: {}", data.name);
                }
            }
            
            log.info("Category initialization completed.");
        };
    }

    private static class CategoryData {
        String name;
        String slug;

        public CategoryData(String name, String slug) {
            this.name = name;
            this.slug = slug;
        }
    }
}
