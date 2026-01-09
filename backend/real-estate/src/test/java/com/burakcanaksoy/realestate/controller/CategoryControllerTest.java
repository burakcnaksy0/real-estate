package com.burakcanaksoy.realestate.controller;

import com.burakcanaksoy.realestate.request.CategoryCreateRequest;
import com.burakcanaksoy.realestate.request.CategoryUpdateRequest;
import com.burakcanaksoy.realestate.response.CategoryResponse;
import com.burakcanaksoy.realestate.security.AuthService;
import com.burakcanaksoy.realestate.security.JwtAuthenticationFilter;
import com.burakcanaksoy.realestate.service.CategoryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = CategoryController.class, excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class))
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("CategoryController Unit Tests")
class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CategoryService categoryService;

    @MockBean
    private AuthService authService; // Security dependency

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("getAllCategories - Should return list of categories")
    void testGetAllCategories() throws Exception {
        CategoryResponse response = new CategoryResponse();
        response.setId(1L);
        response.setName("Electronics");

        when(categoryService.getAllCategories()).thenReturn(List.of(response));

        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Electronics"));
    }

    @Test
    @DisplayName("getAllCategories(Pageable) - Should return page")
    void testGetAllCategoriesPaginated() throws Exception {
        CategoryResponse response = new CategoryResponse();
        response.setId(1L);
        response.setName("Electronics");

        Page<CategoryResponse> page = new PageImpl<>(List.of(response));

        when(categoryService.getAllCategories(any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/categories/page"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Electronics"));
    }

    @Test
    @DisplayName("createCategory - Should create and return category")
    void testCreateCategory() throws Exception {
        CategoryCreateRequest request = new CategoryCreateRequest();
        request.setName("Electronics");
        request.setSlug("electronics");
        request.setActive(true);

        CategoryResponse response = new CategoryResponse();
        response.setId(1L);
        response.setName("Electronics");

        when(categoryService.createCategory(any(CategoryCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Electronics"));
    }

    @Test
    @DisplayName("getCategoryById - Should return category")
    void testGetCategoryById() throws Exception {
        CategoryResponse response = new CategoryResponse();
        response.setId(1L);
        response.setName("Electronics");

        when(categoryService.getCategoryById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/categories/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Electronics"));
    }

    @Test
    @DisplayName("updateCategory - Should return updated category")
    void testUpdateCategory() throws Exception {
        CategoryUpdateRequest request = new CategoryUpdateRequest();
        request.setName("New Name");

        CategoryResponse response = new CategoryResponse();
        response.setId(1L);
        response.setName("New Name");

        when(categoryService.updateCategory(eq(1L), any(CategoryUpdateRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/categories/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("New Name"));
    }

    @Test
    @DisplayName("deleteCategory - Should return 200 OK")
    void testDeleteCategory() throws Exception {
        mockMvc.perform(delete("/api/categories/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value("Deleted with this category : 1"));
    }
}
