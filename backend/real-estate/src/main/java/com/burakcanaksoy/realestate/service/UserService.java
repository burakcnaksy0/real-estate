package com.burakcanaksoy.realestate.service;

import com.burakcanaksoy.realestate.model.User;
import com.burakcanaksoy.realestate.repository.UserRepository;
import com.burakcanaksoy.realestate.request.ChangePasswordRequest;
import com.burakcanaksoy.realestate.request.UpdateProfileRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Random;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final FileStorageService fileStorageService;
    private final SmsService smsService;

    @Transactional
    public User updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }
        if (request.getSurname() != null && !request.getSurname().isBlank()) {
            user.setSurname(request.getSurname());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            user.setEmail(request.getEmail());
        }

        return userRepository.save(user);
    }

    @Transactional
    public void processForgotPassword(String email, String phoneNumber, String method) {
        User user = null;

        if ("SMS".equalsIgnoreCase(method)) {
            if (phoneNumber == null || phoneNumber.isBlank()) {
                throw new RuntimeException("Telefon numarası gereklidir.");
            }
            user = userRepository.findByPhoneNumber(phoneNumber)
                    .orElseThrow(() -> new RuntimeException("Bu telefon numarası ile kayıtlı kullanıcı bulunamadı."));
        } else {
            // Default to Email
            if (email == null || email.isBlank()) {
                throw new RuntimeException("E-posta adresi gereklidir.");
            }
            user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı."));
        }

        // 6 haneli kod
        String code = String.valueOf(new Random().nextInt(900000) + 100000);

        user.setResetPasswordToken(code);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        if ("SMS".equalsIgnoreCase(method)) {
            // Send SMS via Twilio Service
            String message = "Doğrulama Kodunuz: " + code;
            smsService.sendSms(user.getPhoneNumber(), message);
        } else {
            emailService.sendPasswordResetCode(user.getEmail(), code);
        }
    }

    @Transactional
    public void processResetPassword(String email, String code, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı."));

        if (user.getResetPasswordToken() == null ||
                !user.getResetPasswordToken().equals(code) ||
                user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Geçersiz veya süresi dolmuş kod.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Mevcut şifre hatalı");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public User updateProfilePicture(Long userId, org.springframework.web.multipart.MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        // Delete old picture if exists
        if (user.getProfilePicture() != null) {
            fileStorageService.deleteUserProfileImage(userId);
        }

        String imagePath = fileStorageService.uploadUserProfileImage(file, userId);
        user.setProfilePicture(imagePath);

        return userRepository.save(user);
    }

    public java.util.Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
}
