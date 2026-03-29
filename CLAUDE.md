# CLAUDE.md

## Project Overview

**PredictorAtlas** — a game theory prediction platform built with Next.js 14 (App Router) and AWS Amplify Gen 2. Users can browse predictions on global events (elections, economics, geopolitics, sports) and submit forecasts. Game theory models (Nash equilibrium, payoff matrices) power the analysis.

## Commands

```bash
npm run dev        # Start local dev server
npm run build      # Build for production
npm start          # Start production server
npm run lint       # Run ESLint
npx ampx sandbox   # Start local Amplify backend sandbox (generates amplify_outputs.json)
```

## Architecture

### Authentication
`app/layout.tsx` wraps the app in `<Authenticator.Provider>` (AWS Amplify UI). The dashboard page requires sign-in via `<Authenticator>`. Amplify is configured via `amplify_outputs.json`.

### Server/client component split
- `app/page.tsx` — server component (landing page)
- `app/about/page.tsx` — server component
- `app/predictions/page.tsx` — client component (interactive filters/forecasts)
- `app/dashboard/page.tsx` — client component (auth-gated)

### Data Models (AppSync + DynamoDB)
- **Prediction** — an event to forecast (title, category, status, resolution date)
- **Outcome** — possible outcomes for a prediction with Nash scores and probabilities
- **Forecast** — a user's prediction on a specific outcome (owner-authorized)
- **GameTheoryModel** — strategic analysis: players, payoff matrix, Nash equilibria

### Styling
CSS Modules (`.module.css`) per page/component. Global styles in `app/globals.css`. Dark theme with blue accent (#3b82f6).

### AWS Amplify backend (`amplify/`)
- Auth: Cognito with email login, admin group (`amplify/auth/resource.ts`)
- Data: AppSync + DynamoDB (`amplify/data/resource.ts`)
- Backend definition: `amplify/backend.ts`
- Deployment config: `amplify.yml`
