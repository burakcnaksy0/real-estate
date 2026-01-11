package com.burakcanaksoy.realestate.service;

import com.burakcanaksoy.realestate.mapper.BaseListingMapper;
import com.burakcanaksoy.realestate.model.BaseListing;
import com.burakcanaksoy.realestate.repository.ImageRepository;
import com.burakcanaksoy.realestate.repository.LandRepository;
import com.burakcanaksoy.realestate.repository.RealEstateRepository;
import com.burakcanaksoy.realestate.repository.VehicleRepository;
import com.burakcanaksoy.realestate.repository.WorkplaceRepository;
import com.burakcanaksoy.realestate.request.GeneralFilterRequest;
import com.burakcanaksoy.realestate.request.LandFilterRequest;
import com.burakcanaksoy.realestate.request.RealEstateFilterRequest;
import com.burakcanaksoy.realestate.request.VehicleFilterRequest;
import com.burakcanaksoy.realestate.request.WorkplaceFilterRequest;
import com.burakcanaksoy.realestate.response.BaseListingResponse;
import com.burakcanaksoy.realestate.response.CategoryStatsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ListingService {

    private final RealEstateRepository realEstateRepository;
    private final LandRepository landRepository;
    private final VehicleRepository vehicleRepository;
    private final WorkplaceRepository workplaceRepository;
    private final ImageRepository imageRepository; // Inject added

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
        List<BaseListing> allListings = new ArrayList<>();

        // Her ilan tipine özgü filter request oluştur ve ara
        RealEstateFilterRequest realEstateFilter = new RealEstateFilterRequest();
        realEstateFilter.setCity(filter.getCity());
        realEstateFilter.setDistrict(filter.getDistrict());
        realEstateFilter.setCategorySlug(filter.getCategorySlug());
        realEstateFilter.setStatus(filter.getStatus());
        realEstateFilter.setMinPrice(filter.getMinPrice());
        realEstateFilter.setMaxPrice(filter.getMaxPrice());

        LandFilterRequest landFilter = new LandFilterRequest();
        landFilter.setCity(filter.getCity());
        landFilter.setDistrict(filter.getDistrict());
        landFilter.setCategorySlug(filter.getCategorySlug());
        landFilter.setStatus(filter.getStatus());
        landFilter.setMinPrice(filter.getMinPrice());
        landFilter.setMaxPrice(filter.getMaxPrice());

        VehicleFilterRequest vehicleFilter = new VehicleFilterRequest();
        vehicleFilter.setCity(filter.getCity());
        vehicleFilter.setDistrict(filter.getDistrict());
        vehicleFilter.setCategorySlug(filter.getCategorySlug());
        vehicleFilter.setStatus(filter.getStatus());
        vehicleFilter.setMinPrice(filter.getMinPrice());
        vehicleFilter.setMaxPrice(filter.getMaxPrice());

        WorkplaceFilterRequest workplaceFilter = new WorkplaceFilterRequest();
        workplaceFilter.setCity(filter.getCity());
        workplaceFilter.setDistrict(filter.getDistrict());
        workplaceFilter.setCategorySlug(filter.getCategorySlug());
        workplaceFilter.setStatus(filter.getStatus());
        workplaceFilter.setMinPrice(filter.getMinPrice());
        workplaceFilter.setMaxPrice(filter.getMaxPrice());

        // Tüm repository'lerden filtrelenmiş sonuçları al
        allListings.addAll(realEstateRepository.search(realEstateFilter, Pageable.unpaged()).getContent());
        allListings.addAll(landRepository.search(landFilter, Pageable.unpaged()).getContent());
        allListings.addAll(vehicleRepository.search(vehicleFilter, Pageable.unpaged()).getContent());
        allListings.addAll(workplaceRepository.search(workplaceFilter, Pageable.unpaged()).getContent());

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
        stats.add(new CategoryStatsResponse("konut", "Emlak", realEstateCount));

        // Vasıta (Vehicle)
        long vehicleCount = vehicleRepository.count();
        stats.add(new CategoryStatsResponse("vasita", "Araçlar", vehicleCount));

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

        return response;
    }
}