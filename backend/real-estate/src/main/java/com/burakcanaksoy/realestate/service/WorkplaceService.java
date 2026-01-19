package com.burakcanaksoy.realestate.service;

import com.burakcanaksoy.realestate.mapper.WorkplaceMapper;
import com.burakcanaksoy.realestate.model.Category;
import com.burakcanaksoy.realestate.model.User;
import com.burakcanaksoy.realestate.model.Workplace;
import com.burakcanaksoy.realestate.model.enums.Role;
import com.burakcanaksoy.realestate.repository.CategoryRepository;
import com.burakcanaksoy.realestate.repository.ImageRepository;
import com.burakcanaksoy.realestate.repository.WorkplaceRepository;
import com.burakcanaksoy.realestate.request.WorkplaceCreateRequest;
import com.burakcanaksoy.realestate.request.WorkplaceFilterRequest;
import com.burakcanaksoy.realestate.request.WorkplaceUpdateRequest;
import com.burakcanaksoy.realestate.response.WorkplaceResponse;
import com.burakcanaksoy.realestate.security.AuthService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkplaceService {
    private final WorkplaceRepository workplaceRepository;
    private final CategoryRepository categoryRepository;
    private final AuthService authService;
    private final ImageRepository imageRepository; // Inject

    public WorkplaceService(WorkplaceRepository workplaceRepository, CategoryRepository categoryRepository,
            AuthService authService, ImageRepository imageRepository) {
        this.workplaceRepository = workplaceRepository;
        this.categoryRepository = categoryRepository;
        this.authService = authService;
        this.imageRepository = imageRepository;
    }

    public List<WorkplaceResponse> getAllWorkplaces() {
        List<Workplace> workplaceList = this.workplaceRepository.findAll();
        return workplaceList.stream()
                .map(this::convertToResponse)
                .toList();
    }

    public WorkplaceResponse createWorkplace(@Valid WorkplaceCreateRequest request) {

        Category category = categoryRepository.findBySlug(request.getCategorySlug())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Category not found with slug: " + request.getCategorySlug()));

        User currentUser = authService.getCurrentUser();

        Workplace workplace = WorkplaceMapper.toEntity(request, category);
        workplace.setCreatedBy(currentUser);

        Workplace savedWorkplace = workplaceRepository.save(workplace);
        return WorkplaceMapper.toResponse(savedWorkplace);
    }

    public WorkplaceResponse getWorkplaceById(Long workplaceId) {
        Workplace workplace = this.workplaceRepository.findById(workplaceId)
                .orElseThrow(() -> new EntityNotFoundException("Workplace not found with this id : " + workplaceId));
        return WorkplaceMapper.toResponse(workplace);
    }

    public void incrementViewCount(Long workplaceId) {
        Workplace workplace = this.workplaceRepository.findById(workplaceId)
                .orElseThrow(() -> new EntityNotFoundException("Workplace not found with this id : " + workplaceId));
        workplace.setViewCount(workplace.getViewCount() + 1);
        this.workplaceRepository.save(workplace);
    }

    private void assertOwnerOrAdmin(Workplace workplace, User currentUser) {
        boolean isAdmin = currentUser.getRoles().contains(Role.ROLE_ADMIN);
        boolean isOwner = workplace.getCreatedBy() != null &&
                workplace.getCreatedBy().getId().equals(currentUser.getId());
        if (!isAdmin && !isOwner) {
            throw new AccessDeniedException("You are not allowed to modify this workplace");
        }
    }

    public void deleteWorkplace(Long workplaceId) {
        User currentUser = this.authService.getCurrentUser();
        Workplace workplace = this.workplaceRepository.findById(workplaceId)
                .orElseThrow(() -> new EntityNotFoundException("Workplace not found with this id : " + workplaceId));
        assertOwnerOrAdmin(workplace, currentUser);
        this.workplaceRepository.delete(workplace);
    }

    public WorkplaceResponse updateWorkplace(Long workplaceId, @Valid WorkplaceUpdateRequest request) {
        User currentUser = this.authService.getCurrentUser();
        Workplace workplace = workplaceRepository.findById(workplaceId)
                .orElseThrow(() -> new EntityNotFoundException("Workplace not found with id: " + workplaceId));
        assertOwnerOrAdmin(workplace, currentUser);

        /* -------- BaseListing fields -------- */

        if (request.getTitle() != null) {
            workplace.setTitle(request.getTitle());
        }

        if (request.getDescription() != null) {
            workplace.setDescription(request.getDescription());
        }

        if (request.getPrice() != null) {
            workplace.setPrice(request.getPrice());
        }

        if (request.getCurrency() != null) {
            workplace.setCurrency(request.getCurrency());
        }

        if (request.getCity() != null) {
            workplace.setCity(request.getCity());
        }

        if (request.getDistrict() != null) {
            workplace.setDistrict(request.getDistrict());
        }

        if (request.getCategorySlug() != null) {
            Category category = categoryRepository
                    .findBySlug(request.getCategorySlug())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Category not found with slug: " + request.getCategorySlug()));
            workplace.setCategory(category);
        }

        /* -------- Workplace-specific fields -------- */

        if (request.getWorkplaceType() != null) {
            workplace.setWorkplaceType(request.getWorkplaceType());
        }

        if (request.getSquareMeter() != null) {
            workplace.setSquareMeter(request.getSquareMeter());
        }

        if (request.getFloorCount() != null) {
            workplace.setFloorCount(request.getFloorCount());
        }

        if (request.getFurnished() != null) {
            workplace.setFurnished(request.getFurnished());
        }

        Workplace updatedWorkplace = workplaceRepository.save(workplace);

        return WorkplaceMapper.toResponse(updatedWorkplace);
    }

    public Page<WorkplaceResponse> getAllWorkplaces(Pageable pageable) {
        Page<Workplace> workplacePage = this.workplaceRepository.findAll(pageable);
        return workplacePage.map(this::convertToResponse);

    }

    public Page<WorkplaceResponse> search(WorkplaceFilterRequest filter, Pageable pageable) {
        Page<Workplace> workplacePage = this.workplaceRepository.search(filter, pageable);
        return workplacePage.map(this::convertToResponse);
    }

    private WorkplaceResponse convertToResponse(Workplace workplace) {
        WorkplaceResponse response = WorkplaceMapper.toResponse(workplace);
        imageRepository.findFirstByListingIdAndListingTypeOrderByDisplayOrderAsc(workplace.getId(), "WORKPLACE")
                .ifPresent(image -> response.setImageUrl("/api/images/view/" + image.getId()));
        return response;
    }

    public List<WorkplaceResponse> getSimilarWorkplaces(Long id) {
        Workplace workplace = workplaceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Workplace not found with id: " + id));

        List<Workplace> similarWorkplaces = workplaceRepository.findTop3ByCityAndDistrictAndWorkplaceTypeAndIdNot(
                workplace.getCity(),
                workplace.getDistrict(),
                workplace.getWorkplaceType(),
                id);

        return similarWorkplaces.stream()
                .map(this::convertToResponse)
                .toList();
    }
}
