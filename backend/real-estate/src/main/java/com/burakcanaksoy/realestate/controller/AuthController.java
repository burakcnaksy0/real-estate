package com.burakcanaksoy.realestate.controller;

import com.burakcanaksoy.realestate.request.ForgotPasswordRequest;
import com.burakcanaksoy.realestate.request.LoginRequest;
import com.burakcanaksoy.realestate.request.RegisterRequest;
import com.burakcanaksoy.realestate.request.ResetPasswordRequest;
import com.burakcanaksoy.realestate.response.AuthResponse;
import com.burakcanaksoy.realestate.response.MessageResponse;
import com.burakcanaksoy.realestate.security.AuthService;
import com.burakcanaksoy.realestate.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping(value = "/register", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> register(@Valid @ModelAttribute RegisterRequest request,
            @RequestParam(value = "file", required = false) org.springframework.web.multipart.MultipartFile file) {
        try {
            // Register user (without image first)
            MessageResponse response = authService.register(request);

            // If file is present, upload it
            if (file != null && !file.isEmpty()) {
                // We need the userId. AuthService.register returns MessageResponse which might
                // not have ID.
                // We need to fetch the user by username or email.
                // Or update AuthService to return something else.
                // However, looking at AuthController, it returns MessageResponse.

                // Let's modify AuthService logic or just fetch user here?
                // Fetching is easier for now to avoid changing AuthService signature deeply if
                // not needed.
                com.burakcanaksoy.realestate.model.User user = userService.findByUsername(request.getUsername())
                        .orElseThrow(() -> new RuntimeException("User not found after registration"));

                userService.updateProfilePicture(user.getId(), file);
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Kayıt işlemi sırasında bir hata oluştu: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Kullanıcı adı veya şifre hatalı!"));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            userService.processForgotPassword(request.getEmail(), request.getPhoneNumber(), request.getMethod());
            String message = "SMS".equalsIgnoreCase(request.getMethod())
                    ? "Doğrulama kodu telefonunuza gönderildi (Simülasyon: Sunucu loglarına bakınız)."
                    : "Şifre sıfırlama kodu e-posta adresinize gönderildi.";
            return ResponseEntity.ok(new MessageResponse(message));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            userService.processResetPassword(request.getEmail(), request.getCode(), request.getNewPassword());
            return ResponseEntity
                    .ok(new MessageResponse("Şifreniz başarıyla sıfırlandı. Yeni şifrenizle giriş yapabilirsiniz."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String token) {
        try {
            // Extract username from token
            String jwtToken = token.replace("Bearer ", "");
            AuthResponse userInfo = authService.getUserInfoFromToken(jwtToken);
            return ResponseEntity.ok(userInfo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Geçersiz token"));
        }
    }
}