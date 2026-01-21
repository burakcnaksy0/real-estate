package com.burakcanaksoy.realestate.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class CompareRequest {

    @NotNull(message = "Listing IDs cannot be null")
    @Size(min = 2, max = 3, message = "You must select between 2 and 3 listings to compare")
    private List<Long> listingIds;
}
