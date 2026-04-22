package com.smartcampus.config;

import com.smartcampus.users.UserRepository;
import com.smartcampus.users.UserStatus;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class UserStatusFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;

    public UserStatusFilter(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated() && authentication.getPrincipal() instanceof OAuth2User) {
            OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
            String email = oauth2User.getAttribute("email");

            userRepository.findByEmail(email).ifPresent(user -> {
                if (user.getStatus() == UserStatus.DEACTIVATED) {
                    // Block access
                    SecurityContextHolder.clearContext();
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    try {
                        response.getWriter().write("Your account has been deactivated. Please contact the administrator.");
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    return;
                }
            });
            
            if (response.isCommitted()) return;
        }

        filterChain.doFilter(request, response);
    }
}
