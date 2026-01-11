package com.burakcanaksoy.realestate.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategoryStatsResponse {
    private String categorySlug;
    private String categoryName;
    private Long count;
}
