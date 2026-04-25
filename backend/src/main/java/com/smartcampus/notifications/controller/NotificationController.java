package com.smartcampus.notifications.controller;

import com.smartcampus.notifications.model.Notification;
import com.smartcampus.notifications.model.NotificationPreference;
import com.smartcampus.notifications.service.NotificationService;
import com.smartcampus.users.User;
import com.smartcampus.users.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('USER', 'ADMIN', 'TECHNICIAN')")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new RuntimeException("User not authenticated");
        }
        
        String email;
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else if (principal instanceof User) {
            email = ((User) principal).getEmail();
        } else {
            email = principal.toString();
        }
        
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications(Authentication authentication) {
        try {
            User user = getAuthenticatedUser(authentication);
            // Use email to ensure user only sees their own data
            return ResponseEntity.ok(notificationService.getNotificationsByEmail(user.getEmail()));
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, Authentication authentication) {
        try {
            User user = getAuthenticatedUser(authentication);
            // Ownership validation is already in service, but we ensure it here too
            notificationService.markAsRead(id, user);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(403).body("Access Denied: You do not own this notification.");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id, Authentication authentication) {
        try {
            User user = getAuthenticatedUser(authentication);
            // Explicit check to ensure privacy
            notificationService.deleteNotification(id, user);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(403).body("Access Denied: You do not own this notification.");
        }
    }

    @PutMapping("/preferences")
    public ResponseEntity<?> updatePreferences(
            @RequestBody NotificationPreference preferences,
            Authentication authentication) {
        try {
            User user = getAuthenticatedUser(authentication);
            return ResponseEntity.ok(notificationService.updatePreferences(user, preferences));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/preferences")
    public ResponseEntity<?> getPreferences(Authentication authentication) {
        try {
            User user = getAuthenticatedUser(authentication);
            return ResponseEntity.ok(notificationService.getPreferences(user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
