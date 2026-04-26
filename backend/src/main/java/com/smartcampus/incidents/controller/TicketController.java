package com.smartcampus.incidents.controller;

import com.smartcampus.incidents.model.Ticket;
import com.smartcampus.incidents.model.TicketComment;
import com.smartcampus.incidents.model.TicketStatus;
import com.smartcampus.incidents.service.TicketService;
import com.smartcampus.users.User;
import com.smartcampus.users.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController("incidentTicketController")
@RequestMapping("/api/incident-tickets")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class TicketController {

    private final TicketService ticketService;
    private final UserRepository userRepository;

    @Autowired
    public TicketController(TicketService ticketService, UserRepository userRepository) {
        this.ticketService = ticketService;
        this.userRepository = userRepository;
    }

    private User resolveCurrentUser(OAuth2User principal) {
        String email = principal.getAttribute("email");
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets(@AuthenticationPrincipal OAuth2User principal) {
        User user = resolveCurrentUser(principal);
        if (user.getRole().name().equals("ADMIN")) {
            return ResponseEntity.ok(ticketService.getAllTickets());
        } else if (user.getRole().name().equals("TECHNICIAN")) {
            return ResponseEntity.ok(ticketService.getTicketsByTechnician(user));
        } else {
            return ResponseEntity.ok(ticketService.getTicketsByReporter(user));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PostMapping
    @SuppressWarnings("unchecked")
    public ResponseEntity<Ticket> createTicket(@RequestBody Map<String, Object> payload, @AuthenticationPrincipal OAuth2User principal) {
        User user = resolveCurrentUser(principal);
        Ticket ticket = Ticket.builder()
                .category((String) payload.get("category"))
                .description((String) payload.get("description"))
                .priority(com.smartcampus.incidents.model.TicketPriority.valueOf((String) payload.get("priority")))
                .contactDetails((String) payload.get("contactDetails"))
                .reporter(user)
                .build();
        
        List<String> imageUrls = (List<String>) payload.get("imageUrls");
        return ResponseEntity.ok(ticketService.createTicket(ticket, imageUrls));
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<Ticket> assignTechnician(@PathVariable Long id, @RequestBody Map<String, Long> payload) {
        return ResponseEntity.ok(ticketService.assignTechnician(id, payload.get("technicianId")));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Ticket> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> payload, @AuthenticationPrincipal OAuth2User principal) {
        User user = resolveCurrentUser(principal);
        TicketStatus status = TicketStatus.valueOf(payload.get("status"));
        String notes = payload.get("notes");
        return ResponseEntity.ok(ticketService.updateStatus(id, status, notes, user));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketComment> addComment(@PathVariable Long id, @RequestBody Map<String, String> payload, @AuthenticationPrincipal OAuth2User principal) {
        User user = resolveCurrentUser(principal);
        return ResponseEntity.ok(ticketService.addComment(id, payload.get("text"), user));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id, @AuthenticationPrincipal OAuth2User principal) {
        User user = resolveCurrentUser(principal);
        ticketService.deleteComment(id, user);
        return ResponseEntity.noContent().build();
    }
}
