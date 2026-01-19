package com.burakcanaksoy.realestate.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FavoriteCountUpdateEvent {
    private Long listingId;
    private String listingType;
    private Long favoriteCount;
}
