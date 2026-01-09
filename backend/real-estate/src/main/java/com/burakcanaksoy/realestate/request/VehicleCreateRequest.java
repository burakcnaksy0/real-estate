package com.burakcanaksoy.realestate.request;

import com.burakcanaksoy.realestate.model.enums.Currency;
import com.burakcanaksoy.realestate.model.enums.FuelType;
import com.burakcanaksoy.realestate.model.enums.Transmission;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class VehicleCreateRequest {

    @NotBlank(message = "Title cannot be blank")
    @Size(max = 150)
    private String title;

    @Size(max = 5000)
    private String description;

    @NotNull(message = "Price cannot be null")
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal price;

    @NotNull(message = "Currency cannot be null")
    private Currency currency;

    /** Category slug: "arac" */
    @NotBlank(message = "Category slug cannot be blank")
    private String categorySlug;

    @NotBlank(message = "City cannot be blank")
    @Size(max = 50)
    private String city;

    @NotBlank(message = "District cannot be blank")
    @Size(max = 50)
    private String district;

    @NotBlank(message = "Brand cannot be blank")
    @Size(max = 50)
    private String brand;

    @NotBlank(message = "Model cannot be blank.")
    @Size(max = 50)
    private String model;

    @NotNull(message = "Year cannot be null")
    @Min(1900)
    private Integer year;

    @NotNull(message = "Fuel type cannot be null")
    private FuelType fuelType;

    @NotNull(message = "Transmission cannot be null.")
    private Transmission transmission;

    @NotNull(message = "Kilometer cannot be null")
    @Min(0)
    private Integer kilometer;

    @Size(max = 20)
    @NotBlank(message = "Engine volume cannot be blank")
    private String engineVolume;
}
