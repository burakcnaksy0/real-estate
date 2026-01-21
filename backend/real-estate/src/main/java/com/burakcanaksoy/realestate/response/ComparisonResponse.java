package com.burakcanaksoy.realestate.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComparisonResponse {

    private String category;
    private List<ComparisonFieldResponse> fields;
    private Map<String, Object> listings; // Key: listing ID, Value: listing details for header
}
