package com.scholarshare.scholarshare_backend.dto.responses;

import com.scholarshare.scholarshare_backend.entities.Notification;
import com.scholarshare.scholarshare_backend.entities.enums.NotificationType;
import com.scholarshare.scholarshare_backend.entities.enums.RelatedEntityType;

import java.time.Instant;

public record NotificationResponse(
        Long id,
        NotificationType type,
        String message,
        RelatedEntityType relatedEntityType,
        Long relatedEntityId,
        boolean read,
        Instant createdAt
) {
    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(n.getId(), n.getType(), n.getMessage(), n.getRelatedEntityType(),
                n.getRelatedEntityId(), n.isRead(), n.getCreatedAt());
    }
}
