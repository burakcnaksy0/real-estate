package com.burakcanaksoy.realestate.service;

import com.burakcanaksoy.realestate.model.Notification;
import com.burakcanaksoy.realestate.model.enums.NotificationType;
import com.burakcanaksoy.realestate.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public void sendNotification(Long userId, String title, String message, NotificationType type,
            Long relatedListingId, String relatedListingType) {
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .relatedListingId(relatedListingId)
                .relatedListingType(relatedListingType)
                .isRead(false)
                .build();

        Notification savedNotification = notificationRepository.save(notification);

        // Send via WebSocket
        messagingTemplate.convertAndSend("/topic/notifications/" + userId, savedNotification);
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserId(userId, Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserId(userId, Sort.unsorted());
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }
}
