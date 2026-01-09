package com.burakcanaksoy.realestate.response;

import com.burakcanaksoy.realestate.model.enums.ListingStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class BaseListingResponse {
    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private String currency;
    private String city;
    private String district;
    private String categorySlug;
    private String categoryName;
    private ListingStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdByUsername;
    private String listingType;
}
