package com.burakcanaksoy.realestate.mapper;

import com.burakcanaksoy.realestate.model.Category;
import com.burakcanaksoy.realestate.request.CategoryCreateRequest;
import com.burakcanaksoy.realestate.response.CategoryResponse;
import jakarta.validation.Valid;
import lombok.experimental.UtilityClass;

@UtilityClass
public class CategoryMapper {

    public static Category toEntity(@Valid CategoryCreateRequest request){
        Category category = new Category();
        category.setName(request.getName());
        category.setSlug(request.getSlug());
        category.setActive(request.getActive());

        return category;
    }

    public static CategoryResponse toResponse(Category category){
        CategoryResponse categoryResponse = new CategoryResponse();

        categoryResponse.setId(category.getId());
        categoryResponse.setName(category.getName());
        categoryResponse.setSlug(category.getSlug());
        categoryResponse.setActive(category.getActive());

        return categoryResponse;
    }
}
