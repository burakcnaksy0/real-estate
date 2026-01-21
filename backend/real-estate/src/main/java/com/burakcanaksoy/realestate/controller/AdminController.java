package com.burakcanaksoy.realestate.controller;

import com.burakcanaksoy.realestate.response.*;
import com.burakcanaksoy.realestate.service.AdminAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminController {

    private final AdminAnalyticsService analyticsService;
    private final com.burakcanaksoy.realestate.service.UserService userService;

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<org.springframework.data.domain.Page<com.burakcanaksoy.realestate.model.User>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "desc") String sortDirection,
            @RequestParam(defaultValue = "createdAt") String sortBy) {
        org.springframework.data.domain.Sort.Direction direction = sortDirection.equalsIgnoreCase("asc")
                ? org.springframework.data.domain.Sort.Direction.ASC
                : org.springframework.data.domain.Sort.Direction.DESC;

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                org.springframework.data.domain.Sort.by(direction, sortBy));
        return ResponseEntity.ok(userService.getAllUsers(pageable));
    }

    @PutMapping("/users/{userId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> toggleUserStatus(@PathVariable Long userId) {
        try {
            userService.toggleUserStatus(userId);
            return ResponseEntity.ok(new MessageResponse("Kullanıcı durumu güncellendi"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/users/{userId}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> updateUserRoles(
            @PathVariable Long userId,
            @RequestBody java.util.Set<com.burakcanaksoy.realestate.model.enums.Role> roles) {
        try {
            userService.updateUserRoles(userId, roles);
            return ResponseEntity.ok(new MessageResponse("Kullanıcı rolleri güncellendi"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteUser(@PathVariable Long userId) {
        try {
            userService.deleteUser(userId);
            return ResponseEntity.ok(new MessageResponse("Kullanıcı başarıyla silindi"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/stats/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserStatsDTO> getUserStatistics() {
        UserStatsDTO stats = analyticsService.getUserStatistics();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/stats/listings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ListingStatsDTO> getListingStatistics() {
        ListingStatsDTO stats = analyticsService.getListingStatistics();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/stats/activities")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ActivityLogDTO>> getRecentActivities(
            @RequestParam(defaultValue = "20") int limit) {
        List<ActivityLogDTO> activities = analyticsService.getRecentActivities(limit);
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/stats/growth/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<GrowthDataDTO>> getUserGrowth(
            @RequestParam(defaultValue = "6") int months) {
        List<GrowthDataDTO> growthData = analyticsService.getUserGrowthData(months);
        return ResponseEntity.ok(growthData);
    }

    @GetMapping("/stats/growth/listings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<GrowthDataDTO>> getListingGrowth(
            @RequestParam(defaultValue = "6") int months) {
        List<GrowthDataDTO> growthData = analyticsService.getListingGrowthData(months);
        return ResponseEntity.ok(growthData);
    }

    @GetMapping("/stats/distribution/cities")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CityDistributionDTO>> getCityDistribution() {
        List<CityDistributionDTO> distribution = analyticsService.getCityDistribution();
        return ResponseEntity.ok(distribution);
    }
}
