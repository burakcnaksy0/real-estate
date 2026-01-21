package com.burakcanaksoy.realestate.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComparisonFieldResponse {

    private String fieldName;
    private Map<String, String> values; // Key: listing ID, Value: formatted field value
}
