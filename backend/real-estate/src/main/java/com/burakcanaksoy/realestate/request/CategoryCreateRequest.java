package com.burakcanaksoy.realestate.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryCreateRequest {

    @NotBlank(message = "The category name cannot be blank")
    @Size(
            min = 3,
            max = 30,
            message = "The category name must be between 3 and 30 characters long."
    )
    private String name;

    @NotBlank(message = "The slug cannot be blank")
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

    @NotNull(message = "Active information cannot be empty")
    private Boolean active = true;
}
