package com.burakcanaksoy.realestate.service;

import com.burakcanaksoy.realestate.model.Category;
import com.burakcanaksoy.realestate.model.User;
import com.burakcanaksoy.realestate.model.Vehicle;
import com.burakcanaksoy.realestate.model.enums.Currency;
import com.burakcanaksoy.realestate.model.enums.FuelType;
import com.burakcanaksoy.realestate.model.enums.Role;
import com.burakcanaksoy.realestate.model.enums.Transmission;
import com.burakcanaksoy.realestate.repository.CategoryRepository;
import com.burakcanaksoy.realestate.repository.VehicleRepository;
import com.burakcanaksoy.realestate.request.VehicleCreateRequest;
import com.burakcanaksoy.realestate.request.VehicleFilterRequest;
import com.burakcanaksoy.realestate.request.VehicleUpdateRequest;
import com.burakcanaksoy.realestate.response.VehicleResponse;
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
 * Unit tests for VehicleService
 *
 * This test class covers all methods of VehicleService.
 * 
 * @Mock: Mocks the repository and auth service dependencies
 * @InjectMocks: Creates VehicleService and injects mocked dependencies
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("VehicleService Unit Tests")
public class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private AuthService authService;

    @InjectMocks
    private VehicleService vehicleService;

    private Vehicle testVehicle;
    private VehicleCreateRequest vehicleCreateRequest;
    private VehicleUpdateRequest vehicleUpdateRequest;
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
        testCategory.setName("Vehicle");
        testCategory.setSlug("arac");
        testCategory.setActive(true);

        // Prepare test vehicle entity
        testVehicle = new Vehicle();
        testVehicle.setId(1L);
        testVehicle.setTitle("2020 Toyota Corolla");
        testVehicle.setDescription("Well maintained, low mileage");
        testVehicle.setPrice(new BigDecimal("450000.00"));
        testVehicle.setCurrency(Currency.TRY);
        testVehicle.setCategory(testCategory);
        testVehicle.setCity("Istanbul");
        testVehicle.setDistrict("Kadikoy");
        testVehicle.setBrand("Toyota");
        testVehicle.setModel("Corolla");
        testVehicle.setYear(2020);
        testVehicle.setFuelType(FuelType.HYBRID);
        testVehicle.setTransmission(Transmission.AUTOMATIC);
        testVehicle.setKilometer(35000);
        testVehicle.setEngineVolume("1.8");
        testVehicle.setCreatedBy(testUser);

        // Prepare create request
        vehicleCreateRequest = new VehicleCreateRequest();
        vehicleCreateRequest.setTitle("2020 Toyota Corolla");
        vehicleCreateRequest.setDescription("Well maintained, low mileage");
        vehicleCreateRequest.setPrice(new BigDecimal("450000.00"));
        vehicleCreateRequest.setCurrency(Currency.TRY);
        vehicleCreateRequest.setCategorySlug("arac");
        vehicleCreateRequest.setCity("Istanbul");
        vehicleCreateRequest.setDistrict("Kadikoy");
        vehicleCreateRequest.setBrand("Toyota");
        vehicleCreateRequest.setModel("Corolla");
        vehicleCreateRequest.setYear(2020);
        vehicleCreateRequest.setFuelType(FuelType.HYBRID);
        vehicleCreateRequest.setTransmission(Transmission.AUTOMATIC);
        vehicleCreateRequest.setKilometer(35000);
        vehicleCreateRequest.setEngineVolume("1.8");

        // Prepare update request
        vehicleUpdateRequest = new VehicleUpdateRequest();
        vehicleUpdateRequest.setTitle("2020 Toyota Corolla - Updated");
        vehicleUpdateRequest.setDescription("Updated description");
        vehicleUpdateRequest.setPrice(new BigDecimal("440000.00"));
        vehicleUpdateRequest.setCurrency(Currency.USD);
        vehicleUpdateRequest.setCity("Ankara");
        vehicleUpdateRequest.setDistrict("Cankaya");
    }

    // ============ getAllVehicles() Tests ============

    @Test
    @DisplayName("getAllVehicles - Should return all vehicles successfully")
    void testGetAllVehicles_Success() {
        // Arrange
        List<Vehicle> vehicleList = new ArrayList<>();
        vehicleList.add(testVehicle);
        when(vehicleRepository.findAll()).thenReturn(vehicleList);

        // Act
        List<VehicleResponse> result = vehicleService.getAllVehicles();

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1)
                .extracting(VehicleResponse::getTitle)
                .contains("2020 Toyota Corolla");

        verify(vehicleRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("getAllVehicles - Should return empty list when no vehicles exist")
    void testGetAllVehicles_EmptyList() {
        // Arrange
        when(vehicleRepository.findAll()).thenReturn(new ArrayList<>());

        // Act
        List<VehicleResponse> result = vehicleService.getAllVehicles();

        // Assert
        assertThat(result)
                .isNotNull()
                .isEmpty();

        verify(vehicleRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("getAllVehicles - Should return multiple vehicles")
    void testGetAllVehicles_MultipleVehicles() {
        // Arrange
        Vehicle secondVehicle = new Vehicle();
        secondVehicle.setId(2L);
        secondVehicle.setTitle("2019 Honda Civic");
        secondVehicle.setDescription("Excellent condition");
        secondVehicle.setPrice(new BigDecimal("380000.00"));
        secondVehicle.setCurrency(Currency.TRY);
        secondVehicle.setCategory(testCategory);
        secondVehicle.setCity("Izmir");
        secondVehicle.setDistrict("Bornova");
        secondVehicle.setBrand("Honda");
        secondVehicle.setModel("Civic");
        secondVehicle.setYear(2019);
        secondVehicle.setFuelType(FuelType.GASOLINE);
        secondVehicle.setTransmission(Transmission.MANUAL);
        secondVehicle.setKilometer(50000);
        secondVehicle.setEngineVolume("1.6");
        secondVehicle.setCreatedBy(testUser);

        List<Vehicle> vehicleList = new ArrayList<>();
        vehicleList.add(testVehicle);
        vehicleList.add(secondVehicle);
        when(vehicleRepository.findAll()).thenReturn(vehicleList);

        // Act
        List<VehicleResponse> result = vehicleService.getAllVehicles();

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(2);

        verify(vehicleRepository, times(1)).findAll();
    }

    // ============ getAllVehicles(Pageable) Tests ============

    @Test
    @DisplayName("getAllVehicles(Pageable) - Should return paginated vehicles successfully")
    void testGetAllVehiclesWithPagination_Success() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        List<Vehicle> vehicleList = new ArrayList<>();
        vehicleList.add(testVehicle);
        Page<Vehicle> vehiclePage = new PageImpl<>(vehicleList, pageable, 1);

        when(vehicleRepository.findAll(pageable)).thenReturn(vehiclePage);

        // Act
        Page<VehicleResponse> result = vehicleService.getAllVehicles(pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1)
                .extracting(VehicleResponse::getTitle)
                .contains("2020 Toyota Corolla");

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getNumber()).isEqualTo(0);

        verify(vehicleRepository, times(1)).findAll(pageable);
    }

    @Test
    @DisplayName("getAllVehicles(Pageable) - Should return empty page when no vehicles exist")
    void testGetAllVehiclesWithPagination_EmptyPage() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<Vehicle> emptyPage = new PageImpl<>(new ArrayList<>(), pageable, 0);

        when(vehicleRepository.findAll(pageable)).thenReturn(emptyPage);

        // Act
        Page<VehicleResponse> result = vehicleService.getAllVehicles(pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .isEmpty();

        assertThat(result.getTotalElements()).isEqualTo(0);

        verify(vehicleRepository, times(1)).findAll(pageable);
    }

    @Test
    @DisplayName("getAllVehicles(Pageable) - Should return correct page information")
    void testGetAllVehiclesWithPagination_PageInfo() {
        // Arrange
        Pageable pageable = PageRequest.of(1, 5);
        List<Vehicle> vehicleList = new ArrayList<>();
        vehicleList.add(testVehicle);
        Page<Vehicle> vehiclePage = new PageImpl<>(vehicleList, pageable, 15);

        when(vehicleRepository.findAll(pageable)).thenReturn(vehiclePage);

        // Act
        Page<VehicleResponse> result = vehicleService.getAllVehicles(pageable);

        // Assert
        assertThat(result.getTotalElements()).isEqualTo(15);
        assertThat(result.getTotalPages()).isEqualTo(3);
        assertThat(result.getNumber()).isEqualTo(1);
        assertThat(result.getSize()).isEqualTo(5);

        verify(vehicleRepository, times(1)).findAll(pageable);
    }

    // ============ createVehicle() Tests ============

    @Test
    @DisplayName("createVehicle - Should create vehicle successfully")
    void testCreateVehicle_Success() {
        // Arrange
        when(categoryRepository.findBySlug("arac")).thenReturn(Optional.of(testCategory));
        when(authService.getCurrentUser()).thenReturn(testUser);
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(testVehicle);

        // Act
        VehicleResponse result = vehicleService.createVehicle(vehicleCreateRequest);

        // Assert
        assertThat(result)
                .isNotNull()
                .extracting(VehicleResponse::getTitle, VehicleResponse::getCity)
                .containsExactly("2020 Toyota Corolla", "Istanbul");

        verify(categoryRepository, times(1)).findBySlug("arac");
        verify(authService, times(1)).getCurrentUser();
        verify(vehicleRepository, times(1)).save(any(Vehicle.class));
    }

    @Test
    @DisplayName("createVehicle - Should throw exception when category not found")
    void testCreateVehicle_CategoryNotFound() {
        // Arrange
        when(authService.getCurrentUser()).thenReturn(testUser);
        when(categoryRepository.findBySlug("arac")).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> vehicleService.createVehicle(vehicleCreateRequest))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Category not found with this slug : arac");

        verify(authService, times(1)).getCurrentUser();
        verify(categoryRepository, times(1)).findBySlug("arac");
        verify(vehicleRepository, never()).save(any());
    }

    @Test
    @DisplayName("createVehicle - Should set current user as creator")
    void testCreateVehicle_SetCreator() {
        // Arrange
        when(categoryRepository.findBySlug("arac")).thenReturn(Optional.of(testCategory));
        when(authService.getCurrentUser()).thenReturn(testUser);
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(testVehicle);

        // Act
        vehicleService.createVehicle(vehicleCreateRequest);

        // Assert
        verify(authService, times(1)).getCurrentUser();
        verify(vehicleRepository, times(1)).save(any(Vehicle.class));
    }

    // ============ getVehicleById() Tests ============

    @Test
    @DisplayName("getVehicleById - Should retrieve vehicle by ID successfully")
    void testGetVehicleById_Success() {
        // Arrange
        Long vehicleId = 1L;
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(testVehicle));

        // Act
        VehicleResponse result = vehicleService.getVehicleById(vehicleId);

        // Assert
        assertThat(result)
                .isNotNull()
                .extracting(VehicleResponse::getId, VehicleResponse::getTitle)
                .containsExactly(1L, "2020 Toyota Corolla");

        verify(vehicleRepository, times(1)).findById(vehicleId);
    }

    @Test
    @DisplayName("getVehicleById - Should throw exception when vehicle not found")
    void testGetVehicleById_NotFound() {
        // Arrange
        Long vehicleId = 999L;
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> vehicleService.getVehicleById(vehicleId))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Vehicle not found with this id : 999");

        verify(vehicleRepository, times(1)).findById(vehicleId);
    }

    // ============ deleteVehicle() Tests ============

    @Test
    @DisplayName("deleteVehicle - Should delete vehicle by owner successfully")
    void testDeleteVehicle_ByOwner_Success() {
        // Arrange
        Long vehicleId = 1L;
        when(authService.getCurrentUser()).thenReturn(testUser);
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(testVehicle));

        // Act
        vehicleService.deleteVehicle(vehicleId);

        // Assert
        verify(vehicleRepository, times(1)).findById(vehicleId);
        verify(vehicleRepository, times(1)).delete(testVehicle);
    }

    @Test
    @DisplayName("deleteVehicle - Should delete vehicle by admin successfully")
    void testDeleteVehicle_ByAdmin_Success() {
        // Arrange
        Long vehicleId = 1L;
        User adminUser = new User();
        adminUser.setId(2L);
        adminUser.setUsername("admin");
        Set<Role> adminRoles = new HashSet<>();
        adminRoles.add(Role.ROLE_ADMIN);
        adminUser.setRoles(adminRoles);

        when(authService.getCurrentUser()).thenReturn(adminUser);
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(testVehicle));

        // Act
        vehicleService.deleteVehicle(vehicleId);

        // Assert
        verify(vehicleRepository, times(1)).findById(vehicleId);
        verify(vehicleRepository, times(1)).delete(testVehicle);
    }

    @Test
    @DisplayName("deleteVehicle - Should throw exception when vehicle not found")
    void testDeleteVehicle_NotFound() {
        // Arrange
        Long vehicleId = 999L;
        when(authService.getCurrentUser()).thenReturn(testUser);
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> vehicleService.deleteVehicle(vehicleId))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Vehicle not found: 999");

        verify(vehicleRepository, never()).delete(any());
    }

    @Test
    @DisplayName("deleteVehicle - Should throw exception when user is not owner or admin")
    void testDeleteVehicle_UnauthorizedUser() {
        // Arrange
        Long vehicleId = 1L;
        User unauthorizedUser = new User();
        unauthorizedUser.setId(99L);
        unauthorizedUser.setUsername("unauthorized");
        Set<Role> userRoles = new HashSet<>();
        userRoles.add(Role.ROLE_USER);
        unauthorizedUser.setRoles(userRoles);

        when(authService.getCurrentUser()).thenReturn(unauthorizedUser);
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(testVehicle));

        // Act & Assert
        assertThatThrownBy(() -> vehicleService.deleteVehicle(vehicleId))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("You are not allowed to modify this vehicle");

        verify(vehicleRepository, never()).delete(any());
    }

    // ============ updateVehicle() Tests ============

    @Test
    @DisplayName("updateVehicle - Should update all vehicle fields successfully")
    void testUpdateVehicle_AllFields_Success() {
        // Arrange
        Long vehicleId = 1L;
        vehicleUpdateRequest.setCategorySlug("arac");
        vehicleUpdateRequest.setBrand("Honda");
        vehicleUpdateRequest.setModel("Accord");
        vehicleUpdateRequest.setYear(2021);
        vehicleUpdateRequest.setFuelType(FuelType.GASOLINE);
        vehicleUpdateRequest.setTransmission(Transmission.MANUAL);
        vehicleUpdateRequest.setKilometer(25000);
        vehicleUpdateRequest.setEngineVolume("2.0");

        Category updatedCategory = new Category();
        updatedCategory.setId(1L);
        updatedCategory.setSlug("arac");

        when(authService.getCurrentUser()).thenReturn(testUser);
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(testVehicle));
        when(categoryRepository.findBySlug("arac")).thenReturn(Optional.of(updatedCategory));
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(testVehicle);

        // Act
        VehicleResponse result = vehicleService.updateVehicle(vehicleId, vehicleUpdateRequest);

        // Assert
        assertThat(result).isNotNull();
        verify(vehicleRepository, times(1)).findById(vehicleId);
        verify(vehicleRepository, times(1)).save(any(Vehicle.class));
    }

    @Test
    @DisplayName("updateVehicle - Should update only title field")
    void testUpdateVehicle_OnlyTitle() {
        // Arrange
        Long vehicleId = 1L;
        VehicleUpdateRequest partialRequest = new VehicleUpdateRequest();
        partialRequest.setTitle("New Title");

        when(authService.getCurrentUser()).thenReturn(testUser);
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(testVehicle));
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(testVehicle);

        // Act
        VehicleResponse result = vehicleService.updateVehicle(vehicleId, partialRequest);

        // Assert
        assertThat(result).isNotNull();
        verify(vehicleRepository, times(1)).save(any(Vehicle.class));
    }

    @Test
    @DisplayName("updateVehicle - Should update price field")
    void testUpdateVehicle_OnlyPrice() {
        // Arrange
        Long vehicleId = 1L;
        VehicleUpdateRequest priceRequest = new VehicleUpdateRequest();
        priceRequest.setPrice(new BigDecimal("500000.00"));

        when(authService.getCurrentUser()).thenReturn(testUser);
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(testVehicle));
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(testVehicle);

        // Act
        vehicleService.updateVehicle(vehicleId, priceRequest);

        // Assert
        verify(vehicleRepository, times(1)).save(any(Vehicle.class));
    }

    @Test
    @DisplayName("updateVehicle - Should update vehicle-specific fields")
    void testUpdateVehicle_VehicleSpecificFields() {
        // Arrange
        Long vehicleId = 1L;
        VehicleUpdateRequest vehicleSpecificRequest = new VehicleUpdateRequest();
        vehicleSpecificRequest.setBrand("BMW");
        vehicleSpecificRequest.setModel("320i");
        vehicleSpecificRequest.setYear(2022);
        vehicleSpecificRequest.setFuelType(FuelType.DIESEL);
        vehicleSpecificRequest.setTransmission(Transmission.AUTOMATIC);
        vehicleSpecificRequest.setKilometer(15000);
        vehicleSpecificRequest.setEngineVolume("2.0");

        when(authService.getCurrentUser()).thenReturn(testUser);
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(testVehicle));
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(testVehicle);

        // Act
        vehicleService.updateVehicle(vehicleId, vehicleSpecificRequest);

        // Assert
        verify(vehicleRepository, times(1)).save(any(Vehicle.class));
    }

    @Test
    @DisplayName("updateVehicle - Should update category by slug")
    void testUpdateVehicle_UpdateCategory() {
        // Arrange
        Long vehicleId = 1L;
        VehicleUpdateRequest categoryRequest = new VehicleUpdateRequest();
        categoryRequest.setCategorySlug("commercial");
        Category newCategory = new Category();
        newCategory.setId(2L);
        newCategory.setSlug("commercial");

        when(authService.getCurrentUser()).thenReturn(testUser);
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(testVehicle));
        when(categoryRepository.findBySlug("commercial")).thenReturn(Optional.of(newCategory));
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(testVehicle);

        // Act
        vehicleService.updateVehicle(vehicleId, categoryRequest);

        // Assert
        verify(categoryRepository, times(1)).findBySlug("commercial");
        verify(vehicleRepository, times(1)).save(any(Vehicle.class));
    }

    @Test
    @DisplayName("updateVehicle - Should throw exception when vehicle not found")
    void testUpdateVehicle_NotFound() {
        // Arrange
        Long vehicleId = 999L;
        when(authService.getCurrentUser()).thenReturn(testUser);
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> vehicleService.updateVehicle(vehicleId, vehicleUpdateRequest))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Vehicle not found with id: 999");

        verify(vehicleRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateVehicle - Should throw exception when user is not owner or admin")
    void testUpdateVehicle_UnauthorizedUser() {
        // Arrange
        Long vehicleId = 1L;
        User unauthorizedUser = new User();
        unauthorizedUser.setId(99L);
        unauthorizedUser.setUsername("unauthorized");
        Set<Role> userRoles = new HashSet<>();
        userRoles.add(Role.ROLE_USER);
        unauthorizedUser.setRoles(userRoles);

        when(authService.getCurrentUser()).thenReturn(unauthorizedUser);
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(testVehicle));

        // Act & Assert
        assertThatThrownBy(() -> vehicleService.updateVehicle(vehicleId, vehicleUpdateRequest))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("You are not allowed to modify this vehicle");

        verify(vehicleRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateVehicle - Should throw exception when category not found")
    void testUpdateVehicle_CategoryNotFound() {
        // Arrange
        Long vehicleId = 1L;
        VehicleUpdateRequest categoryRequest = new VehicleUpdateRequest();
        categoryRequest.setCategorySlug("nonexistent");

        when(authService.getCurrentUser()).thenReturn(testUser);
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(testVehicle));
        when(categoryRepository.findBySlug("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> vehicleService.updateVehicle(vehicleId, categoryRequest))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Category not found with slug: nonexistent");

        verify(vehicleRepository, never()).save(any());
    }

    // ============ search() Tests ============

    @Test
    @DisplayName("search - Should search vehicles with all filters")
    void testSearch_AllFilters_Success() {
        // Arrange
        VehicleFilterRequest filter = new VehicleFilterRequest();
        filter.setCity("Istanbul");
        filter.setDistrict("Kadikoy");
        filter.setCategorySlug("arac");
        filter.setMinPrice(new BigDecimal("100000"));
        filter.setMaxPrice(new BigDecimal("500000"));
        filter.setBrand("Toyota");
        filter.setMinYear(2018);
        filter.setMaxYear(2022);
        filter.setFuelType(FuelType.HYBRID);
        filter.setTransmission(Transmission.AUTOMATIC);

        Pageable pageable = PageRequest.of(0, 10);
        List<Vehicle> vehicleList = new ArrayList<>();
        vehicleList.add(testVehicle);
        Page<Vehicle> vehiclePage = new PageImpl<>(vehicleList, pageable, 1);

        when(vehicleRepository.search(filter, pageable)).thenReturn(vehiclePage);

        // Act
        Page<VehicleResponse> result = vehicleService.search(filter, pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1);

        verify(vehicleRepository, times(1)).search(filter, pageable);
    }

    @Test
    @DisplayName("search - Should search vehicles with city filter only")
    void testSearch_CityFilterOnly() {
        // Arrange
        VehicleFilterRequest filter = new VehicleFilterRequest();
        filter.setCity("Istanbul");

        Pageable pageable = PageRequest.of(0, 10);
        List<Vehicle> vehicleList = new ArrayList<>();
        vehicleList.add(testVehicle);
        Page<Vehicle> vehiclePage = new PageImpl<>(vehicleList, pageable, 1);

        when(vehicleRepository.search(filter, pageable)).thenReturn(vehiclePage);

        // Act
        Page<VehicleResponse> result = vehicleService.search(filter, pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1);

        verify(vehicleRepository, times(1)).search(filter, pageable);
    }

    @Test
    @DisplayName("search - Should search vehicles with price range filter")
    void testSearch_PriceRangeFilter() {
        // Arrange
        VehicleFilterRequest filter = new VehicleFilterRequest();
        filter.setMinPrice(new BigDecimal("400000"));
        filter.setMaxPrice(new BigDecimal("500000"));

        Pageable pageable = PageRequest.of(0, 10);
        List<Vehicle> vehicleList = new ArrayList<>();
        vehicleList.add(testVehicle);
        Page<Vehicle> vehiclePage = new PageImpl<>(vehicleList, pageable, 1);

        when(vehicleRepository.search(filter, pageable)).thenReturn(vehiclePage);

        // Act
        Page<VehicleResponse> result = vehicleService.search(filter, pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1);

        verify(vehicleRepository, times(1)).search(filter, pageable);
    }

    @Test
    @DisplayName("search - Should return empty page when no results")
    void testSearch_NoResults() {
        // Arrange
        VehicleFilterRequest filter = new VehicleFilterRequest();
        filter.setCity("NonexistentCity");

        Pageable pageable = PageRequest.of(0, 10);
        Page<Vehicle> emptyPage = new PageImpl<>(new ArrayList<>(), pageable, 0);

        when(vehicleRepository.search(filter, pageable)).thenReturn(emptyPage);

        // Act
        Page<VehicleResponse> result = vehicleService.search(filter, pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .isEmpty();

        verify(vehicleRepository, times(1)).search(filter, pageable);
    }

    @Test
    @DisplayName("search - Should search with brand filter")
    void testSearch_BrandFilter() {
        // Arrange
        VehicleFilterRequest filter = new VehicleFilterRequest();
        filter.setBrand("Toyota");

        Pageable pageable = PageRequest.of(0, 10);
        List<Vehicle> vehicleList = new ArrayList<>();
        vehicleList.add(testVehicle);
        Page<Vehicle> vehiclePage = new PageImpl<>(vehicleList, pageable, 1);

        when(vehicleRepository.search(filter, pageable)).thenReturn(vehiclePage);

        // Act
        Page<VehicleResponse> result = vehicleService.search(filter, pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1);

        verify(vehicleRepository, times(1)).search(filter, pageable);
    }

    @Test
    @DisplayName("search - Should search with fuel type filter")
    void testSearch_FuelTypeFilter() {
        // Arrange
        VehicleFilterRequest filter = new VehicleFilterRequest();
        filter.setFuelType(FuelType.HYBRID);

        Pageable pageable = PageRequest.of(0, 10);
        List<Vehicle> vehicleList = new ArrayList<>();
        vehicleList.add(testVehicle);
        Page<Vehicle> vehiclePage = new PageImpl<>(vehicleList, pageable, 1);

        when(vehicleRepository.search(filter, pageable)).thenReturn(vehiclePage);

        // Act
        Page<VehicleResponse> result = vehicleService.search(filter, pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1);

        verify(vehicleRepository, times(1)).search(filter, pageable);
    }

    @Test
    @DisplayName("search - Should search with transmission filter")
    void testSearch_TransmissionFilter() {
        // Arrange
        VehicleFilterRequest filter = new VehicleFilterRequest();
        filter.setTransmission(Transmission.AUTOMATIC);

        Pageable pageable = PageRequest.of(0, 10);
        List<Vehicle> vehicleList = new ArrayList<>();
        vehicleList.add(testVehicle);
        Page<Vehicle> vehiclePage = new PageImpl<>(vehicleList, pageable, 1);

        when(vehicleRepository.search(filter, pageable)).thenReturn(vehiclePage);

        // Act
        Page<VehicleResponse> result = vehicleService.search(filter, pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1);

        verify(vehicleRepository, times(1)).search(filter, pageable);
    }

    @Test
    @DisplayName("search - Should search with year range filter")
    void testSearch_YearRangeFilter() {
        // Arrange
        VehicleFilterRequest filter = new VehicleFilterRequest();
        filter.setMinYear(2018);
        filter.setMaxYear(2022);

        Pageable pageable = PageRequest.of(0, 10);
        List<Vehicle> vehicleList = new ArrayList<>();
        vehicleList.add(testVehicle);
        Page<Vehicle> vehiclePage = new PageImpl<>(vehicleList, pageable, 1);

        when(vehicleRepository.search(filter, pageable)).thenReturn(vehiclePage);

        // Act
        Page<VehicleResponse> result = vehicleService.search(filter, pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1);

        verify(vehicleRepository, times(1)).search(filter, pageable);
    }
}
