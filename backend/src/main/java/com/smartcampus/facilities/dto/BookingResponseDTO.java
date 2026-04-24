package com.smartcampus.facilities.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
@AllArgsConstructor
public class BookingResponseDTO {
    private Long id;
    private String studentId;
    private String studentName;
    private String contactNumber;
    private Long resourceId;
    private String resourceName;
    private String resourceLocation;
    private LocalDateTime bookingDate;
    private LocalDate reservationDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String status;
    private String purpose;
    private String rejectionReason;
    private Integer slotNumber;
    private List<String> additionalMembers;
}