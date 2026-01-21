package com.burakcanaksoy.realestate.response;

import com.burakcanaksoy.realestate.model.enums.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.burakcanaksoy.realestate.model.enums.ListingFrom;

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
        private Double latitude;
        private Double longitude;
        private ListingStatus status;

        private RealEstateType realEstateType;
        private String roomCount;
        private Integer grossSquareMeter;
        private Integer netSquareMeter;
        private String buildingAge;
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
        private BigDecimal dues;
        private BigDecimal deposit;
        private TittleStatus tittleStatus;
        private ListingFrom fromWho;
        private String imageUrl;
        private String videoUrl;
        private OfferType offerType;
        private Long viewCount;
        private Long favoriteCount;

        private Long ownerId;
        private String ownerUsername;
        private LocalDateTime ownerLastSeen;

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime createdAt;

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime updatedAt;
}
