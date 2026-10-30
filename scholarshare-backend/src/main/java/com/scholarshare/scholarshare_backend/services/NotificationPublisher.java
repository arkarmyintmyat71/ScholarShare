package com.scholarshare.scholarshare_backend.services;

import com.scholarshare.scholarshare_backend.entities.User;
import com.scholarshare.scholarshare_backend.entities.enums.NotificationType;
import com.scholarshare.scholarshare_backend.entities.enums.RelatedEntityType;

/**
 * Creates notification rows. Called from other services INSIDE their transaction, so a
 * notification exists if and only if the action that caused it was saved.
 */
public interface NotificationPublisher {
    void toUser(User recipient, NotificationType type, String message, RelatedEntityType entityType, Long entityId);

    /** One row per APPROVED admin. */
    void toAdmins(NotificationType type, String message, RelatedEntityType entityType, Long entityId);
}
