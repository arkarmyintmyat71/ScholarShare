-- =====================================================================
--  ScholarShare  -  MySQL 8  schema, sample data and useful queries
--  Plain text. Run it with:   mysql -u root -p < scholarshare_queries.sql
--  (or paste it into MySQL Workbench and run all).
--
--  PART 1  schema   : the 6 thesis tables (Table 3.6.x) + "bookmarks"
--  PART 2  sample data : admin, students, categories, research files, topics...
--  PART 3  queries  : the same queries the Spring Boot API runs, to try by hand
--
--  WARNING: PART 1 DROPS and recreates the database "scholarshare_db".
--  If you already started the old backend, its tables used the old role/status
--  values (USER / ACTIVE). Running this file replaces them.
--
--  Logins created by PART 2
--      admin@scholarshare.com   Admin@12345    (ADMIN)
--      may@uni.edu              Student@123    (STUDENT, approved)
--      aung@uni.edu             Student@123    (STUDENT, approved)
--      pann@uni.edu             Student@123    (STUDENT, approved)
--      zaw@uni.edu              Student@123    (STUDENT, PENDING  -> cannot log in yet)
--      hnin@uni.edu             Student@123    (STUDENT, REJECTED -> cannot log in)
-- =====================================================================


-- =====================================================================
-- PART 1  -  SCHEMA
-- =====================================================================
DROP DATABASE IF EXISTS scholarshare_db;
CREATE DATABASE scholarshare_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE scholarshare_db;

-- 3.6.1 users ----------------------------------------------------------
CREATE TABLE users (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL,
    password_hash   VARCHAR(255) NULL,                       -- NULL for Google accounts
    picture_url     VARCHAR(255) NULL,
    role            VARCHAR(20)  NOT NULL,                   -- STUDENT | ADMIN
    provider        VARCHAR(20)  NOT NULL DEFAULT 'LOCAL',   -- LOCAL | GOOGLE
    google_id       VARCHAR(255) NULL,
    account_status  VARCHAR(20)  NOT NULL,                   -- PENDING | APPROVED | REJECTED | DISABLED
    created_at      DATETIME(6)  NOT NULL,
    updated_at      DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email (email),
    UNIQUE KEY uk_users_google_id (google_id),
    KEY idx_users_status (account_status),
    CONSTRAINT chk_users_role   CHECK (role IN ('STUDENT','ADMIN')),
    CONSTRAINT chk_users_status CHECK (account_status IN ('PENDING','APPROVED','REJECTED','DISABLED'))
) ENGINE=InnoDB;

-- 3.6.2 categories -----------------------------------------------------
CREATE TABLE categories (
    id    BIGINT       NOT NULL AUTO_INCREMENT,
    name  VARCHAR(100) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_categories_name (name)
) ENGINE=InnoDB;

-- 3.6.3 research_files  (the file itself is stored in file_data) -------
CREATE TABLE research_files (
    id             BIGINT        NOT NULL AUTO_INCREMENT,
    title          VARCHAR(255)  NOT NULL,
    description    VARCHAR(1000) NOT NULL,
    category_id    BIGINT        NOT NULL,
    academic_year  INT           NOT NULL,
    status         VARCHAR(20)   NOT NULL DEFAULT 'PENDING', -- PENDING | APPROVED | REJECTED
    file_name      VARCHAR(255)  NOT NULL,
    content_type   VARCHAR(100)  NOT NULL,
    file_size      BIGINT        NOT NULL,
    file_data      LONGBLOB      NOT NULL,
    uploaded_by    BIGINT        NOT NULL,
    uploaded_at    DATETIME(6)   NOT NULL,
    reviewed_by    BIGINT        NULL,
    reviewed_at    DATETIME(6)   NULL,
    PRIMARY KEY (id),
    KEY idx_research_search   (status, category_id, academic_year),
    KEY idx_research_uploaded (status, uploaded_at),
    KEY idx_research_owner    (uploaded_by),
    CONSTRAINT fk_research_category    FOREIGN KEY (category_id) REFERENCES categories (id),
    CONSTRAINT fk_research_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users (id),
    CONSTRAINT fk_research_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users (id),
    CONSTRAINT chk_research_status CHECK (status IN ('PENDING','APPROVED','REJECTED'))
) ENGINE=InnoDB;

-- 3.6.4 topics ---------------------------------------------------------
CREATE TABLE topics (
    id          BIGINT        NOT NULL AUTO_INCREMENT,
    title       VARCHAR(255)  NOT NULL,
    body        VARCHAR(2000) NOT NULL,
    created_by  BIGINT        NOT NULL,
    created_at  DATETIME(6)   NOT NULL,
    PRIMARY KEY (id),
    KEY idx_topics_created_at (created_at),
    CONSTRAINT fk_topics_user FOREIGN KEY (created_by) REFERENCES users (id)
) ENGINE=InnoDB;

-- 3.6.5 comments (belong to a topic) -----------------------------------
CREATE TABLE comments (
    id          BIGINT        NOT NULL AUTO_INCREMENT,
    topic_id    BIGINT        NOT NULL,
    body        VARCHAR(1000) NOT NULL,
    created_by  BIGINT        NOT NULL,
    created_at  DATETIME(6)   NOT NULL,
    PRIMARY KEY (id),
    KEY idx_comments_topic (topic_id, created_at),
    CONSTRAINT fk_comments_topic FOREIGN KEY (topic_id)   REFERENCES topics (id),
    CONSTRAINT fk_comments_user  FOREIGN KEY (created_by) REFERENCES users (id)
) ENGINE=InnoDB;

-- 3.6.6 notifications --------------------------------------------------
CREATE TABLE notifications (
    id                   BIGINT       NOT NULL AUTO_INCREMENT,
    recipient_id         BIGINT       NOT NULL,
    type                 VARCHAR(40)  NOT NULL,  -- REGISTRATION_SUBMITTED | REGISTRATION_RESULT | FILE_SUBMITTED | FILE_RESULT | NEW_COMMENT
    message              VARCHAR(255) NOT NULL,
    related_entity_type  VARCHAR(30)  NULL,      -- USER | RESEARCH_FILE | TOPIC
    related_entity_id    BIGINT       NULL,
    is_read              TINYINT(1)   NOT NULL DEFAULT 0,
    created_at           DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    KEY idx_notifications_recipient (recipient_id, is_read, created_at),
    CONSTRAINT fk_notifications_user FOREIGN KEY (recipient_id) REFERENCES users (id)
) ENGINE=InnoDB;

-- extra table: "Save" button on research cards (not in the thesis tables)
CREATE TABLE bookmarks (
    id                BIGINT      NOT NULL AUTO_INCREMENT,
    user_id           BIGINT      NOT NULL,
    research_file_id  BIGINT      NOT NULL,
    created_at        DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_bookmarks_user_research (user_id, research_file_id),
    CONSTRAINT fk_bookmarks_user     FOREIGN KEY (user_id)          REFERENCES users (id),
    CONSTRAINT fk_bookmarks_research FOREIGN KEY (research_file_id) REFERENCES research_files (id)
) ENGINE=InnoDB;


-- =====================================================================
-- PART 2  -  SAMPLE DATA
-- =====================================================================

-- users: id 1 = admin, 2-4 approved students, 5 pending, 6 rejected
INSERT INTO users (id, name, email, password_hash, role, provider, account_status, created_at, updated_at) VALUES
 (1, 'Administrator', 'admin@scholarshare.com', '$2a$12$NuPNTY.lDxUGfkFs.4AsFu6/lxe5Fo0h8YoXHwCGd5hAwaZf1HrGu', 'ADMIN',   'LOCAL', 'APPROVED', NOW(6), NOW(6)),
 (2, 'May Thiri',     'may@uni.edu',  '$2a$12$EGdJFhCJQHtU9lLeKTWovOT..bVCdhwCoP6dTZI9uJA.nVlAttqoq', 'STUDENT', 'LOCAL', 'APPROVED', NOW(6), NOW(6)),
 (3, 'Aung Min',      'aung@uni.edu', '$2a$12$EGdJFhCJQHtU9lLeKTWovOT..bVCdhwCoP6dTZI9uJA.nVlAttqoq', 'STUDENT', 'LOCAL', 'APPROVED', NOW(6), NOW(6)),
 (4, 'Pann Ei',       'pann@uni.edu', '$2a$12$EGdJFhCJQHtU9lLeKTWovOT..bVCdhwCoP6dTZI9uJA.nVlAttqoq', 'STUDENT', 'LOCAL', 'APPROVED', NOW(6), NOW(6)),
 (5, 'Zaw Lin',       'zaw@uni.edu',  '$2a$12$EGdJFhCJQHtU9lLeKTWovOT..bVCdhwCoP6dTZI9uJA.nVlAttqoq', 'STUDENT', 'LOCAL', 'PENDING',  NOW(6), NOW(6)),
 (6, 'Hnin Su',       'hnin@uni.edu', '$2a$12$EGdJFhCJQHtU9lLeKTWovOT..bVCdhwCoP6dTZI9uJA.nVlAttqoq', 'STUDENT', 'LOCAL', 'REJECTED', NOW(6), NOW(6));

INSERT INTO categories (id, name) VALUES
 (1, 'Computer Science'),
 (2, 'Information Technology'),
 (3, 'Artificial Intelligence'),
 (4, 'Cybersecurity'),
 (5, 'Data Science'),
 (6, 'Business & Management');

-- research files: each holds a tiny valid PDF written as hex (UNHEX) so Download works.
INSERT INTO research_files
 (id, title, description, category_id, academic_year, status, file_name, content_type, file_size, file_data, uploaded_by, uploaded_at, reviewed_by, reviewed_at) VALUES
 (1, 'Full-Stack Web Application Development',
     'Explore frontend interfaces, backend services, REST APIs and databases in modern web applications.',
     1, 2025, 'APPROVED', 'full-stack-web-development.pdf', 'application/pdf', 640, UNHEX('255044462D312E340A312030206F626A0A3C3C202F54797065202F436174616C6F67202F5061676573203220302052203E3E0A656E646F626A0A322030206F626A0A3C3C202F54797065202F5061676573202F4B696473205B33203020525D202F436F756E742031203E3E0A656E646F626A0A332030206F626A0A3C3C202F54797065202F50616765202F506172656E74203220302052202F4D65646961426F78205B30203020363132203739325D202F436F6E74656E7473203420302052202F5265736F7572636573203C3C202F466F6E74203C3C202F4631203520302052203E3E203E3E203E3E0A656E646F626A0A342030206F626A0A3C3C202F4C656E677468203936203E3E0A73747265616D0A4254202F463120323020546620373220373230205464202846756C6C2D537461636B20576562204170706C69636174696F6E20446576656C6F706D656E74202D2073616D706C65205363686F6C617253686172652066696C652920546A2045540A656E6473747265616D0A656E646F626A0A352030206F626A0A3C3C202F54797065202F466F6E74202F53756274797065202F5479706531202F42617365466F6E74202F48656C766574696361203E3E0A656E646F626A0A787265660A3020360A303030303030303030302036353533352066200A30303030303030303039203030303030206E200A30303030303030303538203030303030206E200A30303030303030313135203030303030206E200A30303030303030323431203030303030206E200A30303030303030333837203030303030206E200A747261696C65720A3C3C202F53697A652036202F526F6F74203120302052203E3E0A7374617274787265660A3435370A2525454F460A'),
     2, NOW(6) - INTERVAL 10 DAY, 1, NOW(6) - INTERVAL 9 DAY),
 (2, 'Artificial Intelligence in Higher Education',
     'Discover how AI tools and machine learning can support university learning and research.',
     3, 2025, 'APPROVED', 'ai-in-higher-education.pdf', 'application/pdf', 646, UNHEX('255044462D312E340A312030206F626A0A3C3C202F54797065202F436174616C6F67202F5061676573203220302052203E3E0A656E646F626A0A322030206F626A0A3C3C202F54797065202F5061676573202F4B696473205B33203020525D202F436F756E742031203E3E0A656E646F626A0A332030206F626A0A3C3C202F54797065202F50616765202F506172656E74203220302052202F4D65646961426F78205B30203020363132203739325D202F436F6E74656E7473203420302052202F5265736F7572636573203C3C202F466F6E74203C3C202F4631203520302052203E3E203E3E203E3E0A656E646F626A0A342030206F626A0A3C3C202F4C656E67746820313031203E3E0A73747265616D0A4254202F46312032302054662037322037323020546420284172746966696369616C20496E74656C6C6967656E636520696E2048696768657220456475636174696F6E202D2073616D706C65205363686F6C617253686172652066696C652920546A2045540A656E6473747265616D0A656E646F626A0A352030206F626A0A3C3C202F54797065202F466F6E74202F53756274797065202F5479706531202F42617365466F6E74202F48656C766574696361203E3E0A656E646F626A0A787265660A3020360A303030303030303030302036353533352066200A30303030303030303039203030303030206E200A30303030303030303538203030303030206E200A30303030303030313135203030303030206E200A30303030303030323431203030303030206E200A30303030303030333933203030303030206E200A747261696C65720A3C3C202F53697A652036202F526F6F74203120302052203E3E0A7374617274787265660A3436330A2525454F460A'),
     3, NOW(6) - INTERVAL 8 DAY, 1, NOW(6) - INTERVAL 7 DAY),
 (3, 'Security and Access Control for Web Systems',
     'Learn about authentication, privacy and role-based permissions in web applications.',
     4, 2024, 'APPROVED', 'web-security-access-control.pdf', 'application/pdf', 646, UNHEX('255044462D312E340A312030206F626A0A3C3C202F54797065202F436174616C6F67202F5061676573203220302052203E3E0A656E646F626A0A322030206F626A0A3C3C202F54797065202F5061676573202F4B696473205B33203020525D202F436F756E742031203E3E0A656E646F626A0A332030206F626A0A3C3C202F54797065202F50616765202F506172656E74203220302052202F4D65646961426F78205B30203020363132203739325D202F436F6E74656E7473203420302052202F5265736F7572636573203C3C202F466F6E74203C3C202F4631203520302052203E3E203E3E203E3E0A656E646F626A0A342030206F626A0A3C3C202F4C656E67746820313031203E3E0A73747265616D0A4254202F4631203230205466203732203732302054642028536563757269747920616E642041636365737320436F6E74726F6C20666F72205765622053797374656D73202D2073616D706C65205363686F6C617253686172652066696C652920546A2045540A656E6473747265616D0A656E646F626A0A352030206F626A0A3C3C202F54797065202F466F6E74202F53756274797065202F5479706531202F42617365466F6E74202F48656C766574696361203E3E0A656E646F626A0A787265660A3020360A303030303030303030302036353533352066200A30303030303030303039203030303030206E200A30303030303030303538203030303030206E200A30303030303030313135203030303030206E200A30303030303030323431203030303030206E200A30303030303030333933203030303030206E200A747261696C65720A3C3C202F53697A652036202F526F6F74203120302052203E3E0A7374617274787265660A3436330A2525454F460A'),
     4, NOW(6) - INTERVAL 6 DAY, 1, NOW(6) - INTERVAL 5 DAY),
 (4, 'Data Analytics for Student Learning',
     'Explore how data visualizations and analytics support academic decisions.',
     5, 2024, 'APPROVED', 'data-analytics-student-learning.pdf', 'application/pdf', 637, UNHEX('255044462D312E340A312030206F626A0A3C3C202F54797065202F436174616C6F67202F5061676573203220302052203E3E0A656E646F626A0A322030206F626A0A3C3C202F54797065202F5061676573202F4B696473205B33203020525D202F436F756E742031203E3E0A656E646F626A0A332030206F626A0A3C3C202F54797065202F50616765202F506172656E74203220302052202F4D65646961426F78205B30203020363132203739325D202F436F6E74656E7473203420302052202F5265736F7572636573203C3C202F466F6E74203C3C202F4631203520302052203E3E203E3E203E3E0A656E646F626A0A342030206F626A0A3C3C202F4C656E677468203933203E3E0A73747265616D0A4254202F46312032302054662037322037323020546420284461746120416E616C797469637320666F722053747564656E74204C6561726E696E67202D2073616D706C65205363686F6C617253686172652066696C652920546A2045540A656E6473747265616D0A656E646F626A0A352030206F626A0A3C3C202F54797065202F466F6E74202F53756274797065202F5479706531202F42617365466F6E74202F48656C766574696361203E3E0A656E646F626A0A787265660A3020360A303030303030303030302036353533352066200A30303030303030303039203030303030206E200A30303030303030303538203030303030206E200A30303030303030313135203030303030206E200A30303030303030323431203030303030206E200A30303030303030333834203030303030206E200A747261696C65720A3C3C202F53697A652036202F526F6F74203120302052203E3E0A7374617274787265660A3435340A2525454F460A'),
     2, NOW(6) - INTERVAL 4 DAY, 1, NOW(6) - INTERVAL 3 DAY),
 (5, 'Cloud Services for University IT Departments',
     'A short study of how universities can adopt cloud services safely. Waiting for review.',
     2, 2026, 'PENDING', 'cloud-services-university-it.pdf', 'application/pdf', 622, UNHEX('255044462D312E340A312030206F626A0A3C3C202F54797065202F436174616C6F67202F5061676573203220302052203E3E0A656E646F626A0A322030206F626A0A3C3C202F54797065202F5061676573202F4B696473205B33203020525D202F436F756E742031203E3E0A656E646F626A0A332030206F626A0A3C3C202F54797065202F50616765202F506172656E74203220302052202F4D65646961426F78205B30203020363132203739325D202F436F6E74656E7473203420302052202F5265736F7572636573203C3C202F466F6E74203C3C202F4631203520302052203E3E203E3E203E3E0A656E646F626A0A342030206F626A0A3C3C202F4C656E677468203738203E3E0A73747265616D0A4254202F463120323020546620373220373230205464202850656E64696E672073616D706C65207061706572202D2073616D706C65205363686F6C617253686172652066696C652920546A2045540A656E6473747265616D0A656E646F626A0A352030206F626A0A3C3C202F54797065202F466F6E74202F53756274797065202F5479706531202F42617365466F6E74202F48656C766574696361203E3E0A656E646F626A0A787265660A3020360A303030303030303030302036353533352066200A30303030303030303039203030303030206E200A30303030303030303538203030303030206E200A30303030303030313135203030303030206E200A30303030303030323431203030303030206E200A30303030303030333639203030303030206E200A747261696C65720A3C3C202F53697A652036202F526F6F74203120302052203E3E0A7374617274787265660A3433390A2525454F460A'),
     3, NOW(6) - INTERVAL 1 DAY, NULL, NULL);

INSERT INTO topics (id, title, body, created_by, created_at) VALUES
 (1, 'How can AI support university learning?',
     'Share ideas and discuss how AI can support students and academic research.', 2, NOW(6) - INTERVAL 5 DAY),
 (2, 'Which method fits a web application study?',
     'Discuss quantitative, qualitative and mixed-method approaches for student projects.', 3, NOW(6) - INTERVAL 3 DAY),
 (3, 'Tips for writing a clear literature review',
     'What tools and habits helped you organise your sources?', 4, NOW(6) - INTERVAL 1 DAY);

INSERT INTO comments (id, topic_id, body, created_by, created_at) VALUES
 (1, 1, 'AI tutors could give quick feedback on drafts, but students still need to check the facts.', 3, NOW(6) - INTERVAL 4 DAY),
 (2, 1, 'I use it to summarise long papers before reading them in full.', 4, NOW(6) - INTERVAL 4 DAY),
 (3, 2, 'A mixed-method study works well: a survey for numbers and a few interviews for the reasons.', 2, NOW(6) - INTERVAL 2 DAY),
 (4, 3, 'A simple spreadsheet with one row per source helped me a lot.', 2, NOW(6) - INTERVAL 20 HOUR);

INSERT INTO notifications (recipient_id, type, message, related_entity_type, related_entity_id, is_read, created_at) VALUES
 (1, 'REGISTRATION_SUBMITTED', 'Zaw Lin has registered and is waiting for approval.', 'USER', 5, 0, NOW(6) - INTERVAL 2 DAY),
 (1, 'FILE_SUBMITTED', 'Aung Min uploaded "Cloud Services for University IT Departments" for review.', 'RESEARCH_FILE', 5, 0, NOW(6) - INTERVAL 1 DAY),
 (2, 'FILE_RESULT', 'Your file "Full-Stack Web Application Development" was approved.', 'RESEARCH_FILE', 1, 1, NOW(6) - INTERVAL 9 DAY),
 (2, 'FILE_RESULT', 'Your file "Data Analytics for Student Learning" was approved.', 'RESEARCH_FILE', 4, 0, NOW(6) - INTERVAL 3 DAY),
 (2, 'NEW_COMMENT', 'Aung Min commented on your topic "How can AI support university learning?".', 'TOPIC', 1, 0, NOW(6) - INTERVAL 4 DAY),
 (3, 'FILE_RESULT', 'Your file "Artificial Intelligence in Higher Education" was approved.', 'RESEARCH_FILE', 2, 1, NOW(6) - INTERVAL 7 DAY),
 (3, 'NEW_COMMENT', 'May Thiri commented on your topic "Which method fits a web application study?".', 'TOPIC', 2, 0, NOW(6) - INTERVAL 2 DAY);

INSERT INTO bookmarks (user_id, research_file_id, created_at) VALUES
 (2, 2, NOW(6) - INTERVAL 2 DAY),
 (2, 3, NOW(6) - INTERVAL 1 DAY);


-- =====================================================================
-- PART 3  -  USEFUL QUERIES  (what the API runs; ? = a value you type)
-- =====================================================================

-- ---- Auth -----------------------------------------------------------
-- POST /api/auth/login : find the account by e-mail (password is checked in Java with BCrypt)
SELECT id, name, email, role, account_status FROM users WHERE email = 'may@uni.edu';

-- POST /api/auth/register : a new student always starts as PENDING
-- INSERT INTO users (name, email, password_hash, role, provider, account_status, created_at, updated_at)
-- VALUES ('New Student', 'new@uni.edu', '<bcrypt hash>', 'STUDENT', 'LOCAL', 'PENDING', NOW(6), NOW(6));

-- ---- Admin: accounts ------------------------------------------------
-- GET /api/admin/users/pending
SELECT id, name, email, created_at FROM users WHERE account_status = 'PENDING' ORDER BY created_at;

-- PUT /api/admin/users/{id}/approve   (reject / disable work the same way)
-- UPDATE users SET account_status = 'APPROVED', updated_at = NOW(6) WHERE id = 5;
-- UPDATE users SET account_status = 'REJECTED', updated_at = NOW(6) WHERE id = 5;
-- UPDATE users SET account_status = 'DISABLED', updated_at = NOW(6) WHERE id = 5;

-- GET /api/admin/users?status=APPROVED&q=may
SELECT id, name, email, role, account_status, created_at
FROM users
WHERE (account_status = 'APPROVED' OR 'APPROVED' IS NULL)
  AND (LOWER(name) LIKE '%may%' OR LOWER(email) LIKE '%may%')
ORDER BY created_at DESC;

-- ---- Research: public search (never loads file_data) ---------------
-- GET /api/research?q=security&categoryId=4&year=2024&page=0&size=9
SELECT r.id, r.title, r.description, c.name AS category, r.academic_year,
       r.file_name, r.file_size, u.name AS uploaded_by, r.uploaded_at
FROM research_files r
JOIN categories c ON c.id = r.category_id
JOIN users u      ON u.id = r.uploaded_by
WHERE r.status = 'APPROVED'
  AND (4    IS NULL OR r.category_id = 4)
  AND (2024 IS NULL OR r.academic_year = 2024)
  AND (LOWER(r.title) LIKE '%security%' OR LOWER(r.description) LIKE '%security%' OR LOWER(c.name) LIKE '%security%')
ORDER BY r.uploaded_at DESC
LIMIT 9 OFFSET 0;                       -- page 0, size 9  (OFFSET = page * size)

-- total for the pager (totalElements / totalPages)
SELECT COUNT(*) AS total
FROM research_files r JOIN categories c ON c.id = r.category_id
WHERE r.status = 'APPROVED' AND (LOWER(r.title) LIKE '%security%' OR LOWER(r.description) LIKE '%security%');

-- GET /api/research/mine : my uploads with their status
SELECT r.id, r.title, c.name AS category, r.academic_year, r.status, r.uploaded_at, r.reviewed_at
FROM research_files r JOIN categories c ON c.id = r.category_id
WHERE r.uploaded_by = 2
ORDER BY r.uploaded_at DESC;

-- GET /api/research/{id}/download : the only query that reads the file bytes
SELECT file_name, content_type, file_data FROM research_files WHERE id = 1;

-- ---- Admin: research review ----------------------------------------
-- GET /api/admin/research/pending
SELECT r.id, r.title, c.name AS category, u.name AS uploaded_by, r.file_name, r.file_size, r.uploaded_at
FROM research_files r
JOIN categories c ON c.id = r.category_id
JOIN users u      ON u.id = r.uploaded_by
WHERE r.status = 'PENDING'
ORDER BY r.uploaded_at;

-- PUT /api/admin/research/{id}/approve | reject
-- UPDATE research_files SET status = 'APPROVED', reviewed_by = 1, reviewed_at = NOW(6) WHERE id = 5;
-- UPDATE research_files SET status = 'REJECTED', reviewed_by = 1, reviewed_at = NOW(6) WHERE id = 5;

-- ---- Categories -----------------------------------------------------
-- GET /api/categories (with the number of approved files in each)
SELECT c.id, c.name,
       (SELECT COUNT(*) FROM research_files r WHERE r.category_id = c.id AND r.status = 'APPROVED') AS research_count
FROM categories c
ORDER BY c.name;

-- DELETE /api/admin/categories/{id} is refused while files use it:
SELECT COUNT(*) AS files_using_category FROM research_files WHERE category_id = 6;

-- ---- Topics and comments -------------------------------------------
-- GET /api/topics : newest first with the number of comments
SELECT t.id, t.title, t.body, u.name AS created_by, t.created_at,
       (SELECT COUNT(*) FROM comments c WHERE c.topic_id = t.id) AS comment_count
FROM topics t JOIN users u ON u.id = t.created_by
ORDER BY t.created_at DESC;

-- GET /api/topics/{id} : the comments of one topic, oldest first
SELECT c.id, c.body, u.name AS created_by, c.created_at
FROM comments c JOIN users u ON u.id = c.created_by
WHERE c.topic_id = 1
ORDER BY c.created_at;

-- DELETE /api/admin/topics/{id} : comments first, then the topic
-- DELETE FROM comments WHERE topic_id = 3;
-- DELETE FROM topics   WHERE id = 3;

-- ---- Notifications ---------------------------------------------------
-- GET /api/notifications (latest 50 for the signed-in user)
SELECT id, type, message, related_entity_type, related_entity_id, is_read, created_at
FROM notifications WHERE recipient_id = 2 ORDER BY created_at DESC LIMIT 50;

-- GET /api/notifications/unread-count  (the red number on the bell)
SELECT COUNT(*) AS unread FROM notifications WHERE recipient_id = 2 AND is_read = 0;

-- PUT /api/notifications/{id}/read   and   /read-all
-- UPDATE notifications SET is_read = 1 WHERE id = 4 AND recipient_id = 2;
-- UPDATE notifications SET is_read = 1 WHERE recipient_id = 2 AND is_read = 0;

-- ---- Bookmarks ("Save") -------------------------------------------------
SELECT research_file_id FROM bookmarks WHERE user_id = 2;                       -- GET /api/bookmarks/ids
-- INSERT IGNORE INTO bookmarks (user_id, research_file_id, created_at) VALUES (2, 4, NOW(6));   -- PUT    /api/bookmarks/4
-- DELETE FROM bookmarks WHERE user_id = 2 AND research_file_id = 4;                              -- DELETE /api/bookmarks/4

-- ---- Dashboard numbers ----------------------------------------------------
-- GET /api/admin/stats
SELECT
  (SELECT COUNT(*) FROM users WHERE account_status = 'PENDING')                       AS pending_accounts,
  (SELECT COUNT(*) FROM users WHERE role = 'STUDENT' AND account_status = 'APPROVED') AS active_students,
  (SELECT COUNT(*) FROM research_files WHERE status = 'PENDING')                      AS pending_research,
  (SELECT COUNT(*) FROM research_files WHERE status = 'APPROVED')                     AS approved_research,
  (SELECT COUNT(*) FROM topics)                                                       AS topics;

-- Uploads per category (a simple report for the thesis)
SELECT c.name, COUNT(r.id) AS approved_files
FROM categories c LEFT JOIN research_files r ON r.category_id = c.id AND r.status = 'APPROVED'
GROUP BY c.id, c.name ORDER BY approved_files DESC;

-- ---- If you keep your OLD database instead of re-running PART 1 ----------
-- UPDATE users SET role = 'STUDENT'  WHERE role = 'USER';
-- UPDATE users SET account_status = 'APPROVED' WHERE account_status = 'ACTIVE';
-- UPDATE users SET account_status = 'DISABLED' WHERE account_status = 'SUSPENDED';
