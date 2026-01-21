package com.burakcanaksoy.realestate.request;

import lombok.Data;

import java.util.Map;

@Data
public class SavedSearchRequest {
    private String name;
    private Map<String, Object> searchCriteria;
    private Boolean notificationEnabled = false;
}
