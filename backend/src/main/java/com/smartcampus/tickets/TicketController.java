package com.smartcampus.tickets;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> createTicket(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("category") String category,
            @RequestParam("priority") String priority,
            @RequestParam("contactDetails") String contactDetails,
            @RequestParam(value = "images", required = false) MultipartFile[] images) {
        
        if (title == null || title.isBlank() || 
            description == null || description.isBlank() ||
            category == null || category.isBlank() ||
            priority == null || priority.isBlank() ||
            contactDetails == null || contactDetails.isBlank()) {
            return ResponseEntity.badRequest().body("All fields (title, category, priority, contact, description) are mandatory.");
        }

        Ticket ticket = new Ticket();
        ticket.setTitle(title);
        ticket.setDescription(description);
        ticket.setCategory(category);
        ticket.setPriority(priority);
        ticket.setContactDetails(contactDetails);
        ticket.setStatus(TicketStatus.OPEN);

        if (images != null && images.length > 0) {
            List<String> imageUrls = new ArrayList<>();
            for (MultipartFile file : images) {
                String path = fileStorageService.save(file);
                imageUrls.add(path);
            }
            ticket.setImageUrls(imageUrls);
        }

        return ResponseEntity.ok(ticketRepository.save(ticket));
    }

    @GetMapping
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<?> assignTechnician(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        return ticketRepository.findById(id).map(ticket -> {
            ticket.setAssignedTechnician(payload.get("technician"));
            return ResponseEntity.ok(ticketRepository.save(ticket));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        return ticketRepository.findById(id).map(ticket -> {
            ticket.setStatus(TicketStatus.valueOf(payload.get("status")));
            
            if (payload.containsKey("rejectionReason")) {
                ticket.setRejectionReason(payload.get("rejectionReason"));
            }
            
            if (payload.containsKey("resolutionNotes")) {
                ticket.setResolutionNotes(payload.get("resolutionNotes"));
            }
            
            return ResponseEntity.ok(ticketRepository.save(ticket));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<Comment> addComment(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Ticket ticket = ticketRepository.findById(id).orElseThrow();
        Comment comment = new Comment();
        comment.setText(payload.get("text"));
        comment.setAuthor(payload.get("author"));
        comment.setTicket(ticket);
        return ResponseEntity.ok(commentRepository.save(comment));
    }

    @DeleteMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Long ticketId, @PathVariable Long commentId) {
        commentRepository.deleteById(commentId);
        return ResponseEntity.ok().build();
    }
}