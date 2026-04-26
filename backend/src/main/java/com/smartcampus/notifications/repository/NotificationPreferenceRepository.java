package com.smartcampus.notifications.repository;

import com.smartcampus.notifications.model.NotificationPreference;
import com.smartcampus.users.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {
    Optional<NotificationPreference> findByUser(User user);
}
