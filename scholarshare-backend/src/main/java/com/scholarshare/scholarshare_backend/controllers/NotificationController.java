package com.scholarshare.scholarshare_backend.controllers;

import com.scholarshare.scholarshare_backend.dto.responses.ApiResponse;
import com.scholarshare.scholarshare_backend.dto.responses.CountResponse;
import com.scholarshare.scholarshare_backend.dto.responses.NotificationResponse;
import com.scholarshare.scholarshare_backend.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> latest() {
        return ResponseEntity.ok(ApiResponse.ok("OK", notificationService.latest()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<CountResponse>> unreadCount() {
        return ResponseEntity.ok(ApiResponse.ok("OK", new CountResponse(notificationService.unreadCount())));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> readAll() {
        notificationService.markAllRead();
        return ResponseEntity.ok(ApiResponse.ok("All notifications marked as read"));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> read(@PathVariable Long id) {
        notificationService.markRead(id);
        return ResponseEntity.ok(ApiResponse.ok("Notification marked as read"));
    }
}
