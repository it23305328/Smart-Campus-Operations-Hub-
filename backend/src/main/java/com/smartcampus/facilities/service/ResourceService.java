package com.smartcampus.facilities.service;

import com.smartcampus.facilities.model.Resource;
import com.smartcampus.facilities.model.ResourceType;
import com.smartcampus.facilities.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;

    @Autowired
    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    public List<Resource> getAllResources(String name, ResourceType type, String location, Integer minCapacity) {
        List<Resource> resources;
        if (name == null && type == null && location == null && minCapacity == null) {
            resources = resourceRepository.findAll();
        } else {
            resources = resourceRepository.findWithFilters(name, type, location, minCapacity);
        }
        
        // Ensure all resources have default time values
        for (Resource resource : resources) {
            if (resource.getAvailableFrom() == null) {
                resource.setAvailableFrom(LocalTime.of(8, 0));
            }
            if (resource.getAvailableTo() == null) {
                resource.setAvailableTo(LocalTime.of(20, 0));
            }
        }
        
        return resources;
    }

    public Resource addResource(Resource resource) {
        // Set default timings if not provided
        if (resource.getAvailableFrom() == null) {
            resource.setAvailableFrom(LocalTime.of(8, 0));
        }
        if (resource.getAvailableTo() == null) {
            resource.setAvailableTo(LocalTime.of(20, 0));
        }
        
        // For meeting rooms, set default slots
        if (resource.getType() == ResourceType.MEETING_ROOM) {
            resource.setHasSlots(true);
            resource.setSlotDurationMinutes(120); // 2 hours
            // Only set meeting room specific times if not explicitly set
            if (resource.getAvailableFrom() == LocalTime.of(8, 0) || resource.getAvailableFrom() == null) {
                resource.setAvailableFrom(LocalTime.of(9, 0)); // 9 AM
            }
            if (resource.getAvailableTo() == LocalTime.of(20, 0) || resource.getAvailableTo() == null) {
                resource.setAvailableTo(LocalTime.of(19, 0)); // 7 PM
            }
        } else {
            resource.setHasSlots(false);
            resource.setSlotDurationMinutes(null);
        }
        
        return resourceRepository.save(resource);
    }

    public Resource updateResource(Long id, Resource resourceDetails) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id " + id));

        resource.setName(resourceDetails.getName());
        resource.setType(resourceDetails.getType());
        resource.setCapacity(resourceDetails.getCapacity());
        resource.setLocation(resourceDetails.getLocation());
        resource.setStatus(resourceDetails.getStatus());
        resource.setAvailabilityWindows(resourceDetails.getAvailabilityWindows());
        
        // Update timings if provided, otherwise keep existing
        if (resourceDetails.getAvailableFrom() != null) {
            resource.setAvailableFrom(resourceDetails.getAvailableFrom());
        } else if (resource.getAvailableFrom() == null) {
            resource.setAvailableFrom(LocalTime.of(8, 0));
        }
        
        if (resourceDetails.getAvailableTo() != null) {
            resource.setAvailableTo(resourceDetails.getAvailableTo());
        } else if (resource.getAvailableTo() == null) {
            resource.setAvailableTo(LocalTime.of(20, 0));
        }
        
        // For meeting rooms
        if (resourceDetails.getType() == ResourceType.MEETING_ROOM) {
            resource.setHasSlots(true);
            resource.setSlotDurationMinutes(120);
        } else {
            resource.setHasSlots(false);
            resource.setSlotDurationMinutes(null);
        }

        return resourceRepository.save(resource);
    }

    public void deleteResource(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id " + id));
        resourceRepository.delete(resource);
    }

    public Optional<Resource> getResourceById(Long id) {
        Optional<Resource> resourceOpt = resourceRepository.findById(id);
        resourceOpt.ifPresent(resource -> {
            if (resource.getAvailableFrom() == null) {
                resource.setAvailableFrom(LocalTime.of(8, 0));
            }
            if (resource.getAvailableTo() == null) {
                resource.setAvailableTo(LocalTime.of(20, 0));
            }
        });
        return resourceOpt;
    }

    public List<com.smartcampus.facilities.dto.TopResourceDTO> getTopResources() {
        return resourceRepository.findTopResources();
    }

    public java.util.Map<String, Long> getSummaryMetrics() {
        java.util.Map<String, Long> metrics = new java.util.HashMap<>();
        metrics.put("totalResources", resourceRepository.count());
        metrics.put("activeResources", resourceRepository.countByStatus(Resource.ResourceStatus.ACTIVE));
        metrics.put("outOfServiceResources", resourceRepository.countByStatus(Resource.ResourceStatus.OUT_OF_SERVICE));
        return metrics;
    }
}
