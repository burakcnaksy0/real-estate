package com.burakcanaksoy.realestate.request;

import com.burakcanaksoy.realestate.model.enums.HeatingType;
import com.burakcanaksoy.realestate.model.enums.ListingStatus;
import com.burakcanaksoy.realestate.model.enums.RealEstateType;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RealEstateFilterRequest {
    private String city;
    private String district;

    private String categorySlug;

    private ListingStatus status;

    private BigDecimal minPrice;
    private BigDecimal maxPrice;

    private RealEstateType realEstateType;

    private Integer minRoomCount;
    private Integer maxRoomCount;

    private Integer minSquareMeter;
    private Integer maxSquareMeter;

    private Integer minBuildingAge;
    private Integer maxBuildingAge;

    private Integer minFloor;
    private Integer maxFloor;

    private HeatingType heatingType;

    private Boolean furnished;
}
