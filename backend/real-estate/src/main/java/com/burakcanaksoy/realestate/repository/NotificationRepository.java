package com.burakcanaksoy.realestate.repository;

import com.burakcanaksoy.realestate.model.Notification;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserId(Long userId, Sort sort);

    long countByUserIdAndIsReadFalse(Long userId);
}
