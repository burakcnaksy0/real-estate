package com.burakcanaksoy.realestate.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLogDTO {
    private Long id;
    private String type; // USER_REGISTERED, LISTING_CREATED, FAVORITE_ADDED, MESSAGE_SENT
    private String description;
    private LocalDateTime timestamp;
    private String userName;
}
