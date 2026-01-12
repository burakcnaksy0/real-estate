package com.burakcanaksoy.realestate.controller;

import com.burakcanaksoy.realestate.model.User;
import com.burakcanaksoy.realestate.repository.UserRepository;
import com.burakcanaksoy.realestate.request.ChangePasswordRequest;
import com.burakcanaksoy.realestate.request.UpdateProfileRequest;
import com.burakcanaksoy.realestate.response.FavoriteResponse;
import com.burakcanaksoy.realestate.response.MessageResponse;
import com.burakcanaksoy.realestate.security.AuthService;
import com.burakcanaksoy.realestate.service.FavoriteService;
import com.burakcanaksoy.realestate.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final FavoriteService favoriteService;
    private final AuthService authService;

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest request, Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: " + username));

        try {
            User updatedUser = userService.updateProfile(user.getId(), request);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Profil güncellenirken hata oluştu: " + e.getMessage()));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<MessageResponse> changePassword(@RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: " + username));

        try {
            userService.changePassword(user.getId(), request);
            return ResponseEntity.ok(new MessageResponse("Şifre başarıyla güncellendi"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/me/favorites")
    public ResponseEntity<List<FavoriteResponse>> getCurrentUserFavorites() {
        Long userId = authService.getCurrentUser().getId();
        List<FavoriteResponse> favorites = favoriteService.getUserFavorites(userId);
        return ResponseEntity.ok(favorites);
    }

    @PutMapping(value = "/profile-picture", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProfilePicture(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            Long userId = authService.getCurrentUser().getId();
            User updatedUser = userService.updateProfilePicture(userId, file);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Profil fotoğrafı güncellenirken hata oluştu: " + e.getMessage()));
        }
    }
}
