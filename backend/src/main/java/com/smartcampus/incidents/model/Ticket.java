package com.smartcampus.incidents.model;

import com.smartcampus.facilities.model.Resource;
import com.smartcampus.users.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity(name = "IncidentTicket")
@Table(name = "incident_tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "resource_id")
    private Resource resource;

    @ManyToOne
    @JoinColumn(name = "reporter_id")
    private User reporter;

    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private TicketPriority priority;

    private String contactDetails;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private TicketStatus status = TicketStatus.OPEN;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    @ManyToOne
    @JoinColumn(name = "technician_id")
    private User technician;

    @Column(columnDefinition = "TEXT")
    private String resolutionNotes;

    private LocalDateTime resolvedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @Builder.Default
    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TicketAttachment> attachments = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TicketComment> comments = new ArrayList<>();
}
