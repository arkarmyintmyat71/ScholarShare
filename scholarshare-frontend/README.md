# ScholarShare — Frontend

> New here? Read **[ARCHITECTURE.md](ARCHITECTURE.md)** first: who can open which page, who can do what, and where each kind of code lives.

React 19 + Vite app for ScholarShare (research resource and topic sharing platform).
**Every list on screen comes from the Spring Boot API and the MySQL database** — there is no static or
`localStorage` data any more (only the sign-in token is kept in the browser).

---

## 1. How to run it

You need **Node.js 20.19+ (or 22+)**, npm, and the backend running on `http://localhost:8080`
(see `scholarshare-backend/README.md`; load `scholarshare_queries.sql` into MySQL for sample data).

```bash
npm install
cp .env.example .env     # Windows: copy .env.example .env
npm run dev              # http://localhost:5173
```

Other commands: `npm run build` (production build into `dist/`), `npm run preview`, `npm run lint`.

| Variable            | Meaning                                                                                  |
|---------------------|------------------------------------------------------------------------------------------|
| `VITE_API_BASE_URL` | `/api` (default) goes through the Vite dev proxy to `http://localhost:8080`, so no CORS in development. For production use the full URL, e.g. `https://api.scholarshare.com/api`, and add your site to `app.cors.allowed-origins` in the backend. |

Sample accounts (from `scholarshare_queries.sql`): `admin@scholarshare.com / Admin@12345` (admin),
`may@uni.edu / Student@123` (student).

---

## 2. Pages and who can open them

| URL                     | Page                                              | Who                     |
|-------------------------|---------------------------------------------------|-------------------------|
| `/`                     | Home: newest approved research, categories, topics | everyone (topics: signed in) |
| `/search`               | Search + filters (category, year) + pages          | everyone                |
| `/research/:id`         | Research details. Visitors only read the description; **Download, ratings and comments need sign-in** | everyone (approved files) |
| `/research/:id/edit`    | Edit your own research (goes back to *Pending*)    | `STUDENT` (owner)       |
| `/categories`           | All categories with their number of files          | everyone                |
| `/login`, `/register`   | Sign in / create an account (no approval needed) | everyone                |
| `/topics`, `/topics/:id`| Discussion topics and comments                     | signed in (students post) |
| `/profile`              | One-page profile: framed photo, Intro (Edit details), My research, Account settings, Sign out | signed in |
| `/student`              | **Student dashboard**: explore, save, upload, my uploads | `STUDENT`         |
| `/admin/dashboard`      | **Admin dashboard** (tabs below)                   | `ADMIN`                 |

Admin tabs (`/admin/dashboard?tab=…`): **Overview** (numbers), **Accounts** (search, disable / enable),
**Research review** (download, approve / reject with a reason), **Categories** (add / rename / change photo / delete),
**Topics** (delete topics; open a topic to delete comments).

**Registration flow:** there is no admin approval. A new account is active at once and the student is signed in
after the register page (or the Google button) succeeds. An admin can still **disable** an account later.
**Upload flow:** a student uploads → status `PENDING` (hidden) → an admin approves/rejects → the student gets a
notification (bell in the header) and sees the status under **My uploads**.

---

## 3. Project structure

```
src/
  main.jsx, App.jsx          Entry point: Router + AuthProvider + routes
  config/constants.js        Storage key, roles, route paths, upload rules, page sizes
  routes/                    AppRoutes (ALL urls), ProtectedRoute (login/role guard), ScrollManager
  context/                   AuthContext — who is signed in (user, login, register, logout)
  hooks/                     useAuth, useAsync (load data), useDebouncedValue, useNotifications, useDismiss
  services/                  Everything that talks to the backend (one file per API area)
    api/httpClient.js          the ONE axios instance: base URL, JWT header, unwraps {success,message,data}, errors
    authService  researchService  categoryService  topicService  notificationService
    bookmarkService  likeService  userService  adminService
  utils/                     Small pure helpers (roles, format, categoryImage, notificationTarget)
  styles/                    theme.css (tokens), dashboard-base.css (student/admin shell), pages.css (pg- blocks)
  components/                Reusable UI: layout (public navbar/footer), dashboard (shared header/footer),
                             account (bell, profile menu, avatar), pagination, confirmDialog, StatusBlock, cards
  pages/                     One folder per URL; a page loads data with hooks and composes components
    home  search  research  categories  topics  profile  auth  student  admin  notFound  comingSoon
  features/
    student/                 components + hooks for the student dashboard (explore, uploads, saved, upload form)
    admin/                   components for each admin tab (Overview, Accounts, ResearchReview, Categories, Topics)
```

**The rules that keep it tidy**

1. **A page composes, a component renders, a hook holds state, a service calls the API.**
   Pages and components never call axios directly.
2. **Shared** things live in the top-level folders. Things used by **one area only** live in `features/<area>/`.
3. **One place for each fact**: URLs in `ROUTES`, the token key in `STORAGE_KEYS`, roles in `ROLES`, page sizes in `PAGE_SIZE`.
4. **The backend envelope is unwrapped once**, in `httpClient.js`. Services return plain data; errors are
   `{ status, message, details }` (e.g. `details.accountStatus` on a refused login).
5. **Loading data**: `useAsync(() => service(), [deps])` gives `{ data, error, isLoading, reload }`; show it with `<StatusBlock>`.
6. **Adding a page**: create `pages/<name>/<Name>Page.jsx`, add one `<Route>` in `routes/AppRoutes.jsx`
   (wrap in `<ProtectedRoute roles={[ROLES.ADMIN]} />` if restricted).

---

## 4. How the code works

### Login and roles
1. `LoginPage` → `useAuth().login()` → `POST /api/auth/login`. The `accessToken` is saved in `localStorage` and
   `httpClient` sends `Authorization: Bearer <token>` on every request.
2. After a page refresh, `AuthContext` restores the user with `GET /api/auth/me`.
3. A `401` on a normal request removes the token and signs the user out. A `403` on login carries
   `data.accountStatus` (`PENDING`, `REJECTED`, `DISABLED`).
4. `ProtectedRoute` only hides pages — **Spring Security enforces the real permissions**.

### Notifications
The bell in the sidebar layout reads `GET /api/notifications` (refreshed every minute). Clicking one marks it read and
opens the right page (`utils/notificationTarget.js`): new registration/file → admin tab, file result → My uploads,
new comment → the topic.

### Navigation
The **profile picture** in the top bar is a link straight to `/profile` (there is no drop-down; **Sign out** is on the
profile page and asks for confirmation). The **ScholarShare logo** takes a signed-in user to their dashboard
(`/student` or `/admin/dashboard`); there is no separate "Dashboard" button.

### Profile page (`pages/profile/ProfilePage.jsx`, `features/profile/`)
One page, no tabs: the **framed profile photo** (click it, or its "Edit" pill, to change the picture), name, role and headline;
an **Intro** card (bio, university, location, joined, e-mail) with one **Edit details** button; and **My research** (status,
View / Edit / Delete; students only, admins see a link to the admin dashboard). **Edit details** changes name, headline, bio,
university and location. **Account settings** shows the e-mail (**view only, it cannot be changed**), changes the password
(eye buttons) and the photo. **Profile photo**: after choosing a picture the student drags it inside a round
finder, zooms, turns it and presses *Use this photo* (`PhotoCropper.jsx` saves a 512 px square JPEG, so it is always under
the 2 MB limit). The **frame** can be customised: style (Solid / Gradient / Dashed / No frame), 6 colours and thickness
(Thin / Medium / Bold). The frame choice (`avatarFrame.js`) is kept in this browser (`localStorage`, per user), not on the
server. There is no cover photo, no post composer and no "research interests". Saved research
lives in the student dashboard (**My library**).

### Sign-in pages (`pages/auth/`, `pages/legal/`)
- **Login / Register**: e-mail + password, **Continue with Google**. Registration has a required checkbox *I agree to the Terms & Conditions and Privacy Policy* (both open in a new tab).
- **Eye icons**: every `type="password"` field uses `components/formField/FormField.jsx`, which adds the show/hide eye by itself (login, register, and the profile page's own `PasswordField`).
- **Terms & Conditions** (`/terms`) and **Privacy Policy** (`/privacy`) are real pages built with `pages/legal/LegalPage.jsx`; edit the `SECTIONS` arrays in `TermsPage.jsx` / `PrivacyPage.jsx` to change the wording.

### Rate, comment, save (`features/research/`)
`RatingButton` is the star **Rate** button: click it (or hover / focus) and five stars open; click a star to rate 1-5, click your own star again (or "Remove") to take it back. It also shows the average and the number of ratings, e.g. `4.3 (12)`.
`CommentsModal` is the comments window (sort by Most relevant / Newest, comment Like, Reply, compose bar). Students
react, comment and save; administrators can only read comments and delete them. Visitors who are not signed in see
only the description (`pages/research/ResearchDetailPage.jsx` shows a sign-in box instead of the buttons).

### Submit / edit research and categories
`features/student/components/ResearchForm.jsx` is used for both. The Category list ends with **Other (type your own
category)**: the student types the name and can upload a photo for it (PNG/JPG/GIF/WebP, 2 MB). The backend reuses an
existing category with the same name. A category photo shows on every card of that category; admins can change or remove
it in **Categories**.

The form also has an optional, labelled **Research picture** field (PNG/JPG/GIF/WebP, 2 MB). The picture shows on the card and on the research page; without it the category picture is used. When editing, a checkbox removes the current picture. `utils/categoryImage.js` (`researchImage`) chooses which picture to show.

### Images
`utils/categoryImage.js`: a category's own photo (`imageUrl` from the API) wins; otherwise one of the bundled photos
by name, otherwise a default. Profile photos are served by `GET /users/{id}/avatar`. `utils/media.js` puts the API address
in front of these relative links.

---

## 5. API used by the frontend

All paths start with `/api`; every JSON answer is `{ success, message, data }`.

| Area          | Calls |
|---------------|-------|
| Auth          | `POST /auth/login`, `/auth/register`, `/auth/google`, `GET /auth/me` |
| My account    | `PUT /users/me` (name, headline, bio, university, location), `PUT /users/me/password`, `POST/DELETE /users/me/avatar` (multipart `file`) |
| Research      | `GET /research?q&categoryId&year&page&size`, `GET /research/{id}`, `GET /research/{id}/download`, `GET /research/mine`, `POST /research` and `PUT /research/{id}` (multipart; `categoryId` **or** `newCategoryName` + `categoryImage`), `DELETE /research/{id}` |
| Categories    | `GET /categories` (with `imageUrl`), admin `POST/DELETE /admin/categories/{id}/image` |
| Topics        | `GET /topics?q&page&size`, `GET /topics/{id}`, `POST /topics`, `POST /topics/{id}/comments` |
| Saved / Rated | `GET /bookmarks`, `PUT/DELETE /bookmarks/{id}`, `GET /ratings` (`[{researchId, rating}]`), `PUT /ratings/{id}` `{rating: 1-5}`, `DELETE /ratings/{id}` |
| Research comments | `GET/POST /research/{id}/comments`, `PUT/DELETE /research-comments/{id}/like`, admin `DELETE /admin/research-comments/{id}` |
| Notifications | `GET /notifications`, `PUT /notifications/{id}/read`, `PUT /notifications/read-all` |
| Admin         | `GET /admin/stats`, `GET /admin/users/pending`, `GET /admin/users`, `PUT /admin/users/{id}/approve \| reject \| disable`, `GET /admin/research/pending`, `PUT /admin/research/{id}/approve \| reject`, categories CRUD, `DELETE /admin/topics/{id}`, `DELETE /admin/comments/{id}` |

## 6. Notes

- Upload rules (checked again by the backend): pdf, doc, docx, ppt, pptx, up to **10 MB**.
- Every research card in the student dashboard has **⭐ Rate · 💬 Comment · 🔖 Save**. Ratings and comments are
  stored in the backend (`research_ratings`, `research_comments`, `research_comment_likes`); the numbers come with each research item
  (`ratingAverage`, `ratingCount`, `commentCount`). Comments open in a window on the card and also appear on the research detail page.
  Topic discussion stays separate under **Topics**.
- Responsive and mobile-first; breakpoints: 460, 560, 760, 860, 1100 px.

## 7. Google sign-in

The login page (and the register page: **Sign up with Google**) always shows **Continue with Google**. With `VITE_GOOGLE_CLIENT_ID` set in `.env` it is Google's real button; without it the button stays visible and, when pressed, says the client id is missing.
1. Google Cloud Console → *APIs & Services → Credentials → Create credentials → OAuth client ID → Web application*.
2. *Authorised JavaScript origins*: `http://localhost:5173` (and your real site later). No redirect URI is needed.
3. Put the client id in the frontend `.env` (`VITE_GOOGLE_CLIENT_ID=…apps.googleusercontent.com`) and give the **same** id to the
   backend (`GOOGLE_CLIENT_ID`, or `app.google.client-id` in `application-local.yaml`). Restart both.

Google gives the browser an ID token; the backend checks it (`POST /api/auth/google`). A known e-mail signs in like a normal login.
A **new** Google user is created as a student and signed in at once (no approval step).
