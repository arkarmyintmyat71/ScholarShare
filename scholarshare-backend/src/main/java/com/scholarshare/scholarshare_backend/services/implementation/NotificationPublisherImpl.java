package com.scholarshare.scholarshare_backend.services.implementation;

import com.scholarshare.scholarshare_backend.entities.Notification;
import com.scholarshare.scholarshare_backend.entities.User;
import com.scholarshare.scholarshare_backend.entities.enums.AccountStatus;
import com.scholarshare.scholarshare_backend.entities.enums.NotificationType;
import com.scholarshare.scholarshare_backend.entities.enums.RelatedEntityType;
import com.scholarshare.scholarshare_backend.entities.enums.Role;
import com.scholarshare.scholarshare_backend.repositories.NotificationRepo;
import com.scholarshare.scholarshare_backend.repositories.UserRepo;
import com.scholarshare.scholarshare_backend.services.NotificationPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationPublisherImpl implements NotificationPublisher {

    private static final int MAX_MESSAGE = 255;

    private final NotificationRepo notificationRepo;
    private final UserRepo userRepo;

    // MANDATORY: must be called from inside another service's transaction (see the interface comment).
    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public void toUser(User recipient, NotificationType type, String message,
                       RelatedEntityType entityType, Long entityId) {
        notificationRepo.save(build(recipient, type, message, entityType, entityId));
    }

    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public void toAdmins(NotificationType type, String message, RelatedEntityType entityType, Long entityId) {
        List<User> admins = userRepo.findByRoleAndAccountStatus(Role.ADMIN, AccountStatus.APPROVED);
        notificationRepo.saveAll(admins.stream()
                .map(admin -> build(admin, type, message, entityType, entityId))
                .toList());
    }

    private Notification build(User recipient, NotificationType type, String message,
                               RelatedEntityType entityType, Long entityId) {
        String text = message.length() > MAX_MESSAGE ? message.substring(0, MAX_MESSAGE - 1) + "…" : message;
        return Notification.builder()
                .recipient(recipient)
                .type(type)
                .message(text)
                .relatedEntityType(entityType)
                .relatedEntityId(entityId)
                .read(false)
                .build();
    }
}
