package com.burakcanaksoy.realestate.mapper;

import com.burakcanaksoy.realestate.model.Category;
import com.burakcanaksoy.realestate.model.Land;
import com.burakcanaksoy.realestate.model.enums.ListingStatus;
import com.burakcanaksoy.realestate.request.LandCreateRequest;
import com.burakcanaksoy.realestate.response.LandResponse;
import lombok.experimental.UtilityClass;

@UtilityClass
public class LandMapper {

    // LandCreateRequest → Land
    public static Land toEntity(LandCreateRequest request, Category category) {
        if (request == null) {
            throw new IllegalArgumentException("LandCreateRequest cannot be null");
        }
        if (category == null) {
            throw new IllegalArgumentException("Category cannot be null");
        }

        Land land = new Land();

        /* ---------- BaseListing fields ---------- */
        land.setTitle(request.getTitle());
        land.setDescription(request.getDescription());
        land.setPrice(request.getPrice());
        land.setCurrency(request.getCurrency());
        land.setCity(request.getCity());
        land.setDistrict(request.getDistrict());
        land.setCategory(category);
        land.setStatus(ListingStatus.ACTIVE);

        /* ---------- Land-specific fields ---------- */
        land.setLandType(request.getLandType());
        land.setSquareMeter(request.getSquareMeter());
        land.setZoningStatus(request.getZoningStatus());
        land.setParcelNumber(request.getParcelNumber());
        land.setIslandNumber(request.getIslandNumber());

        return land;
    }

    // Land → LandResponse
    public static LandResponse toResponse(Land land) {
        if (land == null) {
            throw new IllegalArgumentException("Land cannot be null");
        }

        LandResponse response = new LandResponse();

        /* ---------- BaseListing fields ---------- */
        response.setId(land.getId());
        response.setTitle(land.getTitle());
        response.setDescription(land.getDescription());
        response.setPrice(land.getPrice());
        response.setCurrency(land.getCurrency());
        response.setCity(land.getCity());
        response.setDistrict(land.getDistrict());
        response.setStatus(land.getStatus());
        response.setCreatedAt(land.getCreatedAt());
        response.setUpdatedAt(land.getUpdatedAt());

        if (land.getCategory() != null) {
            response.setCategorySlug(land.getCategory().getSlug());
            response.setCategory(land.getCategory().getName());
        }

        /* ---------- Land-specific fields ---------- */
        response.setLandType(land.getLandType());
        response.setSquareMeter(land.getSquareMeter());
        response.setZoningStatus(land.getZoningStatus());
        response.setParcelNumber(land.getParcelNumber());
        response.setIslandNumber(land.getIslandNumber());

        // user relationship
        if (land.getCreatedBy() != null){
            response.setOwnerId(land.getCreatedBy().getId());
            response.setOwnerUsername(land.getCreatedBy().getUsername());
        }

        return response;
    }

}
