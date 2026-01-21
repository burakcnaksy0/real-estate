package com.burakcanaksoy.realestate.request;

import com.burakcanaksoy.realestate.model.enums.Currency;
import com.burakcanaksoy.realestate.model.enums.HeatingType;
import com.burakcanaksoy.realestate.model.enums.RealEstateType;
import com.burakcanaksoy.realestate.model.enums.UsingStatus;
import com.burakcanaksoy.realestate.model.enums.KitchenType;
import com.burakcanaksoy.realestate.model.enums.TittleStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RealEstateUpdateRequest {

    /* ---------------- BaseListing fields ---------------- */

    @Size(max = 150, message = "Title must not exceed 150 characters")
    private String title;

    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;

    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than zero")
    private BigDecimal price;

    private Currency currency;

    private String categorySlug;

    @Size(max = 50, message = "City must not exceed 50 characters")
    private String city;

    @Size(max = 50, message = "District must not exceed 50 characters")
    private String district;

    /* ---------------- RealEstate-specific fields ---------------- */

    private RealEstateType realEstateType;

    @Size(max = 20, message = "Room count must not exceed 20 characters")
    private String roomCount;

    @Min(value = 1, message = "Gross square meter must be greater than zero")
    private Integer grossSquareMeter;

    @Min(value = 1, message = "Net square meter must be greater than zero")
    private Integer netSquareMeter;

    @Size(max = 20, message = "Building age must not exceed 20 characters")
    private String buildingAge;

    @Min(value = 0, message = "Floor cannot be negative")
    private Integer floor;

    private Integer totalFloors;

    private Integer bathroomCount;

    private HeatingType heatingType;

    private Boolean balcony;

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

    private com.burakcanaksoy.realestate.model.enums.ListingFrom fromWho;
}
