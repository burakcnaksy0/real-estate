package com.burakcanaksoy.realestate.service;

import com.burakcanaksoy.realestate.model.Category;
import com.burakcanaksoy.realestate.model.User;
import com.burakcanaksoy.realestate.model.Workplace;
import com.burakcanaksoy.realestate.model.enums.Currency;
import com.burakcanaksoy.realestate.model.enums.Role;
import com.burakcanaksoy.realestate.model.enums.WorkplaceType;
import com.burakcanaksoy.realestate.repository.CategoryRepository;
import com.burakcanaksoy.realestate.repository.WorkplaceRepository;
import com.burakcanaksoy.realestate.request.WorkplaceCreateRequest;
import com.burakcanaksoy.realestate.request.WorkplaceFilterRequest;
import com.burakcanaksoy.realestate.request.WorkplaceUpdateRequest;
import com.burakcanaksoy.realestate.response.WorkplaceResponse;
import com.burakcanaksoy.realestate.security.AuthService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for WorkplaceService
 *
 * This test class covers all methods of WorkplaceService.
 * 
 * @Mock: Mocks the repository and auth service dependencies
 * @InjectMocks: Creates WorkplaceService and injects mocked dependencies
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("WorkplaceService Unit Tests")
public class WorkplaceServiceTest {

    @Mock
    private WorkplaceRepository workplaceRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private AuthService authService;

    @InjectMocks
    private WorkplaceService workplaceService;

    private Workplace testWorkplace;
    private WorkplaceCreateRequest workplaceCreateRequest;
    private WorkplaceUpdateRequest workplaceUpdateRequest;
    private Category testCategory;
    private User testUser;

    /**
     * Setup method executed before each test
     * Test data is prepared here
     */
    @BeforeEach
    void setUp() {
        // Prepare test user
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        Set<Role> roles = new HashSet<>();
        roles.add(Role.ROLE_USER);
        testUser.setRoles(roles);

        // Prepare test category
        testCategory = new Category();
        testCategory.setId(1L);
        testCategory.setName("Workplace");
        testCategory.setSlug("isyeri");
        testCategory.setActive(true);

        // Prepare test workplace entity
        testWorkplace = new Workplace();
        testWorkplace.setId(1L);
        testWorkplace.setTitle("Modern Office Space in Levent");
        testWorkplace.setDescription("Fully equipped office with great view");
        testWorkplace.setPrice(new BigDecimal("25000.00"));
        testWorkplace.setCurrency(Currency.TRY);
        testWorkplace.setCategory(testCategory);
        testWorkplace.setCity("Istanbul");
        testWorkplace.setDistrict("Levent");
        testWorkplace.setWorkplaceType(WorkplaceType.OFFICE);
        testWorkplace.setSquareMeter(120);
        testWorkplace.setFloorCount(5);
        testWorkplace.setFurnished(true);
        testWorkplace.setCreatedBy(testUser);

        // Prepare create request
        workplaceCreateRequest = new WorkplaceCreateRequest();
        workplaceCreateRequest.setTitle("Modern Office Space in Levent");
        workplaceCreateRequest.setDescription("Fully equipped office with great view");
        workplaceCreateRequest.setPrice(new BigDecimal("25000.00"));
        workplaceCreateRequest.setCurrency(Currency.TRY);
        workplaceCreateRequest.setCategorySlug("isyeri");
        workplaceCreateRequest.setCity("Istanbul");
        workplaceCreateRequest.setDistrict("Levent");
        workplaceCreateRequest.setWorkplaceType(WorkplaceType.OFFICE);
        workplaceCreateRequest.setSquareMeter(120);
        workplaceCreateRequest.setFloorCount(5);
        workplaceCreateRequest.setFurnished(true);

        // Prepare update request
        workplaceUpdateRequest = new WorkplaceUpdateRequest();
        workplaceUpdateRequest.setTitle("Updated Office Space");
        workplaceUpdateRequest.setDescription("Updated description");
        workplaceUpdateRequest.setPrice(new BigDecimal("27000.00"));
        workplaceUpdateRequest.setCurrency(Currency.USD);
        workplaceUpdateRequest.setCity("Ankara");
        workplaceUpdateRequest.setDistrict("Cankaya");
    }

    // ============ getAllWorkplaces() Tests ============

    @Test
    @DisplayName("getAllWorkplaces - Should return all workplaces successfully")
    void testGetAllWorkplaces_Success() {
        // Arrange
        List<Workplace> workplaceList = new ArrayList<>();
        workplaceList.add(testWorkplace);
        when(workplaceRepository.findAll()).thenReturn(workplaceList);

        // Act
        List<WorkplaceResponse> result = workplaceService.getAllWorkplaces();

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1)
                .extracting(WorkplaceResponse::getTitle)
                .contains("Modern Office Space in Levent");

        verify(workplaceRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("getAllWorkplaces - Should return empty list when no workplaces exist")
    void testGetAllWorkplaces_EmptyList() {
        // Arrange
        when(workplaceRepository.findAll()).thenReturn(new ArrayList<>());

        // Act
        List<WorkplaceResponse> result = workplaceService.getAllWorkplaces();

        // Assert
        assertThat(result)
                .isNotNull()
                .isEmpty();

        verify(workplaceRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("getAllWorkplaces - Should return multiple workplaces")
    void testGetAllWorkplaces_MultipleWorkplaces() {
        // Arrange
        Workplace secondWorkplace = new Workplace();
        secondWorkplace.setId(2L);
        secondWorkplace.setTitle("Large Warehouse in Ikitelli");
        secondWorkplace.setDescription("Spacious warehouse for storage");
        secondWorkplace.setPrice(new BigDecimal("50000.00"));
        secondWorkplace.setCurrency(Currency.TRY);
        secondWorkplace.setCategory(testCategory);
        secondWorkplace.setCity("Istanbul");
        secondWorkplace.setDistrict("Ikitelli");
        secondWorkplace.setWorkplaceType(WorkplaceType.WAREHOUSE);
        secondWorkplace.setSquareMeter(500);
        secondWorkplace.setFloorCount(1);
        secondWorkplace.setFurnished(false);
        secondWorkplace.setCreatedBy(testUser);

        List<Workplace> workplaceList = new ArrayList<>();
        workplaceList.add(testWorkplace);
        workplaceList.add(secondWorkplace);
        when(workplaceRepository.findAll()).thenReturn(workplaceList);

        // Act
        List<WorkplaceResponse> result = workplaceService.getAllWorkplaces();

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(2);

        verify(workplaceRepository, times(1)).findAll();
    }

    // ============ getAllWorkplaces(Pageable) Tests ============

    @Test
    @DisplayName("getAllWorkplaces(Pageable) - Should return paginated workplaces successfully")
    void testGetAllWorkplacesWithPagination_Success() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        List<Workplace> workplaceList = new ArrayList<>();
        workplaceList.add(testWorkplace);
        Page<Workplace> workplacePage = new PageImpl<>(workplaceList, pageable, 1);

        when(workplaceRepository.findAll(pageable)).thenReturn(workplacePage);

        // Act
        Page<WorkplaceResponse> result = workplaceService.getAllWorkplaces(pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1)
                .extracting(WorkplaceResponse::getTitle)
                .contains("Modern Office Space in Levent");

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getNumber()).isEqualTo(0);

        verify(workplaceRepository, times(1)).findAll(pageable);
    }

    @Test
    @DisplayName("getAllWorkplaces(Pageable) - Should return empty page when no workplaces exist")
    void testGetAllWorkplacesWithPagination_EmptyPage() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<Workplace> emptyPage = new PageImpl<>(new ArrayList<>(), pageable, 0);

        when(workplaceRepository.findAll(pageable)).thenReturn(emptyPage);

        // Act
        Page<WorkplaceResponse> result = workplaceService.getAllWorkplaces(pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .isEmpty();

        assertThat(result.getTotalElements()).isEqualTo(0);

        verify(workplaceRepository, times(1)).findAll(pageable);
    }

    @Test
    @DisplayName("getAllWorkplaces(Pageable) - Should return correct page information")
    void testGetAllWorkplacesWithPagination_PageInfo() {
        // Arrange
        Pageable pageable = PageRequest.of(1, 5);
        List<Workplace> workplaceList = new ArrayList<>();
        workplaceList.add(testWorkplace);
        Page<Workplace> workplacePage = new PageImpl<>(workplaceList, pageable, 15);

        when(workplaceRepository.findAll(pageable)).thenReturn(workplacePage);

        // Act
        Page<WorkplaceResponse> result = workplaceService.getAllWorkplaces(pageable);

        // Assert
        assertThat(result.getTotalElements()).isEqualTo(15);
        assertThat(result.getTotalPages()).isEqualTo(3);
        assertThat(result.getNumber()).isEqualTo(1);
        assertThat(result.getSize()).isEqualTo(5);

        verify(workplaceRepository, times(1)).findAll(pageable);
    }

    // ============ createWorkplace() Tests ============

    @Test
    @DisplayName("createWorkplace - Should create workplace successfully")
    void testCreateWorkplace_Success() {
        // Arrange
        when(categoryRepository.findBySlug("isyeri")).thenReturn(Optional.of(testCategory));
        when(authService.getCurrentUser()).thenReturn(testUser);
        when(workplaceRepository.save(any(Workplace.class))).thenReturn(testWorkplace);

        // Act
        WorkplaceResponse result = workplaceService.createWorkplace(workplaceCreateRequest);

        // Assert
        assertThat(result)
                .isNotNull()
                .extracting(WorkplaceResponse::getTitle, WorkplaceResponse::getCity)
                .containsExactly("Modern Office Space in Levent", "Istanbul");

        verify(categoryRepository, times(1)).findBySlug("isyeri");
        verify(authService, times(1)).getCurrentUser();
        verify(workplaceRepository, times(1)).save(any(Workplace.class));
    }

    @Test
    @DisplayName("createWorkplace - Should throw exception when category not found")
    void testCreateWorkplace_CategoryNotFound() {
        // Arrange
        when(categoryRepository.findBySlug("isyeri")).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> workplaceService.createWorkplace(workplaceCreateRequest))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Category not found with slug: isyeri");

        verify(categoryRepository, times(1)).findBySlug("isyeri");
        verify(authService, never()).getCurrentUser();
        verify(workplaceRepository, never()).save(any());
    }

    @Test
    @DisplayName("createWorkplace - Should set current user as creator")
    void testCreateWorkplace_SetCreator() {
        // Arrange
        when(categoryRepository.findBySlug("isyeri")).thenReturn(Optional.of(testCategory));
        when(authService.getCurrentUser()).thenReturn(testUser);
        when(workplaceRepository.save(any(Workplace.class))).thenReturn(testWorkplace);

        // Act
        workplaceService.createWorkplace(workplaceCreateRequest);

        // Assert
        verify(authService, times(1)).getCurrentUser();
        verify(workplaceRepository, times(1)).save(any(Workplace.class));
    }

    // ============ getWorkplaceById() Tests ============

    @Test
    @DisplayName("getWorkplaceById - Should retrieve workplace by ID successfully")
    void testGetWorkplaceById_Success() {
        // Arrange
        Long workplaceId = 1L;
        when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.of(testWorkplace));

        // Act
        WorkplaceResponse result = workplaceService.getWorkplaceById(workplaceId);

        // Assert
        assertThat(result)
                .isNotNull()
                .extracting(WorkplaceResponse::getId, WorkplaceResponse::getTitle)
                .containsExactly(1L, "Modern Office Space in Levent");

        verify(workplaceRepository, times(1)).findById(workplaceId);
    }

    @Test
    @DisplayName("getWorkplaceById - Should throw exception when workplace not found")
    void testGetWorkplaceById_NotFound() {
        // Arrange
        Long workplaceId = 999L;
        when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> workplaceService.getWorkplaceById(workplaceId))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Workplace not found with this id : 999");

        verify(workplaceRepository, times(1)).findById(workplaceId);
    }

    // ============ deleteWorkplace() Tests ============

    @Test
    @DisplayName("deleteWorkplace - Should delete workplace by owner successfully")
    void testDeleteWorkplace_ByOwner_Success() {
        // Arrange
        Long workplaceId = 1L;
        when(authService.getCurrentUser()).thenReturn(testUser);
        when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.of(testWorkplace));

        // Act
        workplaceService.deleteWorkplace(workplaceId);

        // Assert
        verify(workplaceRepository, times(1)).findById(workplaceId);
        verify(workplaceRepository, times(1)).delete(testWorkplace);
    }

    @Test
    @DisplayName("deleteWorkplace - Should delete workplace by admin successfully")
    void testDeleteWorkplace_ByAdmin_Success() {
        // Arrange
        Long workplaceId = 1L;
        User adminUser = new User();
        adminUser.setId(2L);
        adminUser.setUsername("admin");
        Set<Role> adminRoles = new HashSet<>();
        adminRoles.add(Role.ROLE_ADMIN);
        adminUser.setRoles(adminRoles);

        when(authService.getCurrentUser()).thenReturn(adminUser);
        when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.of(testWorkplace));

        // Act
        workplaceService.deleteWorkplace(workplaceId);

        // Assert
        verify(workplaceRepository, times(1)).findById(workplaceId);
        verify(workplaceRepository, times(1)).delete(testWorkplace);
    }

    @Test
    @DisplayName("deleteWorkplace - Should throw exception when workplace not found")
    void testDeleteWorkplace_NotFound() {
        // Arrange
        Long workplaceId = 999L;
        when(authService.getCurrentUser()).thenReturn(testUser);
        when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> workplaceService.deleteWorkplace(workplaceId))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Workplace not found with this id : 999");

        verify(workplaceRepository, never()).delete(any());
    }

    @Test
    @DisplayName("deleteWorkplace - Should throw exception when user is not owner or admin")
    void testDeleteWorkplace_UnauthorizedUser() {
        // Arrange
        Long workplaceId = 1L;
        User unauthorizedUser = new User();
        unauthorizedUser.setId(99L);
        unauthorizedUser.setUsername("unauthorized");
        Set<Role> userRoles = new HashSet<>();
        userRoles.add(Role.ROLE_USER);
        unauthorizedUser.setRoles(userRoles);

        when(authService.getCurrentUser()).thenReturn(unauthorizedUser);
        when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.of(testWorkplace));

        // Act & Assert
        assertThatThrownBy(() -> workplaceService.deleteWorkplace(workplaceId))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("You are not allowed to modify this workplace");

        verify(workplaceRepository, never()).delete(any());
    }

    // ============ updateWorkplace() Tests ============

    @Test
    @DisplayName("updateWorkplace - Should update all workplace fields successfully")
    void testUpdateWorkplace_AllFields_Success() {
        // Arrange
        Long workplaceId = 1L;
        workplaceUpdateRequest.setCategorySlug("isyeri");
        workplaceUpdateRequest.setWorkplaceType(WorkplaceType.SHOP);
        workplaceUpdateRequest.setSquareMeter(150);
        workplaceUpdateRequest.setFloorCount(3);
        workplaceUpdateRequest.setFurnished(false);

        Category updatedCategory = new Category();
        updatedCategory.setId(1L);
        updatedCategory.setSlug("isyeri");

        when(authService.getCurrentUser()).thenReturn(testUser);
        when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.of(testWorkplace));
        when(categoryRepository.findBySlug("isyeri")).thenReturn(Optional.of(updatedCategory));
        when(workplaceRepository.save(any(Workplace.class))).thenReturn(testWorkplace);

        // Act
        WorkplaceResponse result = workplaceService.updateWorkplace(workplaceId, workplaceUpdateRequest);

        // Assert
        assertThat(result).isNotNull();
        verify(workplaceRepository, times(1)).findById(workplaceId);
        verify(workplaceRepository, times(1)).save(any(Workplace.class));
    }

    @Test
    @DisplayName("updateWorkplace - Should update only title field")
    void testUpdateWorkplace_OnlyTitle() {
        // Arrange
        Long workplaceId = 1L;
        WorkplaceUpdateRequest partialRequest = new WorkplaceUpdateRequest();
        partialRequest.setTitle("New Title");

        when(authService.getCurrentUser()).thenReturn(testUser);
        when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.of(testWorkplace));
        when(workplaceRepository.save(any(Workplace.class))).thenReturn(testWorkplace);

        // Act
        WorkplaceResponse result = workplaceService.updateWorkplace(workplaceId, partialRequest);

        // Assert
        assertThat(result).isNotNull();
        verify(workplaceRepository, times(1)).save(any(Workplace.class));
    }

    @Test
    @DisplayName("updateWorkplace - Should update price field")
    void testUpdateWorkplace_OnlyPrice() {
        // Arrange
        Long workplaceId = 1L;
        WorkplaceUpdateRequest priceRequest = new WorkplaceUpdateRequest();
        priceRequest.setPrice(new BigDecimal("30000.00"));

        when(authService.getCurrentUser()).thenReturn(testUser);
        when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.of(testWorkplace));
        when(workplaceRepository.save(any(Workplace.class))).thenReturn(testWorkplace);

        // Act
        workplaceService.updateWorkplace(workplaceId, priceRequest);

        // Assert
        verify(workplaceRepository, times(1)).save(any(Workplace.class));
    }

    @Test
    @DisplayName("updateWorkplace - Should update workplace-specific fields")
    void testUpdateWorkplace_WorkplaceSpecificFields() {
        // Arrange
        Long workplaceId = 1L;
        WorkplaceUpdateRequest workplaceSpecificRequest = new WorkplaceUpdateRequest();
        workplaceSpecificRequest.setWorkplaceType(WorkplaceType.FACTORY);
        workplaceSpecificRequest.setSquareMeter(1000);
        workplaceSpecificRequest.setFloorCount(2);
        workplaceSpecificRequest.setFurnished(false);

        when(authService.getCurrentUser()).thenReturn(testUser);
        when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.of(testWorkplace));
        when(workplaceRepository.save(any(Workplace.class))).thenReturn(testWorkplace);

        // Act
        workplaceService.updateWorkplace(workplaceId, workplaceSpecificRequest);

        // Assert
        verify(workplaceRepository, times(1)).save(any(Workplace.class));
    }

    @Test
    @DisplayName("updateWorkplace - Should update category by slug")
    void testUpdateWorkplace_UpdateCategory() {
        // Arrange
        Long workplaceId = 1L;
        WorkplaceUpdateRequest categoryRequest = new WorkplaceUpdateRequest();
        categoryRequest.setCategorySlug("commercial");
        Category newCategory = new Category();
        newCategory.setId(2L);
        newCategory.setSlug("commercial");

        when(authService.getCurrentUser()).thenReturn(testUser);
        when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.of(testWorkplace));
        when(categoryRepository.findBySlug("commercial")).thenReturn(Optional.of(newCategory));
        when(workplaceRepository.save(any(Workplace.class))).thenReturn(testWorkplace);

        // Act
        workplaceService.updateWorkplace(workplaceId, categoryRequest);

        // Assert
        verify(categoryRepository, times(1)).findBySlug("commercial");
        verify(workplaceRepository, times(1)).save(any(Workplace.class));
    }

    @Test
    @DisplayName("updateWorkplace - Should throw exception when workplace not found")
    void testUpdateWorkplace_NotFound() {
        // Arrange
        Long workplaceId = 999L;
        when(authService.getCurrentUser()).thenReturn(testUser);
        when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> workplaceService.updateWorkplace(workplaceId, workplaceUpdateRequest))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Workplace not found with id: 999");

        verify(workplaceRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateWorkplace - Should throw exception when user is not owner or admin")
    void testUpdateWorkplace_UnauthorizedUser() {
        // Arrange
        Long workplaceId = 1L;
        User unauthorizedUser = new User();
        unauthorizedUser.setId(99L);
        unauthorizedUser.setUsername("unauthorized");
        Set<Role> userRoles = new HashSet<>();
        userRoles.add(Role.ROLE_USER);
        unauthorizedUser.setRoles(userRoles);

        when(authService.getCurrentUser()).thenReturn(unauthorizedUser);
        when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.of(testWorkplace));

        // Act & Assert
        assertThatThrownBy(() -> workplaceService.updateWorkplace(workplaceId, workplaceUpdateRequest))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("You are not allowed to modify this workplace");

        verify(workplaceRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateWorkplace - Should throw exception when category not found")
    void testUpdateWorkplace_CategoryNotFound() {
        // Arrange
        Long workplaceId = 1L;
        WorkplaceUpdateRequest categoryRequest = new WorkplaceUpdateRequest();
        categoryRequest.setCategorySlug("nonexistent");

        when(authService.getCurrentUser()).thenReturn(testUser);
        when(workplaceRepository.findById(workplaceId)).thenReturn(Optional.of(testWorkplace));
        when(categoryRepository.findBySlug("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> workplaceService.updateWorkplace(workplaceId, categoryRequest))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Category not found with slug: nonexistent");

        verify(workplaceRepository, never()).save(any());
    }

    // ============ search() Tests ============

    @Test
    @DisplayName("search - Should search workplaces with all filters")
    void testSearch_AllFilters_Success() {
        // Arrange
        WorkplaceFilterRequest filter = new WorkplaceFilterRequest();
        filter.setCity("Istanbul");
        filter.setDistrict("Levent");
        filter.setCategorySlug("isyeri");
        filter.setMinPrice(new BigDecimal("10000"));
        filter.setMaxPrice(new BigDecimal("50000"));
        filter.setWorkplaceType(WorkplaceType.OFFICE);
        filter.setMinSquareMeter(100);
        filter.setMaxSquareMeter(200);

        Pageable pageable = PageRequest.of(0, 10);
        List<Workplace> workplaceList = new ArrayList<>();
        workplaceList.add(testWorkplace);
        Page<Workplace> workplacePage = new PageImpl<>(workplaceList, pageable, 1);

        when(workplaceRepository.search(filter, pageable)).thenReturn(workplacePage);

        // Act
        Page<WorkplaceResponse> result = workplaceService.search(filter, pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1);

        verify(workplaceRepository, times(1)).search(filter, pageable);
    }

    @Test
    @DisplayName("search - Should search workplaces with city filter only")
    void testSearch_CityFilterOnly() {
        // Arrange
        WorkplaceFilterRequest filter = new WorkplaceFilterRequest();
        filter.setCity("Istanbul");

        Pageable pageable = PageRequest.of(0, 10);
        List<Workplace> workplaceList = new ArrayList<>();
        workplaceList.add(testWorkplace);
        Page<Workplace> workplacePage = new PageImpl<>(workplaceList, pageable, 1);

        when(workplaceRepository.search(filter, pageable)).thenReturn(workplacePage);

        // Act
        Page<WorkplaceResponse> result = workplaceService.search(filter, pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1);

        verify(workplaceRepository, times(1)).search(filter, pageable);
    }

    @Test
    @DisplayName("search - Should search workplaces with price range filter")
    void testSearch_PriceRangeFilter() {
        // Arrange
        WorkplaceFilterRequest filter = new WorkplaceFilterRequest();
        filter.setMinPrice(new BigDecimal("20000"));
        filter.setMaxPrice(new BigDecimal("30000"));

        Pageable pageable = PageRequest.of(0, 10);
        List<Workplace> workplaceList = new ArrayList<>();
        workplaceList.add(testWorkplace);
        Page<Workplace> workplacePage = new PageImpl<>(workplaceList, pageable, 1);

        when(workplaceRepository.search(filter, pageable)).thenReturn(workplacePage);

        // Act
        Page<WorkplaceResponse> result = workplaceService.search(filter, pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1);

        verify(workplaceRepository, times(1)).search(filter, pageable);
    }

    @Test
    @DisplayName("search - Should return empty page when no results")
    void testSearch_NoResults() {
        // Arrange
        WorkplaceFilterRequest filter = new WorkplaceFilterRequest();
        filter.setCity("NonexistentCity");

        Pageable pageable = PageRequest.of(0, 10);
        Page<Workplace> emptyPage = new PageImpl<>(new ArrayList<>(), pageable, 0);

        when(workplaceRepository.search(filter, pageable)).thenReturn(emptyPage);

        // Act
        Page<WorkplaceResponse> result = workplaceService.search(filter, pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .isEmpty();

        verify(workplaceRepository, times(1)).search(filter, pageable);
    }

    @Test
    @DisplayName("search - Should search with workplace type filter")
    void testSearch_WorkplaceTypeFilter() {
        // Arrange
        WorkplaceFilterRequest filter = new WorkplaceFilterRequest();
        filter.setWorkplaceType(WorkplaceType.OFFICE);

        Pageable pageable = PageRequest.of(0, 10);
        List<Workplace> workplaceList = new ArrayList<>();
        workplaceList.add(testWorkplace);
        Page<Workplace> workplacePage = new PageImpl<>(workplaceList, pageable, 1);

        when(workplaceRepository.search(filter, pageable)).thenReturn(workplacePage);

        // Act
        Page<WorkplaceResponse> result = workplaceService.search(filter, pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1);

        verify(workplaceRepository, times(1)).search(filter, pageable);
    }

    @Test
    @DisplayName("search - Should search with square meter range filter")
    void testSearch_SquareMeterRangeFilter() {
        // Arrange
        WorkplaceFilterRequest filter = new WorkplaceFilterRequest();
        filter.setMinSquareMeter(100);
        filter.setMaxSquareMeter(200);

        Pageable pageable = PageRequest.of(0, 10);
        List<Workplace> workplaceList = new ArrayList<>();
        workplaceList.add(testWorkplace);
        Page<Workplace> workplacePage = new PageImpl<>(workplaceList, pageable, 1);

        when(workplaceRepository.search(filter, pageable)).thenReturn(workplacePage);

        // Act
        Page<WorkplaceResponse> result = workplaceService.search(filter, pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1);

        verify(workplaceRepository, times(1)).search(filter, pageable);
    }
}
