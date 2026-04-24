package com.smartcampus.facilities.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;

@Entity
@Table(name = "resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Type is required")
    @Enumerated(EnumType.STRING)
    private ResourceType type;

    private Integer capacity;

    private String location;

    @Enumerated(EnumType.STRING)
    private ResourceStatus status = ResourceStatus.ACTIVE;

    @Column(name = "available_from", columnDefinition = "TIME")
    private LocalTime availableFrom = LocalTime.of(8, 0); // Default 8:00 AM

    @Column(name = "available_to", columnDefinition = "TIME")
    private LocalTime availableTo = LocalTime.of(20, 0); // Default 8:00 PM

    @Column(name = "has_slots")
    private Boolean hasSlots = false; // True for MEETING_ROOM

    @Column(name = "slot_duration_minutes")
    private Integer slotDurationMinutes; // 120 for MEETING_ROOM (2 hours)

    @Lob
    @Column(columnDefinition = "TEXT")
    private String availabilityWindows; // Store as JSON string

    public enum ResourceStatus {
        ACTIVE,
        OUT_OF_SERVICE
    }
    
    // Helper method to get formatted available time
    public String getFormattedAvailableTime() {
        if (availableFrom != null && availableTo != null) {
            return availableFrom.toString() + " - " + availableTo.toString();
        }
        return "08:00 - 20:00";
    }
}