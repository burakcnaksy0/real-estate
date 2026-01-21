package com.burakcanaksoy.realestate.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SavedSearchResponse {
    private Long id;
    private String name;
    private Map<String, Object> searchCriteria;
    private Boolean notificationEnabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
