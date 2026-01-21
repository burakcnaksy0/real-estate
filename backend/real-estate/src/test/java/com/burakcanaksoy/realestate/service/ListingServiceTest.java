package com.burakcanaksoy.realestate.service;

import com.burakcanaksoy.realestate.model.*;
import com.burakcanaksoy.realestate.model.enums.*;
import com.burakcanaksoy.realestate.repository.LandRepository;
import com.burakcanaksoy.realestate.repository.RealEstateRepository;
import com.burakcanaksoy.realestate.repository.VehicleRepository;
import com.burakcanaksoy.realestate.repository.WorkplaceRepository;
import com.burakcanaksoy.realestate.response.BaseListingResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ListingService
 *
 * This test class covers all methods of ListingService.
 * ListingService aggregates listings from multiple repositories.
 * 
 * @Mock: Mocks all repository dependencies
 * @InjectMocks: Creates ListingService and injects mocked dependencies
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ListingService Unit Tests")
public class ListingServiceTest {

    @Mock
    private RealEstateRepository realEstateRepository;

    @Mock
    private LandRepository landRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private WorkplaceRepository workplaceRepository;

    @InjectMocks
    private ListingService listingService;

    private RealEstate testRealEstate;
    private Land testLand;
    private Vehicle testVehicle;
    private Workplace testWorkplace;
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
        testCategory.setName("Test Category");
        testCategory.setSlug("test-category");
        testCategory.setActive(true);

        // Prepare test real estate
        testRealEstate = new RealEstate();
        testRealEstate.setId(1L);
        testRealEstate.setTitle("Luxury Apartment");
        testRealEstate.setDescription("Beautiful apartment");
        testRealEstate.setPrice(new BigDecimal("500000.00"));
        testRealEstate.setCurrency(Currency.TRY);
        testRealEstate.setCategory(testCategory);
        testRealEstate.setCity("Istanbul");
        testRealEstate.setDistrict("Kadikoy");
        testRealEstate.setRealEstateType(RealEstateType.APARTMENT);
        testRealEstate.setRoomCount("3");
        testRealEstate.setGrossSquareMeter(120);
        testRealEstate.setNetSquareMeter(100);
        testRealEstate.setBuildingAge("5");
        testRealEstate.setFloor(3);
        testRealEstate.setHeatingType(HeatingType.CENTRAL_HEATING);
        testRealEstate.setFurnished(true);
        testRealEstate.setCreatedBy(testUser);

        // Prepare test land
        testLand = new Land();
        testLand.setId(2L);
        testLand.setTitle("Agricultural Land");
        testLand.setDescription("Fertile land");
        testLand.setPrice(new BigDecimal("200000.00"));
        testLand.setCurrency(Currency.TRY);
        testLand.setCategory(testCategory);
        testLand.setCity("Izmir");
        testLand.setDistrict("Cesme");
        testLand.setLandType(LandType.GARDEN);
        testLand.setSquareMeter(5000);
        testLand.setZoningStatus("Residential Zone");
        testLand.setCreatedBy(testUser);

        // Prepare test vehicle
        testVehicle = new Vehicle();
        testVehicle.setId(3L);
        testVehicle.setTitle("2020 Toyota Corolla");
        testVehicle.setDescription("Well maintained");
        testVehicle.setPrice(new BigDecimal("450000.00"));
        testVehicle.setCurrency(Currency.TRY);
        testVehicle.setCategory(testCategory);
        testVehicle.setCity("Ankara");
        testVehicle.setDistrict("Cankaya");
        testVehicle.setBrand("Toyota");
        testVehicle.setModel("Corolla");
        testVehicle.setYear(2020);
        testVehicle.setFuelType(FuelType.HYBRID);
        testVehicle.setTransmission(Transmission.AUTOMATIC);
        testVehicle.setKilometer(35000);
        testVehicle.setEngineVolume("1.8");
        testVehicle.setCreatedBy(testUser);

        // Prepare test workplace
        testWorkplace = new Workplace();
        testWorkplace.setId(4L);
        testWorkplace.setTitle("Modern Office");
        testWorkplace.setDescription("Fully equipped office");
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
    }

    // ============ getAllListings() Tests ============

    @Test
    @DisplayName("getAllListings - Should return all listings from all repositories successfully")
    void testGetAllListings_AllRepositories_Success() {
        // Arrange
        when(realEstateRepository.findAll()).thenReturn(List.of(testRealEstate));
        when(landRepository.findAll()).thenReturn(List.of(testLand));
        when(vehicleRepository.findAll()).thenReturn(List.of(testVehicle));
        when(workplaceRepository.findAll()).thenReturn(List.of(testWorkplace));

        // Act
        List<BaseListingResponse> result = listingService.getAllListings();

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(4);

        verify(realEstateRepository, times(1)).findAll();
        verify(landRepository, times(1)).findAll();
        verify(vehicleRepository, times(1)).findAll();
        verify(workplaceRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("getAllListings - Should return empty list when no listings exist")
    void testGetAllListings_EmptyList() {
        // Arrange
        when(realEstateRepository.findAll()).thenReturn(new ArrayList<>());
        when(landRepository.findAll()).thenReturn(new ArrayList<>());
        when(vehicleRepository.findAll()).thenReturn(new ArrayList<>());
        when(workplaceRepository.findAll()).thenReturn(new ArrayList<>());

        // Act
        List<BaseListingResponse> result = listingService.getAllListings();

        // Assert
        assertThat(result)
                .isNotNull()
                .isEmpty();

        verify(realEstateRepository, times(1)).findAll();
        verify(landRepository, times(1)).findAll();
        verify(vehicleRepository, times(1)).findAll();
        verify(workplaceRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("getAllListings - Should return only real estate listings when other repositories are empty")
    void testGetAllListings_OnlyRealEstate() {
        // Arrange
        when(realEstateRepository.findAll()).thenReturn(List.of(testRealEstate));
        when(landRepository.findAll()).thenReturn(new ArrayList<>());
        when(vehicleRepository.findAll()).thenReturn(new ArrayList<>());
        when(workplaceRepository.findAll()).thenReturn(new ArrayList<>());

        // Act
        List<BaseListingResponse> result = listingService.getAllListings();

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1)
                .extracting(BaseListingResponse::getTitle)
                .contains("Luxury Apartment");

        verify(realEstateRepository, times(1)).findAll();
        verify(landRepository, times(1)).findAll();
        verify(vehicleRepository, times(1)).findAll();
        verify(workplaceRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("getAllListings - Should return only vehicle listings when other repositories are empty")
    void testGetAllListings_OnlyVehicles() {
        // Arrange
        when(realEstateRepository.findAll()).thenReturn(new ArrayList<>());
        when(landRepository.findAll()).thenReturn(new ArrayList<>());
        when(vehicleRepository.findAll()).thenReturn(List.of(testVehicle));
        when(workplaceRepository.findAll()).thenReturn(new ArrayList<>());

        // Act
        List<BaseListingResponse> result = listingService.getAllListings();

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1)
                .extracting(BaseListingResponse::getTitle)
                .contains("2020 Toyota Corolla");

        verify(realEstateRepository, times(1)).findAll();
        verify(landRepository, times(1)).findAll();
        verify(vehicleRepository, times(1)).findAll();
        verify(workplaceRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("getAllListings - Should combine listings from different types correctly")
    void testGetAllListings_CombineMultipleTypes() {
        // Arrange
        RealEstate secondRealEstate = new RealEstate();
        secondRealEstate.setId(5L);
        secondRealEstate.setTitle("Villa");
        secondRealEstate.setDescription("Luxury villa");
        secondRealEstate.setPrice(new BigDecimal("1000000.00"));
        secondRealEstate.setCurrency(Currency.TRY);
        secondRealEstate.setCity("Bodrum");
        secondRealEstate.setDistrict("Yalikavak");
        secondRealEstate.setCategory(testCategory);
        secondRealEstate.setCreatedBy(testUser);

        Vehicle secondVehicle = new Vehicle();
        secondVehicle.setId(6L);
        secondVehicle.setTitle("2019 Honda Civic");
        secondVehicle.setDescription("Good condition");
        secondVehicle.setPrice(new BigDecimal("380000.00"));
        secondVehicle.setCurrency(Currency.TRY);
        secondVehicle.setCity("Izmir");
        secondVehicle.setDistrict("Bornova");
        secondVehicle.setCategory(testCategory);
        secondVehicle.setCreatedBy(testUser);

        when(realEstateRepository.findAll()).thenReturn(List.of(testRealEstate, secondRealEstate));
        when(landRepository.findAll()).thenReturn(List.of(testLand));
        when(vehicleRepository.findAll()).thenReturn(List.of(testVehicle, secondVehicle));
        when(workplaceRepository.findAll()).thenReturn(List.of(testWorkplace));

        // Act
        List<BaseListingResponse> result = listingService.getAllListings();

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(6);

        verify(realEstateRepository, times(1)).findAll();
        verify(landRepository, times(1)).findAll();
        verify(vehicleRepository, times(1)).findAll();
        verify(workplaceRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("getAllListings - Should return listings from land and workplace only")
    void testGetAllListings_LandAndWorkplace() {
        // Arrange
        when(realEstateRepository.findAll()).thenReturn(new ArrayList<>());
        when(landRepository.findAll()).thenReturn(List.of(testLand));
        when(vehicleRepository.findAll()).thenReturn(new ArrayList<>());
        when(workplaceRepository.findAll()).thenReturn(List.of(testWorkplace));

        // Act
        List<BaseListingResponse> result = listingService.getAllListings();

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(2);

        verify(realEstateRepository, times(1)).findAll();
        verify(landRepository, times(1)).findAll();
        verify(vehicleRepository, times(1)).findAll();
        verify(workplaceRepository, times(1)).findAll();
    }

    // ============ getAllListings(Pageable) Tests ============

    @Test
    @DisplayName("getAllListings(Pageable) - Should return paginated listings successfully")
    void testGetAllListingsWithPagination_Success() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 2);
        when(realEstateRepository.findAll()).thenReturn(List.of(testRealEstate));
        when(landRepository.findAll()).thenReturn(List.of(testLand));
        when(vehicleRepository.findAll()).thenReturn(List.of(testVehicle));
        when(workplaceRepository.findAll()).thenReturn(List.of(testWorkplace));

        // Act
        Page<BaseListingResponse> result = listingService.getAllListings(pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(2);

        assertThat(result.getTotalElements()).isEqualTo(4);
        assertThat(result.getTotalPages()).isEqualTo(2);
        assertThat(result.getNumber()).isEqualTo(0);

        verify(realEstateRepository, times(1)).findAll();
        verify(landRepository, times(1)).findAll();
        verify(vehicleRepository, times(1)).findAll();
        verify(workplaceRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("getAllListings(Pageable) - Should return empty page when no listings exist")
    void testGetAllListingsWithPagination_EmptyPage() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        when(realEstateRepository.findAll()).thenReturn(new ArrayList<>());
        when(landRepository.findAll()).thenReturn(new ArrayList<>());
        when(vehicleRepository.findAll()).thenReturn(new ArrayList<>());
        when(workplaceRepository.findAll()).thenReturn(new ArrayList<>());

        // Act
        Page<BaseListingResponse> result = listingService.getAllListings(pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .isEmpty();

        assertThat(result.getTotalElements()).isEqualTo(0);

        verify(realEstateRepository, times(1)).findAll();
        verify(landRepository, times(1)).findAll();
        verify(vehicleRepository, times(1)).findAll();
        verify(workplaceRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("getAllListings(Pageable) - Should return correct page information")
    void testGetAllListingsWithPagination_PageInfo() {
        // Arrange
        Pageable pageable = PageRequest.of(1, 2);
        when(realEstateRepository.findAll()).thenReturn(List.of(testRealEstate));
        when(landRepository.findAll()).thenReturn(List.of(testLand));
        when(vehicleRepository.findAll()).thenReturn(List.of(testVehicle));
        when(workplaceRepository.findAll()).thenReturn(List.of(testWorkplace));

        // Act
        Page<BaseListingResponse> result = listingService.getAllListings(pageable);

        // Assert
        assertThat(result.getTotalElements()).isEqualTo(4);
        assertThat(result.getTotalPages()).isEqualTo(2);
        assertThat(result.getNumber()).isEqualTo(1);
        assertThat(result.getSize()).isEqualTo(2);
        assertThat(result.getContent()).hasSize(2);

        verify(realEstateRepository, times(1)).findAll();
        verify(landRepository, times(1)).findAll();
        verify(vehicleRepository, times(1)).findAll();
        verify(workplaceRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("getAllListings(Pageable) - Should handle pagination correctly with multiple listing types")
    void testGetAllListingsWithPagination_MultipleListing() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 3);

        RealEstate secondRealEstate = new RealEstate();
        secondRealEstate.setId(5L);
        secondRealEstate.setTitle("Villa");
        secondRealEstate.setDescription("Luxury villa");
        secondRealEstate.setPrice(new BigDecimal("1000000.00"));
        secondRealEstate.setCurrency(Currency.TRY);
        secondRealEstate.setCity("Bodrum");
        secondRealEstate.setDistrict("Yalikavak");
        secondRealEstate.setCategory(testCategory);
        secondRealEstate.setCreatedBy(testUser);

        when(realEstateRepository.findAll()).thenReturn(List.of(testRealEstate, secondRealEstate));
        when(landRepository.findAll()).thenReturn(List.of(testLand));
        when(vehicleRepository.findAll()).thenReturn(List.of(testVehicle));
        when(workplaceRepository.findAll()).thenReturn(List.of(testWorkplace));

        // Act
        Page<BaseListingResponse> result = listingService.getAllListings(pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(3);

        assertThat(result.getTotalElements()).isEqualTo(5);
        assertThat(result.getTotalPages()).isEqualTo(2);

        verify(realEstateRepository, times(1)).findAll();
        verify(landRepository, times(1)).findAll();
        verify(vehicleRepository, times(1)).findAll();
        verify(workplaceRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("getAllListings(Pageable) - Should handle last page correctly")
    void testGetAllListingsWithPagination_LastPage() {
        // Arrange
        Pageable pageable = PageRequest.of(1, 3);
        when(realEstateRepository.findAll()).thenReturn(List.of(testRealEstate));
        when(landRepository.findAll()).thenReturn(List.of(testLand));
        when(vehicleRepository.findAll()).thenReturn(List.of(testVehicle));
        when(workplaceRepository.findAll()).thenReturn(List.of(testWorkplace));

        // Act
        Page<BaseListingResponse> result = listingService.getAllListings(pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1); // Only 1 item on the last page

        assertThat(result.getTotalElements()).isEqualTo(4);
        assertThat(result.getTotalPages()).isEqualTo(2);
        assertThat(result.getNumber()).isEqualTo(1);

        verify(realEstateRepository, times(1)).findAll();
        verify(landRepository, times(1)).findAll();
        verify(vehicleRepository, times(1)).findAll();
        verify(workplaceRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("getAllListings(Pageable) - Should handle single page with all items")
    void testGetAllListingsWithPagination_SinglePage() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        when(realEstateRepository.findAll()).thenReturn(List.of(testRealEstate));
        when(landRepository.findAll()).thenReturn(List.of(testLand));
        when(vehicleRepository.findAll()).thenReturn(List.of(testVehicle));
        when(workplaceRepository.findAll()).thenReturn(List.of(testWorkplace));

        // Act
        Page<BaseListingResponse> result = listingService.getAllListings(pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(4);

        assertThat(result.getTotalElements()).isEqualTo(4);
        assertThat(result.getTotalPages()).isEqualTo(1);
        assertThat(result.getNumber()).isEqualTo(0);

        verify(realEstateRepository, times(1)).findAll();
        verify(landRepository, times(1)).findAll();
        verify(vehicleRepository, times(1)).findAll();
        verify(workplaceRepository, times(1)).findAll();
    }
}
