package com.smartcampus.facilities.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class BookingRequestDTO {
    
    @NotBlank(message = "Student ID is required")
    private String studentId;
    
    @NotBlank(message = "Student name is required")
    private String studentName;
    
    @NotBlank(message = "Contact number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Contact number must be 10 digits")
    private String contactNumber;
    
    @NotNull(message = "Resource ID is required")
    private Long resourceId;
    
    private String purpose;
}