package com.burakcanaksoy.realestate.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteResponse {
    private Long id;
    private Long listingId;
    private String listingType;
    private LocalDateTime createdAt;

    // Listing bilgileri
    private String title;
    private String description;
    private Double price;
    private String currency;
    private String city;
    private String district;
    private String imageUrl;
    private String status;
}
