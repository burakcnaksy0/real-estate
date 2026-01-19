package com.burakcanaksoy.realestate.response;

import com.burakcanaksoy.realestate.model.enums.Currency;
import com.burakcanaksoy.realestate.model.enums.LandType;
import com.burakcanaksoy.realestate.model.enums.ListingStatus;
import com.burakcanaksoy.realestate.model.enums.OfferType;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class LandResponse {
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

        /* ---------------- Land-specific fields ---------------- */
        private LandType landType;
        private Integer squareMeter;
        private String zoningStatus;
        private Integer parcelNumber;
        private Integer islandNumber;
        private String imageUrl;
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