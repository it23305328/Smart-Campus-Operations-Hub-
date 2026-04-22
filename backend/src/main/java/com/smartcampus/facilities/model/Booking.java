package com.smartcampus.facilities.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings", 
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"resource_id", "student_id"})
       })
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Student ID is required")
    @Column(name = "student_id", nullable = false)
    private String studentId;

    @NotBlank(message = "Student name is required")
    @Column(name = "student_name", nullable = false)
    private String studentName;

    @NotBlank(message = "Contact number is required")
    @Column(name = "contact_number", nullable = false)
    private String contactNumber;

    @NotNull(message = "Resource is required")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "resource_id", nullable = false)
    private Resource resource;

    @Column(name = "booking_date", nullable = false)
    private LocalDateTime bookingDate = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status = BookingStatus.PENDING;

    @Column(name = "purpose")
    private String purpose;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    public enum BookingStatus {
        PENDING,
        APPROVED,
        REJECTED,
        CANCELLED
    }
}