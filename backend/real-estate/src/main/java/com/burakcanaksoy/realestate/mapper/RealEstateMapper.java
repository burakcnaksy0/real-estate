package com.burakcanaksoy.realestate.mapper;

import com.burakcanaksoy.realestate.model.Category;
import com.burakcanaksoy.realestate.model.RealEstate;
import com.burakcanaksoy.realestate.model.enums.ListingStatus;
import com.burakcanaksoy.realestate.request.RealEstateCreateRequest;
import com.burakcanaksoy.realestate.response.RealEstateResponse;
import lombok.experimental.UtilityClass;

@UtilityClass
public class RealEstateMapper {

    public static RealEstate toEntity(RealEstateCreateRequest request, Category category) {
        if (request == null) {
            throw new IllegalArgumentException("RealEstateCreateRequest cannot be null");
        }
        if (category == null) {
            throw new IllegalArgumentException("Category cannot be null");
        }
        RealEstate realEstate = new RealEstate();

        realEstate.setTitle(request.getTitle());
        realEstate.setDescription(request.getDescription());
        realEstate.setPrice(request.getPrice());
        realEstate.setCurrency(request.getCurrency());
        realEstate.setCity(request.getCity());
        realEstate.setDistrict(request.getDistrict());
        realEstate.setLatitude(request.getLatitude());
        realEstate.setLongitude(request.getLongitude());
        realEstate.setCategory(category);
        realEstate.setCategory(category);
        realEstate.setStatus(ListingStatus.ACTIVE);
        realEstate.setOfferType(request.getOfferType());

        realEstate.setRealEstateType(request.getRealEstateType());
        realEstate.setRoomCount(request.getRoomCount());
        realEstate.setSquareMeter(request.getSquareMeter());
        realEstate.setBuildingAge(request.getBuildingAge());
        realEstate.setFloor(request.getFloor());
        realEstate.setHeatingType(request.getHeatingType());
        realEstate.setFurnished(request.getFurnished());

        return realEstate;
    }

    public static RealEstateResponse toResponse(RealEstate realEstate) {
        if (realEstate == null) {
            throw new IllegalArgumentException("Real Estate cannot be null");
        }
        RealEstateResponse response = new RealEstateResponse();

        response.setId(realEstate.getId());
        response.setTitle(realEstate.getTitle());
        response.setDescription(realEstate.getDescription());
        response.setPrice(realEstate.getPrice());
        response.setCurrency(realEstate.getCurrency());
        response.setCity(realEstate.getCity());
        response.setDistrict(realEstate.getDistrict());
        response.setLatitude(realEstate.getLatitude());
        response.setLongitude(realEstate.getLongitude());
        response.setStatus(realEstate.getStatus());
        response.setCreatedAt(realEstate.getCreatedAt());
        response.setUpdatedAt(realEstate.getUpdatedAt());
        response.setOfferType(realEstate.getOfferType());
        response.setViewCount(realEstate.getViewCount());
        response.setFavoriteCount(realEstate.getFavoriteCount());

        if (realEstate.getCategory() != null) {
            response.setCategorySlug(realEstate.getCategory().getSlug());
            response.setCategory(realEstate.getCategory().getName());
        }

        response.setRealEstateType(realEstate.getRealEstateType());
        response.setRoomCount(realEstate.getRoomCount());
        response.setSquareMeter(realEstate.getSquareMeter());
        response.setBuildingAge(realEstate.getBuildingAge());
        response.setFloor(realEstate.getFloor());
        response.setHeatingType(realEstate.getHeatingType());
        response.setFurnished(realEstate.getFurnished());

        // user relationship
        if (realEstate.getCreatedBy() != null) {
            response.setOwnerId(realEstate.getCreatedBy().getId());
            response.setOwnerUsername(realEstate.getCreatedBy().getUsername());
            response.setOwnerLastSeen(realEstate.getCreatedBy().getLastSeen());
        }

        return response;
    }
}