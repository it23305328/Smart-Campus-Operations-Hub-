package com.smartcampus.facilities.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

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
    private String status;
    private String purpose;
    private String rejectionReason;
}