package com.smartcampus.incidents.service;

import com.smartcampus.incidents.model.*;
import com.smartcampus.incidents.repository.TicketCommentRepository;
import com.smartcampus.incidents.repository.TicketRepository;
import com.smartcampus.users.User;
import com.smartcampus.users.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final UserRepository userRepository;

    @Autowired
    public TicketService(TicketRepository ticketRepository, 
                         TicketCommentRepository commentRepository,
                         UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));
    }

    public List<Ticket> getTicketsByReporter(User reporter) {
        return ticketRepository.findByReporter(reporter);
    }

    public List<Ticket> getTicketsByTechnician(User technician) {
        return ticketRepository.findByTechnician(technician);
    }

    @Transactional
    public Ticket createTicket(Ticket ticket, List<String> imageUrls) {
        if (imageUrls != null) {
            for (String url : imageUrls.subList(0, Math.min(imageUrls.size(), 3))) {
                TicketAttachment attachment = new TicketAttachment();
                attachment.setTicket(ticket);
                attachment.setImageUrl(url);
                ticket.getAttachments().add(attachment);
            }
        }
        return ticketRepository.save(ticket);
    }

    @Transactional
    public Ticket assignTechnician(Long ticketId, Long technicianId) {
        Ticket ticket = getTicketById(ticketId);
        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technician not found"));
        
        ticket.setTechnician(technician);
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        return ticketRepository.save(ticket);
    }

    @Transactional
    public Ticket updateStatus(Long ticketId, TicketStatus newStatus, String notes, User currentUser) {
        Ticket ticket = getTicketById(ticketId);

        // Workflow Constraints
        if (newStatus == TicketStatus.REJECTED && !currentUser.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Only Admins can reject tickets");
        }

        if (newStatus == TicketStatus.RESOLVED && 
            !currentUser.getRole().name().equals("ADMIN") && 
            !currentUser.getRole().name().equals("TECHNICIAN")) {
            throw new RuntimeException("Only Technicians or Admins can resolve tickets");
        }

        ticket.setStatus(newStatus);
        if (newStatus == TicketStatus.REJECTED) {
            ticket.setRejectionReason(notes);
        } else if (newStatus == TicketStatus.RESOLVED) {
            ticket.setResolutionNotes(notes);
            ticket.setResolvedAt(java.time.LocalDateTime.now());
        }

        return ticketRepository.save(ticket);
    }

    @Transactional
    public TicketComment addComment(Long ticketId, String text, User currentUser) {
        Ticket ticket = getTicketById(ticketId);
        TicketComment comment = new TicketComment();
        comment.setTicket(ticket);
        comment.setUser(currentUser);
        comment.setCommentText(text);
        return commentRepository.save(comment);
    }

    @Transactional
    public void deleteComment(Long commentId, User currentUser) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        if (!comment.getUser().getId().equals(currentUser.getId()) && 
            !currentUser.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Unauthorized to delete this comment");
        }
        
        commentRepository.delete(comment);
    }
}
