package com.burakcanaksoy.realestate.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ShareListingRequest {

    @NotNull(message = "Recipient ID cannot be null")
    private Long recipientId;

    @NotNull(message = "Listing ID cannot be null")
    private Long listingId;

    @NotNull(message = "Listing type cannot be null")
    private String listingType; // VEHICLE, REAL_ESTATE, LAND, WORKPLACE

    private String message; // Optional custom message
}
