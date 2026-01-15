package com.burakcanaksoy.realestate.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ListingStatsDTO {
    private Long totalListings;
    private Long activeListings;
    private Long realEstateCount;
    private Long vehicleCount;
    private Long landCount;
    private Long workplaceCount;
}
