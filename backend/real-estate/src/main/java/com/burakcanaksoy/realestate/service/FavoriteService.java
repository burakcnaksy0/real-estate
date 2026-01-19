package com.burakcanaksoy.realestate.service;

import com.burakcanaksoy.realestate.event.FavoriteCountUpdateEvent;
import com.burakcanaksoy.realestate.mapper.BaseListingMapper;
import com.burakcanaksoy.realestate.model.*;
import com.burakcanaksoy.realestate.repository.*;
import com.burakcanaksoy.realestate.response.BaseListingResponse;
import com.burakcanaksoy.realestate.response.FavoriteResponse;
import jakarta.transaction.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;
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
    private final ImageRepository imageRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    public FavoriteService(FavoriteRepository favoriteRepository,
            UserRepository userRepository,
            RealEstateRepository realEstateRepository,
            VehicleRepository vehicleRepository,
            LandRepository landRepository,
            WorkplaceRepository workplaceRepository,
            ImageRepository imageRepository,
            SimpMessagingTemplate messagingTemplate,
            NotificationService notificationService) {
        this.favoriteRepository = favoriteRepository;
        this.userRepository = userRepository;
        this.realEstateRepository = realEstateRepository;
        this.vehicleRepository = vehicleRepository;
        this.landRepository = landRepository;
        this.workplaceRepository = workplaceRepository;
        this.imageRepository = imageRepository;
        this.messagingTemplate = messagingTemplate;
        this.notificationService = notificationService;
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

        // Increment favorite count
        incrementFavoriteCount(listingId, listingType);

        // Notify listing owner
        notifyListingOwner(listingId, listingType, user);

        return mapToResponse(saved);
    }

    @Transactional
    public void removeFavorite(Long userId, Long listingId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get the favorite to know the listing type before deleting
        Favorite favorite = favoriteRepository.findByUserAndListingId(user, listingId)
                .orElseThrow(() -> new RuntimeException("Favorite not found"));

        String listingType = favorite.getListingType();
        favoriteRepository.deleteByUserAndListingId(user, listingId);

        // Decrement favorite count
        decrementFavoriteCount(listingId, listingType);
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

    private void incrementFavoriteCount(Long listingId, String listingType) {
        switch (listingType) {
            case "REAL_ESTATE":
                realEstateRepository.findById(listingId).ifPresent(listing -> {
                    listing.setFavoriteCount(listing.getFavoriteCount() + 1);
                    realEstateRepository.save(listing);
                });
                realEstateRepository.findById(listingId).ifPresent(listing -> {
                    messagingTemplate.convertAndSend(
                            "/topic/listing/" + listingId + "/favoriteCount",
                            new FavoriteCountUpdateEvent(listingId, listingType, listing.getFavoriteCount()));
                });
                break;
            case "VEHICLE":
                vehicleRepository.findById(listingId).ifPresent(listing -> {
                    listing.setFavoriteCount(listing.getFavoriteCount() + 1);
                    vehicleRepository.save(listing);
                });
                vehicleRepository.findById(listingId).ifPresent(listing -> {
                    messagingTemplate.convertAndSend(
                            "/topic/listing/" + listingId + "/favoriteCount",
                            new FavoriteCountUpdateEvent(listingId, listingType, listing.getFavoriteCount()));
                });
                break;
            case "LAND":
                landRepository.findById(listingId).ifPresent(listing -> {
                    listing.setFavoriteCount(listing.getFavoriteCount() + 1);
                    landRepository.save(listing);
                });
                landRepository.findById(listingId).ifPresent(listing -> {
                    messagingTemplate.convertAndSend(
                            "/topic/listing/" + listingId + "/favoriteCount",
                            new FavoriteCountUpdateEvent(listingId, listingType, listing.getFavoriteCount()));
                });
                break;
            case "WORKPLACE":
                workplaceRepository.findById(listingId).ifPresent(listing -> {
                    listing.setFavoriteCount(listing.getFavoriteCount() + 1);
                    workplaceRepository.save(listing);
                });
                workplaceRepository.findById(listingId).ifPresent(listing -> {
                    messagingTemplate.convertAndSend(
                            "/topic/listing/" + listingId + "/favoriteCount",
                            new FavoriteCountUpdateEvent(listingId, listingType, listing.getFavoriteCount()));
                });
                break;
        }
    }

    private void decrementFavoriteCount(Long listingId, String listingType) {
        switch (listingType) {
            case "REAL_ESTATE":
                realEstateRepository.findById(listingId).ifPresent(listing -> {
                    long newCount = Math.max(0, listing.getFavoriteCount() - 1);
                    listing.setFavoriteCount(newCount);
                    realEstateRepository.save(listing);
                });
                realEstateRepository.findById(listingId).ifPresent(listing -> {
                    messagingTemplate.convertAndSend(
                            "/topic/listing/" + listingId + "/favoriteCount",
                            new FavoriteCountUpdateEvent(listingId, listingType, listing.getFavoriteCount()));
                });
                break;
            case "VEHICLE":
                vehicleRepository.findById(listingId).ifPresent(listing -> {
                    long newCount = Math.max(0, listing.getFavoriteCount() - 1);
                    listing.setFavoriteCount(newCount);
                    vehicleRepository.save(listing);
                });
                vehicleRepository.findById(listingId).ifPresent(listing -> {
                    messagingTemplate.convertAndSend(
                            "/topic/listing/" + listingId + "/favoriteCount",
                            new FavoriteCountUpdateEvent(listingId, listingType, listing.getFavoriteCount()));
                });
                break;
            case "LAND":
                landRepository.findById(listingId).ifPresent(listing -> {
                    long newCount = Math.max(0, listing.getFavoriteCount() - 1);
                    listing.setFavoriteCount(newCount);
                    landRepository.save(listing);
                });
                landRepository.findById(listingId).ifPresent(listing -> {
                    messagingTemplate.convertAndSend(
                            "/topic/listing/" + listingId + "/favoriteCount",
                            new FavoriteCountUpdateEvent(listingId, listingType, listing.getFavoriteCount()));
                });
                break;
            case "WORKPLACE":
                workplaceRepository.findById(listingId).ifPresent(listing -> {
                    long newCount = Math.max(0, listing.getFavoriteCount() - 1);
                    listing.setFavoriteCount(newCount);
                    workplaceRepository.save(listing);
                });
                workplaceRepository.findById(listingId).ifPresent(listing -> {
                    messagingTemplate.convertAndSend(
                            "/topic/listing/" + listingId + "/favoriteCount",
                            new FavoriteCountUpdateEvent(listingId, listingType, listing.getFavoriteCount()));
                });
                break;
        }
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
                    response.setImageUrl(imageRepository
                            .findFirstByListingIdAndListingTypeOrderByDisplayOrderAsc(favorite.getListingId(),
                                    "REAL_ESTATE")
                            .map(image -> "/api/images/view/" + image.getId()).orElse(null));
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
                    response.setImageUrl(imageRepository
                            .findFirstByListingIdAndListingTypeOrderByDisplayOrderAsc(favorite.getListingId(),
                                    "VEHICLE")
                            .map(image -> "/api/images/view/" + image.getId()).orElse(null));
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
                    response.setImageUrl(imageRepository
                            .findFirstByListingIdAndListingTypeOrderByDisplayOrderAsc(favorite.getListingId(), "LAND")
                            .map(image -> "/api/images/view/" + image.getId()).orElse(null));
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
                    response.setImageUrl(imageRepository
                            .findFirstByListingIdAndListingTypeOrderByDisplayOrderAsc(favorite.getListingId(),
                                    "WORKPLACE")
                            .map(image -> "/api/images/view/" + image.getId()).orElse(null));
                    response.setStatus(listing.getStatus().toString());
                });
                break;
            default:
                return null;
        }

        return response;
    }

    private BaseListingResponse convertToResponseWithImage(BaseListing listing) {
        BaseListingResponse response = BaseListingMapper.toResponse(listing);

        // Fetch first image if available
        imageRepository
                .findFirstByListingIdAndListingTypeOrderByDisplayOrderAsc(listing.getId(), response.getListingType())
                .ifPresent(image -> response.setImageUrl("/api/images/view/" + image.getId()));

        return response;
    }

    private void notifyListingOwner(Long listingId, String listingType, User favoritedBy) {
        BaseListing listing = null;
        switch (listingType) {
            case "REAL_ESTATE":
                listing = realEstateRepository.findById(listingId).orElse(null);
                break;
            case "VEHICLE":
                listing = vehicleRepository.findById(listingId).orElse(null);
                break;
            case "LAND":
                listing = landRepository.findById(listingId).orElse(null);
                break;
            case "WORKPLACE":
                listing = workplaceRepository.findById(listingId).orElse(null);
                break;
        }

        if (listing != null && listing.getCreatedBy() != null
                && !listing.getCreatedBy().getId().equals(favoritedBy.getId())) {
            notificationService.sendNotification(
                    listing.getCreatedBy().getId(),
                    "İlanınız Favoriye Eklendi",
                    favoritedBy.getName() + " " + favoritedBy.getSurname() + " ilanınızı favorilerine ekledi: "
                            + listing.getTitle(),
                    NotificationType.FAVORITE,
                    listingId,
                    listingType);
        }
    }
}
