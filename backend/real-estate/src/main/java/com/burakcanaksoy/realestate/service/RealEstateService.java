package com.burakcanaksoy.realestate.service;

import com.burakcanaksoy.realestate.mapper.RealEstateMapper;
import com.burakcanaksoy.realestate.model.Category;
import com.burakcanaksoy.realestate.model.RealEstate;
import com.burakcanaksoy.realestate.model.User;
import com.burakcanaksoy.realestate.model.enums.Role;
import com.burakcanaksoy.realestate.repository.CategoryRepository;
import com.burakcanaksoy.realestate.repository.ImageRepository;
import com.burakcanaksoy.realestate.repository.RealEstateRepository;
import com.burakcanaksoy.realestate.repository.VideoRepository;
import com.burakcanaksoy.realestate.request.RealEstateCreateRequest;
import com.burakcanaksoy.realestate.request.RealEstateFilterRequest;
import com.burakcanaksoy.realestate.request.RealEstateUpdateRequest;
import com.burakcanaksoy.realestate.response.RealEstateResponse;
import com.burakcanaksoy.realestate.security.AuthService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RealEstateService {
    private final RealEstateRepository realEstateRepository;
    private final CategoryRepository categoryRepository;
    private final AuthService authService;
    private final ImageRepository imageRepository;
    private final VideoRepository videoRepository;
    private final ActivityLogService activityLogService;

    public RealEstateService(RealEstateRepository realEstateRepository, CategoryRepository categoryRepository,
            AuthService authService, ImageRepository imageRepository, VideoRepository videoRepository,
            ActivityLogService activityLogService) {
        this.realEstateRepository = realEstateRepository;
        this.categoryRepository = categoryRepository;
        this.authService = authService;
        this.imageRepository = imageRepository;
        this.videoRepository = videoRepository;
        this.activityLogService = activityLogService;
    }

    public List<RealEstateResponse> getAllRealEstates() {
        List<RealEstate> realEstateList = this.realEstateRepository.findAll();
        return realEstateList.stream()
                .map(this::convertToResponse)
                .toList();
    }

    public RealEstateResponse createRealEstate(@Valid RealEstateCreateRequest realEstateCreateRequest) {
        Category category = categoryRepository.findBySlug(realEstateCreateRequest.getCategorySlug())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Category not found with slug: " + realEstateCreateRequest.getCategorySlug()));
        User currentUser = this.authService.getCurrentUser();

        RealEstate realEstate = RealEstateMapper.toEntity(realEstateCreateRequest, category);
        realEstate.setCreatedBy(currentUser);

        RealEstate savedRealEstate = this.realEstateRepository.save(realEstate);

        // Log activity
        String description = String.format("User created real estate listing: %s", savedRealEstate.getTitle());
        activityLogService.logActivity(currentUser.getUsername(), "LISTING_CREATED", description, "N/A");

        return RealEstateMapper.toResponse(savedRealEstate);

    }

    public RealEstateResponse getRealEstateById(Long realEstateId) {
        RealEstate realEstate = this.realEstateRepository.findById(realEstateId)
                .orElseThrow(() -> new EntityNotFoundException("Real Estate not found with this id : " + realEstateId));
        return convertToResponse(realEstate);
    }

    public void incrementViewCount(Long realEstateId) {
        RealEstate realEstate = this.realEstateRepository.findById(realEstateId)
                .orElseThrow(() -> new EntityNotFoundException("Real Estate not found with this id : " + realEstateId));
        realEstate.setViewCount(realEstate.getViewCount() + 1);
        this.realEstateRepository.save(realEstate);
    }

    private void assertOwnerOrAdmin(RealEstate realEstate, User currentUser) {
        boolean isAdmin = currentUser.getRoles().contains(Role.ROLE_ADMIN);
        boolean isOwner = realEstate.getCreatedBy() != null &&
                realEstate.getCreatedBy().getId().equals(currentUser.getId());
        if (!isAdmin && !isOwner) {
            throw new AccessDeniedException("You are not allowed to modify this realEstate");
        }
    }

    public void deleteRealEstate(Long realEstateId) {
        User currentUser = this.authService.getCurrentUser();
        RealEstate realEstate = this.realEstateRepository.findById(realEstateId)
                .orElseThrow(() -> new EntityNotFoundException("Real Estate not found with this id : " + realEstateId));
        assertOwnerOrAdmin(realEstate, currentUser);

        String listingTitle = realEstate.getTitle();
        this.realEstateRepository.delete(realEstate);

        // Log activity
        String description = String.format("User deleted real estate listing: %s (ID: %d)", listingTitle, realEstateId);
        activityLogService.logActivity(currentUser.getUsername(), "LISTING_DELETED", description, "N/A");
    }

    public RealEstateResponse updateRealEstate(Long realEstateId, @Valid RealEstateUpdateRequest request) {
        User currentUser = this.authService.getCurrentUser();
        RealEstate realEstate = realEstateRepository.findById(realEstateId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Real estate not found with id: " + realEstateId));
        assertOwnerOrAdmin(realEstate, currentUser);

        /* ---------------- BaseListing fields ---------------- */

        if (request.getTitle() != null) {
            realEstate.setTitle(request.getTitle());
        }

        if (request.getDescription() != null) {
            realEstate.setDescription(request.getDescription());
        }

        if (request.getPrice() != null) {
            realEstate.setPrice(request.getPrice());
        }

        if (request.getCurrency() != null) {
            realEstate.setCurrency(request.getCurrency());
        }

        if (request.getCity() != null) {
            realEstate.setCity(request.getCity());
        }

        if (request.getDistrict() != null) {
            realEstate.setDistrict(request.getDistrict());
        }

        if (request.getCategorySlug() != null) {
            Category category = categoryRepository
                    .findBySlug(request.getCategorySlug())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Category not found with slug: " + request.getCategorySlug()));
            realEstate.setCategory(category);
        }

        /* ---------------- RealEstate-specific fields ---------------- */

        if (request.getRealEstateType() != null) {
            realEstate.setRealEstateType(request.getRealEstateType());
        }

        if (request.getRoomCount() != null) {
            realEstate.setRoomCount(request.getRoomCount());
        }

        if (request.getGrossSquareMeter() != null) {
            realEstate.setGrossSquareMeter(request.getGrossSquareMeter());
        }

        if (request.getNetSquareMeter() != null) {
            realEstate.setNetSquareMeter(request.getNetSquareMeter());
        }

        if (request.getBuildingAge() != null) {
            realEstate.setBuildingAge(request.getBuildingAge());
        }

        if (request.getFloor() != null) {
            realEstate.setFloor(request.getFloor());
        }

        if (request.getTotalFloors() != null) {
            realEstate.setTotalFloors(request.getTotalFloors());
        }

        if (request.getBathroomCount() != null) {
            realEstate.setBathroomCount(request.getBathroomCount());
        }

        if (request.getHeatingType() != null) {
            realEstate.setHeatingType(request.getHeatingType());
        }

        if (request.getBalcony() != null) {
            realEstate.setBalcony(request.getBalcony());
        }

        if (request.getFurnished() != null) {
            realEstate.setFurnished(request.getFurnished());
        }

        if (request.getUsingStatus() != null) {
            realEstate.setUsingStatus(request.getUsingStatus());
        }

        if (request.getKitchen() != null) {
            realEstate.setKitchen(request.getKitchen());
        }

        if (request.getElevator() != null) {
            realEstate.setElevator(request.getElevator());
        }

        if (request.getParking() != null) {
            realEstate.setParking(request.getParking());
        }

        if (request.getInComplex() != null) {
            realEstate.setInComplex(request.getInComplex());
        }

        if (request.getComplexName() != null) {
            realEstate.setComplexName(request.getComplexName());
        }

        if (request.getDues() != null) {
            realEstate.setDues(request.getDues());
        }

        if (request.getDeposit() != null) {
            realEstate.setDeposit(request.getDeposit());
        }

        if (request.getTittleStatus() != null) {
            realEstate.setTittleStatus(request.getTittleStatus());
        }

        if (request.getFromWho() != null) {
            realEstate.setFromWho(request.getFromWho());
        }

        RealEstate updated = realEstateRepository.save(realEstate);

        return RealEstateMapper.toResponse(updated);
    }

    public Page<RealEstateResponse> getAllRealEstates(Pageable pageable) {
        Page<RealEstate> realEstatePage = this.realEstateRepository.findAll(pageable);
        return realEstatePage.map(this::convertToResponse);

    }

    public Page<RealEstateResponse> search(RealEstateFilterRequest filter, Pageable pageable) {
        Page<RealEstate> realEstatePage = this.realEstateRepository.search(filter, pageable);
        return realEstatePage.map(this::convertToResponse);
    }

    private RealEstateResponse convertToResponse(RealEstate realEstate) {
        RealEstateResponse response = RealEstateMapper.toResponse(realEstate);
        imageRepository.findFirstByListingIdAndListingTypeOrderByDisplayOrderAsc(realEstate.getId(), "REAL_ESTATE")
                .ifPresent(image -> response.setImageUrl("/api/images/view/" + image.getId()));

        videoRepository.findByListingIdAndListingTypeOrderByDisplayOrderAsc(realEstate.getId(), "REAL_ESTATE")
                .stream().findFirst()
                .ifPresent(video -> response.setVideoUrl("/api/listings/videos/" + video.getId()));

        return response;
    }

    public List<RealEstateResponse> getSimilarRealEstates(Long id) {
        RealEstate realEstate = realEstateRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Real Estate not found with id: " + id));

        List<RealEstate> similarRealEstates = realEstateRepository.findTop3ByCityAndDistrictAndRealEstateTypeAndIdNot(
                realEstate.getCity(),
                realEstate.getDistrict(),
                realEstate.getRealEstateType(),
                id);

        return similarRealEstates.stream()
                .map(this::convertToResponse)
                .toList();
    }
}