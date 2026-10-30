package com.scholarshare.scholarshare_backend.utils;

import com.scholarshare.scholarshare_backend.exceptions.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Locale;
import java.util.Map;

/**
 * Checks an uploaded research file BEFORE it is stored (thesis section 3.8 "file validation"):
 *   1. not empty, at most 10 MB
 *   2. extension is pdf, doc, docx, ppt or pptx
 *   3. the first bytes really look like that format (so "virus.exe" renamed to "a.pdf" is refused)
 * The content type is taken from the extension, never from what the browser claims.
 */
public final class UploadValidator {

    public static final long MAX_BYTES = 10L * 1024 * 1024;

    private static final Map<String, String> CONTENT_TYPES = Map.of(
            "pdf", "application/pdf",
            "doc", "application/msword",
            "docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "ppt", "application/vnd.ms-powerpoint",
            "pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation");

    private static final byte[] PDF_MAGIC = {'%', 'P', 'D', 'F'};
    private static final byte[] ZIP_MAGIC = {'P', 'K', 3, 4};                                   // docx, pptx
    private static final byte[] OLE_MAGIC = {(byte) 0xD0, (byte) 0xCF, 0x11, (byte) 0xE0};     // doc, ppt

    /** A file that passed every check. */
    public record ValidatedFile(String fileName, String contentType, byte[] data) {
    }

    private UploadValidator() {
    }

    public static ValidatedFile validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw bad("Please choose a file to upload.");
        }
        if (file.getSize() > MAX_BYTES) {
            throw bad("The file is too large (maximum 10 MB).");
        }

        String fileName = cleanName(file.getOriginalFilename());
        String extension = extensionOf(fileName);
        String contentType = CONTENT_TYPES.get(extension);
        if (contentType == null) {
            throw bad("Only PDF, DOC, DOCX, PPT and PPTX files are allowed.");
        }

        byte[] data;
        try {
            data = file.getBytes();
        } catch (IOException e) {
            throw bad("The file could not be read.");
        }
        if (!startsWith(data, expectedMagic(extension))) {
            throw bad("The file content does not match its ." + extension + " extension.");
        }
        return new ValidatedFile(fileName, contentType, data);
    }

    private static byte[] expectedMagic(String extension) {
        return switch (extension) {
            case "pdf" -> PDF_MAGIC;
            case "docx", "pptx" -> ZIP_MAGIC;
            default -> OLE_MAGIC;
        };
    }

    private static boolean startsWith(byte[] data, byte[] prefix) {
        if (data.length < prefix.length) {
            return false;
        }
        for (int i = 0; i < prefix.length; i++) {
            if (data[i] != prefix[i]) {
                return false;
            }
        }
        return true;
    }

    /** Drops any folder part and control characters, and keeps the name within the 255-character column. */
    static String cleanName(String original) {
        String name = original == null ? "" : original.replace('\\', '/');
        name = name.substring(name.lastIndexOf('/') + 1).replaceAll("\\p{Cntrl}", "").trim();
        if (name.length() > 255) {
            String ext = extensionOf(name);
            name = name.substring(0, 250 - ext.length()) + "." + ext;
        }
        return name;
    }

    static String extensionOf(String fileName) {
        int dot = fileName.lastIndexOf('.');
        return dot < 0 ? "" : fileName.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    private static ApiException bad(String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, message);
    }
}
