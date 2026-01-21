package com.burakcanaksoy.realestate.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchSuggestion {
    private String text;
    private String type; // city, district, category, listing
    private Long count; // Number of results
}
