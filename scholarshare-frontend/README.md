# ScholarShare — Frontend

React + Vite frontend for ScholarShare, structured to plug into a Java
(Spring Boot or similar) REST backend.

## Getting started

```bash
npm install
cp .env.example .env   # then edit VITE_API_BASE_URL if needed
npm run dev
```

## Project structure

```
src/
  pages/            One folder per route (home, auth, categories, topics,
                     search, notFound). Each owns its JSX and its own CSS.
  components/       Reusable, presentational pieces:
                       layout/navbar, layout/footer, layout/appLayout
                       researchCard, topicCard, formField
  routes/           AppRoutes.jsx — the single source of truth for URL → page.
  context/          AuthContext — app-wide auth state (current user, token).
  hooks/            useAuth — convenience hook over AuthContext.
  services/         authService.js, researchService.js — one function per
                     backend endpoint. api/httpClient.js is the single axios
                     instance every service call goes through.
  data/             Static placeholder content (homeContent.js), kept
                     separate from JSX so it's easy to swap for real API data.
  styles/           theme.css — CSS variables, reset, and utility classes
                     shared by every page (kicker, section, light-btn, etc.)
```

Each page/component keeps its own CSS file scoped to what it renders;
`styles/theme.css` only holds things genuinely shared across more than
one place (colors, spacing scale, reset, a few utility classes).

## Connecting the Java backend

1. **Set the API base URL.** In `.env`:
   ```
   VITE_API_BASE_URL=/api
   ```
   Leaving it as `/api` routes requests through the Vite dev proxy
   configured in `vite.config.js`, which forwards them to
   `http://localhost:8080` (change the `target` there to match your
   backend's port). This means you don't need CORS configured on the
   Java side just to develop locally.

   For a deployed build, point `VITE_API_BASE_URL` at the real backend
   URL (e.g. `https://api.scholarshare.com/api`) and make sure your
   Spring app's CORS configuration allows the frontend's origin.

2. **Expected endpoints.** These are documented as comments in
   `src/services/authService.js` and `src/services/researchService.js`,
   and are the contract the frontend currently expects:

   | Method | Path                        | Body / Query        | Returns                |
   |--------|-----------------------------|----------------------|------------------------|
   | POST   | `/api/auth/login`           | `{ email, password }`| `{ token, user }`      |
   | POST   | `/api/auth/register`        | `{ name, email, password }` | `{ token, user }` |
   | GET    | `/api/auth/me`               | (Bearer token header)| `user`                 |
   | GET    | `/api/research/search`      | `?q=<term>`           | `[research item]`      |
   | GET    | `/api/categories`           | —                     | `[category]`           |
   | GET    | `/api/topics`               | —                     | `[topic]`              |

   Adjust the field names/shapes in the services to match whatever your
   Spring controllers actually return — these are a starting contract,
   not a hard requirement.

3. **Auth token handling.** `authService` stores the JWT from
   login/register in `localStorage`, and `httpClient` attaches it as
   `Authorization: Bearer <token>` on every request automatically. If
   your backend uses a different auth scheme (session cookies, a
   different header), that's the one file to change
   (`src/services/api/httpClient.js`).

4. **Where to see it working today.** The search page
   (`src/pages/search/SearchResultsPage.jsx`) already calls
   `researchService.searchResearch()` for real. Until the backend
   implements that endpoint it'll show a friendly "couldn't reach the
   server" message instead of crashing — once the Java side responds,
   results should appear with no frontend changes needed.

## Responsive design

Styles are written mobile-first: base rules target small screens, and
`min-width` media queries progressively add complexity. Breakpoints
used throughout: `560px` (large phone), `780px` (tablet), `860px`
(navbar switches to inline), `1020px` (desktop). Typography and
spacing use `clamp()` in `styles/theme.css` so they scale smoothly
rather than jumping between fixed sizes.

## Scripts

- `npm run dev` — start the dev server (with API proxy)
- `npm run build` — production build to `dist/`
- `npm run lint` — ESLint
- `npm run preview` — preview the production build locally
