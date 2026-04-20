package com.smartcampus.users;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Autowired
    private HttpServletRequest request;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = oauth2User.getAttributes();
        
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String googleId = (String) attributes.get("sub");

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;

        if (userOptional.isPresent()) {
            user = userOptional.get();
        } else {
            // Register new user with default role USER
            user = User.builder()
                    .email(email)
                    .name(name)
                    .googleId(googleId)
                    .role(Role.USER) // Default role
                    .status(UserStatus.ACTIVE)
                    .build();
        }

        // Update Audit Info and Ensure Fields (Member 4)
        if (user.getGoogleId() == null) user.setGoogleId(googleId);
        user.setLastLogin(java.time.LocalDateTime.now());
        user.setIpAddress(request.getRemoteAddr());
        userRepository.save(user);

        System.out.println(">>> User logged in: " + email + " | Role: " + user.getRole() + " | IP: " + user.getIpAddress());

        // Return a DefaultOAuth2User with our internal role mapped to Spring Security GrantedAuthority
        return new DefaultOAuth2User(
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())),
                attributes,
                "email" // attribute name for user id
        );
    }
}
