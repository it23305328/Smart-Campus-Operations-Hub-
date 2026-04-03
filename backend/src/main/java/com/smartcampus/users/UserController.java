package com.smartcampus.users;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

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
    }
}
