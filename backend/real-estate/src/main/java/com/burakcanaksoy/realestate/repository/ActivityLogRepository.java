package com.burakcanaksoy.realestate.repository;

import com.burakcanaksoy.realestate.model.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    Page<ActivityLog> findAllByOrderByTimestampDesc(Pageable pageable);

    // Search capability
    Page<ActivityLog> findByUsernameContainingIgnoreCaseOrActionContainingIgnoreCase(
            String username, String action, Pageable pageable);
}
