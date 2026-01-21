package com.burakcanaksoy.realestate.mapper;

import com.burakcanaksoy.realestate.model.Category;
import com.burakcanaksoy.realestate.model.Vehicle;
import com.burakcanaksoy.realestate.model.enums.ListingStatus;
import com.burakcanaksoy.realestate.request.VehicleCreateRequest;
import com.burakcanaksoy.realestate.response.VehicleResponse;
import lombok.experimental.UtilityClass;

@UtilityClass
public class VehicleMapper {

    // VehicleCreateRequest → Vehicle
    public static Vehicle toEntity(VehicleCreateRequest request, Category category) {

        if (request == null) {
            throw new IllegalArgumentException("VehicleCreateRequest cannot be null");
        }
        if (category == null) {
            throw new IllegalArgumentException("Category cannot be null");
        }

        Vehicle vehicle = new Vehicle();

        vehicle.setTitle(request.getTitle());
        vehicle.setDescription(request.getDescription());
        vehicle.setPrice(request.getPrice());
        vehicle.setCurrency(request.getCurrency());
        vehicle.setCity(request.getCity());
        vehicle.setDistrict(request.getDistrict());
        vehicle.setLatitude(request.getLatitude());
        vehicle.setLongitude(request.getLongitude());
        vehicle.setCategory(category);
        vehicle.setCategory(category);
        vehicle.setStatus(ListingStatus.ACTIVE);
        vehicle.setOfferType(request.getOfferType());

        vehicle.setBrand(request.getBrand());
        vehicle.setModel(request.getModel());
        vehicle.setYear(request.getYear());
        vehicle.setFuelType(request.getFuelType());
        vehicle.setTransmission(request.getTransmission());
        vehicle.setKilometer(request.getKilometer());
        vehicle.setKilometer(request.getKilometer());
        vehicle.setEngineVolume(request.getEngineVolume());

        vehicle.setSeries(request.getSeries());
        vehicle.setVehicleStatus(request.getVehicleStatus());
        vehicle.setBodyType(request.getBodyType());
        vehicle.setEnginePower(request.getEnginePower());
        vehicle.setTractionType(request.getTractionType());
        vehicle.setColor(request.getColor());
        vehicle.setWarranty(request.getWarranty());
        vehicle.setHeavyDamage(request.getHeavyDamage());
        vehicle.setPlateNationality(request.getPlateNationality());
        vehicle.setFromWho(request.getFromWho());
        vehicle.setExchange(request.getExchange());

        return vehicle;
    }

    // Vehicle → VehicleResponse
    public static VehicleResponse toResponse(Vehicle vehicle) {
        VehicleResponse response = new VehicleResponse();

        response.setId(vehicle.getId());
        response.setTitle(vehicle.getTitle());
        response.setDescription(vehicle.getDescription());
        response.setPrice(vehicle.getPrice());
        response.setCurrency(vehicle.getCurrency());
        response.setStatus(vehicle.getStatus());
        response.setCity(vehicle.getCity());
        response.setDistrict(vehicle.getDistrict());
        response.setLatitude(vehicle.getLatitude());
        response.setLongitude(vehicle.getLongitude());

        if (vehicle.getCategory() != null) {
            response.setCategorySlug(vehicle.getCategory().getSlug());
            response.setCategory(vehicle.getCategory().getName());
        }

        response.setBrand(vehicle.getBrand());
        response.setModel(vehicle.getModel());
        response.setYear(vehicle.getYear());
        response.setFuelType(vehicle.getFuelType());
        response.setTransmission(vehicle.getTransmission());
        response.setKilometer(vehicle.getKilometer());
        response.setEngineVolume(vehicle.getEngineVolume());

        response.setSeries(vehicle.getSeries());
        response.setVehicleStatus(vehicle.getVehicleStatus());
        response.setBodyType(vehicle.getBodyType());
        response.setEnginePower(vehicle.getEnginePower());
        response.setTractionType(vehicle.getTractionType());
        response.setColor(vehicle.getColor());
        response.setWarranty(vehicle.getWarranty());
        response.setHeavyDamage(vehicle.getHeavyDamage());
        response.setPlateNationality(vehicle.getPlateNationality());
        response.setFromWho(vehicle.getFromWho());
        response.setExchange(vehicle.getExchange());
        response.setCreatedAt(vehicle.getCreatedAt());
        response.setCreatedAt(vehicle.getCreatedAt());
        response.setUpdatedAt(vehicle.getUpdatedAt());
        response.setOfferType(vehicle.getOfferType());
        response.setViewCount(vehicle.getViewCount());
        response.setFavoriteCount(vehicle.getFavoriteCount());

        // user relationship
        if (vehicle.getCreatedBy() != null) {
            response.setOwnerId(vehicle.getCreatedBy().getId());
            response.setOwnerUsername(vehicle.getCreatedBy().getUsername());
            response.setOwnerLastSeen(vehicle.getCreatedBy().getLastSeen());
        }

        return response;
    }
}