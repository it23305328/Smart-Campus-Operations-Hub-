package com.smartcampus.bookings.model;

import com.smartcampus.facilities.model.Resource;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "bookings")
@Data
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "resource_id")
    private Resource resource;

    private String status; // PENDING, APPROVED, CANCELLED
}
