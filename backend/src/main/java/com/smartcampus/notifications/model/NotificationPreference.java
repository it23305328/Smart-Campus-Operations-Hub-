package com.smartcampus.notifications.model;

import com.smartcampus.users.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "notification_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreference {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Builder.Default
    @Column(name = "enable_booking_notifications")
    private boolean enableBookingNotifications = true;

    @Builder.Default
    @Column(name = "enable_ticket_notifications")
    private boolean enableTicketNotifications = true;

    @Builder.Default
    @Column(name = "enable_comment_notifications")
    private boolean enableCommentNotifications = true;
}
