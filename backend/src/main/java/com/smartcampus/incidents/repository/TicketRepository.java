package com.smartcampus.incidents.repository;

import com.smartcampus.incidents.model.Ticket;
import com.smartcampus.users.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository("incidentTicketRepository")
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByReporter(User reporter);
    List<Ticket> findByTechnician(User technician);
}
