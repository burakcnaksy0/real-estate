package com.burakcanaksoy.realestate.service;

import com.burakcanaksoy.realestate.model.*;
import com.burakcanaksoy.realestate.repository.*;
import com.burakcanaksoy.realestate.response.FavoriteResponse;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class FavoriteService {
    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final RealEstateRepository realEstateRepository;
    private final VehicleRepository vehicleRepository;
    private final LandRepository landRepository;
    private final WorkplaceRepository workplaceRepository;

    public FavoriteService(FavoriteRepository favoriteRepository,
            UserRepository userRepository,
            RealEstateRepository realEstateRepository,
            VehicleRepository vehicleRepository,
            LandRepository landRepository,
            WorkplaceRepository workplaceRepository) {
        this.favoriteRepository = favoriteRepository;
        this.userRepository = userRepository;
        this.realEstateRepository = realEstateRepository;
        this.vehicleRepository = vehicleRepository;
        this.landRepository = landRepository;
        this.workplaceRepository = workplaceRepository;
    }

    @Transactional
    public FavoriteResponse addFavorite(Long userId, Long listingId, String listingType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if already favorited
        if (favoriteRepository.existsByUserAndListingId(user, listingId)) {
            throw new RuntimeException("Listing already in favorites");
        }

        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setListingId(listingId);
        favorite.setListingType(listingType);

        Favorite saved = favoriteRepository.save(favorite);

        return mapToResponse(saved);
    }

    @Transactional
    public void removeFavorite(Long userId, Long listingId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        favoriteRepository.deleteByUserAndListingId(user, listingId);
    }

    public List<FavoriteResponse> getUserFavorites(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Favorite> favorites = favoriteRepository.findByUserOrderByCreatedAtDesc(user);
        List<FavoriteResponse> responses = new ArrayList<>();

        for (Favorite favorite : favorites) {
            FavoriteResponse response = mapToResponse(favorite);
            if (response != null) {
                responses.add(response);
            }
        }

        return responses;
    }

    public boolean isFavorite(Long userId, Long listingId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return favoriteRepository.existsByUserAndListingId(user, listingId);
    }

    private FavoriteResponse mapToResponse(Favorite favorite) {
        FavoriteResponse response = new FavoriteResponse();
        response.setId(favorite.getId());
        response.setListingId(favorite.getListingId());
        response.setListingType(favorite.getListingType());
        response.setCreatedAt(favorite.getCreatedAt());

        // Fetch listing details based on type
        switch (favorite.getListingType()) {
            case "REAL_ESTATE":
                realEstateRepository.findById(favorite.getListingId()).ifPresent(listing -> {
                    response.setTitle(listing.getTitle());
                    response.setDescription(listing.getDescription());
                    response.setPrice(listing.getPrice().doubleValue());
                    response.setCurrency(listing.getCurrency().toString());
                    response.setCity(listing.getCity());
                    response.setDistrict(listing.getDistrict());
                    response.setImageUrl(null); // Will be fetched separately if needed
                    response.setStatus(listing.getStatus().toString());
                });
                break;
            case "VEHICLE":
                vehicleRepository.findById(favorite.getListingId()).ifPresent(listing -> {
                    response.setTitle(listing.getTitle());
                    response.setDescription(listing.getDescription());
                    response.setPrice(listing.getPrice().doubleValue());
                    response.setCurrency(listing.getCurrency().toString());
                    response.setCity(listing.getCity());
                    response.setDistrict(listing.getDistrict());
                    response.setImageUrl(null);
                    response.setStatus(listing.getStatus().toString());
                });
                break;
            case "LAND":
                landRepository.findById(favorite.getListingId()).ifPresent(listing -> {
                    response.setTitle(listing.getTitle());
                    response.setDescription(listing.getDescription());
                    response.setPrice(listing.getPrice().doubleValue());
                    response.setCurrency(listing.getCurrency().toString());
                    response.setCity(listing.getCity());
                    response.setDistrict(listing.getDistrict());
                    response.setImageUrl(null);
                    response.setStatus(listing.getStatus().toString());
                });
                break;
            case "WORKPLACE":
                workplaceRepository.findById(favorite.getListingId()).ifPresent(listing -> {
                    response.setTitle(listing.getTitle());
                    response.setDescription(listing.getDescription());
                    response.setPrice(listing.getPrice().doubleValue());
                    response.setCurrency(listing.getCurrency().toString());
                    response.setCity(listing.getCity());
                    response.setDistrict(listing.getDistrict());
                    response.setImageUrl(null);
                    response.setStatus(listing.getStatus().toString());
                });
                break;
            default:
                return null;
        }

        return response;
    }
}
