package com.burakcanaksoy.realestate.service;

import com.burakcanaksoy.realestate.mapper.BaseListingMapper;
import com.burakcanaksoy.realestate.model.BaseListing;
import com.burakcanaksoy.realestate.repository.LandRepository;
import com.burakcanaksoy.realestate.repository.RealEstateRepository;
import com.burakcanaksoy.realestate.repository.VehicleRepository;
import com.burakcanaksoy.realestate.repository.WorkplaceRepository;
import com.burakcanaksoy.realestate.response.BaseListingResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ListingService {

    private final RealEstateRepository realEstateRepository;
    private final LandRepository landRepository;
    private final VehicleRepository vehicleRepository;
    private final WorkplaceRepository workplaceRepository;

    public List<BaseListingResponse> getAllListings() {
        List<BaseListing> allListings = new ArrayList<>();
        allListings.addAll(realEstateRepository.findAll());
        allListings.addAll(landRepository.findAll());
        allListings.addAll(vehicleRepository.findAll());
        allListings.addAll(workplaceRepository.findAll());

        return allListings.stream()
                .map(BaseListingMapper::toResponse)
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
        return new PageImpl<>(pageList.stream().map(BaseListingMapper::toResponse).toList(), pageable, allListings.size());
    }
}