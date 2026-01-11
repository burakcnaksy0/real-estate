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

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            MessageResponse response = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            // Hata mesajını direkt olarak döndür (AuthService'den gelen mesaj)
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            // Beklenmeyen hatalar için genel mesaj
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Kayıt işlemi sırasında bir hata oluştu."));
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
            userService.processForgotPassword(request.getEmail());
            return ResponseEntity.ok(new MessageResponse("Şifre sıfırlama kodu e-posta adresinize gönderildi."));
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
}