package com.burakcanaksoy.realestate.service;

import com.burakcanaksoy.realestate.model.Category;
import com.burakcanaksoy.realestate.model.Land;
import com.burakcanaksoy.realestate.model.User;
import com.burakcanaksoy.realestate.model.enums.Currency;
import com.burakcanaksoy.realestate.model.enums.LandType;
import com.burakcanaksoy.realestate.model.enums.Role;
import com.burakcanaksoy.realestate.repository.CategoryRepository;
import com.burakcanaksoy.realestate.repository.LandRepository;
import com.burakcanaksoy.realestate.request.LandCreateRequest;
import com.burakcanaksoy.realestate.request.LandFilterRequest;
import com.burakcanaksoy.realestate.request.LandUpdateRequest;
import com.burakcanaksoy.realestate.response.LandResponse;
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
 * Unit tests for LandService
 *
 * This test class covers all methods of LandService.
 * @Mock: Mocks the repository and auth service dependencies
 * @InjectMocks: Creates LandService and injects mocked dependencies
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("LandService Unit Tests")
class LandServiceTest {

    @Mock
    private LandRepository landRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private AuthService authService;

    @InjectMocks
    private LandService landService;

    private Land testLand;
    private LandResponse testLandResponse;
    private LandCreateRequest landCreateRequest;
    private LandUpdateRequest landUpdateRequest;
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
        testCategory.setName("Land");
        testCategory.setSlug("land");
        testCategory.setActive(true);

        // Prepare test land entity
        testLand = new Land();
        testLand.setId(1L);
        testLand.setTitle("Beautiful Land in Istanbul");
        testLand.setDescription("Spacious land with great potential");
        testLand.setPrice(new BigDecimal("500000.00"));
        testLand.setCurrency(Currency.USD);
        testLand.setCategory(testCategory);
        testLand.setCity("Istanbul");
        testLand.setDistrict("Besiktas");
        testLand.setLandType(LandType.LAND);
        testLand.setSquareMeter(5000);
        testLand.setZoningStatus("Residential Zone");
        testLand.setParcelNumber(123);
        testLand.setIslandNumber(456);
        testLand.setCreatedBy(testUser);

        // Prepare test land response
        testLandResponse = new LandResponse();
        testLandResponse.setId(1L);
        testLandResponse.setTitle("Beautiful Land in Istanbul");
        testLandResponse.setDescription("Spacious land with great potential");
        testLandResponse.setPrice(new BigDecimal("500000.00"));
        testLandResponse.setCurrency(Currency.USD);
        testLandResponse.setCategorySlug("land");
        testLandResponse.setCity("Istanbul");
        testLandResponse.setDistrict("Besiktas");
        testLandResponse.setLandType(LandType.LAND);
        testLandResponse.setSquareMeter(5000);
        testLandResponse.setZoningStatus("Residential Zone");
        testLandResponse.setParcelNumber(123);
        testLandResponse.setIslandNumber(456);
        testLandResponse.setOwnerId(1L);
        testLandResponse.setOwnerUsername("testuser");

        // Prepare create request
        landCreateRequest = new LandCreateRequest();
        landCreateRequest.setTitle("Beautiful Land in Istanbul");
        landCreateRequest.setDescription("Spacious land with great potential");
        landCreateRequest.setPrice(new BigDecimal("500000.00"));
        landCreateRequest.setCurrency(Currency.USD);
        landCreateRequest.setCategorySlug("land");
        landCreateRequest.setCity("Istanbul");
        landCreateRequest.setDistrict("Besiktas");
        landCreateRequest.setLandType(LandType.LAND);
        landCreateRequest.setSquareMeter(5000);
        landCreateRequest.setZoningStatus("Residential Zone");
        landCreateRequest.setParcelNumber(123);
        landCreateRequest.setIslandNumber(456);

        // Prepare update request
        landUpdateRequest = new LandUpdateRequest();
        landUpdateRequest.setTitle("Updated Beautiful Land");
        landUpdateRequest.setDescription("Updated description");
        landUpdateRequest.setPrice(new BigDecimal("550000.00"));
        landUpdateRequest.setCurrency(Currency.TRY);
        landUpdateRequest.setCity("Ankara");
        landUpdateRequest.setDistrict("Cankaya");
        landUpdateRequest.setSquareMeter(6000);
    }

    // ============ getAllLands() Tests ============

    @Test
    @DisplayName("getAllLands - Should return all lands successfully")
    void testGetAllLands_Success() {
        // Arrange
        List<Land> landList = new ArrayList<>();
        landList.add(testLand);
        when(landRepository.findAll()).thenReturn(landList);

        // Act
        List<LandResponse> result = landService.getAllLands();

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1)
                .extracting(LandResponse::getTitle)
                .contains("Beautiful Land in Istanbul");

        verify(landRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("getAllLands - Should return empty list when no lands exist")
    void testGetAllLands_EmptyList() {
        // Arrange
        when(landRepository.findAll()).thenReturn(new ArrayList<>());

        // Act
        List<LandResponse> result = landService.getAllLands();

        // Assert
        assertThat(result)
                .isNotNull()
                .isEmpty();

        verify(landRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("getAllLands - Should return multiple lands")
    void testGetAllLands_MultipleLands() {
        // Arrange
        Land secondLand = new Land();
        secondLand.setId(2L);
        secondLand.setTitle("Another Land");
        secondLand.setDescription("Another description");
        secondLand.setPrice(new BigDecimal("300000.00"));
        secondLand.setCurrency(Currency.USD);
        secondLand.setCategory(testCategory);
        secondLand.setCity("Ankara");
        secondLand.setDistrict("Cankaya");
        secondLand.setLandType(LandType.VINEYARD);
        secondLand.setSquareMeter(10000);
        secondLand.setZoningStatus("Agricultural Zone");
        secondLand.setParcelNumber(789);
        secondLand.setIslandNumber(101);
        secondLand.setCreatedBy(testUser);

        List<Land> landList = new ArrayList<>();
        landList.add(testLand);
        landList.add(secondLand);
        when(landRepository.findAll()).thenReturn(landList);

        // Act
        List<LandResponse> result = landService.getAllLands();

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(2);

        verify(landRepository, times(1)).findAll();
    }

    // ============ getAllLands(Pageable) Tests ============

    @Test
    @DisplayName("getAllLands(Pageable) - Should return paginated lands successfully")
    void testGetAllLandsWithPagination_Success() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        List<Land> landList = new ArrayList<>();
        landList.add(testLand);
        Page<Land> landPage = new PageImpl<>(landList, pageable, 1);

        when(landRepository.findAll(pageable)).thenReturn(landPage);

        // Act
        Page<LandResponse> result = landService.getAllLands(pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1)
                .extracting(LandResponse::getTitle)
                .contains("Beautiful Land in Istanbul");

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getNumber()).isEqualTo(0);

        verify(landRepository, times(1)).findAll(pageable);
    }

    @Test
    @DisplayName("getAllLands(Pageable) - Should return empty page when no lands exist")
    void testGetAllLandsWithPagination_EmptyPage() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<Land> emptyPage = new PageImpl<>(new ArrayList<>(), pageable, 0);

        when(landRepository.findAll(pageable)).thenReturn(emptyPage);

        // Act
        Page<LandResponse> result = landService.getAllLands(pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .isEmpty();

        assertThat(result.getTotalElements()).isEqualTo(0);

        verify(landRepository, times(1)).findAll(pageable);
    }

    @Test
    @DisplayName("getAllLands(Pageable) - Should return correct page information")
    void testGetAllLandsWithPagination_PageInfo() {
        // Arrange
        Pageable pageable = PageRequest.of(1, 5);
        List<Land> landList = new ArrayList<>();
        landList.add(testLand);
        Page<Land> landPage = new PageImpl<>(landList, pageable, 15);

        when(landRepository.findAll(pageable)).thenReturn(landPage);

        // Act
        Page<LandResponse> result = landService.getAllLands(pageable);

        // Assert
        assertThat(result.getTotalElements()).isEqualTo(15);
        assertThat(result.getTotalPages()).isEqualTo(3);
        assertThat(result.getNumber()).isEqualTo(1);
        assertThat(result.getSize()).isEqualTo(5);

        verify(landRepository, times(1)).findAll(pageable);
    }

    // ============ createLand() Tests ============

    @Test
    @DisplayName("createLand - Should create land successfully")
    void testCreateLand_Success() {
        // Arrange
        when(categoryRepository.findBySlug("land")).thenReturn(Optional.of(testCategory));
        when(authService.getCurrentUser()).thenReturn(testUser);
        when(landRepository.save(any(Land.class))).thenReturn(testLand);

        // Act
        LandResponse result = landService.createLand(landCreateRequest);

        // Assert
        assertThat(result)
                .isNotNull()
                .extracting(LandResponse::getTitle, LandResponse::getCity)
                .containsExactly("Beautiful Land in Istanbul", "Istanbul");

        verify(categoryRepository, times(1)).findBySlug("land");
        verify(authService, times(1)).getCurrentUser();
        verify(landRepository, times(1)).save(any(Land.class));
    }

    @Test
    @DisplayName("createLand - Should throw exception when category not found")
    void testCreateLand_CategoryNotFound() {
        // Arrange
        when(categoryRepository.findBySlug("land")).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> landService.createLand(landCreateRequest))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Category not found with slug: land");

        verify(categoryRepository, times(1)).findBySlug("land");
        verify(authService, never()).getCurrentUser();
        verify(landRepository, never()).save(any());
    }

    @Test
    @DisplayName("createLand - Should set current user as creator")
    void testCreateLand_SetCreator() {
        // Arrange
        when(categoryRepository.findBySlug("land")).thenReturn(Optional.of(testCategory));
        when(authService.getCurrentUser()).thenReturn(testUser);
        when(landRepository.save(any(Land.class))).thenReturn(testLand);

        // Act
        landService.createLand(landCreateRequest);

        // Assert
        verify(authService, times(1)).getCurrentUser();
        verify(landRepository, times(1)).save(any(Land.class));
    }

    // ============ getLandById() Tests ============

    @Test
    @DisplayName("getLandById - Should retrieve land by ID successfully")
    void testGetLandById_Success() {
        // Arrange
        Long landId = 1L;
        when(landRepository.findById(landId)).thenReturn(Optional.of(testLand));

        // Act
        LandResponse result = landService.getLandById(landId);

        // Assert
        assertThat(result)
                .isNotNull()
                .extracting(LandResponse::getId, LandResponse::getTitle)
                .containsExactly(1L, "Beautiful Land in Istanbul");

        verify(landRepository, times(1)).findById(landId);
    }

    @Test
    @DisplayName("getLandById - Should throw exception when land not found")
    void testGetLandById_NotFound() {
        // Arrange
        Long landId = 999L;
        when(landRepository.findById(landId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> landService.getLandById(landId))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Land not found with this id : 999");

        verify(landRepository, times(1)).findById(landId);
    }

    // ============ deleteLand() Tests ============

    @Test
    @DisplayName("deleteLand - Should delete land by owner successfully")
    void testDeleteLand_ByOwner_Success() {
        // Arrange
        Long landId = 1L;
        when(authService.getCurrentUser()).thenReturn(testUser);
        when(landRepository.findById(landId)).thenReturn(Optional.of(testLand));

        // Act
        landService.deleteLand(landId);

        // Assert
        verify(landRepository, times(1)).findById(landId);
        verify(landRepository, times(1)).delete(testLand);
    }

    @Test
    @DisplayName("deleteLand - Should delete land by admin successfully")
    void testDeleteLand_ByAdmin_Success() {
        // Arrange
        Long landId = 1L;
        User adminUser = new User();
        adminUser.setId(2L);
        adminUser.setUsername("admin");
        Set<Role> adminRoles = new HashSet<>();
        adminRoles.add(Role.ROLE_ADMIN);
        adminUser.setRoles(adminRoles);

        when(authService.getCurrentUser()).thenReturn(adminUser);
        when(landRepository.findById(landId)).thenReturn(Optional.of(testLand));

        // Act
        landService.deleteLand(landId);

        // Assert
        verify(landRepository, times(1)).findById(landId);
        verify(landRepository, times(1)).delete(testLand);
    }

    @Test
    @DisplayName("deleteLand - Should throw exception when land not found")
    void testDeleteLand_NotFound() {
        // Arrange
        Long landId = 999L;
        when(authService.getCurrentUser()).thenReturn(testUser);
        when(landRepository.findById(landId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> landService.deleteLand(landId))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Land not found with this id : 999");

        verify(landRepository, never()).delete(any());
    }

    @Test
    @DisplayName("deleteLand - Should throw exception when user is not owner or admin")
    void testDeleteLand_UnauthorizedUser() {
        // Arrange
        Long landId = 1L;
        User unauthorizedUser = new User();
        unauthorizedUser.setId(99L);
        unauthorizedUser.setUsername("unauthorized");
        Set<Role> userRoles = new HashSet<>();
        userRoles.add(Role.ROLE_USER);
        unauthorizedUser.setRoles(userRoles);

        when(authService.getCurrentUser()).thenReturn(unauthorizedUser);
        when(landRepository.findById(landId)).thenReturn(Optional.of(testLand));

        // Act & Assert
        assertThatThrownBy(() -> landService.deleteLand(landId))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("You are not allowed to modify this land");

        verify(landRepository, never()).delete(any());
    }

    // ============ updateLand() Tests ============

    @Test
    @DisplayName("updateLand - Should update all land fields successfully")
    void testUpdateLand_AllFields_Success() {
        // Arrange
        Long landId = 1L;
        landUpdateRequest.setCategorySlug("land");
        Category updatedCategory = new Category();
        updatedCategory.setId(1L);
        updatedCategory.setSlug("land");

        when(authService.getCurrentUser()).thenReturn(testUser);
        when(landRepository.findById(landId)).thenReturn(Optional.of(testLand));
        when(categoryRepository.findBySlug("land")).thenReturn(Optional.of(updatedCategory));
        when(landRepository.save(any(Land.class))).thenReturn(testLand);

        // Act
        LandResponse result = landService.updateLand(landId, landUpdateRequest);

        // Assert
        assertThat(result).isNotNull();
        verify(landRepository, times(1)).findById(landId);
        verify(landRepository, times(1)).save(any(Land.class));
    }

    @Test
    @DisplayName("updateLand - Should update only title field")
    void testUpdateLand_OnlyTitle() {
        // Arrange
        Long landId = 1L;
        LandUpdateRequest partialRequest = new LandUpdateRequest();
        partialRequest.setTitle("New Title");

        when(authService.getCurrentUser()).thenReturn(testUser);
        when(landRepository.findById(landId)).thenReturn(Optional.of(testLand));
        when(landRepository.save(any(Land.class))).thenReturn(testLand);

        // Act
        LandResponse result = landService.updateLand(landId, partialRequest);

        // Assert
        assertThat(result).isNotNull();
        verify(landRepository, times(1)).save(any(Land.class));
    }

    @Test
    @DisplayName("updateLand - Should update price field")
    void testUpdateLand_OnlyPrice() {
        // Arrange
        Long landId = 1L;
        LandUpdateRequest priceRequest = new LandUpdateRequest();
        priceRequest.setPrice(new BigDecimal("600000.00"));

        when(authService.getCurrentUser()).thenReturn(testUser);
        when(landRepository.findById(landId)).thenReturn(Optional.of(testLand));
        when(landRepository.save(any(Land.class))).thenReturn(testLand);

        // Act
        landService.updateLand(landId, priceRequest);

        // Assert
        verify(landRepository, times(1)).save(any(Land.class));
    }

    @Test
    @DisplayName("updateLand - Should update land-specific fields")
    void testUpdateLand_LandSpecificFields() {
        // Arrange
        Long landId = 1L;
        LandUpdateRequest landSpecificRequest = new LandUpdateRequest();
        landSpecificRequest.setLandType(LandType.VINEYARD);
        landSpecificRequest.setSquareMeter(8000);
        landSpecificRequest.setZoningStatus("Agricultural Zone");

        when(authService.getCurrentUser()).thenReturn(testUser);
        when(landRepository.findById(landId)).thenReturn(Optional.of(testLand));
        when(landRepository.save(any(Land.class))).thenReturn(testLand);

        // Act
        landService.updateLand(landId, landSpecificRequest);

        // Assert
        verify(landRepository, times(1)).save(any(Land.class));
    }

    @Test
    @DisplayName("updateLand - Should update category by slug")
    void testUpdateLand_UpdateCategory() {
        // Arrange
        Long landId = 1L;
        LandUpdateRequest categoryRequest = new LandUpdateRequest();
        categoryRequest.setCategorySlug("field");
        Category newCategory = new Category();
        newCategory.setId(2L);
        newCategory.setSlug("field");

        when(authService.getCurrentUser()).thenReturn(testUser);
        when(landRepository.findById(landId)).thenReturn(Optional.of(testLand));
        when(categoryRepository.findBySlug("field")).thenReturn(Optional.of(newCategory));
        when(landRepository.save(any(Land.class))).thenReturn(testLand);

        // Act
        landService.updateLand(landId, categoryRequest);

        // Assert
        verify(categoryRepository, times(1)).findBySlug("field");
        verify(landRepository, times(1)).save(any(Land.class));
    }

    @Test
    @DisplayName("updateLand - Should throw exception when land not found")
    void testUpdateLand_NotFound() {
        // Arrange
        Long landId = 999L;
        when(authService.getCurrentUser()).thenReturn(testUser);
        when(landRepository.findById(landId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> landService.updateLand(landId, landUpdateRequest))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Land not found with id: 999");

        verify(landRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateLand - Should throw exception when user is not owner or admin")
    void testUpdateLand_UnauthorizedUser() {
        // Arrange
        Long landId = 1L;
        User unauthorizedUser = new User();
        unauthorizedUser.setId(99L);
        unauthorizedUser.setUsername("unauthorized");
        Set<Role> userRoles = new HashSet<>();
        userRoles.add(Role.ROLE_USER);
        unauthorizedUser.setRoles(userRoles);

        when(authService.getCurrentUser()).thenReturn(unauthorizedUser);
        when(landRepository.findById(landId)).thenReturn(Optional.of(testLand));

        // Act & Assert
        assertThatThrownBy(() -> landService.updateLand(landId, landUpdateRequest))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("You are not allowed to modify this land");

        verify(landRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateLand - Should throw exception when category not found")
    void testUpdateLand_CategoryNotFound() {
        // Arrange
        Long landId = 1L;
        LandUpdateRequest categoryRequest = new LandUpdateRequest();
        categoryRequest.setCategorySlug("nonexistent");

        when(authService.getCurrentUser()).thenReturn(testUser);
        when(landRepository.findById(landId)).thenReturn(Optional.of(testLand));
        when(categoryRepository.findBySlug("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> landService.updateLand(landId, categoryRequest))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Category not found with slug: nonexistent");

        verify(landRepository, never()).save(any());
    }

    // ============ search() Tests ============

    @Test
    @DisplayName("search - Should search lands with all filters")
    void testSearch_AllFilters_Success() {
        // Arrange
        LandFilterRequest filter = new LandFilterRequest();
        filter.setCity("Istanbul");
        filter.setDistrict("Besiktas");
        filter.setCategorySlug("land");
        filter.setMinPrice(new BigDecimal("100000"));
        filter.setMaxPrice(new BigDecimal("1000000"));
        filter.setLandType(LandType.VINEYARD);
        filter.setMinSquareMeter(1000);
        filter.setMaxSquareMeter(10000);

        Pageable pageable = PageRequest.of(0, 10);
        List<Land> landList = new ArrayList<>();
        landList.add(testLand);
        Page<Land> landPage = new PageImpl<>(landList, pageable, 1);

        when(landRepository.search(filter, pageable)).thenReturn(landPage);

        // Act
        Page<LandResponse> result = landService.search(filter, pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1);

        verify(landRepository, times(1)).search(filter, pageable);
    }

    @Test
    @DisplayName("search - Should search lands with city filter only")
    void testSearch_CityFilterOnly() {
        // Arrange
        LandFilterRequest filter = new LandFilterRequest();
        filter.setCity("Istanbul");

        Pageable pageable = PageRequest.of(0, 10);
        List<Land> landList = new ArrayList<>();
        landList.add(testLand);
        Page<Land> landPage = new PageImpl<>(landList, pageable, 1);

        when(landRepository.search(filter, pageable)).thenReturn(landPage);

        // Act
        Page<LandResponse> result = landService.search(filter, pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1);

        verify(landRepository, times(1)).search(filter, pageable);
    }

    @Test
    @DisplayName("search - Should search lands with price range filter")
    void testSearch_PriceRangeFilter() {
        // Arrange
        LandFilterRequest filter = new LandFilterRequest();
        filter.setMinPrice(new BigDecimal("400000"));
        filter.setMaxPrice(new BigDecimal("600000"));

        Pageable pageable = PageRequest.of(0, 10);
        List<Land> landList = new ArrayList<>();
        landList.add(testLand);
        Page<Land> landPage = new PageImpl<>(landList, pageable, 1);

        when(landRepository.search(filter, pageable)).thenReturn(landPage);

        // Act
        Page<LandResponse> result = landService.search(filter, pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1);

        verify(landRepository, times(1)).search(filter, pageable);
    }

    @Test
    @DisplayName("search - Should return empty page when no results")
    void testSearch_NoResults() {
        // Arrange
        LandFilterRequest filter = new LandFilterRequest();
        filter.setCity("NonexistentCity");

        Pageable pageable = PageRequest.of(0, 10);
        Page<Land> emptyPage = new PageImpl<>(new ArrayList<>(), pageable, 0);

        when(landRepository.search(filter, pageable)).thenReturn(emptyPage);

        // Act
        Page<LandResponse> result = landService.search(filter, pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .isEmpty();

        verify(landRepository, times(1)).search(filter, pageable);
    }

    @Test
    @DisplayName("search - Should search with land type filter")
    void testSearch_LandTypeFilter() {
        // Arrange
        LandFilterRequest filter = new LandFilterRequest();
        filter.setLandType(LandType.VINEYARD);

        Pageable pageable = PageRequest.of(0, 10);
        List<Land> landList = new ArrayList<>();
        landList.add(testLand);
        Page<Land> landPage = new PageImpl<>(landList, pageable, 1);

        when(landRepository.search(filter, pageable)).thenReturn(landPage);

        // Act
        Page<LandResponse> result = landService.search(filter, pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1);

        verify(landRepository, times(1)).search(filter, pageable);
    }

    @Test
    @DisplayName("search - Should search with square meter range filter")
    void testSearch_SquareMeterRangeFilter() {
        // Arrange
        LandFilterRequest filter = new LandFilterRequest();
        filter.setMinSquareMeter(4000);
        filter.setMaxSquareMeter(6000);

        Pageable pageable = PageRequest.of(0, 10);
        List<Land> landList = new ArrayList<>();
        landList.add(testLand);
        Page<Land> landPage = new PageImpl<>(landList, pageable, 1);

        when(landRepository.search(filter, pageable)).thenReturn(landPage);

        // Act
        Page<LandResponse> result = landService.search(filter, pageable);

        // Assert
        assertThat(result)
                .isNotNull()
                .hasSize(1);

        verify(landRepository, times(1)).search(filter, pageable);
    }

}
