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

    private String roomCount;

    private Integer minGrossSquareMeter;
    private Integer maxGrossSquareMeter;

    private String buildingAge;

    private Integer minFloor;
    private Integer maxFloor;

    private HeatingType heatingType;

    private Boolean furnished;
}
