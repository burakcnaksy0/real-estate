package com.burakcanaksoy.realestate.request;

import com.burakcanaksoy.realestate.model.enums.ListingStatus;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AdvancedSearchRequest {

    // Full-text search
    private String query;

    // Location-based
    private String city;
    private String district;
    private Double latitude;
    private Double longitude;
    private Double radiusKm; // Search within radius (in kilometers)

    // Category & Status
    private String categorySlug;
    private ListingStatus status;

    // Price range
    private BigDecimal minPrice;
    private BigDecimal maxPrice;

    // Additional filters (category-specific)
    private Integer minRooms;
    private Integer maxRooms;
    private Integer minArea;
    private Integer maxArea;
    private Integer minYear;
    private Integer maxYear;

    // Vehicle specific
    private String brand;
    private String model;
    private String fuelType;
    private String transmission;

    // Sorting
    private String sortBy; // price, date, distance, relevance
    private String sortOrder; // asc, desc
}
