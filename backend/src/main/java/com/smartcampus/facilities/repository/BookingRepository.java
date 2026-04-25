package com.smartcampus.facilities.repository;

import com.smartcampus.facilities.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM Booking b " +
           "WHERE b.resource.id = :resourceId AND b.studentId = :studentId " +
           "AND b.reservationDate = :date AND b.status IN :statuses")
    boolean existsByResourceIdAndStudentIdAndDateAndStatusIn(@Param("resourceId") Long resourceId, 
                                                              @Param("studentId") String studentId,
                                                              @Param("date") java.time.LocalDate date,
                                                              @Param("statuses") List<Booking.BookingStatus> statuses);
    
    List<Booking> findByStudentId(String studentId);
    
    List<Booking> findByResourceId(Long resourceId);
    
    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId AND b.studentId = :studentId")
    List<Booking> findByResourceIdAndStudentId(@Param("resourceId") Long resourceId, 
                                                @Param("studentId") String studentId);
    
    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId AND b.studentId = :studentId AND b.status IN :statuses")
    List<Booking> findByResourceIdAndStudentIdAndStatusIn(@Param("resourceId") Long resourceId, 
                                                           @Param("studentId") String studentId,
                                                           @Param("statuses") List<Booking.BookingStatus> statuses);
    
    List<Booking> findByStatus(Booking.BookingStatus status);
    
    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId AND b.status = 'APPROVED' AND b.reservationDate = :date")
    List<Booking> findApprovedBookingsByResourceIdAndDate(@Param("resourceId") Long resourceId, 
                                                           @Param("date") LocalDate date);
    
    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId AND b.status IN :statuses " +
           "AND b.reservationDate = :date " +
           "AND ((b.startTime < :endTime AND b.endTime > :startTime))")
    List<Booking> findConflictingBookings(@Param("resourceId") Long resourceId,
                                          @Param("date") LocalDate date,
                                          @Param("startTime") LocalTime startTime,
                                          @Param("endTime") LocalTime endTime,
                                          @Param("statuses") List<Booking.BookingStatus> statuses);

    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId AND b.slotNumber = :slotNumber " +
           "AND b.status IN :statuses AND b.reservationDate = :date")
    List<Booking> findBookingsBySlot(@Param("resourceId") Long resourceId,
                                     @Param("slotNumber") Integer slotNumber,
                                     @Param("date") LocalDate date,
                                     @Param("statuses") List<Booking.BookingStatus> statuses);
    
    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId " +
           "AND b.reservationDate = :date AND b.status IN :statuses")
    List<Booking> findBookingsByResourceAndDate(@Param("resourceId") Long resourceId,
                                                 @Param("date") LocalDate date,
                                                 @Param("statuses") List<Booking.BookingStatus> statuses);
    
    @Modifying
    @Query("UPDATE Booking b SET b.status = 'CANCELLED' WHERE b.status = 'APPROVED' " +
           "AND (b.reservationDate < :today OR (b.reservationDate = :today AND b.endTime < :currentTime))")
    int expirePastBookings(@Param("today") LocalDate today, @Param("currentTime") LocalTime currentTime);
}