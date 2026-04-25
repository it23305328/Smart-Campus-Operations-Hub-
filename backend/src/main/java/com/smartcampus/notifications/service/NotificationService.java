package com.smartcampus.notifications.service;

import com.smartcampus.notifications.model.Notification;
import com.smartcampus.notifications.model.NotificationPreference;
import com.smartcampus.notifications.model.NotificationType;
import com.smartcampus.notifications.repository.NotificationPreferenceRepository;
import com.smartcampus.notifications.repository.NotificationRepository;
import com.smartcampus.users.User;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void sendNotification(User recipient, String message, NotificationType type) {
        // Check user preferences before sending
        NotificationPreference prefs = preferenceRepository.findByUser(recipient)
                .orElseGet(() -> {
                    NotificationPreference newPrefs = NotificationPreference.builder()
                            .user(recipient)
                            .build();
                    return preferenceRepository.save(newPrefs);
                });

        boolean enabled = switch (type) {
            case BOOKING -> prefs.isEnableBookingNotifications();
            case TICKET -> prefs.isEnableTicketNotifications();
            case COMMENT -> prefs.isEnableCommentNotifications();
        };

        if (enabled) {
            Notification notification = Notification.builder()
                    .recipient(recipient)
                    .message(message)
                    .type(type)
                    .build();
            Notification savedNotification = notificationRepository.save(notification);
            
            // Push via WebSocket to user-specific destination
            // Using email as the destination identifier
            messagingTemplate.convertAndSendToUser(
                recipient.getEmail(),
                "/queue/notifications",
                savedNotification
            );
        }
    }

    public List<Notification> getNotificationsForUser(User user) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user);
    }

    public List<Notification> getNotificationsByEmail(String email) {
        return notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(email);
    }

    @Transactional
    public void markAsRead(Long id, User user) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void deleteNotification(Long id, User user) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        notificationRepository.delete(notification);
    }

    @Transactional
    public NotificationPreference updatePreferences(User user, NotificationPreference newPrefs) {
        NotificationPreference prefs = preferenceRepository.findByUser(user)
                .orElseGet(() -> NotificationPreference.builder().user(user).build());
        
        prefs.setEnableBookingNotifications(newPrefs.isEnableBookingNotifications());
        prefs.setEnableTicketNotifications(newPrefs.isEnableTicketNotifications());
        prefs.setEnableCommentNotifications(newPrefs.isEnableCommentNotifications());
        
        return preferenceRepository.save(prefs);
    }

    public NotificationPreference getPreferences(User user) {
        return preferenceRepository.findByUser(user)
                .orElseGet(() -> preferenceRepository.save(NotificationPreference.builder().user(user).build()));
    }
}
