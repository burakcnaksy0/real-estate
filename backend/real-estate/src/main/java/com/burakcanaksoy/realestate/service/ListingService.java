package com.burakcanaksoy.realestate.service;

import com.burakcanaksoy.realestate.mapper.BaseListingMapper;
import com.burakcanaksoy.realestate.model.BaseListing;
import com.burakcanaksoy.realestate.repository.ImageRepository;
import com.burakcanaksoy.realestate.repository.LandRepository;
import com.burakcanaksoy.realestate.repository.RealEstateRepository;
import com.burakcanaksoy.realestate.repository.VehicleRepository;
import com.burakcanaksoy.realestate.repository.VideoRepository;
import com.burakcanaksoy.realestate.repository.WorkplaceRepository;
import com.burakcanaksoy.realestate.request.GeneralFilterRequest;
import com.burakcanaksoy.realestate.request.LandFilterRequest;
import com.burakcanaksoy.realestate.request.RealEstateFilterRequest;
import com.burakcanaksoy.realestate.request.VehicleFilterRequest;
import com.burakcanaksoy.realestate.request.WorkplaceFilterRequest;
import com.burakcanaksoy.realestate.response.BaseListingResponse;
import com.burakcanaksoy.realestate.response.CategoryStatsResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ListingService {

    private final RealEstateRepository realEstateRepository;
    private final LandRepository landRepository;
    private final VehicleRepository vehicleRepository;
    private final WorkplaceRepository workplaceRepository;
    private final ImageRepository imageRepository; // Inject added
    private final VideoRepository videoRepository;

    public List<BaseListingResponse> getAllListings() {
        List<BaseListing> allListings = new ArrayList<>();
        allListings.addAll(realEstateRepository.findAll());
        allListings.addAll(landRepository.findAll());
        allListings.addAll(vehicleRepository.findAll());
        allListings.addAll(workplaceRepository.findAll());

        return allListings.stream()
                .map(this::convertToResponseWithImage)
                .toList();
    }

    public Page<BaseListingResponse> getAllListings(Pageable pageable) {
        List<BaseListing> allListings = new ArrayList<>();
        allListings.addAll(realEstateRepository.findAll());
        allListings.addAll(landRepository.findAll());
        allListings.addAll(vehicleRepository.findAll());
        allListings.addAll(workplaceRepository.findAll());

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), allListings.size());
        List<BaseListing> pageList = allListings.subList(start, end);
        return new PageImpl<>(pageList.stream().map(this::convertToResponseWithImage).toList(), pageable,
                allListings.size());
    }

    public Page<BaseListingResponse> search(GeneralFilterRequest filter, Pageable pageable) {
        log.info("Processing search in service. Filter: {}", filter);
        List<BaseListing> allListings = new ArrayList<>();
        String categorySlug = filter.getCategorySlug();

        if (categorySlug != null && categorySlug.trim().isEmpty()) {
            categorySlug = null;
        }

        boolean searchRealEstate = true;
        boolean searchLand = true;
        boolean searchVehicle = true;
        boolean searchWorkplace = true;

        // If a main category is selected, search only the relevant repository
        // and clear categorySlug so it returns all listings of that type regardless of
        // sub-category.
        if ("emlak".equals(categorySlug)) {
            searchLand = false;
            searchVehicle = false;
            searchWorkplace = false;
            categorySlug = null;
        } else if ("arsa".equals(categorySlug)) {
            searchRealEstate = false;
            searchVehicle = false;
            searchWorkplace = false;
            categorySlug = null;
        } else if ("arac".equals(categorySlug)) {
            searchRealEstate = false;
            searchLand = false;
            searchWorkplace = false;
            categorySlug = null;
        } else if ("isyeri".equals(categorySlug)) {
            searchRealEstate = false;
            searchLand = false;
            searchVehicle = false;
            categorySlug = null;
        }

        // Her ilan tipine özgü filter request oluştur ve ara

        if (searchRealEstate) {
            RealEstateFilterRequest realEstateFilter = new RealEstateFilterRequest();
            realEstateFilter.setCity(filter.getCity());
            realEstateFilter.setDistrict(filter.getDistrict());
            realEstateFilter.setCategorySlug(categorySlug);
            realEstateFilter.setStatus(filter.getStatus());
            realEstateFilter.setMinPrice(filter.getMinPrice());
            realEstateFilter.setMaxPrice(filter.getMaxPrice());
            realEstateFilter.setOwnerId(filter.getOwnerId());
            List<com.burakcanaksoy.realestate.model.RealEstate> results = realEstateRepository
                    .search(realEstateFilter, Pageable.unpaged()).getContent();
            log.info("Real Estate search results count: {}", results.size());
            allListings.addAll(results);
        }

        if (searchLand) {
            LandFilterRequest landFilter = new LandFilterRequest();
            landFilter.setCity(filter.getCity());
            landFilter.setDistrict(filter.getDistrict());
            landFilter.setCategorySlug(categorySlug);
            landFilter.setStatus(filter.getStatus());
            landFilter.setMinPrice(filter.getMinPrice());
            landFilter.setMaxPrice(filter.getMaxPrice());
            landFilter.setOwnerId(filter.getOwnerId());
            List<com.burakcanaksoy.realestate.model.Land> results = landRepository
                    .search(landFilter, Pageable.unpaged()).getContent();
            log.info("Land search results count: {}", results.size());
            allListings.addAll(results);
        }

        if (searchVehicle) {
            VehicleFilterRequest vehicleFilter = new VehicleFilterRequest();
            vehicleFilter.setCity(filter.getCity());
            vehicleFilter.setDistrict(filter.getDistrict());
            vehicleFilter.setCategorySlug(categorySlug);
            vehicleFilter.setStatus(filter.getStatus());
            vehicleFilter.setMinPrice(filter.getMinPrice());
            vehicleFilter.setMaxPrice(filter.getMaxPrice());
            vehicleFilter.setOwnerId(filter.getOwnerId());
            List<com.burakcanaksoy.realestate.model.Vehicle> results = vehicleRepository
                    .search(vehicleFilter, Pageable.unpaged()).getContent();
            log.info("Vehicle search results count: {}", results.size());
            allListings.addAll(results);
        }

        if (searchWorkplace) {
            WorkplaceFilterRequest workplaceFilter = new WorkplaceFilterRequest();
            workplaceFilter.setCity(filter.getCity());
            workplaceFilter.setDistrict(filter.getDistrict());
            workplaceFilter.setCategorySlug(categorySlug);
            workplaceFilter.setStatus(filter.getStatus());
            workplaceFilter.setMinPrice(filter.getMinPrice());
            workplaceFilter.setMaxPrice(filter.getMaxPrice());
            workplaceFilter.setOwnerId(filter.getOwnerId());
            List<com.burakcanaksoy.realestate.model.Workplace> results = workplaceRepository
                    .search(workplaceFilter, Pageable.unpaged()).getContent();
            log.info("Workplace search results count: {}", results.size());
            allListings.addAll(results);
        }

        // Tarihe göre sırala (en yeni önce)
        allListings.sort(Comparator.comparing(BaseListing::getCreatedAt).reversed());

        // Sayfalama uygula
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), allListings.size());
        List<BaseListing> pageList = start < allListings.size() ? allListings.subList(start, end) : new ArrayList<>();

        return new PageImpl<>(
                pageList.stream().map(this::convertToResponseWithImage).toList(),
                pageable,
                allListings.size());
    }

    public List<BaseListingResponse> getListingsByOwnerId(Long ownerId) {
        List<BaseListing> userListings = new ArrayList<>();
        userListings.addAll(realEstateRepository.findAllByCreatedById(ownerId));
        userListings.addAll(landRepository.findAllByCreatedById(ownerId));
        userListings.addAll(vehicleRepository.findAllByCreatedById(ownerId));
        userListings.addAll(workplaceRepository.findAllByCreatedById(ownerId));

        userListings.sort(Comparator.comparing(BaseListing::getCreatedAt).reversed());

        return userListings.stream()
                .map(this::convertToResponseWithImage)
                .toList();
    }

    public List<CategoryStatsResponse> getCategoryStats() {
        List<CategoryStatsResponse> stats = new ArrayList<>();

        // Konut (Real Estate)
        long realEstateCount = realEstateRepository.count();
        stats.add(new CategoryStatsResponse("emlak", "Emlak", realEstateCount));

        // Vasıta (Vehicle)
        long vehicleCount = vehicleRepository.count();
        stats.add(new CategoryStatsResponse("arac", "Araçlar", vehicleCount));

        // Arsa (Land)
        long landCount = landRepository.count();
        stats.add(new CategoryStatsResponse("arsa", "Arsalar", landCount));

        // İşyeri (Workplace)
        long workplaceCount = workplaceRepository.count();
        stats.add(new CategoryStatsResponse("isyeri", "İşyerleri", workplaceCount));

        return stats;
    }

    private BaseListingResponse convertToResponseWithImage(BaseListing listing) {
        BaseListingResponse response = BaseListingMapper.toResponse(listing);

        // Fetch first image if available
        imageRepository
                .findFirstByListingIdAndListingTypeOrderByDisplayOrderAsc(listing.getId(), response.getListingType())
                .ifPresent(image -> response.setImageUrl("/api/images/view/" + image.getId()));

        // Fetch first video if available
        videoRepository.findByListingIdAndListingTypeOrderByDisplayOrderAsc(listing.getId(), response.getListingType())
                .stream().findFirst()
                .ifPresent(video -> response.setVideoUrl("/api/listings/videos/" + video.getId()));

        return response;
    }
}