package com.burakcanaksoy.realestate.request;

import com.burakcanaksoy.realestate.model.enums.Currency;
import com.burakcanaksoy.realestate.model.enums.HeatingType;
import com.burakcanaksoy.realestate.model.enums.ListingFrom;
import com.burakcanaksoy.realestate.model.enums.TittleStatus;
import com.burakcanaksoy.realestate.model.enums.WorkplaceType;
import com.burakcanaksoy.realestate.model.enums.YesNo;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class WorkplaceUpdateRequest {

    /* ---------------- BaseListing fields ---------------- */

    @Size(max = 150, message = "Title must not exceed 150 characters")
    private String title;

    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;

    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than zero")
    private BigDecimal price;

    private Currency currency;

    /** Category slug */
    private String categorySlug;

    @Size(max = 50, message = "City must not exceed 50 characters")
    private String city;

    @Size(max = 50, message = "District must not exceed 50 characters")
    private String district;

    /* ---------------- Workplace fields ---------------- */

    private WorkplaceType workplaceType;

    @Min(value = 1, message = "Square meter must be greater than zero")
    private Integer squareMeter;

    @Min(value = 0, message = "Floor count cannot be negative")
    private Integer floorCount;

    private Boolean furnished;

    /* ---------------- New optional fields ---------------- */

    private HeatingType heatingType;

    @Size(max = 50, message = "Building age must not exceed 50 characters")
    private String buildingAge;

    @DecimalMin(value = "0.0", message = "Dues must be greater than or equal to zero")
    private BigDecimal dues;

    private YesNo creditEligibility;

    private TittleStatus deedStatus;

    private ListingFrom listingFrom;

    private YesNo exchange;
}
