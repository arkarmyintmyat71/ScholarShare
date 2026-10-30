package com.scholarshare.scholarshare_backend.entities.enums;

/**
 * PENDING   - just registered, cannot sign in until an admin approves
 * APPROVED  - normal account
 * REJECTED  - admin refused the registration
 * DISABLED  - approved earlier, later switched off by an admin
 */
public enum AccountStatus {
    PENDING,
    APPROVED,
    REJECTED,
    DISABLED
}
