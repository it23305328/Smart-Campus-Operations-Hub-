package com.smartcampus.facilities.controller;

import com.smartcampus.facilities.dto.BookingRequestDTO;
import com.smartcampus.facilities.dto.BookingResponseDTO;
import com.smartcampus.facilities.model.Booking;
import com.smartcampus.facilities.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class BookingController {

    private final BookingService bookingService;

    @Autowired
    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<?> createBooking(@Valid @RequestBody BookingRequestDTO bookingRequest) {
        try {
            BookingResponseDTO booking = bookingService.createBooking(bookingRequest);
            return new ResponseEntity<>(booking, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<BookingResponseDTO>> getBookingsByStudentId(@PathVariable String studentId) {
        List<BookingResponseDTO> bookings = bookingService.getBookingsByStudentId(studentId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/resource/{resourceId}")
    public ResponseEntity<List<BookingResponseDTO>> getBookingsByResourceId(@PathVariable Long resourceId) {
        List<BookingResponseDTO> bookings = bookingService.getBookingsByResourceId(resourceId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> checkBookingExists(
            @RequestParam Long resourceId,
            @RequestParam String studentId) {
        boolean exists = bookingService.hasStudentBookedResource(resourceId, studentId);
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{bookingId}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long bookingId, 
                                          @RequestParam String studentId) {
        try {
            bookingService.cancelBooking(bookingId, studentId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Booking cancelled successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{bookingId}/status")
    public ResponseEntity<BookingResponseDTO> updateBookingStatus(
            @PathVariable Long bookingId,
            @RequestParam Booking.BookingStatus status,
            @RequestParam(required = false) String rejectionReason) {
        BookingResponseDTO booking = bookingService.updateBookingStatus(bookingId, status, rejectionReason);
        return ResponseEntity.ok(booking);
    }

    @GetMapping
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings() {
        List<BookingResponseDTO> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/status")
    public ResponseEntity<List<BookingResponseDTO>> getBookingsByStatus(@RequestParam Booking.BookingStatus status) {
        List<BookingResponseDTO> bookings = bookingService.getBookingsByStatus(status);
        return ResponseEntity.ok(bookings);
    }
}