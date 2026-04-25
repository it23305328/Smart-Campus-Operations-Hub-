package com.smartcampus.facilities.controller;

import com.smartcampus.facilities.model.Resource;
import com.smartcampus.facilities.model.ResourceType;
import com.smartcampus.facilities.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ResourceController {

    private final ResourceService resourceService;

    @Autowired
    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping
    public ResponseEntity<List<Resource>> getAllResources(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity) {
        List<Resource> resources = resourceService.getAllResources(name, type, location, minCapacity);
        return ResponseEntity.ok(resources);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable Long id) {
        return resourceService.getResourceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Resource> addResource(@Valid @RequestBody Resource resource) {
        Resource newResource = resourceService.addResource(resource);
        return new ResponseEntity<>(newResource, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Resource> updateResource(@PathVariable Long id, @Valid @RequestBody Resource resourceDetails) {
        try {
            Resource updatedResource = resourceService.updateResource(id, resourceDetails);
            return ResponseEntity.ok(updatedResource);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        try {
            resourceService.deleteResource(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
