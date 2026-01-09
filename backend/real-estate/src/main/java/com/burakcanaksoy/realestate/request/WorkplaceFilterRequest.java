package com.burakcanaksoy.realestate.request;

import com.burakcanaksoy.realestate.model.enums.ListingStatus;
import com.burakcanaksoy.realestate.model.enums.WorkplaceType;
import lombok.Data;

@Data
public class WorkplaceFilterRequest {
    private String city;
    private String district;
    private String categorySlug;
    private ListingStatus status;
    private Integer minPrice;
    private Integer maxPrice;
    private WorkplaceType workplaceType;
    private Integer minSquareMeter;
    private Integer maxSquareMeter;
    private Integer minFloorCount;
    private Integer maxFloorCount;
    private Boolean furnished;
}
