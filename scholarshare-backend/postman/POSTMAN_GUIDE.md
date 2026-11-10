# Testing the ScholarShare API with Postman

## Set up (2 minutes)
1. Start MySQL and the backend (`./mvnw spring-boot:run`). The API is at `http://localhost:8080/api`.
   For the sample data, run `scholarshare_queries.sql` first (research id 1 is approved and used by the requests).
2. Postman → **Import** → select both files:
   - `ScholarShare.postman_collection.json`
   - `ScholarShare_Local.postman_environment.json`
3. Top-right, choose the environment **ScholarShare Local**.
4. If the admin password in your `application-local.yaml` is not `Admin@12345`, change it in request **1 Auth → Login admin**.

## Run order
- Open folder **1 Auth** and run it top to bottom (or right-click the folder → *Run*). It registers a new student
  (usable at once, no approval), signs in as the admin and saves `adminToken` and `studentToken` in the environment.
- After that you can run any other folder, or the whole collection (*Run collection*).
- Requests that upload a file (research, category photo, profile photo) need you to pick a file under
  **Body → form-data → file**. Postman cannot do that for you; skip them in a bulk run or choose files first.
- **10 Admin → Disable an account** blocks the test student, so run it near the end (**Enable an account** switches it back on).

## What the tests check
Each request has a test tab: the expected HTTP status (200/201 for success, 400 validation, 401 not signed in,
403 wrong role or disabled account, 409 duplicate e-mail), and for some requests the data (a new account is APPROVED at once, rating
average present, role is ADMIN). Failed tests show in red in the response panel.

## Google sign-in
`POST /auth/google` needs a real Google ID token, which only the browser button can produce. The collection only checks
that a fake token is refused (401, or 503 when `GOOGLE_CLIENT_ID` is not configured). Test the real flow in the app.

## Variables
`baseUrl`, `researchId` (default 1), `categoryId` are in the environment. The others (`adminToken`, `studentToken`, `studentId`,
`myResearchId`, `commentId`, `topicId`, ...) are filled in by the tests.

## Research picture
`Upload research (student)` has an optional `image` field (png, jpg, gif or webp, max 2 MB) - the picture of the research.
`Edit my research` can send a new `image`, or `removeImage=true` to delete it. `Get research picture (public)` opens it
(404 when the research has no picture).
