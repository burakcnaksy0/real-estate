package com.burakcanaksoy.realestate.response;

import com.burakcanaksoy.realestate.model.enums.Currency;
import com.burakcanaksoy.realestate.model.enums.ListingStatus;
import com.burakcanaksoy.realestate.model.enums.OfferType;
import com.burakcanaksoy.realestate.model.enums.WorkplaceType;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class WorkplaceResponse {
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

        private WorkplaceType workplaceType;
        private Integer squareMeter;
        private Integer floorCount;
        private Boolean furnished;
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
