package com.smartcampus.facilities.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TopResourceDTO {
    private String resourceName;
    private Long bookingCount;
}
