package com.burakcanaksoy.realestate.service;

import com.burakcanaksoy.realestate.model.Category;
import com.burakcanaksoy.realestate.repository.CategoryRepository;
import com.burakcanaksoy.realestate.request.CategoryCreateRequest;
import com.burakcanaksoy.realestate.request.CategoryUpdateRequest;
import com.burakcanaksoy.realestate.response.CategoryResponse;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for CategoryService
 *
 * This test class covers all methods of CategoryService.
 * @Mock: Mocks the repository dependency
 * @InjectMocks: Creates CategoryService and injects mocked dependencies
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("CategoryService Unit Tests")
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    private Category testCategory;
    private CategoryResponse testCategoryResponse;
    private CategoryCreateRequest categoryCreateRequest;
    private CategoryUpdateRequest categoryUpdateRequest;

    /**
     * Setup method executed before each test
     * Test data is prepared here
     */
    @BeforeEach
    void setUp() {
        // Prepare test category entity
        testCategory = new Category();
        testCategory.setId(1L);
        testCategory.setName("Electronics");
        testCategory.setSlug("electronics");
        testCategory.setActive(true);

        // Prepare test category response
        testCategoryResponse = new CategoryResponse();
        testCategoryResponse.setId(1L);
        testCategoryResponse.setName("Electronics");
        testCategoryResponse.setSlug("electronics");
        testCategoryResponse.setActive(true);

        // Prepare create request
        categoryCreateRequest = new CategoryCreateRequest();
        categoryCreateRequest.setName("Electronics");
        categoryCreateRequest.setSlug("electronics");
        categoryCreateRequest.setActive(true);

        // Prepare update request
        categoryUpdateRequest = new CategoryUpdateRequest();
        categoryUpdateRequest.setName("Updated Electronics");
        categoryUpdateRequest.setSlug("updated-electronics");
        categoryUpdateRequest.setActive(false);
    }

    // ============ getAllCategories() Tests ============

    @Test
    @DisplayName("getAllCategories - Should return all categories successfully")
    void testGetAllCategories_Success() {
        // Arrange: Mock repository findAll()
        List<Category> categoryList = new ArrayList<>();
        categoryList.add(testCategory);
        when(categoryRepository.findAll()).thenReturn(categoryList);

        // Act
        List<CategoryResponse> result = categoryService.getAllCategories();

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1)
                .extracting(CategoryResponse::getName)
                .contains("Electronics");

        verify(categoryRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("getAllCategories - Should return empty list")
    void testGetAllCategories_EmptyList() {
        // Arrange
        when(categoryRepository.findAll()).thenReturn(new ArrayList<>());

        // Act
        List<CategoryResponse> result = categoryService.getAllCategories();

        // Assert
        assertThat(result)
                .isNotNull()
                .isEmpty();

        verify(categoryRepository, times(1)).findAll();
    }

    // ============ createCategory() Tests ============

    @Test
    @DisplayName("createCategory - Should create category successfully")
    void testCreateCategory_Success() {
        // Arrange
        when(categoryRepository.save(any(Category.class))).thenReturn(testCategory);

        // Act
        CategoryResponse result = categoryService.createCategory(categoryCreateRequest);

        // Assert
        assertThat(result)
                .isNotNull()
                .extracting(CategoryResponse::getName)
                .isEqualTo("Electronics");

        verify(categoryRepository, times(1)).save(any(Category.class));
    }

    @Test
    @DisplayName("createCategory - Should fail when request is null")
    void testCreateCategory_WithNullRequest() {
        // Ideally, service should handle null validation
        assertThatThrownBy(() -> categoryService.createCategory(null))
                .isInstanceOf(NullPointerException.class);
    }

    // ============ getCategoryById() Tests ============

    @Test
    @DisplayName("getCategoryById - Should retrieve category by ID successfully")
    void testGetCategoryById_Success() {
        // Arrange
        Long categoryId = 1L;
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(testCategory));

        // Act
        CategoryResponse result = categoryService.getCategoryById(categoryId);

        // Assert
        assertThat(result)
                .isNotNull()
                .extracting(CategoryResponse::getId, CategoryResponse::getName)
                .containsExactly(1L, "Electronics");

        verify(categoryRepository, times(1)).findById(categoryId);
    }

    @Test
    @DisplayName("getCategoryById - Should throw exception when category not found")
    void testGetCategoryById_NotFound() {
        // Arrange
        Long categoryId = 999L;
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> categoryService.getCategoryById(categoryId))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Category not found with this id : 999");

        verify(categoryRepository, times(1)).findById(categoryId);
    }

    // ============ deleteCategory() Tests ============

    @Test
    @DisplayName("deleteCategory - Should delete category successfully")
    void testDeleteCategory_Success() {
        // Arrange
        Long categoryId = 1L;
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(testCategory));

        // Act
        categoryService.deleteCategory(categoryId);

        // Assert
        verify(categoryRepository, times(1)).findById(categoryId);
        verify(categoryRepository, times(1)).delete(testCategory);
    }

    @Test
    @DisplayName("deleteCategory - Should throw exception when category not found")
    void testDeleteCategory_NotFound() {
        // Arrange
        Long categoryId = 999L;
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> categoryService.deleteCategory(categoryId))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Category not found with this id : 999");

        verify(categoryRepository, never()).delete(any());
    }

    // ============ updateCategory() Tests ============

    @Test
    @DisplayName("updateCategory - Should update category successfully")
    void testUpdateCategory_Success() {
        // Arrange
        Long categoryId = 1L;
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(testCategory));
        when(categoryRepository.save(any(Category.class))).thenReturn(testCategory);

        // Act
        CategoryResponse result = categoryService.updateCategory(categoryId, categoryUpdateRequest);

        // Assert
        assertThat(result).isNotNull();
        verify(categoryRepository, times(1)).findById(categoryId);
        verify(categoryRepository, times(1)).save(any(Category.class));
    }

    @Test
    @DisplayName("updateCategory - Should update only name field")
    void testUpdateCategory_OnlyName() {
        // Arrange
        Long categoryId = 1L;
        CategoryUpdateRequest partialRequest = new CategoryUpdateRequest();
        partialRequest.setName("New Name");
        partialRequest.setSlug(null);
        partialRequest.setActive(null);

        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(testCategory));
        when(categoryRepository.save(any(Category.class))).thenReturn(testCategory);

        // Act
        CategoryResponse result = categoryService.updateCategory(categoryId, partialRequest);

        // Assert
        assertThat(result).isNotNull();
        verify(categoryRepository, times(1)).save(any(Category.class));
    }

    @Test
    @DisplayName("updateCategory - Should throw exception when category not found")
    void testUpdateCategory_NotFound() {
        // Arrange
        Long categoryId = 999L;
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> categoryService.updateCategory(categoryId, categoryUpdateRequest))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Category not found with id: 999");

        verify(categoryRepository, never()).save(any());
    }

    // ============ getAllCategories(Pageable) Tests ============

    @Test
    @DisplayName("getAllCategories(Pageable) - Should return paginated categories successfully")
    void testGetAllCategoriesWithPagination_Success() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        List<Category> categoryList = new ArrayList<>();
        categoryList.add(testCategory);
        Page<Category> categoryPage = new PageImpl<>(categoryList, pageable, 1);

        when(categoryRepository.findAll(pageable)).thenReturn(categoryPage);

        // Act
        Page<CategoryResponse> result = categoryService.getAllCategories(pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1)
                .extracting(CategoryResponse::getName)
                .contains("Electronics");

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getNumber()).isEqualTo(0);

        verify(categoryRepository, times(1)).findAll(pageable);
    }

    @Test
    @DisplayName("getAllCategories(Pageable) - Should return empty page for second page")
    void testGetAllCategoriesWithPagination_EmptyPage() {
        // Arrange
        Pageable pageable = PageRequest.of(1, 10);
        Page<Category> emptyPage = new PageImpl<>(new ArrayList<>(), pageable, 0);

        when(categoryRepository.findAll(pageable)).thenReturn(emptyPage);

        // Act
        Page<CategoryResponse> result = categoryService.getAllCategories(pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .isEmpty();

        assertThat(result.getTotalElements()).isEqualTo(0);
    }
}
