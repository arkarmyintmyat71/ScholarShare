package com.scholarshare.scholarshare_backend.dto.responses;

/** A stored photo (profile or category) ready to be sent to the browser. */
public record ImageDownload(String contentType, byte[] data) {
}
