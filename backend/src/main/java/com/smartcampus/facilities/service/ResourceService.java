package com.smartcampus.facilities.service;

import com.smartcampus.facilities.model.Resource;
import com.smartcampus.facilities.model.ResourceType;
import com.smartcampus.facilities.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
        if (name == null && type == null && location == null && minCapacity == null) {
            return resourceRepository.findAll();
        }
        return resourceRepository.findWithFilters(name, type, location, minCapacity);
    }

    public Resource addResource(Resource resource) {
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

        return resourceRepository.save(resource);
    }

    public void deleteResource(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id " + id));
        resourceRepository.delete(resource);
    }

    public Optional<Resource> getResourceById(Long id) {
        return resourceRepository.findById(id);
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
