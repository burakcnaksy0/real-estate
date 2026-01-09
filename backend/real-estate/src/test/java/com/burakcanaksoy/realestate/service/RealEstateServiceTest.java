package com.burakcanaksoy.realestate.service;

import com.burakcanaksoy.realestate.model.Category;
import com.burakcanaksoy.realestate.model.RealEstate;
import com.burakcanaksoy.realestate.model.User;
import com.burakcanaksoy.realestate.model.enums.Currency;
import com.burakcanaksoy.realestate.model.enums.HeatingType;
import com.burakcanaksoy.realestate.model.enums.RealEstateType;
import com.burakcanaksoy.realestate.model.enums.Role;
import com.burakcanaksoy.realestate.repository.CategoryRepository;
import com.burakcanaksoy.realestate.repository.RealEstateRepository;
import com.burakcanaksoy.realestate.request.RealEstateCreateRequest;
import com.burakcanaksoy.realestate.request.RealEstateFilterRequest;
import com.burakcanaksoy.realestate.request.RealEstateUpdateRequest;
import com.burakcanaksoy.realestate.response.RealEstateResponse;
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
 * Unit tests for RealEstateService
 *
 * This test class covers all methods of RealEstateService.
 * 
 * @Mock: Mocks the repository and auth service dependencies
 * @InjectMocks: Creates RealEstateService and injects mocked dependencies
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("RealEstateService Unit Tests")
class RealEstateServiceTest {

    @Mock
    private RealEstateRepository realEstateRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private AuthService authService;

    @InjectMocks
    private RealEstateService realEstateService;

    private RealEstate testRealEstate;
    private RealEstateResponse testRealEstateResponse;
    private RealEstateCreateRequest realEstateCreateRequest;
    private RealEstateUpdateRequest realEstateUpdateRequest;
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
        testCategory.setName("Real Estate");
        testCategory.setSlug("real-estate");
        testCategory.setActive(true);

        // Prepare test real estate entity
        testRealEstate = new RealEstate();
        testRealEstate.setId(1L);
        testRealEstate.setTitle("Luxury Apartment in Istanbul");
        testRealEstate.setDescription("Beautiful 3+1 apartment with sea view");
        testRealEstate.setPrice(new BigDecimal("750000.00"));
        testRealEstate.setCurrency(Currency.USD);
        testRealEstate.setCategory(testCategory);
        testRealEstate.setCity("Istanbul");
        testRealEstate.setDistrict("Besiktas");
        testRealEstate.setRealEstateType(RealEstateType.APARTMENT);
        testRealEstate.setRoomCount(4);
        testRealEstate.setSquareMeter(150);
        testRealEstate.setBuildingAge(5);
        testRealEstate.setFloor(8);
        testRealEstate.setHeatingType(HeatingType.CENTRAL_HEATING);
        testRealEstate.setFurnished(true);
        testRealEstate.setCreatedBy(testUser);

        // Prepare test real estate response
        testRealEstateResponse = new RealEstateResponse();
        testRealEstateResponse.setId(1L);
        testRealEstateResponse.setTitle("Luxury Apartment in Istanbul");
        testRealEstateResponse.setDescription("Beautiful 3+1 apartment with sea view");
        testRealEstateResponse.setPrice(new BigDecimal("750000.00"));
        testRealEstateResponse.setCurrency(Currency.USD);
        testRealEstateResponse.setCategorySlug("real-estate");
        testRealEstateResponse.setCity("Istanbul");
        testRealEstateResponse.setDistrict("Besiktas");
        testRealEstateResponse.setRealEstateType(RealEstateType.APARTMENT);
        testRealEstateResponse.setRoomCount(4);
        testRealEstateResponse.setSquareMeter(150);
        testRealEstateResponse.setBuildingAge(5);
        testRealEstateResponse.setFloor(8);
        testRealEstateResponse.setHeatingType(HeatingType.CENTRAL_HEATING);
        testRealEstateResponse.setFurnished(true);
        testRealEstateResponse.setOwnerId(1L);
        testRealEstateResponse.setOwnerUsername("testuser");

        // Prepare create request
        realEstateCreateRequest = new RealEstateCreateRequest();
        realEstateCreateRequest.setTitle("Luxury Apartment in Istanbul");
        realEstateCreateRequest.setDescription("Beautiful 3+1 apartment with sea view");
        realEstateCreateRequest.setPrice(new BigDecimal("750000.00"));
        realEstateCreateRequest.setCurrency(Currency.USD);
        realEstateCreateRequest.setCategorySlug("real-estate");
        realEstateCreateRequest.setCity("Istanbul");
        realEstateCreateRequest.setDistrict("Besiktas");
        realEstateCreateRequest.setRealEstateType(RealEstateType.APARTMENT);
        realEstateCreateRequest.setRoomCount(4);
        realEstateCreateRequest.setSquareMeter(150);
        realEstateCreateRequest.setBuildingAge(5);
        realEstateCreateRequest.setFloor(8);
        realEstateCreateRequest.setHeatingType(HeatingType.CENTRAL_HEATING);
        realEstateCreateRequest.setFurnished(true);

        // Prepare update request
        realEstateUpdateRequest = new RealEstateUpdateRequest();
        realEstateUpdateRequest.setTitle("Updated Luxury Apartment");
        realEstateUpdateRequest.setDescription("Updated description");
        realEstateUpdateRequest.setPrice(new BigDecimal("800000.00"));
        realEstateUpdateRequest.setCurrency(Currency.TRY);
        realEstateUpdateRequest.setCity("Ankara");
        realEstateUpdateRequest.setDistrict("Cankaya");
        realEstateUpdateRequest.setRoomCount(5);
        realEstateUpdateRequest.setSquareMeter(180);
    }

    // ============ getAllRealEstates() Tests ============

    @Test
    @DisplayName("getAllRealEstates - Should return all real estates successfully")
    void testGetAllRealEstates_Success() {
        // Arrange
        List<RealEstate> realEstateList = new ArrayList<>();
        realEstateList.add(testRealEstate);
        when(realEstateRepository.findAll()).thenReturn(realEstateList);

        // Act
        List<RealEstateResponse> result = realEstateService.getAllRealEstates();

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1)
                .extracting(RealEstateResponse::getTitle)
                .contains("Luxury Apartment in Istanbul");

        verify(realEstateRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("getAllRealEstates - Should return empty list when no real estates exist")
    void testGetAllRealEstates_EmptyList() {
        // Arrange
        when(realEstateRepository.findAll()).thenReturn(new ArrayList<>());

        // Act
        List<RealEstateResponse> result = realEstateService.getAllRealEstates();

        // Assert
        assertThat(result)
                .isNotNull()
                .isEmpty();

        verify(realEstateRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("getAllRealEstates - Should return multiple real estates")
    void testGetAllRealEstates_MultipleRealEstates() {
        // Arrange
        RealEstate secondRealEstate = new RealEstate();
        secondRealEstate.setId(2L);
        secondRealEstate.setTitle("Villa in Bodrum");
        secondRealEstate.setDescription("Luxury villa with pool");
        secondRealEstate.setPrice(new BigDecimal("2000000.00"));
        secondRealEstate.setCurrency(Currency.USD);
        secondRealEstate.setCategory(testCategory);
        secondRealEstate.setCity("Mugla");
        secondRealEstate.setDistrict("Bodrum");
        secondRealEstate.setRealEstateType(RealEstateType.VILLA);
        secondRealEstate.setRoomCount(7);
        secondRealEstate.setSquareMeter(350);
        secondRealEstate.setBuildingAge(2);
        secondRealEstate.setCreatedBy(testUser);

        List<RealEstate> realEstateList = new ArrayList<>();
        realEstateList.add(testRealEstate);
        realEstateList.add(secondRealEstate);
        when(realEstateRepository.findAll()).thenReturn(realEstateList);

        // Act
        List<RealEstateResponse> result = realEstateService.getAllRealEstates();

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(2);

        verify(realEstateRepository, times(1)).findAll();
    }

    // ============ getAllRealEstates(Pageable) Tests ============

    @Test
    @DisplayName("getAllRealEstates(Pageable) - Should return paginated real estates successfully")
    void testGetAllRealEstatesWithPagination_Success() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        List<RealEstate> realEstateList = new ArrayList<>();
        realEstateList.add(testRealEstate);
        Page<RealEstate> realEstatePage = new PageImpl<>(realEstateList, pageable, 1);

        when(realEstateRepository.findAll(pageable)).thenReturn(realEstatePage);

        // Act
        Page<RealEstateResponse> result = realEstateService.getAllRealEstates(pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1)
                .extracting(RealEstateResponse::getTitle)
                .contains("Luxury Apartment in Istanbul");

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getNumber()).isEqualTo(0);

        verify(realEstateRepository, times(1)).findAll(pageable);
    }

    @Test
    @DisplayName("getAllRealEstates(Pageable) - Should return empty page when no real estates exist")
    void testGetAllRealEstatesWithPagination_EmptyPage() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<RealEstate> emptyPage = new PageImpl<>(new ArrayList<>(), pageable, 0);

        when(realEstateRepository.findAll(pageable)).thenReturn(emptyPage);

        // Act
        Page<RealEstateResponse> result = realEstateService.getAllRealEstates(pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .isEmpty();

        assertThat(result.getTotalElements()).isEqualTo(0);

        verify(realEstateRepository, times(1)).findAll(pageable);
    }

    @Test
    @DisplayName("getAllRealEstates(Pageable) - Should return correct page information")
    void testGetAllRealEstatesWithPagination_PageInfo() {
        // Arrange
        Pageable pageable = PageRequest.of(1, 5);
        List<RealEstate> realEstateList = new ArrayList<>();
        realEstateList.add(testRealEstate);
        Page<RealEstate> realEstatePage = new PageImpl<>(realEstateList, pageable, 15);

        when(realEstateRepository.findAll(pageable)).thenReturn(realEstatePage);

        // Act
        Page<RealEstateResponse> result = realEstateService.getAllRealEstates(pageable);

        // Assert
        assertThat(result.getTotalElements()).isEqualTo(15);
        assertThat(result.getTotalPages()).isEqualTo(3);
        assertThat(result.getNumber()).isEqualTo(1);
        assertThat(result.getSize()).isEqualTo(5);

        verify(realEstateRepository, times(1)).findAll(pageable);
    }

    // ============ createRealEstate() Tests ============

    @Test
    @DisplayName("createRealEstate - Should create real estate successfully")
    void testCreateRealEstate_Success() {
        // Arrange
        when(categoryRepository.findBySlug("real-estate")).thenReturn(Optional.of(testCategory));
        when(authService.getCurrentUser()).thenReturn(testUser);
        when(realEstateRepository.save(any(RealEstate.class))).thenReturn(testRealEstate);

        // Act
        RealEstateResponse result = realEstateService.createRealEstate(realEstateCreateRequest);

        // Assert
        assertThat(result)
                .isNotNull()
                .extracting(RealEstateResponse::getTitle, RealEstateResponse::getCity)
                .containsExactly("Luxury Apartment in Istanbul", "Istanbul");

        verify(categoryRepository, times(1)).findBySlug("real-estate");
        verify(authService, times(1)).getCurrentUser();
        verify(realEstateRepository, times(1)).save(any(RealEstate.class));
    }

    @Test
    @DisplayName("createRealEstate - Should throw exception when category not found")
    void testCreateRealEstate_CategoryNotFound() {
        // Arrange
        when(categoryRepository.findBySlug("real-estate")).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> realEstateService.createRealEstate(realEstateCreateRequest))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Category not found with slug: real-estate");

        verify(categoryRepository, times(1)).findBySlug("real-estate");
        verify(authService, never()).getCurrentUser();
        verify(realEstateRepository, never()).save(any());
    }

    @Test
    @DisplayName("createRealEstate - Should set current user as creator")
    void testCreateRealEstate_SetCreator() {
        // Arrange
        when(categoryRepository.findBySlug("real-estate")).thenReturn(Optional.of(testCategory));
        when(authService.getCurrentUser()).thenReturn(testUser);
        when(realEstateRepository.save(any(RealEstate.class))).thenReturn(testRealEstate);

        // Act
        realEstateService.createRealEstate(realEstateCreateRequest);

        // Assert
        verify(authService, times(1)).getCurrentUser();
        verify(realEstateRepository, times(1)).save(any(RealEstate.class));
    }

    // ============ getRealEstateById() Tests ============

    @Test
    @DisplayName("getRealEstateById - Should retrieve real estate by ID successfully")
    void testGetRealEstateById_Success() {
        // Arrange
        Long realEstateId = 1L;
        when(realEstateRepository.findById(realEstateId)).thenReturn(Optional.of(testRealEstate));

        // Act
        RealEstateResponse result = realEstateService.getRealEstateById(realEstateId);

        // Assert
        assertThat(result)
                .isNotNull()
                .extracting(RealEstateResponse::getId, RealEstateResponse::getTitle)
                .containsExactly(1L, "Luxury Apartment in Istanbul");

        verify(realEstateRepository, times(1)).findById(realEstateId);
    }

    @Test
    @DisplayName("getRealEstateById - Should throw exception when real estate not found")
    void testGetRealEstateById_NotFound() {
        // Arrange
        Long realEstateId = 999L;
        when(realEstateRepository.findById(realEstateId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> realEstateService.getRealEstateById(realEstateId))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Real Estate not found with this id : 999");

        verify(realEstateRepository, times(1)).findById(realEstateId);
    }

    // ============ deleteRealEstate() Tests ============

    @Test
    @DisplayName("deleteRealEstate - Should delete real estate by owner successfully")
    void testDeleteRealEstate_ByOwner_Success() {
        // Arrange
        Long realEstateId = 1L;
        when(authService.getCurrentUser()).thenReturn(testUser);
        when(realEstateRepository.findById(realEstateId)).thenReturn(Optional.of(testRealEstate));

        // Act
        realEstateService.deleteRealEstate(realEstateId);

        // Assert
        verify(realEstateRepository, times(1)).findById(realEstateId);
        verify(realEstateRepository, times(1)).delete(testRealEstate);
    }

    @Test
    @DisplayName("deleteRealEstate - Should delete real estate by admin successfully")
    void testDeleteRealEstate_ByAdmin_Success() {
        // Arrange
        Long realEstateId = 1L;
        User adminUser = new User();
        adminUser.setId(2L);
        adminUser.setUsername("admin");
        Set<Role> adminRoles = new HashSet<>();
        adminRoles.add(Role.ROLE_ADMIN);
        adminUser.setRoles(adminRoles);

        when(authService.getCurrentUser()).thenReturn(adminUser);
        when(realEstateRepository.findById(realEstateId)).thenReturn(Optional.of(testRealEstate));

        // Act
        realEstateService.deleteRealEstate(realEstateId);

        // Assert
        verify(realEstateRepository, times(1)).findById(realEstateId);
        verify(realEstateRepository, times(1)).delete(testRealEstate);
    }

    @Test
    @DisplayName("deleteRealEstate - Should throw exception when real estate not found")
    void testDeleteRealEstate_NotFound() {
        // Arrange
        Long realEstateId = 999L;
        when(authService.getCurrentUser()).thenReturn(testUser);
        when(realEstateRepository.findById(realEstateId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> realEstateService.deleteRealEstate(realEstateId))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Real Estate not found with this id : 999");

        verify(realEstateRepository, never()).delete(any());
    }

    @Test
    @DisplayName("deleteRealEstate - Should throw exception when user is not owner or admin")
    void testDeleteRealEstate_UnauthorizedUser() {
        // Arrange
        Long realEstateId = 1L;
        User unauthorizedUser = new User();
        unauthorizedUser.setId(99L);
        unauthorizedUser.setUsername("unauthorized");
        Set<Role> userRoles = new HashSet<>();
        userRoles.add(Role.ROLE_USER);
        unauthorizedUser.setRoles(userRoles);

        when(authService.getCurrentUser()).thenReturn(unauthorizedUser);
        when(realEstateRepository.findById(realEstateId)).thenReturn(Optional.of(testRealEstate));

        // Act & Assert
        assertThatThrownBy(() -> realEstateService.deleteRealEstate(realEstateId))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("You are not allowed to modify this realEstate");

        verify(realEstateRepository, never()).delete(any());
    }

    // ============ updateRealEstate() Tests ============

    @Test
    @DisplayName("updateRealEstate - Should update all real estate fields successfully")
    void testUpdateRealEstate_AllFields_Success() {
        // Arrange
        Long realEstateId = 1L;
        realEstateUpdateRequest.setCategorySlug("real-estate");
        Category updatedCategory = new Category();
        updatedCategory.setId(1L);
        updatedCategory.setSlug("real-estate");

        when(authService.getCurrentUser()).thenReturn(testUser);
        when(realEstateRepository.findById(realEstateId)).thenReturn(Optional.of(testRealEstate));
        when(categoryRepository.findBySlug("real-estate")).thenReturn(Optional.of(updatedCategory));
        when(realEstateRepository.save(any(RealEstate.class))).thenReturn(testRealEstate);

        // Act
        RealEstateResponse result = realEstateService.updateRealEstate(realEstateId, realEstateUpdateRequest);

        // Assert
        assertThat(result).isNotNull();
        verify(realEstateRepository, times(1)).findById(realEstateId);
        verify(realEstateRepository, times(1)).save(any(RealEstate.class));
    }

    @Test
    @DisplayName("updateRealEstate - Should update only title field")
    void testUpdateRealEstate_OnlyTitle() {
        // Arrange
        Long realEstateId = 1L;
        RealEstateUpdateRequest partialRequest = new RealEstateUpdateRequest();
        partialRequest.setTitle("New Title");

        when(authService.getCurrentUser()).thenReturn(testUser);
        when(realEstateRepository.findById(realEstateId)).thenReturn(Optional.of(testRealEstate));
        when(realEstateRepository.save(any(RealEstate.class))).thenReturn(testRealEstate);

        // Act
        RealEstateResponse result = realEstateService.updateRealEstate(realEstateId, partialRequest);

        // Assert
        assertThat(result).isNotNull();
        verify(realEstateRepository, times(1)).save(any(RealEstate.class));
    }

    @Test
    @DisplayName("updateRealEstate - Should update price field")
    void testUpdateRealEstate_OnlyPrice() {
        // Arrange
        Long realEstateId = 1L;
        RealEstateUpdateRequest priceRequest = new RealEstateUpdateRequest();
        priceRequest.setPrice(new BigDecimal("900000.00"));

        when(authService.getCurrentUser()).thenReturn(testUser);
        when(realEstateRepository.findById(realEstateId)).thenReturn(Optional.of(testRealEstate));
        when(realEstateRepository.save(any(RealEstate.class))).thenReturn(testRealEstate);

        // Act
        realEstateService.updateRealEstate(realEstateId, priceRequest);

        // Assert
        verify(realEstateRepository, times(1)).save(any(RealEstate.class));
    }

    @Test
    @DisplayName("updateRealEstate - Should update real estate-specific fields")
    void testUpdateRealEstate_RealEstateSpecificFields() {
        // Arrange
        Long realEstateId = 1L;
        RealEstateUpdateRequest realEstateSpecificRequest = new RealEstateUpdateRequest();
        realEstateSpecificRequest.setRealEstateType(RealEstateType.VILLA);
        realEstateSpecificRequest.setRoomCount(7);
        realEstateSpecificRequest.setSquareMeter(250);
        realEstateSpecificRequest.setBuildingAge(3);
        realEstateSpecificRequest.setFloor(2);
        realEstateSpecificRequest.setHeatingType(HeatingType.CENTRAL_HEATING);
        realEstateSpecificRequest.setFurnished(false);

        when(authService.getCurrentUser()).thenReturn(testUser);
        when(realEstateRepository.findById(realEstateId)).thenReturn(Optional.of(testRealEstate));
        when(realEstateRepository.save(any(RealEstate.class))).thenReturn(testRealEstate);

        // Act
        realEstateService.updateRealEstate(realEstateId, realEstateSpecificRequest);

        // Assert
        verify(realEstateRepository, times(1)).save(any(RealEstate.class));
    }

    @Test
    @DisplayName("updateRealEstate - Should update category by slug")
    void testUpdateRealEstate_UpdateCategory() {
        // Arrange
        Long realEstateId = 1L;
        RealEstateUpdateRequest categoryRequest = new RealEstateUpdateRequest();
        categoryRequest.setCategorySlug("commercial");
        Category newCategory = new Category();
        newCategory.setId(2L);
        newCategory.setSlug("commercial");

        when(authService.getCurrentUser()).thenReturn(testUser);
        when(realEstateRepository.findById(realEstateId)).thenReturn(Optional.of(testRealEstate));
        when(categoryRepository.findBySlug("commercial")).thenReturn(Optional.of(newCategory));
        when(realEstateRepository.save(any(RealEstate.class))).thenReturn(testRealEstate);

        // Act
        realEstateService.updateRealEstate(realEstateId, categoryRequest);

        // Assert
        verify(categoryRepository, times(1)).findBySlug("commercial");
        verify(realEstateRepository, times(1)).save(any(RealEstate.class));
    }

    @Test
    @DisplayName("updateRealEstate - Should throw exception when real estate not found")
    void testUpdateRealEstate_NotFound() {
        // Arrange
        Long realEstateId = 999L;
        when(authService.getCurrentUser()).thenReturn(testUser);
        when(realEstateRepository.findById(realEstateId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> realEstateService.updateRealEstate(realEstateId, realEstateUpdateRequest))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Real estate not found with id: 999");

        verify(realEstateRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateRealEstate - Should throw exception when user is not owner or admin")
    void testUpdateRealEstate_UnauthorizedUser() {
        // Arrange
        Long realEstateId = 1L;
        User unauthorizedUser = new User();
        unauthorizedUser.setId(99L);
        unauthorizedUser.setUsername("unauthorized");
        Set<Role> userRoles = new HashSet<>();
        userRoles.add(Role.ROLE_USER);
        unauthorizedUser.setRoles(userRoles);

        when(authService.getCurrentUser()).thenReturn(unauthorizedUser);
        when(realEstateRepository.findById(realEstateId)).thenReturn(Optional.of(testRealEstate));

        // Act & Assert
        assertThatThrownBy(() -> realEstateService.updateRealEstate(realEstateId, realEstateUpdateRequest))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("You are not allowed to modify this realEstate");

        verify(realEstateRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateRealEstate - Should throw exception when category not found")
    void testUpdateRealEstate_CategoryNotFound() {
        // Arrange
        Long realEstateId = 1L;
        RealEstateUpdateRequest categoryRequest = new RealEstateUpdateRequest();
        categoryRequest.setCategorySlug("nonexistent");

        when(authService.getCurrentUser()).thenReturn(testUser);
        when(realEstateRepository.findById(realEstateId)).thenReturn(Optional.of(testRealEstate));
        when(categoryRepository.findBySlug("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> realEstateService.updateRealEstate(realEstateId, categoryRequest))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Category not found with slug: nonexistent");

        verify(realEstateRepository, never()).save(any());
    }

    // ============ search() Tests ============

    @Test
    @DisplayName("search - Should search real estates with all filters")
    void testSearch_AllFilters_Success() {
        // Arrange
        RealEstateFilterRequest filter = new RealEstateFilterRequest();
        filter.setCity("Istanbul");
        filter.setDistrict("Besiktas");
        filter.setCategorySlug("real-estate");
        filter.setMinPrice(new BigDecimal("100000"));
        filter.setMaxPrice(new BigDecimal("1000000"));
        filter.setRealEstateType(RealEstateType.APARTMENT);
        filter.setMinSquareMeter(100);
        filter.setMaxSquareMeter(200);
        filter.setMinBuildingAge(0);
        filter.setMaxBuildingAge(10);

        Pageable pageable = PageRequest.of(0, 10);
        List<RealEstate> realEstateList = new ArrayList<>();
        realEstateList.add(testRealEstate);
        Page<RealEstate> realEstatePage = new PageImpl<>(realEstateList, pageable, 1);

        when(realEstateRepository.search(filter, pageable)).thenReturn(realEstatePage);

        // Act
        Page<RealEstateResponse> result = realEstateService.search(filter, pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1);

        verify(realEstateRepository, times(1)).search(filter, pageable);
    }

    @Test
    @DisplayName("search - Should search real estates with city filter only")
    void testSearch_CityFilterOnly() {
        // Arrange
        RealEstateFilterRequest filter = new RealEstateFilterRequest();
        filter.setCity("Istanbul");

        Pageable pageable = PageRequest.of(0, 10);
        List<RealEstate> realEstateList = new ArrayList<>();
        realEstateList.add(testRealEstate);
        Page<RealEstate> realEstatePage = new PageImpl<>(realEstateList, pageable, 1);

        when(realEstateRepository.search(filter, pageable)).thenReturn(realEstatePage);

        // Act
        Page<RealEstateResponse> result = realEstateService.search(filter, pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1);

        verify(realEstateRepository, times(1)).search(filter, pageable);
    }

    @Test
    @DisplayName("search - Should search real estates with price range filter")
    void testSearch_PriceRangeFilter() {
        // Arrange
        RealEstateFilterRequest filter = new RealEstateFilterRequest();
        filter.setMinPrice(new BigDecimal("700000"));
        filter.setMaxPrice(new BigDecimal("800000"));

        Pageable pageable = PageRequest.of(0, 10);
        List<RealEstate> realEstateList = new ArrayList<>();
        realEstateList.add(testRealEstate);
        Page<RealEstate> realEstatePage = new PageImpl<>(realEstateList, pageable, 1);

        when(realEstateRepository.search(filter, pageable)).thenReturn(realEstatePage);

        // Act
        Page<RealEstateResponse> result = realEstateService.search(filter, pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1);

        verify(realEstateRepository, times(1)).search(filter, pageable);
    }

    @Test
    @DisplayName("search - Should return empty page when no results")
    void testSearch_NoResults() {
        // Arrange
        RealEstateFilterRequest filter = new RealEstateFilterRequest();
        filter.setCity("NonexistentCity");

        Pageable pageable = PageRequest.of(0, 10);
        Page<RealEstate> emptyPage = new PageImpl<>(new ArrayList<>(), pageable, 0);

        when(realEstateRepository.search(filter, pageable)).thenReturn(emptyPage);

        // Act
        Page<RealEstateResponse> result = realEstateService.search(filter, pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .isEmpty();

        verify(realEstateRepository, times(1)).search(filter, pageable);
    }

    @Test
    @DisplayName("search - Should search with real estate type filter")
    void testSearch_RealEstateTypeFilter() {
        // Arrange
        RealEstateFilterRequest filter = new RealEstateFilterRequest();
        filter.setRealEstateType(RealEstateType.VILLA);

        Pageable pageable = PageRequest.of(0, 10);
        List<RealEstate> realEstateList = new ArrayList<>();
        realEstateList.add(testRealEstate);
        Page<RealEstate> realEstatePage = new PageImpl<>(realEstateList, pageable, 1);

        when(realEstateRepository.search(filter, pageable)).thenReturn(realEstatePage);

        // Act
        Page<RealEstateResponse> result = realEstateService.search(filter, pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1);

        verify(realEstateRepository, times(1)).search(filter, pageable);
    }

    @Test
    @DisplayName("search - Should search with square meter range filter")
    void testSearch_SquareMeterRangeFilter() {
        // Arrange
        RealEstateFilterRequest filter = new RealEstateFilterRequest();
        filter.setMinSquareMeter(100);
        filter.setMaxSquareMeter(200);

        Pageable pageable = PageRequest.of(0, 10);
        List<RealEstate> realEstateList = new ArrayList<>();
        realEstateList.add(testRealEstate);
        Page<RealEstate> realEstatePage = new PageImpl<>(realEstateList, pageable, 1);

        when(realEstateRepository.search(filter, pageable)).thenReturn(realEstatePage);

        // Act
        Page<RealEstateResponse> result = realEstateService.search(filter, pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1);

        verify(realEstateRepository, times(1)).search(filter, pageable);
    }

    @Test
    @DisplayName("search - Should search with building age range filter")
    void testSearch_BuildingAgeRangeFilter() {
        // Arrange
        RealEstateFilterRequest filter = new RealEstateFilterRequest();
        filter.setMinBuildingAge(0);
        filter.setMaxBuildingAge(10);

        Pageable pageable = PageRequest.of(0, 10);
        List<RealEstate> realEstateList = new ArrayList<>();
        realEstateList.add(testRealEstate);
        Page<RealEstate> realEstatePage = new PageImpl<>(realEstateList, pageable, 1);

        when(realEstateRepository.search(filter, pageable)).thenReturn(realEstatePage);

        // Act
        Page<RealEstateResponse> result = realEstateService.search(filter, pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1);

        verify(realEstateRepository, times(1)).search(filter, pageable);
    }

    @Test
    @DisplayName("search - Should search with room count filter")
    void testSearch_RoomCountFilter() {
        // Arrange
        RealEstateFilterRequest filter = new RealEstateFilterRequest();
        filter.setMinRoomCount(4);

        Pageable pageable = PageRequest.of(0, 10);
        List<RealEstate> realEstateList = new ArrayList<>();
        realEstateList.add(testRealEstate);
        Page<RealEstate> realEstatePage = new PageImpl<>(realEstateList, pageable, 1);

        when(realEstateRepository.search(filter, pageable)).thenReturn(realEstatePage);

        // Act
        Page<RealEstateResponse> result = realEstateService.search(filter, pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1);

        verify(realEstateRepository, times(1)).search(filter, pageable);
    }
}
