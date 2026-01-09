package com.burakcanaksoy.realestate.service;

import com.burakcanaksoy.realestate.mapper.CategoryMapper;
import com.burakcanaksoy.realestate.model.Category;
import com.burakcanaksoy.realestate.repository.CategoryRepository;
import com.burakcanaksoy.realestate.request.CategoryCreateRequest;
import com.burakcanaksoy.realestate.request.CategoryUpdateRequest;
import com.burakcanaksoy.realestate.response.CategoryResponse;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository){
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryResponse> getAllCategories(){
        List<Category> categoryList = this.categoryRepository.findAll();
        return categoryList.stream()
                .map(CategoryMapper::toResponse)
                .toList();

    }
    public CategoryResponse createCategory(CategoryCreateRequest categoryCreateRequest) {
        Category category = CategoryMapper.toEntity(categoryCreateRequest);
        Category savedCategory = this.categoryRepository.save(category);
        return CategoryMapper.toResponse(savedCategory);
    }

    public CategoryResponse getCategoryById(Long categoryId) {
        Category category = this.categoryRepository.findById(categoryId).orElseThrow(() -> new EntityNotFoundException("Category not found with this id : "+categoryId));
        return CategoryMapper.toResponse(category);
    }

    public void deleteCategory(Long categoryId) {
        Category category = this.categoryRepository.findById(categoryId).orElseThrow(() -> new EntityNotFoundException("Category not found with this id : "+categoryId));
        this.categoryRepository.delete(category);
    }

    public CategoryResponse updateCategory(Long id, CategoryUpdateRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException("Category not found with id: " + id)
                );

        if (request.getName() != null) {
            category.setName(request.getName());
        }

        if (request.getSlug() != null) {
            category.setSlug(request.getSlug());
        }

        if (request.getActive() != null) {
            category.setActive(request.getActive());
        }

        categoryRepository.save(category);
        return CategoryMapper.toResponse(category);
    }

    public Page<CategoryResponse> getAllCategories(Pageable pageable) {
        Page<Category> categoryPage = this.categoryRepository.findAll(pageable);
        return categoryPage.map(CategoryMapper::toResponse);
    }
}