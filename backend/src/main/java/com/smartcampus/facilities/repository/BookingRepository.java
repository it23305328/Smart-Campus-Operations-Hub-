package com.smartcampus.facilities.repository;

import com.smartcampus.facilities.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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
    
    List<Booking> findByStatus(Booking.BookingStatus status);
    
    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId AND b.status = 'APPROVED'")
    List<Booking> findApprovedBookingsByResourceId(@Param("resourceId") Long resourceId);
}