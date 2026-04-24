package com.smartcampus.facilities.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcampus.facilities.dto.BookingRequestDTO;
import com.smartcampus.facilities.dto.BookingResponseDTO;
import com.smartcampus.facilities.model.Booking;
import com.smartcampus.facilities.model.Resource;
import com.smartcampus.facilities.model.ResourceType;
import com.smartcampus.facilities.repository.BookingRepository;
import com.smartcampus.facilities.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public BookingService(BookingRepository bookingRepository, ResourceRepository resourceRepository) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
    }

    @Transactional
    public BookingResponseDTO createBooking(BookingRequestDTO bookingRequest) {
        Resource resource = resourceRepository.findById(bookingRequest.getResourceId())
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + bookingRequest.getResourceId()));

        if (resource.getStatus() != Resource.ResourceStatus.ACTIVE) {
            throw new RuntimeException("Resource is not available for booking");
        }

        LocalTime startTime = bookingRequest.getStartTime();
        LocalTime endTime = bookingRequest.getEndTime();
        
        if (startTime == null || endTime == null) {
            throw new RuntimeException("Start time and end time are required");
        }

        LocalTime resourceFrom = resource.getAvailableFrom();
        LocalTime resourceTo = resource.getAvailableTo();
        
        if (resourceFrom == null) {
            resourceFrom = resource.getType() == ResourceType.MEETING_ROOM ? 
                LocalTime.of(9, 0) : LocalTime.of(8, 0);
        }
        if (resourceTo == null) {
            resourceTo = resource.getType() == ResourceType.MEETING_ROOM ? 
                LocalTime.of(19, 0) : LocalTime.of(20, 0);
        }
        
        if (startTime.isBefore(resourceFrom) || endTime.isAfter(resourceTo)) {
            throw new RuntimeException("Booking time must be between " + resourceFrom + " and " + resourceTo);
        }
        
        if (startTime.isAfter(endTime) || startTime.equals(endTime)) {
            throw new RuntimeException("Start time must be before end time");
        }

        if (resource.getHasSlots() != null && resource.getHasSlots() && 
            resource.getType() == ResourceType.MEETING_ROOM) {
            
            if (bookingRequest.getSlotNumber() == null || 
                bookingRequest.getSlotNumber() < 1 || 
                bookingRequest.getSlotNumber() > 5) {
                throw new RuntimeException("Invalid slot number for meeting room");
            }
            
            if (bookingRequest.getAdditionalMembers() == null || 
                bookingRequest.getAdditionalMembers().size() != 4) {
                throw new RuntimeException("Meeting room booking requires exactly 4 additional members");
            }
            
            List<String> allMembers = new ArrayList<>(bookingRequest.getAdditionalMembers());
            allMembers.add(bookingRequest.getStudentId());
            long distinctCount = allMembers.stream().distinct().count();
            if (distinctCount != allMembers.size()) {
                throw new RuntimeException("Duplicate student IDs are not allowed");
            }
            
            List<Booking> slotBookings = bookingRepository.findBookingsBySlot(
                resource.getId(), 
                bookingRequest.getSlotNumber(),
                List.of(Booking.BookingStatus.PENDING, Booking.BookingStatus.APPROVED)
            );
            
            if (!slotBookings.isEmpty()) {
                throw new RuntimeException("This slot is already booked. Please choose another slot.");
            }
        } else {
            List<Booking> conflictingBookings = bookingRepository.findConflictingBookings(
                resource.getId(),
                startTime,
                endTime,
                List.of(Booking.BookingStatus.PENDING, Booking.BookingStatus.APPROVED)
            );
            
            if (!conflictingBookings.isEmpty()) {
                throw new RuntimeException("The selected time period conflicts with an existing booking");
            }
        }

        boolean hasActiveBooking = bookingRepository.existsByResourceIdAndStudentIdAndStatusIn(
                bookingRequest.getResourceId(), 
                bookingRequest.getStudentId(),
                List.of(Booking.BookingStatus.PENDING, Booking.BookingStatus.APPROVED)
        );
        
        if (hasActiveBooking) {
            throw new RuntimeException("You already have an active booking or pending request for this resource");
        }

        List<Booking> existingInactiveBookings = bookingRepository.findByResourceIdAndStudentIdAndStatusIn(
                bookingRequest.getResourceId(), 
                bookingRequest.getStudentId(),
                List.of(Booking.BookingStatus.CANCELLED, Booking.BookingStatus.REJECTED)
        );
        
        if (!existingInactiveBookings.isEmpty()) {
            bookingRepository.deleteAll(existingInactiveBookings);
        }

        try {
            Booking booking = new Booking();
            booking.setStudentId(bookingRequest.getStudentId());
            booking.setStudentName(bookingRequest.getStudentName());
            booking.setContactNumber(bookingRequest.getContactNumber());
            booking.setResource(resource);
            booking.setPurpose(bookingRequest.getPurpose());
            booking.setStatus(Booking.BookingStatus.PENDING);
            booking.setStartTime(startTime);
            booking.setEndTime(endTime);
            booking.setSlotNumber(bookingRequest.getSlotNumber());
            
            if (bookingRequest.getAdditionalMembers() != null && !bookingRequest.getAdditionalMembers().isEmpty()) {
                booking.setAdditionalMembers(objectMapper.writeValueAsString(bookingRequest.getAdditionalMembers()));
            }

            Booking savedBooking = bookingRepository.save(booking);
            return mapToResponseDTO(savedBooking);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Failed to create booking. The time slot may already be taken.");
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error processing member data");
        }
    }

    public List<BookingResponseDTO> getBookingsByStudentId(String studentId) {
        List<Booking> bookings = bookingRepository.findByStudentId(studentId);
        return bookings.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<BookingResponseDTO> getBookingsByResourceId(Long resourceId) {
        List<Booking> bookings = bookingRepository.findByResourceId(resourceId);
        return bookings.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<LocalTime[]> getAvailableSlots(Long resourceId) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
        
        if (resource.getHasSlots() != null && resource.getHasSlots()) {
            return getAvailableMeetingRoomSlots(resource);
        }
        
        return getAvailableTimeRanges(resource);
    }

    private List<LocalTime[]> getAvailableMeetingRoomSlots(Resource resource) {
        List<LocalTime[]> availableSlots = new ArrayList<>();
        
        LocalTime[][] slots = {
            {LocalTime.of(9, 0), LocalTime.of(11, 0)},
            {LocalTime.of(11, 0), LocalTime.of(13, 0)},
            {LocalTime.of(13, 0), LocalTime.of(15, 0)},
            {LocalTime.of(15, 0), LocalTime.of(17, 0)},
            {LocalTime.of(17, 0), LocalTime.of(19, 0)}
        };
        
        List<Booking> approvedBookings = bookingRepository.findApprovedBookingsByResourceId(resource.getId());
        
        for (int i = 0; i < slots.length; i++) {
            final int slotNum = i + 1;
            boolean isBooked = approvedBookings.stream()
                .anyMatch(b -> b.getSlotNumber() != null && b.getSlotNumber() == slotNum);
            
            if (!isBooked) {
                availableSlots.add(slots[i]);
            }
        }
        
        return availableSlots;
    }

    private List<LocalTime[]> getAvailableTimeRanges(Resource resource) {
        List<LocalTime[]> availableRanges = new ArrayList<>();
        
        List<Booking> approvedBookings = bookingRepository.findApprovedBookingsByResourceId(resource.getId());
        approvedBookings.sort((a, b) -> {
            if (a.getStartTime() == null || b.getStartTime() == null) return 0;
            return a.getStartTime().compareTo(b.getStartTime());
        });
        
        LocalTime currentTime = resource.getAvailableFrom();
        if (currentTime == null) {
            currentTime = LocalTime.of(8, 0);
        }
        
        LocalTime availableTo = resource.getAvailableTo();
        if (availableTo == null) {
            availableTo = LocalTime.of(20, 0);
        }
        
        for (Booking booking : approvedBookings) {
            if (booking.getStartTime() != null && currentTime.isBefore(booking.getStartTime())) {
                availableRanges.add(new LocalTime[]{currentTime, booking.getStartTime()});
            }
            if (booking.getEndTime() != null && booking.getEndTime().isAfter(currentTime)) {
                currentTime = booking.getEndTime();
            }
        }
        
        if (currentTime.isBefore(availableTo)) {
            availableRanges.add(new LocalTime[]{currentTime, availableTo});
        }
        
        return availableRanges;
    }

    public boolean hasStudentBookedResource(Long resourceId, String studentId) {
        return bookingRepository.existsByResourceIdAndStudentIdAndStatusIn(
                resourceId, 
                studentId,
                List.of(Booking.BookingStatus.PENDING, Booking.BookingStatus.APPROVED)
        );
    }

    @Transactional
    public void cancelBooking(Long bookingId, String studentId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getStudentId().equals(studentId)) {
            throw new RuntimeException("You are not authorized to cancel this booking");
        }

        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new RuntimeException("This booking is already cancelled");
        }
        
        if (booking.getStatus() == Booking.BookingStatus.REJECTED) {
            throw new RuntimeException("Cannot cancel a rejected booking");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    @Transactional
    public BookingResponseDTO updateBookingStatus(Long bookingId, Booking.BookingStatus status, String rejectionReason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(status);
        if (status == Booking.BookingStatus.REJECTED && rejectionReason != null) {
            booking.setRejectionReason(rejectionReason);
        }
        
        Booking updatedBooking = bookingRepository.save(booking);
        return mapToResponseDTO(updatedBooking);
    }

    public List<BookingResponseDTO> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAll();
        return bookings.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<BookingResponseDTO> getBookingsByStatus(Booking.BookingStatus status) {
        List<Booking> bookings = bookingRepository.findByStatus(status);
        return bookings.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    private BookingResponseDTO mapToResponseDTO(Booking booking) {
        List<String> additionalMembersList = new ArrayList<>();
        if (booking.getAdditionalMembers() != null) {
            try {
                additionalMembersList = objectMapper.readValue(
                    booking.getAdditionalMembers(), 
                    objectMapper.getTypeFactory().constructCollectionType(List.class, String.class)
                );
            } catch (JsonProcessingException e) {
                // Ignore parsing errors
            }
        }
        
        return new BookingResponseDTO(
                booking.getId(),
                booking.getStudentId(),
                booking.getStudentName(),
                booking.getContactNumber(),
                booking.getResource().getId(),
                booking.getResource().getName(),
                booking.getResource().getLocation(),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getStatus().toString(),
                booking.getPurpose(),
                booking.getRejectionReason(),
                booking.getSlotNumber(),
                additionalMembersList
        );
    }
}