package com.burakcanaksoy.realestate.request;

import com.burakcanaksoy.realestate.model.enums.ListingStatus;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class GeneralFilterRequest {
    private String city;
    private String district;
    private String categorySlug;
    private ListingStatus status;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Long ownerId;
}
