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
    @Column(name = "booking_enabled")
    private boolean bookingEnabled = true;

    @Builder.Default
    @Column(name = "ticket_enabled")
    private boolean ticketEnabled = true;

    @Builder.Default
    @Column(name = "comment_enabled")
    private boolean commentEnabled = true;
}
