package com.scholarshare.scholarshare_backend.entities.enums;

/**
 * APPROVED  - normal account. Every new student account starts here: sign-up needs no admin approval.
 * DISABLED  - switched off later by an admin; the person can no longer sign in.
 */
public enum AccountStatus {
    APPROVED,
    DISABLED
}
