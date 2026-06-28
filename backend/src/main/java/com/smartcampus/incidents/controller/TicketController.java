package com.smartcampus.incidents.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.incidents.model.Ticket;
import com.smartcampus.incidents.model.TicketComment;
import com.smartcampus.incidents.model.TicketStatus;
import com.smartcampus.incidents.service.TicketService;
import com.smartcampus.users.User;
import com.smartcampus.users.UserRepository;

@RestController("incidentTicketController")
@RequestMapping("/api/incident-tickets")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class TicketController {

    private final TicketService ticketService;
    private final UserRepository userRepository;

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
        String roleName = user.getRole().name();

        return switch (roleName) {
            case "ADMIN" -> ResponseEntity.ok(ticketService.getAllTickets());
            case "TECHNICIAN" -> ResponseEntity.ok(ticketService.getTicketsByTechnician(user));
            default -> ResponseEntity.ok(ticketService.getTicketsByReporter(user));
        };
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PostMapping
    @SuppressWarnings("unchecked")
    public ResponseEntity<Ticket> createTicket(@RequestBody Map<String, Object> payload, @AuthenticationPrincipal OAuth2User principal) {
        User user = resolveCurrentUser(principal);
        Ticket ticket = new Ticket();
        ticket.setCategory((String) payload.get("category"));
        ticket.setDescription((String) payload.get("description"));
        ticket.setPriority(com.smartcampus.incidents.model.TicketPriority.valueOf((String) payload.get("priority")));
        ticket.setContactDetails((String) payload.get("contactDetails"));
        ticket.setReporter(user);

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
