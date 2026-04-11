# CLAUDE.md

## Project Overview

**PredictorAtlas** — a game theory prediction platform built with Next.js (App Router), Prisma ORM, PostgreSQL, and AWS Amplify Gen 2 (auth only). Users can browse predictions on global events (elections, economics, geopolitics, sports) and submit forecasts. Game theory models (Nash equilibrium, payoff matrices) power the analysis via Claude API with web search.

## Commands

```bash
npm run dev        # Start local dev server
npm run build      # Build for production
npm start          # Start production server
npm run lint       # Run ESLint
docker compose up -d  # Start local PostgreSQL
npx prisma migrate dev  # Run database migrations
npx prisma generate    # Regenerate Prisma client
npx tsx scripts/seed.ts  # Seed database with sample predictions
npx ampx sandbox   # Start local Amplify backend sandbox (generates amplify_outputs.json)
```

## Architecture

### Authentication
`app/layout.tsx` wraps the app in `<Authenticator.Provider>` (AWS Amplify UI). Amplify is configured via `amplify_outputs.json`. Cognito JWTs are verified server-side in API routes via `aws-jwt-verify` (`lib/auth.ts`).

### Data Layer (Prisma + PostgreSQL)
- **Database**: PostgreSQL (local via Docker, production via Aurora Serverless v2)
- **ORM**: Prisma — schema at `prisma/schema.prisma`, generated client at `app/generated/prisma/`
- **API routes**: Next.js API routes under `app/api/` replace AppSync GraphQL
- **Client helper**: `lib/api-client.ts` — `apiFetch()` auto-attaches Cognito access tokens

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
| `/api/analyze` | POST | Auth required |
| `/api/seed` | POST | Admin only |

### Server/client component split
- `app/page.tsx` — server component (landing page)
- `app/about/page.tsx` — server component
- `app/predictions/page.tsx` — client component (interactive filters/forecasts)
- `app/my-predictions/page.tsx` — client component (user's own predictions)
- `app/admin/page.tsx` — client component (admin: seed, manage all predictions)
- `app/dashboard/page.tsx` — client component (auth-gated)

### Styling
CSS Modules (`.module.css`) per page/component. Global styles in `app/globals.css`. Dark theme with blue accent (#3b82f6).

### AWS Amplify backend (`amplify/`)
- Auth: Cognito with email login, admin group (`amplify/auth/resource.ts`)
- Backend definition: `amplify/backend.ts`
- Deployment config: `amplify.yml`

### Key files
- `lib/prisma.ts` — Prisma client singleton
- `lib/auth.ts` — JWT verification, `requireAuth()`, `requireAdmin()`
- `lib/api-client.ts` — Client-side `apiFetch()` with auto auth tokens
- `prisma/schema.prisma` — Database schema
- `docker-compose.yml` — Local PostgreSQL
