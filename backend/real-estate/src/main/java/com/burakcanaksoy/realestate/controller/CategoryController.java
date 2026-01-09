package com.burakcanaksoy.realestate.controller;

import com.burakcanaksoy.realestate.request.CategoryCreateRequest;
import com.burakcanaksoy.realestate.request.CategoryUpdateRequest;
import com.burakcanaksoy.realestate.response.CategoryResponse;
import com.burakcanaksoy.realestate.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService){
        this.categoryService = categoryService;
    }

    @GetMapping()
    public ResponseEntity<List<CategoryResponse>> getAllCategories(){
        return new ResponseEntity<>(this.categoryService.getAllCategories(),HttpStatus.OK);
    }

    @GetMapping("/page")
    public ResponseEntity<Page<CategoryResponse>> getAllLandsPage(Pageable pageable){
        return new ResponseEntity<>(this.categoryService.getAllCategories(pageable), HttpStatus.OK);
    }

    @PostMapping()
    public ResponseEntity<CategoryResponse> createCategory(@RequestBody @Valid CategoryCreateRequest categoryCreateRequest){
        return new ResponseEntity<>(this.categoryService.createCategory(categoryCreateRequest), HttpStatus.CREATED);
    }
    @GetMapping( "/{categoryId}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long categoryId){
        return new ResponseEntity<>(this.categoryService.getCategoryById(categoryId),HttpStatus.OK);
    }

    @DeleteMapping("/{categoryId}")
    public ResponseEntity<String> deleteCategory(@PathVariable Long categoryId){
        this.categoryService.deleteCategory(categoryId);
        return ResponseEntity.ok("Deleted with this category : "+ categoryId);
    }

    @PutMapping("/{categoryId}")
    public ResponseEntity<CategoryResponse> updateCategory(@PathVariable Long categoryId , @RequestBody @Valid CategoryUpdateRequest request){
        return new ResponseEntity<>(this.categoryService.updateCategory(categoryId,request),HttpStatus.OK);
    }
}
