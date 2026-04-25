package com.smartcampus.users;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

import com.smartcampus.notifications.model.NotificationPreference;
import com.smartcampus.notifications.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public UserController(UserRepository userRepository, NotificationService notificationService) {
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(401).body("Not authenticated");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof User) {
            return ResponseEntity.ok((User) principal);
        }

        if (principal instanceof OAuth2User) {
            OAuth2User oauth2User = (OAuth2User) principal;
            String email = oauth2User.getAttribute("email");
            return userRepository.findByEmail(email)
                    .map(user -> ResponseEntity.ok((Object) user))
                    .orElse(ResponseEntity.ok(oauth2User.getAttributes()));
        }

        return ResponseEntity.ok(principal);
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        return getMe(authentication);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> request, Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof OAuth2User)) {
            return ResponseEntity.status(401).body("Not authenticated");
        }
        
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String email = oauth2User.getAttribute("email");
        
        return userRepository.findByEmail(email).map(user -> {
            if (request.containsKey("phoneNumber")) {
                user.setPhoneNumber(request.get("phoneNumber"));
                userRepository.save(user);
            }
            return ResponseEntity.ok(user);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/profile/notifications")
    public ResponseEntity<?> updateNotificationPreferences(@RequestBody NotificationPreference preferences, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Not authenticated");
        }
        
        Object principal = authentication.getPrincipal();
        String email;
        if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
            email = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
        } else if (principal instanceof com.smartcampus.users.User) {
            email = ((com.smartcampus.users.User) principal).getEmail();
        } else {
            email = principal.toString();
        }
        
        return userRepository.findByEmail(email).map(user -> {
            NotificationPreference updated = notificationService.updatePreferences(user, preferences);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }
}
