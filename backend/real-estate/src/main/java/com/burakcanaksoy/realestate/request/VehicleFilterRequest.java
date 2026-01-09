package com.burakcanaksoy.realestate.request;

import com.burakcanaksoy.realestate.model.enums.FuelType;
import com.burakcanaksoy.realestate.model.enums.ListingStatus;
import com.burakcanaksoy.realestate.model.enums.Transmission;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class VehicleFilterRequest {
    private String city;
    private String district;

    private String categorySlug;

    private ListingStatus status;

    private BigDecimal minPrice;
    private BigDecimal maxPrice;

    private String brand;
    private String model;

    private Integer minYear;
    private Integer maxYear;

    private FuelType fuelType;
    private Transmission transmission;

    private Integer minKilometer;
    private Integer maxKilometer;

    private String engineVolume;
}
