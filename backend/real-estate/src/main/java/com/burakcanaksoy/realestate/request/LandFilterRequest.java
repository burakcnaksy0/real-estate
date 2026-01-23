package com.burakcanaksoy.realestate.request;

import com.burakcanaksoy.realestate.model.enums.LandType;
import com.burakcanaksoy.realestate.model.enums.ListingStatus;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class LandFilterRequest {
    private String city;
    private String district;

    private String categorySlug;

    private ListingStatus status;

    private BigDecimal minPrice;
    private BigDecimal maxPrice;

    private LandType landType;

    private Integer minSquareMeter;
    private Integer maxSquareMeter;

    private Long ownerId;
}
