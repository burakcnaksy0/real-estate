package com.burakcanaksoy.realestate.service;

import com.burakcanaksoy.realestate.model.SavedSearch;
import com.burakcanaksoy.realestate.model.User;
import com.burakcanaksoy.realestate.repository.SavedSearchRepository;
import com.burakcanaksoy.realestate.request.SavedSearchRequest;
import com.burakcanaksoy.realestate.response.SavedSearchResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SavedSearchService {

    private final SavedSearchRepository savedSearchRepository;

    /**
     * Save a new search for a user
     */
    @Transactional
    public SavedSearchResponse saveSearch(SavedSearchRequest request, User user) {
        SavedSearch savedSearch = new SavedSearch();
        savedSearch.setUser(user);
        savedSearch.setName(request.getName());
        savedSearch.setSearchCriteria(request.getSearchCriteria());
        savedSearch.setNotificationEnabled(request.getNotificationEnabled());

        SavedSearch saved = savedSearchRepository.save(savedSearch);
        return toResponse(saved);
    }

    /**
     * Get all saved searches for a user
     */
    public List<SavedSearchResponse> getUserSavedSearches(Long userId) {
        return savedSearchRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get a specific saved search
     */
    public SavedSearchResponse getSavedSearch(Long id, Long userId) {
        SavedSearch savedSearch = savedSearchRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Saved search not found"));
        return toResponse(savedSearch);
    }

    /**
     * Update a saved search
     */
    @Transactional
    public SavedSearchResponse updateSavedSearch(Long id, SavedSearchRequest request, Long userId) {
        SavedSearch savedSearch = savedSearchRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Saved search not found"));

        savedSearch.setName(request.getName());
        savedSearch.setSearchCriteria(request.getSearchCriteria());
        savedSearch.setNotificationEnabled(request.getNotificationEnabled());

        SavedSearch updated = savedSearchRepository.save(savedSearch);
        return toResponse(updated);
    }

    /**
     * Delete a saved search
     */
    @Transactional
    public void deleteSavedSearch(Long id, Long userId) {
        savedSearchRepository.deleteByIdAndUserId(id, userId);
    }

    /**
     * Convert SavedSearch entity to response DTO
     */
    private SavedSearchResponse toResponse(SavedSearch savedSearch) {
        return new SavedSearchResponse(
                savedSearch.getId(),
                savedSearch.getName(),
                savedSearch.getSearchCriteria(),
                savedSearch.getNotificationEnabled(),
                savedSearch.getCreatedAt(),
                savedSearch.getUpdatedAt());
    }
}
