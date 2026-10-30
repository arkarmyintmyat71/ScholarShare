package com.scholarshare.scholarshare_backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

// "test" profile = in-memory H2 database (src/test/resources/application-test.yaml), so MySQL isn't needed.
@SpringBootTest
@ActiveProfiles("test")
class ScholarshareBackendApplicationTests {

	@Test
	void contextLoads() {
	}

}
