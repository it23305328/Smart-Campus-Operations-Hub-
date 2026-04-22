package com.smartcampus.users;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> request) {
        return userRepository.findById(id).map(user -> {
            try {
                Role newRole = Role.valueOf(request.get("role").toUpperCase());
                user.setRole(newRole);
                userRepository.save(user);
                return ResponseEntity.ok().body(Map.of("message", "User role updated successfully", "user", user));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid role"));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        return userRepository.findById(id).map(user -> {
            try {
                UserStatus newStatus = UserStatus.valueOf(request.get("status").toUpperCase());
                user.setStatus(newStatus);
                userRepository.save(user);
                return ResponseEntity.ok().body(Map.of("message", "User status updated successfully", "user", user));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid status"));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            userRepository.delete(user);
            return ResponseEntity.ok().body(Map.of("message", "User deleted successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }
}
