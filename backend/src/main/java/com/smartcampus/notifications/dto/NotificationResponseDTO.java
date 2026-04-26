package com.smartcampus.notifications.dto;

import com.smartcampus.notifications.model.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponseDTO {
    private Long id;
    private String message;
    private NotificationType type;
    private boolean isRead;
    private LocalDateTime createdAt;
}
