package com.burakcanaksoy.realestate.service;

import com.burakcanaksoy.realestate.model.User;
import com.burakcanaksoy.realestate.repository.FavoriteRepository;
import com.burakcanaksoy.realestate.repository.ListingRepository;
import com.burakcanaksoy.realestate.repository.MessageRepository;
import com.burakcanaksoy.realestate.repository.UserRepository;
import com.burakcanaksoy.realestate.request.ChangePasswordRequest;
import com.burakcanaksoy.realestate.request.UpdateProfileRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.Random;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Set;
import com.burakcanaksoy.realestate.model.enums.Role;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final FavoriteRepository favoriteRepository;
    private final ListingRepository listingRepository;
    private final MessageRepository messageRepository;
    private final EmailService emailService;
    private final FileStorageService fileStorageService;
    private final SmsService smsService;
    private final com.burakcanaksoy.realestate.service.ActivityLogService activityLogService;

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

        User updatedUser = userRepository.save(user);

        activityLogService.logActivity(user.getUsername(), "PROFILE_UPDATED",
                "User updated their profile information", "N/A");

        return updatedUser;
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

    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    @Transactional
    public void toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        boolean newStatus = !user.getEnabled();
        user.setEnabled(newStatus);
        userRepository.save(user);

        String action = newStatus ? "USER_ENABLED" : "USER_DISABLED";
        String description = String.format("User %s was %s", user.getUsername(), newStatus ? "enabled" : "disabled");
        activityLogService.logActivity(getCurrentUsername(), action, description, "N/A");
    }

    @Transactional
    public void updateUserRoles(Long userId, Set<Role> roles) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        user.setRoles(roles);
        userRepository.save(user);

        String description = String.format("Updated roles for user %s to: %s", user.getUsername(), roles.toString());
        activityLogService.logActivity(getCurrentUsername(), "USER_ROLES_UPDATED", description, "N/A");
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        String deletedUsername = user.getUsername();

        // Delete user's favorites
        favoriteRepository.deleteByUser(user);

        // Delete user's listings
        listingRepository.deleteByCreatedBy(user);

        // Delete user's messages (both sent and received)
        messageRepository.deleteBySenderOrReceiver(user, user);

        // Remove profile image if exists
        if (user.getProfilePicture() != null) {
            try {
                fileStorageService.deleteUserProfileImage(userId);
            } catch (Exception e) {
                // Log warning but continue deletion
                System.err.println("Could not delete profile picture for user " + userId);
            }
        }

        userRepository.delete(user);

        String description = String.format("User %s (ID: %d) was permanently deleted", deletedUsername, userId);
        activityLogService.logActivity(getCurrentUsername(), "USER_DELETED", description, "N/A");
    }

    @Transactional
    public void updateLastSeen(String username) {
        userRepository.findByUsername(username).ifPresent(user -> {
            user.setLastSeen(LocalDateTime.now());
            userRepository.save(user);
        });
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Kullanıcı oturum açmamış");
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
    }

    private String getCurrentUsername() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                return authentication.getName();
            }
        } catch (Exception e) {
            // Ignore
        }
        return "SYSTEM";
    }
}
