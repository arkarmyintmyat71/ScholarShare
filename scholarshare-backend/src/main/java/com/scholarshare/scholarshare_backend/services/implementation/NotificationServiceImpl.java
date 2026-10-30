package com.scholarshare.scholarshare_backend.services.implementation;

import com.scholarshare.scholarshare_backend.dto.responses.NotificationResponse;
import com.scholarshare.scholarshare_backend.exceptions.NotFoundException;
import com.scholarshare.scholarshare_backend.repositories.NotificationRepo;
import com.scholarshare.scholarshare_backend.securities.CurrentUser;
import com.scholarshare.scholarshare_backend.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepo notificationRepo;
    private final CurrentUser currentUser;

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> latest() {
        return notificationRepo.findTop50ByRecipientIdOrderByCreatedAtDesc(currentUser.require().getId()).stream()
                .map(NotificationResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long unreadCount() {
        return notificationRepo.countByRecipientIdAndReadFalse(currentUser.require().getId());
    }

    @Override
    @Transactional
    public void markRead(Long id) {
        if (notificationRepo.markRead(id, currentUser.require().getId()) == 0) {
            throw new NotFoundException("Notification not found");
        }
    }

    @Override
    @Transactional
    public void markAllRead() {
        notificationRepo.markAllRead(currentUser.require().getId());
    }
}
