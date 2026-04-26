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
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final com.smartcampus.notifications.service.NotificationService notificationService;
    private final com.smartcampus.users.UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    private static final String SRI_LANKA_TIMEZONE = "Asia/Colombo";

    @Autowired
    public BookingService(BookingRepository bookingRepository, 
                          ResourceRepository resourceRepository,
                          com.smartcampus.notifications.service.NotificationService notificationService,
                          com.smartcampus.users.UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    // This runs on a separate thread, so @Transactional works here
    @Scheduled(fixedRate = 900000)
    @Transactional
    public void autoExpireBookings() {
        try {
            ZonedDateTime sriLankaNow = ZonedDateTime.now(ZoneId.of(SRI_LANKA_TIMEZONE));
            LocalDate today = sriLankaNow.toLocalDate();
            LocalTime currentTime = sriLankaNow.toLocalTime();
            
            int expired = bookingRepository.expirePastBookings(today, currentTime);
            if (expired > 0) {
                System.out.println("Auto-expired " + expired + " bookings at " + sriLankaNow);
            }
        } catch (Exception e) {
            System.err.println("Error in auto-expire: " + e.getMessage());
        }
    }

    @Transactional
    public BookingResponseDTO createBooking(BookingRequestDTO bookingRequest) {
        ZonedDateTime sriLankaNow = ZonedDateTime.now(ZoneId.of(SRI_LANKA_TIMEZONE));
        
        Resource resource = resourceRepository.findById(bookingRequest.getResourceId())
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        if (resource.getStatus() != Resource.ResourceStatus.ACTIVE) {
            throw new RuntimeException("Resource is not available for booking");
        }

        LocalDate reservationDate = bookingRequest.getReservationDate();
        LocalTime startTime = bookingRequest.getStartTime();
        LocalTime endTime = bookingRequest.getEndTime();
        
        if (reservationDate == null || startTime == null || endTime == null) {
            throw new RuntimeException("Reservation date, start time and end time are required");
        }

        if (reservationDate.isBefore(sriLankaNow.toLocalDate())) {
            throw new RuntimeException("Cannot book for a past date");
        }
        
        if (reservationDate.equals(sriLankaNow.toLocalDate()) && startTime.isBefore(sriLankaNow.toLocalTime())) {
            throw new RuntimeException("Cannot book for a past time today");
        }

        LocalTime resourceFrom = resource.getAvailableFrom();
        LocalTime resourceTo = resource.getAvailableTo();
        
        boolean isMeetingRoom = resource.getType() == ResourceType.MEETING_ROOM;
        
        if (resourceFrom == null) {
            resourceFrom = isMeetingRoom ? LocalTime.of(9, 0) : LocalTime.of(8, 0);
        }
        if (resourceTo == null) {
            resourceTo = isMeetingRoom ? LocalTime.of(19, 0) : LocalTime.of(20, 0);
        }
        
        if (startTime.isBefore(resourceFrom) || endTime.isAfter(resourceTo)) {
            throw new RuntimeException("Booking time must be between " + resourceFrom + " and " + resourceTo);
        }
        
        if (!startTime.isBefore(endTime)) {
            throw new RuntimeException("Start time must be before end time");
        }

        // Meeting room validation
        if (isMeetingRoom && resource.getHasSlots() != null && resource.getHasSlots()) {
            if (bookingRequest.getSlotNumber() == null || bookingRequest.getSlotNumber() < 1 || bookingRequest.getSlotNumber() > 5) {
                throw new RuntimeException("Invalid slot number");
            }
            
            if (bookingRequest.getAdditionalMembers() == null || bookingRequest.getAdditionalMembers().size() != 4) {
                throw new RuntimeException("Meeting room requires exactly 4 additional members");
            }
            
            List<String> allMembers = new ArrayList<>(bookingRequest.getAdditionalMembers());
            allMembers.add(bookingRequest.getStudentId());
            if (allMembers.stream().distinct().count() != allMembers.size()) {
                throw new RuntimeException("Duplicate student IDs are not allowed");
            }
            
            List<Booking> slotBookings = bookingRepository.findBookingsBySlot(
                resource.getId(), bookingRequest.getSlotNumber(), reservationDate,
                List.of(Booking.BookingStatus.PENDING, Booking.BookingStatus.APPROVED)
            );
            
            if (!slotBookings.isEmpty()) {
                throw new RuntimeException("This slot is already booked");
            }
        } else if (!isMeetingRoom) {
            // Check time conflicts
            List<Booking> conflictingBookings = bookingRepository.findConflictingBookings(
                resource.getId(), reservationDate, startTime, endTime,
                List.of(Booking.BookingStatus.PENDING, Booking.BookingStatus.APPROVED)
            );
            
            if (!conflictingBookings.isEmpty()) {
                throw new RuntimeException("The selected time period conflicts with an existing booking");
            }
        }

        // Check for active booking
        // Check if student already has an active booking for this resource on the SAME DATE
        boolean hasActiveBooking = bookingRepository.existsByResourceIdAndStudentIdAndDateAndStatusIn(
                bookingRequest.getResourceId(), bookingRequest.getStudentId(),
                reservationDate,
                List.of(Booking.BookingStatus.PENDING, Booking.BookingStatus.APPROVED)
        );
        
        if (hasActiveBooking) {
            throw new RuntimeException("You already have a pending or approved booking for this resource on " + reservationDate);
        }

        // Clean up old inactive bookings
        List<Booking> existingInactiveBookings = bookingRepository.findByResourceIdAndStudentIdAndStatusIn(
                bookingRequest.getResourceId(), bookingRequest.getStudentId(),
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
            booking.setReservationDate(reservationDate);
            booking.setStartTime(startTime);
            booking.setEndTime(endTime);
            booking.setSlotNumber(bookingRequest.getSlotNumber());
            
            if (bookingRequest.getAdditionalMembers() != null && !bookingRequest.getAdditionalMembers().isEmpty()) {
                booking.setAdditionalMembers(objectMapper.writeValueAsString(bookingRequest.getAdditionalMembers()));
            }

            Booking savedBooking = bookingRepository.save(booking);
            
            // Send notification for successful booking creation
            try {
                Long userId = Long.parseLong(savedBooking.getStudentId());
                userRepository.findById(userId).ifPresent(user -> {
                    String message = String.format("Booking successful! Your request for %s on %s from %s to %s is pending approval.",
                            resource.getName(), savedBooking.getReservationDate(), savedBooking.getStartTime(), savedBooking.getEndTime());
                    notificationService.sendNotification(user, message, com.smartcampus.notifications.model.NotificationType.BOOKING);
                });
            } catch (Exception e) {
                System.err.println("Failed to send booking creation notification: " + e.getMessage());
            }

            return mapToResponseDTO(savedBooking);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Failed to create booking. The time slot may already be taken.");
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error processing member data");
        }
    }

    public List<BookingResponseDTO> getBookingsByStudentId(String studentId) {
        List<Booking> bookings = bookingRepository.findByStudentId(studentId);
        return bookings.stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    public List<BookingResponseDTO> getBookingsByResourceId(Long resourceId) {
        List<Booking> bookings = bookingRepository.findByResourceId(resourceId);
        return bookings.stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    public List<BookingResponseDTO> getBookedSlotsForDate(Long resourceId, LocalDate date) {
        List<Booking> bookings = bookingRepository.findBookingsByResourceAndDate(
            resourceId, date, 
            List.of(Booking.BookingStatus.PENDING, Booking.BookingStatus.APPROVED)
        );
        return bookings.stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    public boolean hasStudentBookedResource(Long resourceId, String studentId) {
        return bookingRepository.existsByResourceIdAndStudentIdAndStatusIn(
                resourceId, studentId,
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
        
        // Send notification for approval or rejection
        if (status == Booking.BookingStatus.APPROVED || status == Booking.BookingStatus.REJECTED) {
            try {
                String studentIdStr = updatedBooking.getStudentId();
                System.out.println("Processing notification for status update. StudentId: " + studentIdStr);
                Long userId = Long.parseLong(studentIdStr);
                userRepository.findById(userId).ifPresentOrElse(user -> {
                    String action = (status == Booking.BookingStatus.APPROVED) ? "APPROVED" : "REJECTED";
                    String message = String.format("Your booking for %s on %s has been %s.",
                            updatedBooking.getResource().getName(), updatedBooking.getReservationDate(), action);
                    
                    if (status == Booking.BookingStatus.REJECTED && rejectionReason != null) {
                        message += " Reason: " + rejectionReason;
                    }
                    
                    System.out.println("Sending status notification to student: " + user.getEmail());
                    notificationService.sendNotification(user, message, com.smartcampus.notifications.model.NotificationType.BOOKING);
                }, () -> {
                    System.err.println("CRITICAL: Student user not found in database for ID: " + userId);
                });
            } catch (Exception e) {
                System.err.println("Failed to send booking status notification: " + e.getMessage());
            }
        }
        
        return mapToResponseDTO(updatedBooking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAll();
        return bookings.stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getBookingsByStatus(Booking.BookingStatus status) {
        List<Booking> bookings = bookingRepository.findByStatus(status);
        return bookings.stream().map(this::mapToResponseDTO).collect(Collectors.toList());
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
                // Ignore
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
                booking.getReservationDate(),
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