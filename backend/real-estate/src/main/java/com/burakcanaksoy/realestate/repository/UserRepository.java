package com.burakcanaksoy.realestate.repository;

import com.burakcanaksoy.realestate.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByPhoneNumber(String phoneNumber);

    Boolean existsByUsername(String username);

    Boolean existsByEmail(String email);

    Boolean existsByPhoneNumber(String phoneNumber);

    // Analytics queries
    Long countByEnabledTrue();

    Long countByProvider(String provider);

    Long countByCreatedAtAfter(LocalDateTime date);

    List<User> findTop10ByOrderByCreatedAtDesc();

    @Query("SELECT FUNCTION('TO_CHAR', u.createdAt, 'YYYY-MM') as month, COUNT(u) as count " +
            "FROM User u " +
            "WHERE u.createdAt >= :startDate " +
            "GROUP BY FUNCTION('TO_CHAR', u.createdAt, 'YYYY-MM') " +
            "ORDER BY month DESC")
    List<Object[]> getUserGrowthData(@Param("startDate") LocalDateTime startDate);
}
