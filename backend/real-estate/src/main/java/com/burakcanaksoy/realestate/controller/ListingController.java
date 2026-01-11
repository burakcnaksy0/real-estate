package com.burakcanaksoy.realestate.controller;

import com.burakcanaksoy.realestate.request.GeneralFilterRequest;
import com.burakcanaksoy.realestate.response.BaseListingResponse;
import com.burakcanaksoy.realestate.response.CategoryStatsResponse;
import com.burakcanaksoy.realestate.service.ListingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import com.burakcanaksoy.realestate.repository.UserRepository;
import com.burakcanaksoy.realestate.model.User;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
public class ListingController {

    private final ListingService listingService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<BaseListingResponse>> getAllListings() {
        return ResponseEntity.ok(listingService.getAllListings());
    }

    @GetMapping("/page")
    public ResponseEntity<Page<BaseListingResponse>> getAllListings(Pageable pageable) {
        return ResponseEntity.ok(listingService.getAllListings(pageable));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<BaseListingResponse>> search(@ModelAttribute GeneralFilterRequest filter,
            Pageable pageable) {
        return ResponseEntity.ok(listingService.search(filter, pageable));
    }

    @GetMapping("/stats")
    public ResponseEntity<List<CategoryStatsResponse>> getCategoryStats() {
        return ResponseEntity.ok(listingService.getCategoryStats());
    }

    @GetMapping("/my-listings")
    public ResponseEntity<List<BaseListingResponse>> getMyListings(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        return ResponseEntity.ok(listingService.getListingsByOwnerId(user.getId()));
    }
}