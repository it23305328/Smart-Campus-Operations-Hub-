package com.smartcampus.facilities.repository;

import com.smartcampus.facilities.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM Booking b " +
           "WHERE b.resource.id = :resourceId AND b.studentId = :studentId AND b.status IN :statuses")
    boolean existsByResourceIdAndStudentIdAndStatusIn(@Param("resourceId") Long resourceId, 
                                                      @Param("studentId") String studentId,
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
    
    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId AND b.status = 'APPROVED'")
    List<Booking> findApprovedBookingsByResourceId(@Param("resourceId") Long resourceId);
    
    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId AND b.status IN :statuses " +
           "AND ((b.startTime < :endTime AND b.endTime > :startTime))")
    List<Booking> findConflictingBookings(@Param("resourceId") Long resourceId,
                                          @Param("startTime") LocalTime startTime,
                                          @Param("endTime") LocalTime endTime,
                                          @Param("statuses") List<Booking.BookingStatus> statuses);

    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId AND b.slotNumber = :slotNumber " +
           "AND b.status IN :statuses")
    List<Booking> findBookingsBySlot(@Param("resourceId") Long resourceId,
                                     @Param("slotNumber") Integer slotNumber,
                                     @Param("statuses") List<Booking.BookingStatus> statuses);
}