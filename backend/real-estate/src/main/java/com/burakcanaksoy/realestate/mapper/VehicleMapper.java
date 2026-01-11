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
        vehicle.setEngineVolume(request.getEngineVolume());

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
        response.setCreatedAt(vehicle.getCreatedAt());
        response.setCreatedAt(vehicle.getCreatedAt());
        response.setUpdatedAt(vehicle.getUpdatedAt());
        response.setOfferType(vehicle.getOfferType());

        // user relationship
        if (vehicle.getCreatedBy() != null) {
            response.setOwnerId(vehicle.getCreatedBy().getId());
            response.setOwnerUsername(vehicle.getCreatedBy().getUsername());
        }

        return response;
    }
}