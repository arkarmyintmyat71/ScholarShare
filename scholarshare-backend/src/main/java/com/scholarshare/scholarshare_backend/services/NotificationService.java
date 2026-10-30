package com.scholarshare.scholarshare_backend.services;

import com.scholarshare.scholarshare_backend.dto.responses.NotificationResponse;

import java.util.List;

/** The signed-in user's inbox. (Creating notifications is NotificationPublisher's job.) */
public interface NotificationService {
    List<NotificationResponse> latest();

    long unreadCount();

    void markRead(Long id);

    void markAllRead();
}
