# ScholarShare — Backend

Spring Boot REST API for ScholarShare, written to the thesis design (Chapter 3): **users, categories,
research_files, topics, comments, notifications** (+ a small `bookmarks` table for the "Save" button).
It serves the React app in `scholarshare-frontend`.

- Java 21, Spring Boot 4.1, Spring Security (stateless JWT), Spring Data JPA, MySQL, MapStruct, Lombok
- Every URL starts with **`/api`** (`server.servlet.context-path`)
- Research files are stored **inside MySQL** (`research_files.file_data`, `LONGBLOB`), as in the thesis

> **Important:** this code was written without being able to download Maven dependencies in the authoring
> environment, so it was checked for syntax but **not compiled or run there**. Run `./mvnw test` first; if the
> compiler reports anything, it will be a small typo-level fix.

---

## 1. How to run it

You need **JDK 21** and **MySQL 8** on `localhost:3306`.

**Step 1 — create the database (recommended).** Run the SQL file that came with this project:

```bash
mysql -u root -p < scholarshare_queries.sql
```

It creates `scholarshare_db`, the 7 tables, and sample data (accounts, categories, 5 research files, topics,
comments, notifications). It **drops and recreates** `scholarshare_db`. If you ran the old backend before, its tables
used the old values `USER` / `ACTIVE`; the file explains how to migrate instead of dropping.
(You may also skip the file: with `ddl-auto: update` Hibernate creates the tables itself, and the app adds the admin
account and default categories on first start. You then just start with empty data.)

**Step 2 — start the API**

```bash
./mvnw spring-boot:run          # Windows: mvnw.cmd spring-boot:run   (or press Run in IntelliJ)
```

It uses the **`local` profile** (`src/main/resources/application-local.yaml`, git-ignored) for your DB password, JWT
secret and the first admin. Copy `application-local.example.yaml` as a template.

| Account (from the SQL file)  | Password        | Role / status                     |
|------------------------------|-----------------|-----------------------------------|
| `admin@scholarshare.com`     | `Admin@12345`   | ADMIN                             |
| `may@uni.edu`, `aung@uni.edu`, `pann@uni.edu` | `Student@123` | STUDENT, approved |
| `zaw@uni.edu`                | `Student@123`   | STUDENT, **pending** (cannot sign in) |
| `hnin@uni.edu`               | `Student@123`   | STUDENT, **rejected** (cannot sign in) |

Change these passwords for anything real. **Running elsewhere (server, Docker):** no profile file; set environment
variables `DB_PASSWORD`, `JWT_SECRET` (32+ random characters), optional `DB_URL`, `DB_USERNAME`, `DDL_AUTO`,
`SPRING_PROFILES_ACTIVE`, and for the first admin `app.seed-admin.enabled=true`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.

**Tests:** `./mvnw test` — in-memory H2 database, no MySQL needed.

---

## 2. What it does (thesis flows)

- **Registration:** `POST /auth/register` creates a `PENDING` student (no token). Every admin gets a notification.
  The student cannot sign in until an admin approves (login answers **403** with `data.accountStatus`).
- **Upload:** a student uploads a file (pdf/doc/docx/ppt/pptx, max 10 MB — extension and file signature are checked)
  → `PENDING`, hidden from everyone but the uploader and admins → admins are notified → approve/reject → the student is notified.
- **Public search:** only `APPROVED` research, filter by text, category and year, paged. Lists never load the file bytes.
- **Topics:** signed-in users read; students create topics and comments; the topic's author is notified of new comments;
  admins can delete topics/comments.
- **Notifications:** one row per recipient, created in the same transaction as the action that causes them.

## 3. API

Every response uses one envelope: `{ "success": true, "message": "…", "data": … }` or `{ "success": false, "message": "…" }`.
Send the token as `Authorization: Bearer <accessToken>`.

| Method | URL | Who | Notes |
|--------|-----|-----|-------|
| POST | `/auth/register` | public | `{ name, email, password }` → user (PENDING), HTTP 201 |
| POST | `/auth/login` | public | `{ email, password }` → `{ accessToken, user }`; 401 wrong password; 403 not approved |
| GET | `/auth/me`, `/users/me` | signed in | current user |
| PUT | `/users/me` | signed in | `{ name, pictureUrl }` |
| GET | `/research` | public | `?q&categoryId&year&page&size` → page of approved research |
| GET | `/research/{id}` | public* | *non-approved only for the uploader/admins |
| GET | `/research/{id}/download` | public* | the file (`Content-Disposition: attachment`) |
| GET | `/research/mine` | student | my uploads, any status *(added; not in the thesis table)* |
| POST | `/research` | student | multipart: `title, description, categoryId, academicYear, file` |
| GET | `/categories` | public | `[{ id, name, researchCount }]` |
| GET, POST | `/topics` | signed in / student | list `?q&page&size`; create `{ title, body }` |
| GET | `/topics/{id}` | signed in | `{ topic, comments }` |
| POST | `/topics/{id}/comments` | student | `{ body }` |
| GET | `/notifications`, `/notifications/unread-count` | signed in | latest 50 / `{ count }` |
| PUT | `/notifications/{id}/read`, `/notifications/read-all` | signed in | |
| GET, PUT, DELETE | `/bookmarks`, `/bookmarks/ids`, `/bookmarks/{researchId}` | student | saved research |
| GET | `/admin/stats` | admin | dashboard numbers |
| GET | `/admin/users/pending`, `/admin/users?status&q&page&size` | admin | |
| PUT | `/admin/users/{id}/approve \| reject \| disable` | admin | reject takes optional `{ reason }` |
| GET | `/admin/research/pending` | admin | |
| PUT | `/admin/research/{id}/approve \| reject` | admin | reject takes optional `{ reason }` |
| POST, PUT, DELETE | `/admin/categories`, `/admin/categories/{id}` | admin | delete refused (409) while files use it |
| DELETE | `/admin/topics/{id}`, `/admin/comments/{id}` | admin | |

| Status | When |
|--------|------|
| 400 | validation failed, bad file type/size/signature, body malformed |
| 401 | wrong e-mail/password, or missing/expired token (the frontend signs the user out) |
| 403 | account not approved, or role not allowed |
| 404 | not found (also used for hidden, non-approved research) |
| 409 | duplicate e-mail/category, category in use, already reviewed |
| 413 | file larger than 10 MB |

## 4. Code structure

```
com.scholarshare.scholarshare_backend
  controllers/      HTTP only: read the request, call a service, wrap the result in ApiResponse
  services/         Business rules (interfaces)   services/implementation/   their implementations
                    NotificationPublisher = "send a notification" (used by the other services)
  repositories/     Database access (Spring Data JPA). Research/topic/category lists use "select new" projections
  entities/         Tables: User, Category, ResearchFile, Topic, Comment, Notification, Bookmark   entities/enums/
  dto/requests/     What clients send (validated with @Valid)
  dto/responses/    What clients receive (ApiResponse, PageResponse, ResearchResponse, ...)
  mappers/          Entity -> DTO (MapStruct)
  securities/       JWT provider/filter, CurrentUser (who is calling), 401/403 JSON handlers
  configs/          SecurityConfig (who may call what), CORS, AdminSeeder, CategorySeeder
  utils/            UploadValidator (file rules), Paging
  exceptions/       ApiException + subclasses, GlobalExceptionHandler (one place that builds error JSON)
```

**Rules:** controllers never touch repositories; services never build HTTP responses; entities are never returned
(always a DTO); every error becomes the standard envelope; notifications are written in the same transaction as the event.

## 5. Where this differs from the thesis text (on purpose)

- Role value is `STUDENT` (thesis wording) instead of the old `USER`.
- `account_status` also has `DISABLED` (needed by the "disable account" endpoint).
- Extra table `bookmarks` (Save button) and extra endpoint `GET /research/mine` (the "my uploads" list).
- `users` has no `university`/`bio` columns (they were removed to match Table 3.6.1).
- The research table has **no keywords column**, so the search text matches title, description and category name.
- **Google sign-in (`POST /auth/google`) is not built** — it needs Google client credentials. `provider` and
  `google_id` columns exist for it.

## 6. Not built yet

Google sign-in, refresh tokens, password reset, e-mail verification, database migrations (Flyway; use `ddl-auto: validate` + Flyway in production).
