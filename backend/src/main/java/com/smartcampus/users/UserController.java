package com.smartcampus.users;

import org.springframework.http.ResponseEntity;
<<<<<<< HEAD
import org.springframework.security.core.Authentication;
=======
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
>>>>>>> 7f3907bf64a4c1b587692adcc08578fd19d8c4a3
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

<<<<<<< HEAD
    public UserController() {
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(401).body("Not authenticated");
        }
        
        if (authentication.getPrincipal() instanceof User) {
            return ResponseEntity.ok((User) authentication.getPrincipal());
        }

        // Fallback or custom extraction depending on context
        return ResponseEntity.ok(authentication.getPrincipal());
=======
    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(@AuthenticationPrincipal OAuth2User oauth2User) {
        if (oauth2User == null) {
            return ResponseEntity.status(401).body("Not authenticated");
        }
        
        String email = oauth2User.getAttribute("email");
        User user = userRepository.findByEmail(email).orElse(null);
        
        if (user == null) {
            // This case might happen if user isn't found even after OAuth login (rare)
            return ResponseEntity.ok(oauth2User.getAttributes());
        }

        return ResponseEntity.ok(user);
>>>>>>> 7f3907bf64a4c1b587692adcc08578fd19d8c4a3
    }
}
