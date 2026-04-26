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

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(401).body("Not authenticated");
        }

        // Standard authentication stores the email as the name, OAuth2 stores it in attributes
        String email = authentication.getName();
        
        // Try to fetch from DB to ensure we have the full entity with correct role
        return userRepository.findByEmail(email)
                .map(user -> {
                    // Password should never be sent to the frontend
                    user.setPassword(null);
                    return ResponseEntity.ok((Object) user);
                })
                .orElseGet(() -> {
                    // Fallback for cases where DB record might not exist yet (OAuth2 edge cases)
                    if (authentication.getPrincipal() instanceof OAuth2User) {
                        return ResponseEntity.ok(((OAuth2User) authentication.getPrincipal()).getAttributes());
                    }
                    return ResponseEntity.status(404).body("User record not found");
                });
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
}
