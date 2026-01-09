package com.burakcanaksoy.realestate.response;

import lombok.Data;

@Data
public class CategoryResponse {
    private Long id;
    private String name;
    private String slug;
    private Boolean active = true;
}
