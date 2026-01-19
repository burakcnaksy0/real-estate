package com.burakcanaksoy.realestate.mapper;

import com.burakcanaksoy.realestate.model.BaseListing;
import com.burakcanaksoy.realestate.model.Land;
import com.burakcanaksoy.realestate.model.RealEstate;
import com.burakcanaksoy.realestate.model.Vehicle;
import com.burakcanaksoy.realestate.model.Workplace;
import com.burakcanaksoy.realestate.response.BaseListingResponse;
import lombok.experimental.UtilityClass;

@UtilityClass
public class BaseListingMapper {

    public static BaseListingResponse toResponse(BaseListing listing) {
        BaseListingResponse response = new BaseListingResponse();
        response.setId(listing.getId());
        response.setTitle(listing.getTitle());
        response.setDescription(listing.getDescription());
        response.setPrice(listing.getPrice());
        response.setCurrency(listing.getCurrency().name());
        response.setCity(listing.getCity());
        response.setDistrict(listing.getDistrict());
        response.setCategorySlug(listing.getCategory().getSlug());
        response.setCategoryName(listing.getCategory().getName());
        response.setStatus(listing.getStatus());
        response.setCreatedAt(listing.getCreatedAt());
        response.setUpdatedAt(listing.getUpdatedAt());
        response.setCreatedByUsername(listing.getCreatedBy().getUsername());
        response.setViewCount(listing.getViewCount());
        response.setFavoriteCount(listing.getFavoriteCount());

        if (listing.getCreatedBy() != null) {
            System.out.println("DEBUG: Mapping listing " + listing.getId() + " owner: "
                    + listing.getCreatedBy().getUsername() + " lastSeen: " + listing.getCreatedBy().getLastSeen());
            response.setOwnerLastSeen(listing.getCreatedBy().getLastSeen());
        } else {
            System.out.println("DEBUG: Listing " + listing.getId() + " has no creator!");
        }

        if (listing instanceof Land) {
            response.setListingType("LAND");
        } else if (listing instanceof RealEstate) {
            response.setListingType("REAL_ESTATE");
        } else if (listing instanceof Vehicle) {
            response.setListingType("VEHICLE");
        } else if (listing instanceof Workplace) {
            response.setListingType("WORKPLACE");
        } else {
            response.setListingType("UNKNOWN");
        }

        return response;
    }
}