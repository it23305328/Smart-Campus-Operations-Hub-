package com.smartcampus.config;

import com.smartcampus.users.CustomOAuth2UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
<<<<<<< HEAD
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
=======
>>>>>>> 7f3907bf64a4c1b587692adcc08578fd19d8c4a3

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;

    public SecurityConfig(CustomOAuth2UserService customOAuth2UserService) {
        this.customOAuth2UserService = customOAuth2UserService;
    }

<<<<<<< HEAD
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

=======
>>>>>>> 7f3907bf64a4c1b587692adcc08578fd19d8c4a3
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
<<<<<<< HEAD
                .requestMatchers("/", "/v3/api-docs/**", "/swagger-ui/**", "/login**", "/api/auth/**").permitAll()
=======
                .requestMatchers("/", "/v3/api-docs/**", "/swagger-ui/**", "/login**").permitAll()
>>>>>>> 7f3907bf64a4c1b587692adcc08578fd19d8c4a3
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo
                        .userService(customOAuth2UserService)
                )
<<<<<<< HEAD
                .defaultSuccessUrl("http://localhost:3000/dashboard", true)
=======
                .defaultSuccessUrl("http://localhost:5173/loginSuccess", true)
>>>>>>> 7f3907bf64a4c1b587692adcc08578fd19d8c4a3
            );
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
<<<<<<< HEAD
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:3000")); // Vite default and user port
=======
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173")); // Vite default port
>>>>>>> 7f3907bf64a4c1b587692adcc08578fd19d8c4a3
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

