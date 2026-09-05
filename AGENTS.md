# AGENTS.md — TPE Digital Admin

Next.js 15 (App Router) + React 19 admin console for TPE Digital. PT-BR UI. Talks to two external APIs (legacy + new) — no local DB.

## Commands

- Package manager: **pnpm** (`pnpm-lock.yaml` is the source of truth).
- `pnpm dev` — dev server with **Turbopack** (`next dev --turbopack`).
- `pnpm build` / `pnpm start` — production build / serve.
- `pnpm lint` — `next lint`. There is **no** test runner, no `test` script, no Vitest/Jest config, no CI workflow. Do not invent one without asking.
- No typecheck script. Run `pnpm tsc --noEmit` if you need it manually.

## Critical gotchas (read before editing)

- **`next.config.mjs` ignores ESLint AND TypeScript errors during build.** Lint and type errors will NOT fail `pnpm build`. You must run `pnpm lint` and `tsc --noEmit` separately to catch them. Don't trust a green build as proof of correctness.
- **API defaults point to homologation, not production.** `lib/api-config.ts` defaults to `https://api.tpedigital.com.br/hmg` (legacy) and `https://server-hmg.tpedigital.com.br` (new). Override with `NEXT_PUBLIC_LEGACY_API_URL` / `NEXT_PUBLIC_NEW_API_URL`. There are no `.env*` files committed — `.gitignore` excludes them.
- **Auth token is stored in 3 places on purpose** (cookie via `nookies`, raw `document.cookie`, `localStorage`). All three are read in `lib/auth-utils.ts:getAuthToken()` and written in `setAuthToken()` / cleared in `removeAuthToken()`. Any change to auth flow must keep all three in sync or auth will silently break (cookie set, localStorage cleared, etc.).
- **`ParticipantProfile` is duplicated.** Canonical (includes `ASSISTANT_CAPTAIN`) lives in `types/auth.ts`; a stale copy at the repo root `types.tsx` is missing it. **Always import from `@/types/auth`**, never from the root `types.tsx`.
- **No `middleware.ts`, no Next route groups.** Auth gating is done **inside each protected page** by wrapping content in `<ProtectedLayout>` (named export from `app/layout-protected.tsx`). It is a client component that reads the JWT from cookies/localStorage and redirects. The root `app/layout.tsx` is the public layout — do not add auth there.
- **Role-based route access** lives in `lib/role-utils.ts` (`routeAccess` map + `hasRouteAccess`). Adding a new protected route? Register it in **both** `routeAccess` (for `ProtectedLayout` to enforce) AND `getAuthorizedMenuItems` (for the sidebar to show it). `COORDINATOR` bypasses everything; `PARTICIPANT` is blocked from the whole app.
- **Two API endpoints** (`legacy` | `new`) are wired in `lib/api-client.ts` via a shared `ApiClient`. **Always pass `{ endpoint: "new" }` explicitly** when creating new features, endpoints or API calls — the code's literal default at `lib/api-client.ts:81,86` is `legacy`, so omitting the option silently hits legacy (never rely on that fallthrough in new code). Use `{ endpoint: "legacy" }` **only** as a deliberate fallback when the route has no equivalent in `new`, and leave a `// TODO: migrate to new` comment. Example: `apiClient.get("/foo", { endpoint: "new" })` — not `apiClient.get("/foo")`. The `petitionApi` helper uses `new`.
- **`apiClient` interceptor redirects to `/login?error=expired` on any 401** with a 5s delay (see `lib/api-client.ts:setupInterceptors`). Don't trigger 401s in dev intentionally.

## Layout map

- `app/` — Next App Router pages. Notable entry: `app/page.tsx` is a redirector (auth → `/dashboard`, else → `/login`).
  - `app/login/`, `app/forgot-password/` — public.
  - `app/dashboard/`, `app/consultar/historico/`, `app/lista-designacao/`, `app/designacao/[designationId]/`, `app/peticoes/`, `app/grupos/`, `app/pontos/` — protected (each wraps content in `<ProtectedLayout>`).
  - `app/actions/auth-actions.ts` — `"use server"` server actions for login/logout (sets `auth_token` httpOnly cookie).
- `components/` — feature components, named in **PT-BR** (grupos, petições, designação, etc.).
  - `components/ui/` — shadcn/ui primitives (`button`, `dialog`, `select`, `form`, etc.). Generated; edit carefully.
  - `components/public/` — reusable pieces used on public pages (welcome-header, link-not-found).
- `hooks/` — React hooks (`use-designation`, `use-petition-form`, `use-toast`, `use-participants-attendance`, `use-media-query`).
- `lib/` — services and utilities (`api-client`, `api-config`, `auth-utils`, `role-utils`, `points-service`, `date-utils`, `utils`).
  - `lib/schemas/petition-form-schema.ts` — Zod schema for the petition form.
  - `lib/stores/use-group-store.ts` — Zustand store for group selection.
- `types/auth.ts` — `ParticipantProfile` enum + `IToken` JWT shape. **Import from here.**
- `style-guide.md` — full design tokens, typography, spacing, mobile rules. Authoritative for colors / spacing — do not hardcode hex values.
- `tailwind.config.js` — registers `tpe-*` color tokens (`tpe-primary`, `tpe-secondary`, `tpe-hover`, `tpe-error`, etc.). **Use these classes, not raw hex.** Standard shadcn HSL tokens are also kept for backward compat.
- `components.json` — shadcn config: aliases map `@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`, `@/hooks`. Path alias `@/*` → repo root (`tsconfig.json`).

## Conventions

- Language: **PT-BR** in code comments, UI strings, and most filenames/routes. Keep new strings and folder names PT-BR.
- Mobile-first: per `style-guide.md`, padding shrinks on `<640px`. Components like `mobile-only-wrapper.tsx` and the sidebar in `layout-protected.tsx` handle responsive switching at the `md` (768px) breakpoint.
- Theme: **light only** for now (`next-themes` is installed but unused; `darkMode: ["class"]` in Tailwind is inert). Don't add dark-mode styles.
- Toasts: `react-hot-toast` via the global `<Toaster>` in `app/layout.tsx`. For shadcn-style toasts in `components/ui/use-toast.ts`, both exist — prefer `react-hot-toast` for new feature work.
- Forms: `react-hook-form` + `zod` resolver (`@hookform/resolvers`). Schemas live next to their feature in `lib/schemas/`.
- State: Zustand (`use-group-store`) for cross-page state; otherwise local React state + TanStack-style custom hooks.
- HTTP: never call `axios` directly outside `lib/api-client.ts`; go through `apiClient` so the 401 interceptor and auth header injection apply.

## When adding a new protected page

1. Create `app/<route>/page.tsx`.
2. Wrap the page content in `<ProtectedLayout title="..." breadcrumbs={...}>...</ProtectedLayout>`.
3. Add the path to `routeAccess` in `lib/role-utils.ts` AND to `getAuthorizedMenuItems` so it appears in the sidebar with the right `allowedProfiles`.
4. Add a `loading.tsx` if the page does real data fetching on mount (Next will stream it).