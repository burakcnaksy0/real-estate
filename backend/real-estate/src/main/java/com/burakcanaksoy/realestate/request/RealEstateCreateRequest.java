package com.burakcanaksoy.realestate.request;

import com.burakcanaksoy.realestate.model.enums.Currency;
import com.burakcanaksoy.realestate.model.enums.HeatingType;
import com.burakcanaksoy.realestate.model.enums.RealEstateType;
import com.burakcanaksoy.realestate.model.enums.UsingStatus;
import com.burakcanaksoy.realestate.model.enums.KitchenType;
import com.burakcanaksoy.realestate.model.enums.TittleStatus;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RealEstateCreateRequest {
    /* ---------------- BaseListing fields ---------------- */

    @NotBlank(message = "Title cannot be blank")
    @Size(max = 150, message = "Title must not exceed 150 characters")
    private String title;

    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;

    @NotNull(message = "Price cannot be null")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than zero")
    private BigDecimal price;

    @NotNull(message = "Currency cannot be null")
    private Currency currency;

    @NotBlank(message = "Category slug cannot be blank")
    private String categorySlug;

    @NotBlank(message = "City cannot be blank")
    @Size(max = 50, message = "City must not exceed 50 characters")
    private String city;

    @NotBlank(message = "District cannot be blank")
    @Size(max = 50, message = "District must not exceed 50 characters")
    private String district;

    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    private Double latitude;

    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    private Double longitude;

    @NotNull(message = "Offer type must be specified")
    private com.burakcanaksoy.realestate.model.enums.OfferType offerType;

    /* ---------------- RealEstateType-specific fields ---------------- */

    @NotNull(message = "Real estate type must be specified")
    private RealEstateType realEstateType;

    @NotNull(message = "Room count must be specified")
    @Size(max = 20, message = "Room count must not exceed 20 characters")
    private String roomCount;

    @NotNull(message = "Gross square meter must be specified")
    @Min(value = 1, message = "Gross square meter must be greater than zero")
    private Integer grossSquareMeter;

    @NotNull(message = "Net square meter must be specified")
    @Min(value = 1, message = "Net square meter must be greater than zero")
    private Integer netSquareMeter;

    @NotNull(message = "Building age must be specified")
    @Size(max = 20, message = "Building age must not exceed 20 characters")
    private String buildingAge;

    @NotNull(message = "Floor must be specified")
    @Min(value = 0, message = "Floor cannot be negative")
    private Integer floor;

    private Integer totalFloors;

    private Integer bathroomCount;

    @NotNull(message = "Heating type must be specified")
    private HeatingType heatingType;

    private Boolean balcony;

    @NotNull(message = "Furnished information must be specified")
    private Boolean furnished;

    private UsingStatus usingStatus;

    private KitchenType kitchen;

    private Boolean elevator;

    private Boolean parking;

    private Boolean inComplex;

    private String complexName;

    private java.math.BigDecimal dues;

    private java.math.BigDecimal deposit;

    private TittleStatus tittleStatus;

    @NotNull(message = "From Who cannot be null")
    private com.burakcanaksoy.realestate.model.enums.ListingFrom fromWho;
}
