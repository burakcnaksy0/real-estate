package com.burakcanaksoy.realestate.controller;

import com.burakcanaksoy.realestate.request.LoginRequest;
import com.burakcanaksoy.realestate.request.RegisterRequest;
import com.burakcanaksoy.realestate.response.AuthResponse;
import com.burakcanaksoy.realestate.response.MessageResponse;
import com.burakcanaksoy.realestate.security.AuthService;
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
                    .body(new MessageResponse("Incorrect username or password!"));
        }
    }
}