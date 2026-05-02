# CLAUDE.md

## Project Overview

**PredictorAtlas** — a game theory prediction platform built with Next.js (App Router), Supabase (Auth + PostgreSQL), and deployed on Vercel. Users can browse predictions on global events (elections, economics, geopolitics, sports) and submit forecasts. Game theory models (Nash equilibrium, payoff matrices) power the analysis via Claude API with web search.

## Dev Environment Setup

### Prerequisites
- Node.js >= 20.19 (use `nvm use 20`)
- A Supabase project (free tier at supabase.com)

### First-time setup
```bash
npm install                  # Install dependencies
```
Create a Supabase project and run the schema SQL (see `schema.sql` or the migration in git history). Set environment variables in `.env`.

### Required environment variables (`.env`)
```
NEXT_PUBLIC_SUPABASE_URL=<Supabase project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase anon key>
SUPABASE_SERVICE_ROLE_KEY=<Supabase service role key>
DATABASE_URL=<Supabase connection pooler URL, transaction mode>
ANTHROPIC_API_KEY=<for AI analysis feature>
```

### Daily development
```bash
npm run dev                  # Start Next.js dev server
```

### Seeding data
Sign in as admin at `/admin` and use the seed button (17 predictions) or file upload.

### Adding yourself as admin
In Supabase SQL Editor:
```sql
UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb WHERE email = 'your@email.com';
```

## Commands

```bash
npm run dev                  # Start local dev server
npm run build                # Build for production
npm start                    # Start production server
npm run lint                 # Run ESLint
npm test                     # Run Jest tests
```

## Architecture

### Authentication (Supabase Auth)
- **Frontend**: `@supabase/auth-ui-react` in `AuthModal.tsx`, `useAuth()` hook for auth state
- **Backend**: Cookie-based auth via `@supabase/ssr`. `lib/auth.ts` reads Supabase session from cookies.
- **Admin role**: `app_metadata.role = "admin"` on the Supabase user (set via SQL or admin API)
- **Middleware**: `middleware.ts` refreshes auth tokens on every request

### Data Layer (PostgreSQL via Supabase)
- **Database**: Supabase-hosted PostgreSQL (connection pooler in transaction mode)
- **Queries**: Raw SQL via `pg` driver in `lib/db.ts`
- **API routes**: Next.js API routes under `app/api/`
- **Client helper**: `lib/api-client.ts` — `apiFetch()` (auth via cookies, no manual token management)

### Data Models
- **Prediction** — an event to forecast (title, category, status, visibility, resolution date, owner)
- **Outcome** — possible outcomes with probabilities (cascade-deletes with prediction)
- **Forecast** — a user's confidence on a specific outcome (unique per owner+outcome, upsert)
- **GameTheoryModel** — strategic analysis: players, payoff matrix, Nash equilibria (one per prediction)

### API Routes
| Route | Methods | Auth |
|-------|---------|------|
| `/api/predictions` | GET, POST | GET public=no auth; POST=auth required |
| `/api/predictions/[id]` | GET, PATCH, DELETE | Owner or admin |
| `/api/outcomes` | GET, POST | Checks parent prediction access |
| `/api/outcomes/[id]` | PATCH, DELETE | Owner or admin |
| `/api/forecasts` | GET, POST | Auth required (own forecasts only) |
| `/api/analyze` | POST | Auth required (calls Claude API with web search) |
| `/api/seed` | POST | Admin only |

### Pages
- `app/page.tsx` — server component (landing page)
- `app/about/page.tsx` — server component
- `app/predictions/page.tsx` — client component (browse public predictions, submit forecasts, run AI analysis)
- `app/my-predictions/page.tsx` — client component (create/manage own predictions, toggle visibility)
- `app/admin/page.tsx` — client component (seed data, manage all predictions, file upload)
- `app/dashboard/page.tsx` — client component (auth-gated)

### Styling
CSS Modules (`.module.css`) per page/component. Global styles in `app/globals.css`. Dark theme with blue accent (#3b82f6).

### AI / Anthropic
- Model: `claude-sonnet-4-6` (used by `/api/analyze` for game-theory analysis with web search)
- Server-side only — never call the Anthropic API or import `@anthropic-ai/sdk` from client components

## Constraints
- Never use `any` in TypeScript
- Never hardcode API keys — read from `process.env`
- Never call the Anthropic API from client components

### Key files
| File | Purpose |
|------|---------|
| `lib/db.ts` | PostgreSQL query helper via `pg` driver |
| `lib/auth.ts` | Supabase auth verification, `requireAuth()`, `requireAdmin()` |
| `lib/api-client.ts` | Client-side `apiFetch()` wrapper |
| `lib/supabase/client.ts` | Browser Supabase client |
| `lib/supabase/server.ts` | Server Supabase client (cookie-based) + service role client |
| `lib/supabase/middleware.ts` | Auth token refresh middleware |
| `middleware.ts` | Next.js middleware (calls Supabase session refresh) |
| `app/hooks/useAuth.ts` | Client-side auth state hook |
| `app/hooks/useAdmin.ts` | Client-side admin role check hook |
| `app/components/PredictionForm.tsx` | Shared prediction creation form (used by admin + my-predictions) |
| `app/components/AuthModal.tsx` | Sign-in/sign-up modal (Supabase Auth UI) |
