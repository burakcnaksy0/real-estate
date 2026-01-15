package com.burakcanaksoy.realestate.service;

import com.burakcanaksoy.realestate.model.User;
import com.burakcanaksoy.realestate.model.enums.ListingStatus;
import com.burakcanaksoy.realestate.repository.*;
import com.burakcanaksoy.realestate.response.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminAnalyticsService {

    private final UserRepository userRepository;
    private final RealEstateRepository realEstateRepository;
    private final VehicleRepository vehicleRepository;
    private final LandRepository landRepository;
    private final WorkplaceRepository workplaceRepository;
    private final FavoriteRepository favoriteRepository;
    private final MessageRepository messageRepository;

    public UserStatsDTO getUserStatistics() {
        Long totalUsers = userRepository.count();
        Long activeUsers = userRepository.countByEnabledTrue();

        // Count OAuth users (Google, Facebook, etc.)
        Long oauthUsers = userRepository.countByProvider("GOOGLE");

        // Users registered in last 7 days
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        Long last7DaysUsers = userRepository.countByCreatedAtAfter(sevenDaysAgo);

        // Users registered in last 30 days
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        Long last30DaysUsers = userRepository.countByCreatedAtAfter(thirtyDaysAgo);

        return new UserStatsDTO(totalUsers, activeUsers, oauthUsers, last7DaysUsers, last30DaysUsers);
    }

    public ListingStatsDTO getListingStatistics() {
        Long realEstateCount = realEstateRepository.count();
        Long vehicleCount = vehicleRepository.count();
        Long landCount = landRepository.count();
        Long workplaceCount = workplaceRepository.count();

        Long totalListings = realEstateCount + vehicleCount + landCount + workplaceCount;

        // Count active listings across all categories
        Long activeRealEstate = realEstateRepository.countByStatus(ListingStatus.ACTIVE);
        Long activeVehicles = vehicleRepository.countByStatus(ListingStatus.ACTIVE);
        Long activeLands = landRepository.countByStatus(ListingStatus.ACTIVE);
        Long activeWorkplaces = workplaceRepository.countByStatus(ListingStatus.ACTIVE);

        Long activeListings = activeRealEstate + activeVehicles + activeLands + activeWorkplaces;

        return new ListingStatsDTO(totalListings, activeListings, realEstateCount, vehicleCount, landCount,
                workplaceCount);
    }

    public List<ActivityLogDTO> getRecentActivities(int limit) {
        List<ActivityLogDTO> activities = new ArrayList<>();

        // Get recent users
        List<User> recentUsers = userRepository.findTop10ByOrderByCreatedAtDesc();
        for (User user : recentUsers) {
            activities.add(new ActivityLogDTO(
                    user.getId(),
                    "USER_REGISTERED",
                    "Yeni kullanıcı kaydı: " + user.getUsername(),
                    user.getCreatedAt(),
                    user.getUsername()));
        }

        // Get recent real estate listings
        realEstateRepository.findTop10ByOrderByCreatedAtDesc().forEach(listing -> {
            activities.add(new ActivityLogDTO(
                    listing.getId(),
                    "LISTING_CREATED",
                    "Yeni emlak ilanı: " + listing.getTitle(),
                    listing.getCreatedAt(),
                    listing.getCreatedBy().getUsername()));
        });

        // Get recent vehicle listings
        vehicleRepository.findTop10ByOrderByCreatedAtDesc().forEach(listing -> {
            activities.add(new ActivityLogDTO(
                    listing.getId(),
                    "LISTING_CREATED",
                    "Yeni araç ilanı: " + listing.getTitle(),
                    listing.getCreatedAt(),
                    listing.getCreatedBy().getUsername()));
        });

        // Sort by timestamp descending and limit
        return activities.stream()
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    public List<GrowthDataDTO> getUserGrowthData(int months) {
        LocalDateTime startDate = LocalDateTime.now().minusMonths(months);
        List<Object[]> rawData = userRepository.getUserGrowthData(startDate);

        return rawData.stream()
                .map(row -> new GrowthDataDTO((String) row[0], ((Number) row[1]).longValue()))
                .collect(Collectors.toList());
    }

    public List<GrowthDataDTO> getListingGrowthData(int months) {
        LocalDateTime startDate = LocalDateTime.now().minusMonths(months);
        List<GrowthDataDTO> growthData = new ArrayList<>();

        // Generate month labels
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        for (int i = months - 1; i >= 0; i--) {
            LocalDateTime monthDate = LocalDateTime.now().minusMonths(i);
            String monthLabel = monthDate.format(formatter);

            LocalDateTime monthStart = monthDate.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime monthEnd = monthStart.plusMonths(1);

            // Count listings created in this month
            Long realEstateCount = realEstateRepository.countByCreatedAtAfter(monthStart) -
                    realEstateRepository.countByCreatedAtAfter(monthEnd);
            Long vehicleCount = vehicleRepository.countByCreatedAtAfter(monthStart) -
                    vehicleRepository.countByCreatedAtAfter(monthEnd);
            Long landCount = landRepository.countByCreatedAtAfter(monthStart) -
                    landRepository.countByCreatedAtAfter(monthEnd);
            Long workplaceCount = workplaceRepository.countByCreatedAtAfter(monthStart) -
                    workplaceRepository.countByCreatedAtAfter(monthEnd);

            Long totalCount = realEstateCount + vehicleCount + landCount + workplaceCount;

            growthData.add(new GrowthDataDTO(monthLabel, totalCount));
        }

        return growthData;
    }

    public List<CityDistributionDTO> getCityDistribution() {
        // This would ideally be a custom query, but for simplicity we'll aggregate in
        // Java
        List<CityDistributionDTO> distribution = new ArrayList<>();

        // Get all listings and group by city
        // For now, returning a placeholder - in production, this should be a proper
        // GROUP BY query
        distribution.add(new CityDistributionDTO("İstanbul", 0L));
        distribution.add(new CityDistributionDTO("Ankara", 0L));
        distribution.add(new CityDistributionDTO("İzmir", 0L));
        distribution.add(new CityDistributionDTO("Diğer", 0L));

        return distribution;
    }
}
