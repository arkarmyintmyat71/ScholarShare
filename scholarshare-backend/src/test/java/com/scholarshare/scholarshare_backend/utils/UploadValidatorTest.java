package com.scholarshare.scholarshare_backend.utils;

import com.scholarshare.scholarshare_backend.exceptions.ApiException;
import com.scholarshare.scholarshare_backend.utils.UploadValidator.ValidatedFile;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UploadValidatorTest {

    private static MockMultipartFile file(String name, byte[] bytes) {
        return new MockMultipartFile("file", name, "application/octet-stream", bytes);
    }

    private static final byte[] PDF = "%PDF-1.4 test".getBytes(StandardCharsets.US_ASCII);

    @Test
    void acceptsARealPdfAndSetsTheContentTypeFromTheExtension() {
        ValidatedFile ok = UploadValidator.validate(file("Thesis.PDF", PDF));

        assertThat(ok.fileName()).isEqualTo("Thesis.PDF");
        assertThat(ok.contentType()).isEqualTo("application/pdf");
        assertThat(ok.data()).isEqualTo(PDF);
    }

    @Test
    void acceptsDocxAndPptxByZipSignature() {
        byte[] zip = {'P', 'K', 3, 4, 0, 0};
        assertThat(UploadValidator.validate(file("a.docx", zip)).contentType()).contains("wordprocessingml");
        assertThat(UploadValidator.validate(file("b.pptx", zip)).contentType()).contains("presentationml");
    }

    @Test
    void acceptsLegacyDocBySignature() {
        byte[] ole = {(byte) 0xD0, (byte) 0xCF, 0x11, (byte) 0xE0, 0, 0};
        assertThat(UploadValidator.validate(file("a.doc", ole)).contentType()).isEqualTo("application/msword");
    }

    @Test
    void rejectsAnExecutableRenamedToPdf() {
        assertThatThrownBy(() -> UploadValidator.validate(file("virus.pdf", "MZ-program".getBytes(StandardCharsets.US_ASCII))))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("does not match");
    }

    @Test
    void rejectsOtherExtensionsAndEmptyFiles() {
        assertThatThrownBy(() -> UploadValidator.validate(file("notes.txt", PDF)))
                .isInstanceOf(ApiException.class).hasMessageContaining("Only PDF");
        assertThatThrownBy(() -> UploadValidator.validate(file("empty.pdf", new byte[0])))
                .isInstanceOf(ApiException.class);
        assertThatThrownBy(() -> UploadValidator.validate(null)).isInstanceOf(ApiException.class);
    }

    @Test
    void stripsFolderPartsFromTheFileName() {
        assertThat(UploadValidator.cleanName("C:\\Users\\me\\thesis.pdf")).isEqualTo("thesis.pdf");
        assertThat(UploadValidator.cleanName("../../etc/passwd.pdf")).isEqualTo("passwd.pdf");
    }
}
