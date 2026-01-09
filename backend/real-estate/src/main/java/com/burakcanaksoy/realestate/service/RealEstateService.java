package com.burakcanaksoy.realestate.service;

import com.burakcanaksoy.realestate.mapper.RealEstateMapper;
import com.burakcanaksoy.realestate.model.Category;
import com.burakcanaksoy.realestate.model.RealEstate;
import com.burakcanaksoy.realestate.model.User;
import com.burakcanaksoy.realestate.model.enums.Role;
import com.burakcanaksoy.realestate.repository.CategoryRepository;
import com.burakcanaksoy.realestate.repository.RealEstateRepository;
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

    public RealEstateService(RealEstateRepository realEstateRepository,CategoryRepository categoryRepository,AuthService authService){
        this.realEstateRepository = realEstateRepository;
        this.categoryRepository = categoryRepository;
        this.authService = authService;
    }

    public List<RealEstateResponse> getAllRealEstates() {
        List<RealEstate> realEstateList = this.realEstateRepository.findAll();
        return realEstateList.stream()
                .map(RealEstateMapper::toResponse)
                .toList();
    }

    public RealEstateResponse createRealEstate(@Valid RealEstateCreateRequest realEstateCreateRequest) {
        Category category = categoryRepository.findBySlug(realEstateCreateRequest.getCategorySlug())
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Category not found with slug: " + realEstateCreateRequest.getCategorySlug()
                        )
                );
        User currentUser = this.authService.getCurrentUser();

        RealEstate realEstate = RealEstateMapper.toEntity(realEstateCreateRequest,category);
        realEstate.setCreatedBy(currentUser);

        RealEstate savedRealEstate = this.realEstateRepository.save(realEstate);
        return RealEstateMapper.toResponse(savedRealEstate);

    }

    public RealEstateResponse getRealEstateById(Long realEstateId) {
        RealEstate realEstate = this.realEstateRepository.findById(realEstateId).orElseThrow(() -> new EntityNotFoundException("Real Estate not found with this id : "+realEstateId));
        return RealEstateMapper.toResponse(realEstate);
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
        RealEstate realEstate = this.realEstateRepository.findById(realEstateId).orElseThrow(() -> new EntityNotFoundException("Real Estate not found with this id : "+realEstateId));
        assertOwnerOrAdmin(realEstate,currentUser);
        this.realEstateRepository.delete(realEstate);
    }

    public RealEstateResponse updateRealEstate(Long realEstateId, @Valid RealEstateUpdateRequest request) {
        User currentUser = this.authService.getCurrentUser();
        RealEstate realEstate = realEstateRepository.findById(realEstateId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Real estate not found with id: " + realEstateId
                        )
                );
        assertOwnerOrAdmin(realEstate,currentUser);

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
                    .orElseThrow(() ->
                            new EntityNotFoundException(
                                    "Category not found with slug: " + request.getCategorySlug()
                            )
                    );
            realEstate.setCategory(category);
        }

        /* ---------------- RealEstate-specific fields ---------------- */

        if (request.getRealEstateType() != null) {
            realEstate.setRealEstateType(request.getRealEstateType());
        }

        if (request.getRoomCount() != null) {
            realEstate.setRoomCount(request.getRoomCount());
        }

        if (request.getSquareMeter() != null) {
            realEstate.setSquareMeter(request.getSquareMeter());
        }

        if (request.getBuildingAge() != null) {
            realEstate.setBuildingAge(request.getBuildingAge());
        }

        if (request.getFloor() != null) {
            realEstate.setFloor(request.getFloor());
        }

        if (request.getHeatingType() != null) {
            realEstate.setHeatingType(request.getHeatingType());
        }

        if (request.getFurnished() != null) {
            realEstate.setFurnished(request.getFurnished());
        }

        RealEstate updated = realEstateRepository.save(realEstate);

        return RealEstateMapper.toResponse(updated);
    }

    public Page<RealEstateResponse> getAllRealEstates(Pageable pageable) {
        Page<RealEstate> realEstatePage = this.realEstateRepository.findAll(pageable);
        return realEstatePage.map(RealEstateMapper::toResponse);

    }

    public Page<RealEstateResponse> search(RealEstateFilterRequest filter, Pageable pageable) {
        Page<RealEstate> realEstatePage = this.realEstateRepository.search(filter, pageable);
        return realEstatePage.map(RealEstateMapper::toResponse);
    }
}