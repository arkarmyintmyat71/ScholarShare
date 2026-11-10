package com.scholarshare.scholarshare_backend.utils;

import com.scholarshare.scholarshare_backend.exceptions.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Checks a profile, category or research photo: not empty, at most 2 MB, and the first bytes must really be
 * a PNG, JPEG, GIF or WebP picture (the browser's claimed type is never trusted).
 */
public final class ImageValidator {

    public static final long MAX_BYTES = 2L * 1024 * 1024;

    public record ValidatedImage(String contentType, byte[] data) {
    }

    private ImageValidator() {
    }

    public static ValidatedImage validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw bad("Please choose a photo.");
        }
        if (file.getSize() > MAX_BYTES) {
            throw bad("The photo is too large (maximum 2 MB).");
        }
        byte[] data;
        try {
            data = file.getBytes();
        } catch (IOException e) {
            throw bad("The photo could not be read.");
        }
        String type = detect(data);
        if (type == null) {
            throw bad("Only PNG, JPG, GIF and WebP photos are allowed.");
        }
        return new ValidatedImage(type, data);
    }

    static String detect(byte[] d) {
        if (d.length >= 8 && (d[0] & 0xFF) == 0x89 && d[1] == 'P' && d[2] == 'N' && d[3] == 'G') {
            return "image/png";
        }
        if (d.length >= 3 && (d[0] & 0xFF) == 0xFF && (d[1] & 0xFF) == 0xD8 && (d[2] & 0xFF) == 0xFF) {
            return "image/jpeg";
        }
        if (d.length >= 6 && d[0] == 'G' && d[1] == 'I' && d[2] == 'F' && d[3] == '8') {
            return "image/gif";
        }
        if (d.length >= 12 && d[0] == 'R' && d[1] == 'I' && d[2] == 'F' && d[3] == 'F'
                && d[8] == 'W' && d[9] == 'E' && d[10] == 'B' && d[11] == 'P') {
            return "image/webp";
        }
        return null;
    }

    private static ApiException bad(String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, message);
    }
}
