package com.burakcanaksoy.realestate.repository;

import com.burakcanaksoy.realestate.model.Category;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category,Long> {
    Optional<Category> findBySlug(String categorySlug);
}
