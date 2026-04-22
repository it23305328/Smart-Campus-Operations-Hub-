package com.smartcampus.facilities.controller;

import com.smartcampus.facilities.dto.TopResourceDTO;
import com.smartcampus.facilities.service.ResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AnalyticsController {

    private final ResourceService resourceService;

    @Autowired
    public AnalyticsController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping("/top-resources")
    public ResponseEntity<List<TopResourceDTO>> getTopResources() {
        return ResponseEntity.ok(resourceService.getTopResources());
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Long>> getSummaryMetrics() {
        return ResponseEntity.ok(resourceService.getSummaryMetrics());
    }
}
