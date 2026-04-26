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
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final UserStatusFilter userStatusFilter;

    public SecurityConfig(CustomOAuth2UserService customOAuth2UserService, UserStatusFilter userStatusFilter) {
        this.customOAuth2UserService = customOAuth2UserService;
        this.userStatusFilter = userStatusFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/", "/v3/api-docs/**", "/swagger-ui/**", "/login**", "/api/auth/**", "/ws/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/resources/**").authenticated()
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/resources/**").hasAnyRole("ADMIN", "USER")
                .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/resources/**").hasAnyRole("ADMIN", "USER")
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/resources/**").hasAnyRole("ADMIN", "USER")
                .requestMatchers("/api/analytics/**").hasAnyRole("ADMIN", "USER")
                .anyRequest().authenticated()
            )
            .addFilterBefore(userStatusFilter, org.springframework.security.web.access.intercept.AuthorizationFilter.class)
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo
                        .userService(customOAuth2UserService)
                )
                .defaultSuccessUrl("http://localhost:3000/dashboard", true)
            );
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:5173")); // Vite dev server ports
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

