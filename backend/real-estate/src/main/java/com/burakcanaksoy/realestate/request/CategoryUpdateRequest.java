package com.burakcanaksoy.realestate.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryUpdateRequest {

    @Size(
            min = 3,
            max = 30,
            message = "The category name must be between 3 and 30 characters long."
    )
    private String name;

    @Size(
            min = 3,
            max = 40,
            message = "The slug must be between 3 and 40 characters long."
    )
    @Pattern(
            regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
            message = "Slugs can only contain lowercase letters, numbers, and '-' (e.g., vehicle-category)"
    )
    private String slug;

    private Boolean active;
}
