# ScholarShare — Frontend

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
| `/research/:id`         | Research details and **Download**                  | everyone (approved files) |
| `/categories`           | All categories with their number of files          | everyone                |
| `/login`, `/register`   | Sign in / create an account (needs admin approval) | everyone                |
| `/topics`, `/topics/:id`| Discussion topics and comments                     | signed in (students post) |
| `/profile`              | Edit name and picture link                         | signed in               |
| `/student`              | **Student dashboard**: explore, save, upload, my uploads | `STUDENT`         |
| `/admin/dashboard`      | **Admin dashboard** (tabs below)                   | `ADMIN`                 |

Admin tabs (`/admin/dashboard?tab=…`): **Overview** (numbers), **Accounts** (approve / reject / disable),
**Research review** (download, approve / reject with a reason), **Categories** (add / rename / delete),
**Topics** (delete topics; open a topic to delete comments).

**Registration flow (thesis 3.4):** a new account is `PENDING`. The register page says it is waiting for approval,
and signing in shows "waiting for administrator approval" until an admin approves it.
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
    bookmarkService  userService  adminService
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
The bell in the dashboard header reads `GET /api/notifications` (refreshed every minute). Clicking one marks it read and
opens the right page (`utils/notificationTarget.js`): new registration/file → admin tab, file result → My uploads,
new comment → the topic.

### Images
The database stores no pictures. `utils/categoryImage.js` maps a category name to one of the bundled photos
(default photo for categories an admin adds later).

---

## 5. API used by the frontend

All paths start with `/api`; every JSON answer is `{ success, message, data }`.

| Area          | Calls |
|---------------|-------|
| Auth          | `POST /auth/login`, `POST /auth/register`, `GET /auth/me`, `PUT /users/me` |
| Research      | `GET /research?q&categoryId&year&page&size`, `GET /research/{id}`, `GET /research/{id}/download`, `GET /research/mine`, `POST /research` (multipart) |
| Categories    | `GET /categories` |
| Topics        | `GET /topics?q&page&size`, `GET /topics/{id}`, `POST /topics`, `POST /topics/{id}/comments` |
| Saved         | `GET /bookmarks`, `PUT /bookmarks/{id}`, `DELETE /bookmarks/{id}` |
| Notifications | `GET /notifications`, `PUT /notifications/{id}/read`, `PUT /notifications/read-all` |
| Admin         | `GET /admin/stats`, `GET /admin/users/pending`, `GET /admin/users`, `PUT /admin/users/{id}/approve \| reject \| disable`, `GET /admin/research/pending`, `PUT /admin/research/{id}/approve \| reject`, categories CRUD, `DELETE /admin/topics/{id}`, `DELETE /admin/comments/{id}` |

## 6. Notes

- Upload rules (checked again by the backend): pdf, doc, docx, ppt, pptx, up to **10 MB**.
- The "Like / reaction" buttons and per-card comments of the first dashboard design were removed: discussion
  happens in **Topics**, as in the thesis. **Save** is kept (a small `bookmarks` table).
- Responsive and mobile-first; breakpoints: 460, 560, 760, 860, 1100 px.
