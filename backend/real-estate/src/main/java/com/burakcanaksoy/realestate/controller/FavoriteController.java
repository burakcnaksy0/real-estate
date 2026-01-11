package com.burakcanaksoy.realestate.controller;

import com.burakcanaksoy.realestate.response.FavoriteResponse;
import com.burakcanaksoy.realestate.security.AuthService;
import com.burakcanaksoy.realestate.service.FavoriteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {
    private final FavoriteService favoriteService;
    private final AuthService authService;

    public FavoriteController(FavoriteService favoriteService, AuthService authService) {
        this.favoriteService = favoriteService;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<FavoriteResponse> addFavorite(
            @RequestParam Long listingId,
            @RequestParam String listingType) {
        Long userId = authService.getCurrentUser().getId();
        FavoriteResponse response = favoriteService.addFavorite(userId, listingId, listingType);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @DeleteMapping("/{listingId}")
    public ResponseEntity<String> removeFavorite(@PathVariable Long listingId) {
        Long userId = authService.getCurrentUser().getId();
        favoriteService.removeFavorite(userId, listingId);
        return ResponseEntity.ok("Favorite removed successfully");
    }

    @GetMapping
    public ResponseEntity<List<FavoriteResponse>> getUserFavorites() {
        Long userId = authService.getCurrentUser().getId();
        List<FavoriteResponse> favorites = favoriteService.getUserFavorites(userId);
        return ResponseEntity.ok(favorites);
    }

    @GetMapping("/check/{listingId}")
    public ResponseEntity<Map<String, Boolean>> checkFavorite(@PathVariable Long listingId) {
        Long userId = authService.getCurrentUser().getId();
        boolean isFavorite = favoriteService.isFavorite(userId, listingId);

        Map<String, Boolean> response = new HashMap<>();
        response.put("isFavorite", isFavorite);

        return ResponseEntity.ok(response);
    }
}
