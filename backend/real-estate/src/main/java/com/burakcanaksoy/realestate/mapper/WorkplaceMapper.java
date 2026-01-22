package com.burakcanaksoy.realestate.mapper;

import com.burakcanaksoy.realestate.model.Category;
import com.burakcanaksoy.realestate.model.Workplace;
import com.burakcanaksoy.realestate.model.enums.ListingStatus;
import com.burakcanaksoy.realestate.request.WorkplaceCreateRequest;
import com.burakcanaksoy.realestate.response.WorkplaceResponse;
import lombok.experimental.UtilityClass;

@UtilityClass
public class WorkplaceMapper {

    public static Workplace toEntity(WorkplaceCreateRequest request, Category category) {
        if (request == null) {
            throw new IllegalArgumentException("WorkplaceCreateRequest cannot be null");
        }
        if (category == null) {
            throw new IllegalArgumentException("Category cannot be null");
        }
        Workplace workplace = new Workplace();

        /* ---------- BaseListing fields ---------- */
        workplace.setTitle(request.getTitle());
        workplace.setDescription(request.getDescription());
        workplace.setPrice(request.getPrice());
        workplace.setCurrency(request.getCurrency());
        workplace.setCity(request.getCity());
        workplace.setDistrict(request.getDistrict());
        workplace.setLatitude(request.getLatitude());
        workplace.setLongitude(request.getLongitude());
        workplace.setCategory(category);
        workplace.setCategory(category);
        workplace.setStatus(ListingStatus.ACTIVE);
        workplace.setOfferType(request.getOfferType());

        workplace.setWorkplaceType(request.getWorkplaceType());
        workplace.setSquareMeter(request.getSquareMeter());
        workplace.setFloorCount(request.getFloorCount());
        workplace.setFurnished(request.getFurnished());

        // New fields
        workplace.setHeatingType(request.getHeatingType());
        workplace.setBuildingAge(request.getBuildingAge());
        workplace.setDues(request.getDues());
        workplace.setCreditEligibility(request.getCreditEligibility());
        workplace.setDeedStatus(request.getDeedStatus());
        workplace.setListingFrom(request.getListingFrom());
        workplace.setExchange(request.getExchange());

        return workplace;
    }

    public static WorkplaceResponse toResponse(Workplace workplace) {
        if (workplace == null) {
            throw new IllegalArgumentException("workplace cannot be null");
        }

        WorkplaceResponse response = new WorkplaceResponse();

        /* ---------- BaseListing fields ---------- */
        response.setId(workplace.getId());
        response.setTitle(workplace.getTitle());
        response.setDescription(workplace.getDescription());
        response.setPrice(workplace.getPrice());
        response.setCurrency(workplace.getCurrency());
        response.setCity(workplace.getCity());
        response.setDistrict(workplace.getDistrict());
        response.setLatitude(workplace.getLatitude());
        response.setLongitude(workplace.getLongitude());
        response.setStatus(workplace.getStatus());
        response.setCreatedAt(workplace.getCreatedAt());
        response.setUpdatedAt(workplace.getUpdatedAt());
        response.setOfferType(workplace.getOfferType());
        response.setViewCount(workplace.getViewCount());
        response.setFavoriteCount(workplace.getFavoriteCount());

        if (workplace.getCategory() != null) {
            response.setCategorySlug(workplace.getCategory().getSlug());
            response.setCategory(workplace.getCategory().getName());
        }

        response.setWorkplaceType(workplace.getWorkplaceType());
        response.setSquareMeter(workplace.getSquareMeter());
        response.setFloorCount(workplace.getFloorCount());
        response.setFurnished(workplace.getFurnished());

        // New fields
        response.setHeatingType(workplace.getHeatingType());
        response.setBuildingAge(workplace.getBuildingAge());
        response.setDues(workplace.getDues());
        response.setCreditEligibility(workplace.getCreditEligibility());
        response.setDeedStatus(workplace.getDeedStatus());
        response.setListingFrom(workplace.getListingFrom());
        response.setExchange(workplace.getExchange());

        // user relationship
        if (workplace.getCreatedBy() != null) {
            response.setOwnerId(workplace.getCreatedBy().getId());
            response.setOwnerUsername(workplace.getCreatedBy().getUsername());
            response.setOwnerLastSeen(workplace.getCreatedBy().getLastSeen());
        }
        return response;
    }
}
