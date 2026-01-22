package com.burakcanaksoy.realestate.config;

import com.burakcanaksoy.realestate.model.User;
import com.burakcanaksoy.realestate.model.enums.Role;
import com.burakcanaksoy.realestate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Set;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class AdminUserInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.username}")
    private String adminUsername;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Bean
    public CommandLineRunner initAdminUser() {
        return args -> {
            String defaultEmail = "admin@vesta.com";

            // Try to find existing admin by email (since it is constant)
            java.util.Optional<User> existingAdmin = userRepository.findByEmail(defaultEmail);

            if (existingAdmin.isPresent()) {
                log.info("Admin account found by email. Updating credentials from config...");
                User admin = existingAdmin.get();
                admin.setUsername(adminUsername);
                admin.setPassword(passwordEncoder.encode(adminPassword));
                // Make sure they have admin role
                admin.setRoles(Set.of(Role.ROLE_ADMIN, Role.ROLE_USER));
                userRepository.save(admin);
                log.info("Admin credentials updated. New Username: {}", adminUsername);
            } else if (userRepository.findByUsername(adminUsername).isEmpty()) {
                log.info("Creating default admin user...");

                User admin = new User();
                admin.setName("Admin");
                admin.setSurname("User");
                admin.setUsername(adminUsername);
                admin.setEmail(defaultEmail);
                admin.setPassword(passwordEncoder.encode(adminPassword));
                admin.setEnabled(true);
                admin.setProvider("LOCAL");
                admin.setRoles(Set.of(Role.ROLE_ADMIN, Role.ROLE_USER));
                admin.setCreatedAt(LocalDateTime.now());
                admin.setUpdatedAt(LocalDateTime.now());

                userRepository.save(admin);

                log.info("Admin user created successfully!");
                log.info("Username: {}", adminUsername);
            } else {
                log.info("Admin username '{}' already taken by another email. Skipping admin init.", adminUsername);
            }
        };
    }
}
