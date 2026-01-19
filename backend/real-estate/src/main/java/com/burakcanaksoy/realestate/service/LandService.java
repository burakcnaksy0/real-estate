package com.burakcanaksoy.realestate.service;

import com.burakcanaksoy.realestate.mapper.LandMapper;
import com.burakcanaksoy.realestate.model.Category;
import com.burakcanaksoy.realestate.model.Land;
import com.burakcanaksoy.realestate.model.User;
import com.burakcanaksoy.realestate.model.enums.Role;
import com.burakcanaksoy.realestate.repository.CategoryRepository;
import com.burakcanaksoy.realestate.repository.ImageRepository;
import com.burakcanaksoy.realestate.repository.LandRepository;
import com.burakcanaksoy.realestate.request.LandCreateRequest;
import com.burakcanaksoy.realestate.request.LandFilterRequest;
import com.burakcanaksoy.realestate.request.LandUpdateRequest;
import com.burakcanaksoy.realestate.response.LandResponse;
import com.burakcanaksoy.realestate.security.AuthService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LandService {
    private final LandRepository landRepository;
    private final CategoryRepository categoryRepository;
    private final AuthService authService;
    private final ImageRepository imageRepository;

    public LandService(LandRepository landRepository, CategoryRepository categoryRepository, AuthService authService,
            ImageRepository imageRepository) {
        this.landRepository = landRepository;
        this.categoryRepository = categoryRepository;
        this.authService = authService;
        this.imageRepository = imageRepository;
    }

    public List<LandResponse> getAllLands() {
        List<Land> landList = this.landRepository.findAll();
        return landList.stream()
                .map(this::convertToResponse)
                .toList();
    }

    public Page<LandResponse> getAllLands(Pageable pageable) {
        Page<Land> landPage = this.landRepository.findAll(pageable);
        return landPage.map(this::convertToResponse);
    }

    public Page<LandResponse> search(LandFilterRequest filter, Pageable pageable) {
        Page<Land> landPage = this.landRepository.search(filter, pageable);
        return landPage.map(this::convertToResponse);
    }

    private LandResponse convertToResponse(Land land) {
        LandResponse response = LandMapper.toResponse(land);
        imageRepository.findFirstByListingIdAndListingTypeOrderByDisplayOrderAsc(land.getId(), "LAND")
                .ifPresent(image -> response.setImageUrl("/api/images/view/" + image.getId()));
        return response;
    }

    public LandResponse createLand(@Valid LandCreateRequest landCreateRequest) {
        Category category = categoryRepository.findBySlug(landCreateRequest.getCategorySlug())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Category not found with slug: " + landCreateRequest.getCategorySlug()));
        User currentUser = this.authService.getCurrentUser();

        Land land = LandMapper.toEntity(landCreateRequest, category);
        land.setCreatedBy(currentUser);

        Land savedLand = this.landRepository.save(land);
        return LandMapper.toResponse(savedLand);
    }

    public LandResponse getLandById(Long landId) {
        Land land = this.landRepository.findById(landId)
                .orElseThrow(() -> new EntityNotFoundException("Land not found with this id : " + landId));
        return LandMapper.toResponse(land);
    }

    public void incrementViewCount(Long landId) {
        Land land = this.landRepository.findById(landId)
                .orElseThrow(() -> new EntityNotFoundException("Land not found with this id : " + landId));
        land.setViewCount(land.getViewCount() + 1);
        this.landRepository.save(land);
    }

    private void assertOwnerOrAdmin(Land land, User currentUser) {
        boolean isAdmin = currentUser.getRoles().contains(Role.ROLE_ADMIN);
        boolean isOwner = land.getCreatedBy() != null &&
                land.getCreatedBy().getId().equals(currentUser.getId());
        if (!isAdmin && !isOwner) {
            throw new AccessDeniedException("You are not allowed to modify this land");
        }
    }

    public void deleteLand(Long landId) {
        User currentUser = this.authService.getCurrentUser();
        Land land = this.landRepository.findById(landId)
                .orElseThrow(() -> new EntityNotFoundException("Land not found with this id : " + landId));
        assertOwnerOrAdmin(land, currentUser);
        this.landRepository.delete(land);
    }

    public LandResponse updateLand(Long id, LandUpdateRequest request) {
        User currentUser = this.authService.getCurrentUser();
        Land land = landRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Land not found with id: " + id));
        assertOwnerOrAdmin(land, currentUser);

        if (request.getTitle() != null) {
            land.setTitle(request.getTitle());
        }

        if (request.getDescription() != null) {
            land.setDescription(request.getDescription());
        }

        if (request.getPrice() != null) {
            land.setPrice(request.getPrice());
        }

        if (request.getCurrency() != null) {
            land.setCurrency(request.getCurrency());
        }

        if (request.getCategorySlug() != null) {

            Category category = categoryRepository
                    .findBySlug(request.getCategorySlug())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Category not found with slug: " + request.getCategorySlug()));

            land.setCategory(category);
        }

        if (request.getCity() != null) {
            land.setCity(request.getCity());
        }

        if (request.getDistrict() != null) {
            land.setDistrict(request.getDistrict());
        }

        if (request.getLandType() != null) {
            land.setLandType(request.getLandType());
        }

        if (request.getSquareMeter() != null) {
            land.setSquareMeter(request.getSquareMeter());
        }

        if (request.getZoningStatus() != null) {
            land.setZoningStatus(request.getZoningStatus());
        }

        if (request.getParcelNumber() != null) {
            land.setParcelNumber(request.getParcelNumber());
        }

        if (request.getIslandNumber() != null) {
            land.setIslandNumber(request.getIslandNumber());
        }

        landRepository.save(land);
        return LandMapper.toResponse(land);
    }

    public List<LandResponse> getSimilarLands(Long id) {
        Land land = landRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Land not found with id: " + id));

        List<Land> similarLands = landRepository.findTop3ByCityAndDistrictAndLandTypeAndIdNot(
                land.getCity(),
                land.getDistrict(),
                land.getLandType(),
                id);

        return similarLands.stream()
                .map(this::convertToResponse)
                .toList();
    }
}