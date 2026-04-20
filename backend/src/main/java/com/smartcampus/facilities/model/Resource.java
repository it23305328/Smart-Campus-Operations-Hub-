package com.smartcampus.facilities.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    @Lob
    @Column(columnDefinition = "TEXT")
    private String availabilityWindows; // Store as JSON string

    public enum ResourceStatus {
        ACTIVE,
        OUT_OF_SERVICE
    }
}
