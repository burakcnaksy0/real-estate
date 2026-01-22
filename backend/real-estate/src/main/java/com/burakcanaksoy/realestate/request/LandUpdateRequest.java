package com.burakcanaksoy.realestate.request;

import com.burakcanaksoy.realestate.model.enums.Currency;
import com.burakcanaksoy.realestate.model.enums.LandType;
import com.burakcanaksoy.realestate.model.enums.ListingFrom;
import com.burakcanaksoy.realestate.model.enums.TittleStatus;
import com.burakcanaksoy.realestate.model.enums.YesNo;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class LandUpdateRequest {

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

    /* ---------------- Land-specific fields ---------------- */

    private LandType landType;

    @Min(value = 1, message = "Square meter must be greater than zero")
    private Integer squareMeter;

    @Size(max = 50, message = "Zoning status must not exceed 50 characters")
    private String zoningStatus;

    @Min(value = 1, message = "Parcel number must be greater than zero")
    private Integer parcelNumber;

    @Min(value = 1, message = "Island number must be greater than zero")
    private Integer islandNumber;

    /* ---------------- New optional fields ---------------- */

    @Size(max = 50, message = "Pafta number must not exceed 50 characters")
    private String paftaNo;

    @DecimalMin(value = "0.0", message = "Kaks must be greater than or equal to zero")
    @DecimalMax(value = "999.99", message = "Kaks must not exceed 999.99")
    private Double kaks;

    @Size(max = 100, message = "Gabari must not exceed 100 characters")
    private String gabari;

    private YesNo creditEligibility;

    private TittleStatus deedStatus;

    private ListingFrom listingFrom;

    private YesNo exchange;
}
