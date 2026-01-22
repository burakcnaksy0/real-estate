package com.burakcanaksoy.realestate.service;

import com.burakcanaksoy.realestate.model.ActivityLog;
import com.burakcanaksoy.realestate.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    public void logActivity(String username, String action, String description, String ipAddress) {
        ActivityLog log = new ActivityLog(username, action, description, ipAddress);
        activityLogRepository.save(log);
    }

    public Page<ActivityLog> getLogs(Pageable pageable) {
        return activityLogRepository.findAllByOrderByTimestampDesc(pageable);
    }
}
