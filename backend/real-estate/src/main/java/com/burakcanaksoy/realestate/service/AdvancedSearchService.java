package com.burakcanaksoy.realestate.service;

import com.burakcanaksoy.realestate.mapper.BaseListingMapper;
import com.burakcanaksoy.realestate.model.BaseListing;
import com.burakcanaksoy.realestate.repository.*;
import com.burakcanaksoy.realestate.request.AdvancedSearchRequest;
import com.burakcanaksoy.realestate.response.BaseListingResponse;
import com.burakcanaksoy.realestate.response.SearchSuggestion;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdvancedSearchService {

    @PersistenceContext
    private EntityManager entityManager;

    private final ImageRepository imageRepository;

    /**
     * Advanced search with full-text, geospatial, and multi-criteria filtering
     */
    public Page<BaseListingResponse> advancedSearch(AdvancedSearchRequest request, Pageable pageable) {
        StringBuilder sql = new StringBuilder("SELECT * FROM listings WHERE 1=1");
        Map<String, Object> params = new HashMap<>();

        // Full-text search
        if (request.getQuery() != null && !request.getQuery().trim().isEmpty()) {
            sql.append(" AND search_vector @@ to_tsquery('turkish', :query)");
            params.put("query", formatSearchQuery(request.getQuery()));
        }

        // Geospatial search (within radius)
        if (request.getLatitude() != null && request.getLongitude() != null && request.getRadiusKm() != null) {
            sql.append(
                    " AND ST_DWithin(location, ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography, :radiusMeters)");
            params.put("latitude", request.getLatitude());
            params.put("longitude", request.getLongitude());
            params.put("radiusMeters", request.getRadiusKm() * 1000); // Convert km to meters
        }

        // City filter
        if (request.getCity() != null && !request.getCity().trim().isEmpty()) {
            sql.append(" AND LOWER(city) = LOWER(:city)");
            params.put("city", request.getCity());
        }

        // District filter
        if (request.getDistrict() != null && !request.getDistrict().trim().isEmpty()) {
            sql.append(" AND LOWER(district) = LOWER(:district)");
            params.put("district", request.getDistrict());
        }

        // Status filter
        if (request.getStatus() != null) {
            sql.append(" AND status = :status");
            params.put("status", request.getStatus().name());
        }

        // Price range
        if (request.getMinPrice() != null) {
            sql.append(" AND price >= :minPrice");
            params.put("minPrice", request.getMinPrice());
        }
        if (request.getMaxPrice() != null) {
            sql.append(" AND price <= :maxPrice");
            params.put("maxPrice", request.getMaxPrice());
        }

        // Sorting
        String orderBy = " ORDER BY ";
        if ("price".equals(request.getSortBy())) {
            orderBy += "price " + ("desc".equalsIgnoreCase(request.getSortOrder()) ? "DESC" : "ASC");
        } else if ("distance".equals(request.getSortBy()) && request.getLatitude() != null
                && request.getLongitude() != null) {
            orderBy += "ST_Distance(location, ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326))";
        } else if ("relevance".equals(request.getSortBy()) && request.getQuery() != null) {
            orderBy += "ts_rank(search_vector, to_tsquery('turkish', :query)) DESC";
        } else {
            orderBy += "created_at DESC"; // Default: newest first
        }
        sql.append(orderBy);

        // Count query
        String countSql = "SELECT COUNT(*) FROM listings WHERE 1=1" +
                sql.substring(sql.indexOf("WHERE 1=1") + 9, sql.indexOf("ORDER BY"));

        Query countQuery = entityManager.createNativeQuery(countSql);
        params.forEach(countQuery::setParameter);
        long total = ((Number) countQuery.getSingleResult()).longValue();

        // Main query with pagination
        Query query = entityManager.createNativeQuery(sql.toString(), BaseListing.class);
        params.forEach(query::setParameter);
        query.setFirstResult((int) pageable.getOffset());
        query.setMaxResults(pageable.getPageSize());

        @SuppressWarnings("unchecked")
        List<BaseListing> listings = query.getResultList();

        List<BaseListingResponse> responses = listings.stream()
                .map(this::convertToResponseWithImage)
                .collect(Collectors.toList());

        return new PageImpl<>(responses, pageable, total);
    }

    /**
     * Get search suggestions for autocomplete
     */
    public List<SearchSuggestion> getSuggestions(String query) {
        List<SearchSuggestion> suggestions = new ArrayList<>();

        if (query == null || query.trim().length() < 2) {
            return suggestions;
        }

        String searchTerm = "%" + query.trim() + "%";

        // City suggestions - using ILIKE for case-insensitive search with Turkish
        // characters
        String citySql = "SELECT DISTINCT city, COUNT(*) as cnt FROM listings " +
                "WHERE city ILIKE :searchTerm GROUP BY city ORDER BY cnt DESC LIMIT 5";
        Query cityQuery = entityManager.createNativeQuery(citySql);
        cityQuery.setParameter("searchTerm", searchTerm);

        @SuppressWarnings("unchecked")
        List<Object[]> cityResults = cityQuery.getResultList();
        for (Object[] row : cityResults) {
            suggestions.add(new SearchSuggestion((String) row[0], "city", ((Number) row[1]).longValue()));
        }

        // District suggestions - using ILIKE for case-insensitive search with Turkish
        // characters
        String districtSql = "SELECT DISTINCT district, COUNT(*) as cnt FROM listings " +
                "WHERE district ILIKE :searchTerm GROUP BY district ORDER BY cnt DESC LIMIT 5";
        Query districtQuery = entityManager.createNativeQuery(districtSql);
        districtQuery.setParameter("searchTerm", searchTerm);

        @SuppressWarnings("unchecked")
        List<Object[]> districtResults = districtQuery.getResultList();
        for (Object[] row : districtResults) {
            suggestions.add(new SearchSuggestion((String) row[0], "district", ((Number) row[1]).longValue()));
        }

        return suggestions;
    }

    /**
     * Search for nearby listings using geospatial queries
     */
    public Page<BaseListingResponse> searchNearby(Double latitude, Double longitude, Double radiusKm,
            Pageable pageable) {
        String sql = "SELECT * FROM listings " +
                "WHERE location IS NOT NULL " +
                "AND ST_DWithin(location, ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography, :radiusMeters) "
                +
                "ORDER BY ST_Distance(location, ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326))";

        String countSql = "SELECT COUNT(*) FROM listings " +
                "WHERE location IS NOT NULL " +
                "AND ST_DWithin(location, ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography, :radiusMeters)";

        Query countQuery = entityManager.createNativeQuery(countSql);
        countQuery.setParameter("latitude", latitude);
        countQuery.setParameter("longitude", longitude);
        countQuery.setParameter("radiusMeters", radiusKm * 1000);
        long total = ((Number) countQuery.getSingleResult()).longValue();

        Query query = entityManager.createNativeQuery(sql, BaseListing.class);
        query.setParameter("latitude", latitude);
        query.setParameter("longitude", longitude);
        query.setParameter("radiusMeters", radiusKm * 1000);
        query.setFirstResult((int) pageable.getOffset());
        query.setMaxResults(pageable.getPageSize());

        @SuppressWarnings("unchecked")
        List<BaseListing> listings = query.getResultList();

        List<BaseListingResponse> responses = listings.stream()
                .map(this::convertToResponseWithImage)
                .collect(Collectors.toList());

        return new PageImpl<>(responses, pageable, total);
    }

    /**
     * Format search query for PostgreSQL full-text search
     */
    private String formatSearchQuery(String query) {
        // Split by spaces and join with & for AND search
        // Example: "istanbul daire" -> "istanbul & daire"
        return Arrays.stream(query.trim().split("\\s+"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.joining(" & "));
    }

    /**
     * Convert BaseListing to BaseListingResponse with image
     */
    private BaseListingResponse convertToResponseWithImage(BaseListing listing) {
        BaseListingResponse response = BaseListingMapper.toResponse(listing);

        imageRepository
                .findFirstByListingIdAndListingTypeOrderByDisplayOrderAsc(listing.getId(), response.getListingType())
                .ifPresent(image -> response.setImageUrl("/api/images/view/" + image.getId()));

        return response;
    }
}
