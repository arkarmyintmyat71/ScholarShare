# Frontend architecture (read this first)

ScholarShare has **two roles** — `STUDENT` and `ADMIN` — plus **guests** (nobody signed in). A guest is not a role; it is
simply `user = null`.

## 1. Who can open which page

| Zone | Wrapper in `routes/AppRoutes.jsx` | Header / footer | Pages |
|---|---|---|---|
| Public | *(none)* | `AppLayout` (public navbar) | home, categories, search, research detail, privacy, terms |
| Guests only | `GuestOnlyRoute` | `AppLayout` | login, register (a signed-in user is sent to their dashboard) |
| Student | `ProtectedRoute roles=[STUDENT]` | `StudentLayout` | `/student`, edit research |
| Admin | `ProtectedRoute roles=[ADMIN]` | `AdminLayout` | `/admin/dashboard` |
| Any signed-in user | `ProtectedRoute` | `AccountLayout` (student or admin header) | `/profile`, `/topics` |

To add a page: create `pages/<name>/<Name>Page.jsx`, then add **one** `<Route>` inside the right zone.

## 2. Who can do what (buttons)
All rules live in **`src/auth/permissions.js`**:

```jsx
import { can } from "../../auth/permissions";
{can.rate(user) && <RatingButton ... />}
```
Never write `user.role === "ADMIN"` in a component. Add or change a rule in `permissions.js` only.
The backend enforces the same rules; the frontend only shows or hides things.

## 3. Folder map
```
src/
  auth/            permissions.js  (who can do what)
  routes/          AppRoutes (all URLs), ProtectedRoute, GuestOnlyRoute, AccountLayout, ScrollManager
  context/         AuthContext  (user, login, loginWithGoogle, register, logout)
  pages/           one folder per URL. A page only composes components and hooks.
  features/        code that belongs to ONE business area
    student/  admin/  profile/  research/  auth/   (components, hooks, css next to each other)
  components/      shared UI used by several areas (navbar, footer, form field, pagination, dialogs)
  hooks/           generic hooks (useAuth, useAsync, useDismiss, ...)
  services/        the only place that talks to the backend (one file per API area, axios in api/httpClient.js)
  utils/           small pure helpers (roles, format, media)
  config/          constants (ROUTES, ROLES, storage keys)
  styles/          theme.css (colours, spacing)
```

## 4. Rules that keep it easy to read
1. **Page composes → component renders → hook holds state → service calls the API.** Pages and components never call axios.
2. **Feature folders are self-contained.** Something used by one area lives in `features/<area>/`; used by several → `components/`, `hooks/` or `utils/`.
3. **One component, one CSS file** next to it, with a class prefix per area (`sd-` student, `fp-` profile, `pg-` pages, `cm-` comments).
4. **One place for each fact**: URLs in `ROUTES`, roles in `ROLES`, permissions in `can`.
5. **Same component for every role.** A research card is one component; it receives what the user is allowed to do instead of having a "guest card" and a "student card".
6. **Loading and errors**: use `useAsync` and `<StatusBlock>`; do not write your own spinner per page.

## 5. Where to look when …
| You want to… | Open |
|---|---|
| change who sees a button | `auth/permissions.js` |
| add a URL | `routes/AppRoutes.jsx` |
| change a backend call | `services/<area>Service.js` |
| change the login flow | `context/AuthContext.jsx`, `services/authService.js`, `pages/auth/` |
| change the star rating | `features/research/RatingButton.jsx`, `useEngagement.js` |
| change the profile | `pages/profile/ProfilePage.jsx`, `features/profile/` |
