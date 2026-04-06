package com.smartcampus.users;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

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
    }
}
