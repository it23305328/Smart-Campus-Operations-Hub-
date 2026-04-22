package com.smartcampus.facilities.service;

import com.smartcampus.facilities.dto.BookingRequestDTO;
import com.smartcampus.facilities.dto.BookingResponseDTO;
import com.smartcampus.facilities.model.Booking;
import com.smartcampus.facilities.model.Resource;
import com.smartcampus.facilities.repository.BookingRepository;
import com.smartcampus.facilities.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;

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

        // Check if student already has an ACTIVE booking (PENDING or APPROVED) for this resource
        boolean hasActiveBooking = bookingRepository.existsByResourceIdAndStudentIdAndStatusIn(
                bookingRequest.getResourceId(), 
                bookingRequest.getStudentId(),
                List.of(Booking.BookingStatus.PENDING, Booking.BookingStatus.APPROVED)
        );
        
        if (hasActiveBooking) {
            throw new RuntimeException("You already have an active booking or pending request for this resource");
        }

        Booking booking = new Booking();
        booking.setStudentId(bookingRequest.getStudentId());
        booking.setStudentName(bookingRequest.getStudentName());
        booking.setContactNumber(bookingRequest.getContactNumber());
        booking.setResource(resource);
        booking.setPurpose(bookingRequest.getPurpose());
        booking.setStatus(Booking.BookingStatus.PENDING);

        Booking savedBooking = bookingRepository.save(booking);

        return mapToResponseDTO(savedBooking);
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
        return new BookingResponseDTO(
                booking.getId(),
                booking.getStudentId(),
                booking.getStudentName(),
                booking.getContactNumber(),
                booking.getResource().getId(),
                booking.getResource().getName(),
                booking.getResource().getLocation(),
                booking.getBookingDate(),
                booking.getStatus().toString(),
                booking.getPurpose(),
                booking.getRejectionReason()
        );
    }
}