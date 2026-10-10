package com.scholarshare.scholarshare_backend.exceptions;

import com.scholarshare.scholarshare_backend.entities.enums.AccountStatus;
import org.springframework.http.HttpStatus;

public class AccountNotActiveException extends ApiException {
    public AccountNotActiveException(AccountStatus status) {
        super(HttpStatus.FORBIDDEN, describe(status));
    }

    private static String describe(AccountStatus status) {
        return switch (status) {
            case SUSPENDED -> "This account has been disabled";
            default -> "This account cannot log in right now";
        };
    }
}
