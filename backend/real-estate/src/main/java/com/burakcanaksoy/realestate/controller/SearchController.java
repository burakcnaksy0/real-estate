package com.burakcanaksoy.realestate.controller;

import com.burakcanaksoy.realestate.model.User;
import com.burakcanaksoy.realestate.repository.UserRepository;
import com.burakcanaksoy.realestate.request.AdvancedSearchRequest;
import com.burakcanaksoy.realestate.request.SavedSearchRequest;
import com.burakcanaksoy.realestate.response.BaseListingResponse;
import com.burakcanaksoy.realestate.response.SavedSearchResponse;
import com.burakcanaksoy.realestate.response.SearchSuggestion;
import com.burakcanaksoy.realestate.service.AdvancedSearchService;
import com.burakcanaksoy.realestate.service.SavedSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final AdvancedSearchService advancedSearchService;
    private final SavedSearchService savedSearchService;
    private final UserRepository userRepository;

    /**
     * Advanced search with full-text, geospatial, and multi-criteria filtering
     * GET
     * /api/search/advanced?query=istanbul&city=Istanbul&minPrice=100000&maxPrice=500000&page=0&size=20
     */
    @GetMapping("/advanced")
    public ResponseEntity<Page<BaseListingResponse>> advancedSearch(
            @ModelAttribute AdvancedSearchRequest request,
            Pageable pageable) {
        return ResponseEntity.ok(advancedSearchService.advancedSearch(request, pageable));
    }

    /**
     * Get search suggestions for autocomplete
     * GET /api/search/suggestions?q=istan
     */
    @GetMapping("/suggestions")
    public ResponseEntity<List<SearchSuggestion>> getSuggestions(@RequestParam("q") String query) {
        return ResponseEntity.ok(advancedSearchService.getSuggestions(query));
    }

    /**
     * Search for nearby listings using geospatial queries
     * GET /api/search/nearby?lat=41.0082&lng=28.9784&radius=5&page=0&size=20
     */
    @GetMapping("/nearby")
    public ResponseEntity<Page<BaseListingResponse>> searchNearby(
            @RequestParam("lat") Double latitude,
            @RequestParam("lng") Double longitude,
            @RequestParam(value = "radius", defaultValue = "5") Double radiusKm,
            Pageable pageable) {
        return ResponseEntity.ok(advancedSearchService.searchNearby(latitude, longitude, radiusKm, pageable));
    }

    /**
     * Save a search for the authenticated user
     * POST /api/search/saved
     */
    @PostMapping("/saved")
    public ResponseEntity<SavedSearchResponse> saveSearch(
            @RequestBody SavedSearchRequest request,
            Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        return ResponseEntity.ok(savedSearchService.saveSearch(request, user));
    }

    /**
     * Get all saved searches for the authenticated user
     * GET /api/search/saved
     */
    @GetMapping("/saved")
    public ResponseEntity<List<SavedSearchResponse>> getSavedSearches(Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        return ResponseEntity.ok(savedSearchService.getUserSavedSearches(user.getId()));
    }

    /**
     * Get a specific saved search
     * GET /api/search/saved/{id}
     */
    @GetMapping("/saved/{id}")
    public ResponseEntity<SavedSearchResponse> getSavedSearch(
            @PathVariable Long id,
            Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        return ResponseEntity.ok(savedSearchService.getSavedSearch(id, user.getId()));
    }

    /**
     * Update a saved search
     * PUT /api/search/saved/{id}
     */
    @PutMapping("/saved/{id}")
    public ResponseEntity<SavedSearchResponse> updateSavedSearch(
            @PathVariable Long id,
            @RequestBody SavedSearchRequest request,
            Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        return ResponseEntity.ok(savedSearchService.updateSavedSearch(id, request, user.getId()));
    }

    /**
     * Delete a saved search
     * DELETE /api/search/saved/{id}
     */
    @DeleteMapping("/saved/{id}")
    public ResponseEntity<Void> deleteSavedSearch(
            @PathVariable Long id,
            Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        savedSearchService.deleteSavedSearch(id, user.getId());
        return ResponseEntity.noContent().build();
    }

    /**
     * Execute a saved search (get results for a saved search)
     * GET /api/search/saved/{id}/execute
     */
    @GetMapping("/saved/{id}/execute")
    public ResponseEntity<Page<BaseListingResponse>> executeSavedSearch(
            @PathVariable Long id,
            Authentication authentication,
            Pageable pageable) {
        User user = getUserFromAuthentication(authentication);
        SavedSearchResponse savedSearch = savedSearchService.getSavedSearch(id, user.getId());

        // Convert saved criteria to AdvancedSearchRequest
        AdvancedSearchRequest request = new AdvancedSearchRequest();
        // Map the criteria from savedSearch to request
        if (savedSearch.getSearchCriteria() != null) {
            // This is a simplified mapping - in production, you'd want more robust
            // conversion
            request.setQuery((String) savedSearch.getSearchCriteria().get("query"));
            request.setCity((String) savedSearch.getSearchCriteria().get("city"));
            request.setDistrict((String) savedSearch.getSearchCriteria().get("district"));
        }

        return ResponseEntity.ok(advancedSearchService.advancedSearch(request, pageable));
    }

    private User getUserFromAuthentication(Authentication authentication) {
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }
}
