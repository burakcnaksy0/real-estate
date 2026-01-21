package com.burakcanaksoy.realestate.response;

import com.burakcanaksoy.realestate.model.enums.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class VehicleResponse {

        private Long id;
        private String title;
        private String description;
        private BigDecimal price;
        private Currency currency;
        private ListingStatus status;

        private String categorySlug;
        private String category;
        private String city;
        private String district;
        private Double latitude;
        private Double longitude;

        private String brand;
        private String model;
        private Integer year;
        private FuelType fuelType;
        private Transmission transmission;
        private Integer kilometer;
        private String engineVolume;
        private String imageUrl;
        private String videoUrl;
        private OfferType offerType;
        private Long viewCount;
        private Long favoriteCount;

        private String series;
        private VehicleStatus vehicleStatus;
        private BodyType bodyType;
        private String enginePower;
        private TractionType tractionType;
        private String color;
        private Boolean warranty;
        private Boolean heavyDamage;
        private String plateNationality;
        private ListingFrom fromWho;
        private Boolean exchange;

        private Long ownerId;
        private String ownerUsername;
        private LocalDateTime ownerLastSeen;

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime createdAt;

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime updatedAt;
}
