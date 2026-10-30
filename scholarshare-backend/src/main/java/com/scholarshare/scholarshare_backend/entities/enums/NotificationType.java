package com.scholarshare.scholarshare_backend.entities.enums;

public enum NotificationType {
    REGISTRATION_SUBMITTED,   // -> every admin
    REGISTRATION_RESULT,      // -> the student
    FILE_SUBMITTED,           // -> every admin
    FILE_RESULT,              // -> the uploader
    NEW_COMMENT               // -> the topic's creator
}
