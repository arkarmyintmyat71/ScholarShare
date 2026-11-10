# ScholarShare — Backend

Spring Boot REST API for ScholarShare, written to the thesis design (Chapter 3): **users, categories,
research_files, topics, comments, notifications** (+ small `bookmarks`, `research_ratings`, `research_comments`, `research_comment_likes`, `user_avatars`, `category_images` and `research_images` tables for Save / Rate / Comment and photos).
It serves the React app in `scholarshare-frontend`.

- Java 21, Spring Boot 4.1, Spring Security (stateless JWT), Spring Data JPA, MySQL, MapStruct, Lombok
- Every URL starts with **`/api`** (`server.servlet.context-path`)
- Research files are stored **inside MySQL** (`research_files.file_data`, `LONGBLOB`), as in the thesis

> **Important:** this code was written without being able to download Maven dependencies in the authoring
> environment, so it was checked for syntax but **not compiled or run there**. Run `./mvnw test` first; if the
> compiler reports anything, it will be a small typo-level fix.

---

> **Testing with Postman:** import `postman/ScholarShare.postman_collection.json` and `ScholarShare_Local.postman_environment.json` (see `postman/POSTMAN_GUIDE.md`). 73 requests with tests, covering every endpoint.

## 1. How to run it

You need **JDK 21** and **MySQL 8** on `localhost:3306`.

**Step 1 — create the database (recommended).** Run the SQL file that came with this project:

```bash
mysql -u root -p < scholarshare_queries.sql
```

It creates `scholarshare_db`, the 9 tables, and sample data (accounts, categories, 5 research files, topics,
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
| `zaw@uni.edu`                | `Student@123`   | STUDENT, active |
| `hnin@uni.edu`               | `Student@123`   | STUDENT, **disabled** (cannot sign in) |

Change these passwords for anything real. **Running elsewhere (server, Docker):** no profile file; set environment
variables `DB_PASSWORD`, `JWT_SECRET` (32+ random characters), optional `DB_URL`, `DB_USERNAME`, `DDL_AUTO`,
`SPRING_PROFILES_ACTIVE`, and for the first admin `app.seed-admin.enabled=true`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.

**Tests:** `./mvnw test` — in-memory H2 database, no MySQL needed.

---

## 2. What it does (thesis flows)

- **Registration:** `POST /auth/register` creates an active student and returns a token (`{ accessToken, user }`). There is no
  approval step. An admin can later **disable** an account; a disabled account gets **403** with `data.accountStatus` on login.
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
| POST | `/auth/register` | public | `{ name, email, password }` → `{ accessToken, user }`, HTTP 201 (no approval) |
| POST | `/auth/login` | public | `{ email, password }` → `{ accessToken, user }`; 401 wrong password; 403 disabled |
| GET | `/auth/me`, `/users/me` | signed in | current user |
| GET | `/research` | public | `?q&categoryId&year&page&size` → page of approved research |
| GET | `/research/{id}` | public* | *non-approved only for the uploader/admins |
| GET | `/research/{id}/download` | **signed in** | the file (`Content-Disposition: attachment`); visitors only read the description |
| GET | `/research/mine` | student | my uploads, any status *(added; not in the thesis table)* |
| POST | `/research` | student | multipart: `title, description, academicYear, file` and `categoryId` **or** `newCategoryName` (+ optional `categoryImage`) for "Other"; optional `image` = the research picture (png/jpg/gif/webp, 2 MB) |
| GET | `/categories` | public | `[{ id, name, researchCount, imageUrl }]` |
| GET | `/categories/{id}/image`, `/users/{id}/avatar`, `/research/{id}/image` | public | the stored photo (404 when a research has no picture) |
| GET, POST | `/topics` | signed in / student | list `?q&page&size`; create `{ title, body }` |
| GET | `/topics/{id}` | signed in | `{ topic, comments }` |
| POST | `/topics/{id}/comments` | student | `{ body }` |
| GET | `/notifications`, `/notifications/unread-count` | signed in | latest 50 / `{ count }` |
| PUT | `/notifications/{id}/read`, `/notifications/read-all` | signed in | |
| GET, PUT, DELETE | `/bookmarks`, `/bookmarks/ids`, `/bookmarks/{researchId}` | student | saved research |
| GET | `/ratings` | student | `[{ researchId, rating }]` (stars 1-5) |
| PUT, DELETE | `/ratings/{researchId}` | student | add/change `{ rating }` (1-5) / remove (every research item carries `ratingAverage`, `ratingCount`, `commentCount`) |
| POST | `/auth/google` | public | `{ idToken }` (Google ID token) → `{ accessToken, user }`; a new Google user is created as an active student and signed in |
| PUT, DELETE | `/research-comments/{id}/like` | student | like a comment; returns the comment with `likeCount`, `likedByMe` |
| PUT | `/research/{id}` | owner (student) | multipart edit; the file is optional; status returns to PENDING and admins are notified |
| DELETE | `/research/{id}` | owner or admin | removes the file with its ratings, comments and bookmarks |
| PUT | `/users/me`, `/users/me/password` | signed in | profile `{ name, headline, bio, university, location }`; password. **The e-mail cannot be changed.** |
| POST, DELETE | `/users/me/avatar` | signed in | profile photo (multipart `file`, PNG/JPG/GIF/WebP, 2 MB) |
| POST, DELETE | `/admin/categories/{id}/image` | admin | category photo |
| GET, POST | `/research/{id}/comments` | signed in (visitors get 401) / student | comments under a research card; the uploader is notified |
| GET | `/admin/stats` | admin | dashboard numbers |
| GET | `/admin/users?status&q&page&size` | admin | status: `APPROVED` or `DISABLED` |
| PUT | `/admin/users/{id}/disable \| enable` | admin | |
| GET | `/admin/research/pending` | admin | |
| PUT | `/admin/research/{id}/approve \| reject` | admin | reject takes optional `{ reason }` |
| POST, PUT, DELETE | `/admin/categories`, `/admin/categories/{id}` | admin | delete refused (409) while files use it |
| DELETE | `/admin/topics/{id}`, `/admin/comments/{id}`, `/admin/research-comments/{id}` | admin | |

| Status | When |
|--------|------|
| 400 | validation failed, bad file type/size/signature, body malformed |
| 401 | wrong e-mail/password, or missing/expired token (the frontend signs the user out) |
| 403 | account disabled, or role not allowed |
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
  entities/         Tables: User, Category, ResearchFile, Topic, Comment, Notification, Bookmark, ResearchLike, ResearchComment   entities/enums/
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
- Extra tables `bookmarks`, `research_ratings` (a `stars` column, 1-5), `research_comments`, `research_comment_likes`, `user_avatars`, `category_images`, `research_images` (photos are kept in MySQL like the research files) (Save / Rate / Comment, profile and category photos, added at your request) and extra endpoint `GET /research/mine` (the "my uploads" list).
- `users` has extra optional columns `headline`, `bio`, `university`, `location` (added for the profile page, on top of Table 3.6.1).
- The research table has **no keywords column**, so the search text matches title, description and category name.
- **Google sign-in** (`POST /auth/google`) needs your own Google client id: set `GOOGLE_CLIENT_ID` (or `app.google.client-id`). The server asks Google to verify the ID token, checks it was issued for your client id and that the e-mail is verified. New Google users are active at once, like normal sign-ups.

## 6. Not built yet

refresh tokens, e-mail verification, database migrations (Flyway; use `ddl-auto: validate` + Flyway in production).
