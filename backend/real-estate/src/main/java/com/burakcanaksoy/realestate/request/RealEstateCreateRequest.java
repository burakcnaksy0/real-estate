package com.burakcanaksoy.realestate.request;

import com.burakcanaksoy.realestate.model.enums.Currency;
import com.burakcanaksoy.realestate.model.enums.HeatingType;
import com.burakcanaksoy.realestate.model.enums.RealEstateType;
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

    /* ---------------- RealEstateType-specific fields ---------------- */

    @NotNull(message = "Real estate type must be specified")
    private RealEstateType realEstateType;

    @NotNull(message = "Room count must be specified")
    @Min(value = 0, message = "Room count cannot be negative")
    private Integer roomCount;

    @NotNull(message = "Square meter must be specified")
    @Min(value = 1, message = "Square meter must be greater than zero")
    private Integer squareMeter;

    @NotNull(message = "Building age must be specified")
    @Min(value = 0, message = "Building age cannot be negative")
    private Integer buildingAge;

    @NotNull(message = "Floor must be specified")
    @Min(value = 0, message = "Floor cannot be negative")
    private Integer floor;

    @NotNull(message = "Heating type must be specified")
    private HeatingType heatingType;

    @NotNull(message = "Furnished information must be specified")
    private Boolean furnished;
}
