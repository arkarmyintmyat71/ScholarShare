package com.scholarshare.scholarshare_backend.dto.responses;

/** The bytes of a research file plus what the browser needs to save it. */
public record FileDownload(String fileName, String contentType, byte[] data) {
}
