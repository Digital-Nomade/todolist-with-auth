# You Do! — Todo List with Auth

Next.js 14 frontend for a GraphQL todo application with access/refresh authentication, account lifecycle flows, and a component playbook powered by Storybook.

## Stack

- Next.js 14 (App Router), React 18, TypeScript
- Tailwind CSS 3 + NextUI 2
- Redux Toolkit + RTK Query for GraphQL transport
- Vitest + Testing Library for unit/integration tests
- Storybook 8 (`@storybook/react-vite`) for the UI component and typography playbook

## Prerequisites

- Node.js 20+
- npm
- Backend GraphQL API running at `http://localhost:3000/graphql`

## Environment

Copy the example environment file and adjust if needed:

```bash
cp .env.example .env.local
```

| Variable | Scope | Default | Purpose |
|---|---|---|---|
| `GRAPHQL_BACKEND_URL` | Server only | `http://localhost:3000/graphql` | Target for the same-origin `/graphql` proxy |

The frontend development server runs on port **3001** so it does not conflict with the backend on port **3000**.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js on `http://localhost:3001` |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run test` | Vitest unit test suite |
| `npm run test:e2e` | Playwright end-to-end test suite |
| `npm run test:e2e:ui` | Playwright interactive UI mode |
| `npm run test:e2e:headed` | Playwright headed browser mode |
| `npm run codegen` | Regenerate GraphQL types from `src/schema.gql` |
| `npm run storybook` | Start Storybook on `http://localhost:6006` |
| `npm run build-storybook` | Build the static Storybook playbook |

## Storybook Component Playbook

Storybook documents reusable UI building blocks and the project typography without touching auth, GraphQL, or live backend calls.

### What is covered

- **Typography** — Roboto scale, color tokens, and gradient-surface pairings
- **Atomic components** — `Button`, `Input`, `FormGroup`, `LandingLink`
- **Icons** — static and stateful icon gallery
- **Presentational todo UI** — `TodosList`, `SectionReminderOn`, `DetailHeader`

### Story locations

| Category | Path |
|---|---|
| Typography | `src/stories/Typography.stories.tsx` |
| Atomic | `src/components/atomic/**/*.stories.tsx` |
| Icons | `src/components/icons/Icons.stories.tsx` |
| Todo UI | `src/components/feats/**` and `src/components/organism/**` |

### Storybook configuration

- Framework: `@storybook/react-vite` in `.storybook/main.ts`
- Global styles and decorators: `.storybook/preview.tsx`
- `next/link` is mocked in `.storybook/mocks/next-link.tsx` for isolated component rendering

All stories render with:

- `src/app/globals.css` (Roboto + Tailwind)
- `NextUIProvider`
- The application gradient background (`from-secondary` to `primary-dark`)

Use the same Tailwind utility classes documented in the typography story instead of inventing new sizes or colors.

### Adding a new story

1. Create `ComponentName.stories.tsx` beside the component or under `src/stories/`.
2. Keep stories isolated from Redux, RTK Query, and authentication unless you add explicit decorators.
3. Use fixtures from `src/stories/fixtures/` for UUID and ISO-8601 sample data.
4. Run `npm run storybook` locally and `npm run build-storybook` before opening a PR.

## Unit testing

The project uses **Vitest** and **React Testing Library** with a **jsdom** environment. Tests are **colocated** beside the code they exercise (`ComponentName.test.tsx` or `moduleName.test.ts`), following the project rule in `.cursorrules`.

### Tooling

| Tool | Purpose |
|---|---|
| Vitest | Test runner and assertions |
| React Testing Library | Component rendering and user-centric queries |
| `@testing-library/jest-dom` | DOM matchers (`toBeInTheDocument`, etc.) |
| jsdom | Browser-like environment for component tests |
| `@vitejs/plugin-react` | JSX/TSX transform in Vitest |

Configuration lives in:

- `vitest.config.ts` — jsdom environment, `@` path alias, React plugin
- `vitest.setup.ts` — imports `@testing-library/jest-dom/vitest`

Run the full suite:

```bash
npm run test
```

### Test helper

`src/test/renderWithProviders.tsx` wraps components in a Redux `Provider` backed by `makeStore()`. Use it whenever a component reads from or dispatches to the store:

```tsx
import { renderWithProviders } from "@/test/renderWithProviders";

const { store } = renderWithProviders(<MyComponent />);
```

For layouts and headers that need a pre-authenticated user, dispatch `sessionRestored` on the store before rendering.

### What is covered

| Area | Examples |
|---|---|
| Redux slices | `authSlice`, `todoSlice`, `notificationsSlice` |
| Auth utilities | `authErrors`, `session` storage and rotation |
| GraphQL API layer | `authApi` contracts, `api` transport (refresh, redirect, cache invalidation) |
| Auth pages | login, signup, forgot/reset password, verify/check email |
| Private pages | profile, change password, home, dashboard |
| Route layouts | `(auth)/layout` and `(private)/layout` guards |
| Organisms | `LayoutHeader`, `AddTodoModal`, `TodoDetail`, signup forms, `NotificationMenu` |
| Atomic UI & icons | `Button`, `Input`, `FormGroup`, `LandingLink`, key icons |
| Presentational todo UI | `TodosList`, `DetailHeader`, `SectionReminderOn` |
| Infrastructure | `AuthBootstrap`, GraphQL `/graphql` proxy route |

Fixtures for UUID and ISO-8601 sample data live in `src/stories/fixtures/` and are reused in tests where appropriate.

### Mocking conventions

- **`vi.hoisted()`** — define mock functions referenced inside `vi.mock()` factories
- **`next/navigation`** — stub `useRouter` and `usePathname` for redirect and route tests
- **`next/link`** — lightweight `<a href>` wrapper for link assertions
- **RTK Query hooks** — mock `useLoginUserMutation`, `useListTodosQuery`, etc. at the feature API module
- **`@/lib/api`** — use `importOriginal` when partially mocking so the Redux store still receives the real `api` slice
- **Framer Motion / NextUI** — stub animation hooks and heavy date pickers in modal/detail tests to keep assertions fast and stable

GraphQL integration tests stub `global.fetch`, assert request variables and `authorization` headers, and verify session side effects (token rotation, logout cleanup, login redirect).

### Adding a new test

1. Create `*.test.ts` or `*.test.tsx` beside the source file.
2. Prefer Testing Library queries (`getByRole`, `getByLabelText`) over implementation details.
3. Add `afterEach(cleanup)` when a file renders components that may leave DOM nodes behind.
4. Use `waitFor` for async validation messages, mutations, and route redirects.
5. Keep fake timers scoped to the single test that needs them (e.g. signup form simulated delays).
6. Run `npm run test` before opening a PR.

## End-to-end testing

Playwright drives the full application in a real browser. Tests live under `e2e/` and mock same-origin `POST /graphql` traffic so the suite runs without a live backend.

### Tooling

| Tool | Purpose |
|---|---|
| Playwright | Browser automation and assertions |
| Chromium | Default desktop project |
| GraphQL route mocks | Deterministic auth and todo flows |

Configuration lives in `playwright.config.ts`:

- `baseURL` — `http://localhost:3001`
- `webServer` — starts `npm run dev` automatically
- Reports — `playwright-report/` and `test-results/` (gitignored)

Run the suite:

```bash
npm run test:e2e
```

### Fixtures and helpers

| Path | Purpose |
|---|---|
| `e2e/fixtures/test-data.ts` | Users, todos, credentials |
| `e2e/fixtures/graphql-mock.ts` | Intercepts `/graphql` and simulates API state |
| `e2e/helpers/auth.ts` | Login and modal helpers |
| `e2e/helpers/alerts.ts` | Targets app `p[role="alert"]` messages |

`installGraphqlMock(page, options)` keeps an in-memory todo list and profile across requests inside a test. `seedAuthenticatedSession(page)` preloads a refresh token to exercise session restoration.

### Scenarios covered

| Area | Scenarios |
|---|---|
| Landing | Brand content, signup/login navigation |
| Login | Active, invalid, pending verification, suspended |
| Signup | Success, duplicate email error |
| Forgot password | Generic success copy, back to login |
| Check email | Resend verification, missing email guard |
| Verify email | Valid token, invalid token, retry, missing token |
| Reset password | Valid token, invalid token, missing token |
| Route guards | Guest redirects, active-user auth redirects, refresh restore/failure |
| Logout | Header logout |
| Home todos | Detail rendering, navigation, mark done |
| Dashboard | List selection, detail sync |
| Create todo | Modal create and cancel |
| Header | Notifications menu, profile navigation |
| Profile | Update fields, change-password link, sign out all devices |
| Change password | Success logout, invalid current password |

### Adding a new E2E test

1. Add or extend a `*.spec.ts` file under `e2e/`.
2. Call `installGraphqlMock(page)` in `beforeEach` unless the flow is unauthenticated marketing content.
3. Prefer `getByRole` and `getByLabelText`; use `appAlert(page)` for form errors.
4. Add new GraphQL operations to `e2e/fixtures/graphql-mock.ts` when the UI starts calling them.
5. Run `npm run test:e2e` before opening a PR.

### E2E layout

```
e2e/
├── fixtures/
│   ├── graphql-mock.ts
│   └── test-data.ts
├── helpers/
│   ├── alerts.ts
│   └── auth.ts
├── landing/
├── auth/
├── guards/
├── todos/
└── private/
```

### Unit test layout

```
src/
├── test/
│   └── renderWithProviders.tsx   # Redux test wrapper
├── lib/
│   ├── api.test.ts               # GraphQL transport & redirectToLogin
│   ├── auth/
│   │   ├── session.test.ts
│   │   └── AuthBootstrap.test.tsx
│   └── features/
│       ├── auth/authApi.test.ts
│       └── **/*.test.ts          # slice and helper tests
├── app/
│   └── **/page.test.tsx          # route and layout tests
└── components/
    └── **/*.test.tsx             # component tests
```

## Component structure

```
src/components/
├── atomic/       # Buttons, inputs, form wrappers
├── icons/        # Inline SVG icons
├── organism/     # Composed UI blocks
└── feats/        # Feature-specific presentational components
```

## Typography conventions

| Role | Classes | Usage |
|---|---|---|
| Display / brand | `text-6xl font-semibold text-danger-light` | Landing brand |
| Page title | `text-4xl font-bold text-danger-light` | Auth and form pages |
| Section title | `text-4xl font-extralight text-white` | Todo detail headings |
| Button label | `font-light text-2xl` | Primary actions |
| Input label | `font-extralight text-2xl text-danger-light` | Floating labels |
| Body | `text-2xl font-extralight text-white` | Descriptions |
| Supporting | `text-lg font-extralight text-danger-light` | Helper copy |
| Error | `text-danger font-light` | Validation messages |

Color tokens are defined in `tailwind.config.ts`: `primary-dark`, `secondary`, `danger`, `danger-light`, `success`, `alert`, and `info`.

## GraphQL workflow

The authoritative schema snapshot lives at `src/schema.gql`. Browser requests go to same-origin `POST /graphql`, which proxies to `GRAPHQL_BACKEND_URL`.

After schema changes:

```bash
npm run codegen
npm run typecheck
```

## Verification checklist

```bash
npm run codegen
npm run typecheck
npm run lint
npm run test
npm run test:e2e
npm run build-storybook
npm run build
```

## Project layout

```
src/
├── app/              # Routes, layouts, and GraphQL proxy
├── components/       # UI components, stories, and colocated tests
├── gql/              # Generated GraphQL types
├── graphql/          # Operation documents
├── lib/              # Store, auth session, API layer, and tests
├── schema.gql        # Authoritative schema snapshot
├── stories/          # Typography playbook and fixtures
└── test/             # Shared test utilities (renderWithProviders)
```
