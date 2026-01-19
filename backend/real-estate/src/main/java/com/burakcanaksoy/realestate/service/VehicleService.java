package com.burakcanaksoy.realestate.service;

import com.burakcanaksoy.realestate.mapper.VehicleMapper;
import com.burakcanaksoy.realestate.model.Category;
import com.burakcanaksoy.realestate.model.User;
import com.burakcanaksoy.realestate.model.Vehicle;
import com.burakcanaksoy.realestate.model.enums.Role;
import com.burakcanaksoy.realestate.repository.CategoryRepository;
import com.burakcanaksoy.realestate.repository.ImageRepository;
import com.burakcanaksoy.realestate.repository.VehicleRepository;
import com.burakcanaksoy.realestate.request.VehicleCreateRequest;
import com.burakcanaksoy.realestate.request.VehicleFilterRequest;
import com.burakcanaksoy.realestate.request.VehicleUpdateRequest;
import com.burakcanaksoy.realestate.response.VehicleResponse;
import com.burakcanaksoy.realestate.security.AuthService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VehicleService {
    private final VehicleRepository vehicleRepository;
    private final CategoryRepository categoryRepository;
    private final AuthService authService;
    private final ImageRepository imageRepository; // Inject ImageRepository

    public VehicleService(VehicleRepository vehicleRepository, CategoryRepository categoryRepository,
            AuthService authService, ImageRepository imageRepository) {
        this.vehicleRepository = vehicleRepository;
        this.categoryRepository = categoryRepository;
        this.authService = authService;
        this.imageRepository = imageRepository;
    }

    public List<VehicleResponse> getAllVehicles() {
        List<Vehicle> vehicleList = this.vehicleRepository.findAll();
        return vehicleList.stream()
                .map(this::convertToResponse)
                .toList();
    }

    public VehicleResponse createVehicle(@Valid VehicleCreateRequest request) {
        User currentUser = this.authService.getCurrentUser();
        Category category = this.categoryRepository.findBySlug(request.getCategorySlug())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Category not found with this slug : " + request.getCategorySlug()));
        Vehicle vehicle = VehicleMapper.toEntity(request, category);
        vehicle.setCreatedBy(currentUser);
        Vehicle savedVehicle = this.vehicleRepository.save(vehicle);
        return VehicleMapper.toResponse(savedVehicle);
    }

    public VehicleResponse getVehicleById(Long vehicleId) {
        Vehicle vehicle = this.vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with this id : " + vehicleId));
        return VehicleMapper.toResponse(vehicle);
    }

    public void incrementViewCount(Long vehicleId) {
        Vehicle vehicle = this.vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with this id : " + vehicleId));
        vehicle.setViewCount(vehicle.getViewCount() + 1);
        this.vehicleRepository.save(vehicle);
    }

    private void assertOwnerOrAdmin(Vehicle vehicle, User currentUser) {
        boolean isAdmin = currentUser.getRoles().contains(Role.ROLE_ADMIN);
        boolean isOwner = vehicle.getCreatedBy() != null &&
                vehicle.getCreatedBy().getId().equals(currentUser.getId());
        if (!isAdmin && !isOwner) {
            throw new AccessDeniedException("You are not allowed to modify this vehicle");
        }
    }

    public void deleteVehicle(Long id) {
        User currentUser = authService.getCurrentUser();
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found: " + id));
        assertOwnerOrAdmin(vehicle, currentUser);
        vehicleRepository.delete(vehicle);
    }

    public VehicleResponse updateVehicle(Long vehicleId, @Valid VehicleUpdateRequest request) {
        User currentUser = authService.getCurrentUser();
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with id: " + vehicleId));
        assertOwnerOrAdmin(vehicle, currentUser);

        if (request.getTitle() != null) {
            vehicle.setTitle(request.getTitle());
        }

        if (request.getDescription() != null) {
            vehicle.setDescription(request.getDescription());
        }

        if (request.getPrice() != null) {
            vehicle.setPrice(request.getPrice());
        }

        if (request.getCurrency() != null) {
            vehicle.setCurrency(request.getCurrency());
        }

        if (request.getCity() != null) {
            vehicle.setCity(request.getCity());
        }

        if (request.getDistrict() != null) {
            vehicle.setDistrict(request.getDistrict());
        }

        if (request.getCategorySlug() != null) {
            Category category = categoryRepository
                    .findBySlug(request.getCategorySlug())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Category not found with slug: " + request.getCategorySlug()));
            vehicle.setCategory(category);
        }
        if (request.getBrand() != null) {
            vehicle.setBrand(request.getBrand());
        }

        if (request.getModel() != null) {
            vehicle.setModel(request.getModel());
        }

        if (request.getYear() != null) {
            vehicle.setYear(request.getYear());
        }

        if (request.getFuelType() != null) {
            vehicle.setFuelType(request.getFuelType());
        }

        if (request.getTransmission() != null) {
            vehicle.setTransmission(request.getTransmission());
        }

        if (request.getKilometer() != null) {
            vehicle.setKilometer(request.getKilometer());
        }

        if (request.getEngineVolume() != null) {
            vehicle.setEngineVolume(request.getEngineVolume());
        }

        Vehicle updatedVehicle = vehicleRepository.save(vehicle);

        return VehicleMapper.toResponse(updatedVehicle);
    }

    public Page<VehicleResponse> getAllVehicles(Pageable pageable) {
        Page<Vehicle> vehiclePage = this.vehicleRepository.findAll(pageable);
        return vehiclePage.map(this::convertToResponse);

    }

    public Page<VehicleResponse> search(VehicleFilterRequest filter, Pageable pageable) {
        Page<Vehicle> vehiclePage = this.vehicleRepository.search(filter, pageable);
        return vehiclePage.map(this::convertToResponse);
    }

    private VehicleResponse convertToResponse(Vehicle vehicle) {
        VehicleResponse response = VehicleMapper.toResponse(vehicle);
        imageRepository.findFirstByListingIdAndListingTypeOrderByDisplayOrderAsc(vehicle.getId(), "VEHICLE")
                .ifPresent(image -> response.setImageUrl("/api/images/view/" + image.getId()));
        return response;
    }

    public List<VehicleResponse> getSimilarVehicles(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with id: " + id));

        List<Vehicle> similarVehicles = vehicleRepository.findByCityAndDistrictAndBrandAndIdNot(
                vehicle.getCity(),
                vehicle.getDistrict(),
                vehicle.getBrand(),
                id,
                PageRequest.of(0, 3));

        return similarVehicles.stream()
                .map(this::convertToResponse)
                .toList();
    }
}