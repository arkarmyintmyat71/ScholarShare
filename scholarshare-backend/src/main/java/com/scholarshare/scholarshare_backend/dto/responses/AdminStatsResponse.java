package com.scholarshare.scholarshare_backend.dto.responses;

/** Numbers for the admin dashboard cards. */
public record AdminStatsResponse(
        long pendingAccounts,
        long pendingResearch,
        long students,
        long publishedResearch,
        long topics,
        long categories
) {
}
