package com.burakcanaksoy.realestate.request;

import com.burakcanaksoy.realestate.model.enums.Currency;
import com.burakcanaksoy.realestate.model.enums.FuelType;
import com.burakcanaksoy.realestate.model.enums.Transmission;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class VehicleUpdateRequest {

    /* ---------------- BaseListing fields ---------------- */

    @Size(max = 150, message = "Title must not exceed 150 characters")
    private String title;

    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;

    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than zero")
    private BigDecimal price;

    private Currency currency;

    /** Category slug: "arac" */
    private String categorySlug;

    @Size(max = 50, message = "City must not exceed 50 characters")
    private String city;

    @Size(max = 50, message = "District must not exceed 50 characters")
    private String district;

    /* ---------------- Vehicle-specific fields ---------------- */

    @Size(max = 50, message = "Brand must not exceed 50 characters")
    private String brand;

    @Size(max = 50, message = "Model must not exceed 50 characters")
    private String model;

    @Min(value = 1900, message = "Year must be greater than or equal to 1900")
    private Integer year;

    private FuelType fuelType;

    private Transmission transmission;

    @Min(value = 0, message = "Kilometer cannot be negative")
    private Integer kilometer;

    @Size(max = 20, message = "Engine volume must not exceed 20 characters")
    private String engineVolume;

    @Size(max = 50, message = "Series must not exceed 50 characters")
    private String series;

    @Size(max = 20, message = "Vehicle status must not exceed 20 characters")
    private String vehicleStatus;

    @Size(max = 50, message = "Body type must not exceed 50 characters")
    private String bodyType;

    @Size(max = 20, message = "Engine power must not exceed 20 characters")
    private String enginePower;

    @Size(max = 50, message = "Traction type must not exceed 50 characters")
    private String tractionType;

    @Size(max = 30, message = "Color must not exceed 30 characters")
    private String color;

    @Size(max = 50, message = "Plate nationality must not exceed 50 characters")
    private String plateNationality;

    @Size(max = 20, message = "From who must not exceed 20 characters")
    private String fromWho;

    private Boolean warranty;

    private Boolean heavyDamage;

    private Boolean exchange;
}
