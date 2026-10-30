package com.scholarshare.scholarshare_backend.exceptions;

import com.scholarshare.scholarshare_backend.entities.enums.AccountStatus;
import org.springframework.http.HttpStatus;

import java.util.Map;

/** 403 on login. The JSON also says which status the account has, so the UI can explain it. */
public class AccountNotActiveException extends ApiException {
    public AccountNotActiveException(AccountStatus status) {
        super(HttpStatus.FORBIDDEN, describe(status), Map.of("accountStatus", status.name()));
    }

    private static String describe(AccountStatus status) {
        return switch (status) {
            case PENDING -> "Your account is waiting for administrator approval.";
            case REJECTED -> "Your registration was not approved.";
            case DISABLED -> "This account has been disabled.";
            default -> "This account cannot sign in right now.";
        };
    }
}
