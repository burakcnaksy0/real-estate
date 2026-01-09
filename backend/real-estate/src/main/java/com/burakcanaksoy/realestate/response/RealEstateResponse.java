package com.burakcanaksoy.realestate.response;

import com.burakcanaksoy.realestate.model.enums.Currency;
import com.burakcanaksoy.realestate.model.enums.HeatingType;
import com.burakcanaksoy.realestate.model.enums.ListingStatus;
import com.burakcanaksoy.realestate.model.enums.RealEstateType;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class RealEstateResponse {
    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private Currency currency;
    private String categorySlug;
    private String city;
    private String category;
    private String district;
    private ListingStatus status;

    private RealEstateType realEstateType;
    private Integer roomCount;
    private Integer squareMeter;
    private Integer buildingAge;
    private Integer floor;
    private HeatingType heatingType;
    private Boolean furnished;

    private Long ownerId;
    private String ownerUsername;

    @JsonFormat(
            shape = JsonFormat.Shape.STRING,
            pattern = "yyyy-MM-dd HH:mm:ss"
    )
    private LocalDateTime createdAt;

    @JsonFormat(
            shape = JsonFormat.Shape.STRING,
            pattern = "yyyy-MM-dd HH:mm:ss"
    )
    private LocalDateTime updatedAt;
}
