package com.burakcanaksoy.realestate.request;

import com.burakcanaksoy.realestate.model.enums.Currency;
import com.burakcanaksoy.realestate.model.enums.LandType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class LandCreateRequest {

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

    /** Category slug: "land", "field" */
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

    /* ---------------- Land-specific fields ---------------- */

    @NotNull(message = "Land type must be specified")
    private LandType landType;

    @NotNull(message = "Square meter must be specified")
    @Min(value = 1, message = "Square meter must be greater than zero")
    private Integer squareMeter;

    @NotBlank(message = "Zoning status must not be blank")
    @Size(max = 50, message = "Zoning status must not exceed 50 characters")
    private String zoningStatus;

    @NotNull(message = "Parcel number must be specified")
    @Min(value = 1, message = "Parcel number must be greater than zero")
    private Integer parcelNumber;

    @NotNull(message = "Island number must be specified")
    @Min(value = 1, message = "Island number must be greater than zero")
    private Integer islandNumber;
}
