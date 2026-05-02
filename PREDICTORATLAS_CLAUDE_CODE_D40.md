# PredictorAtlas — Iran War Intelligence Model v3+
## Claude Code Complete Context & Startup Document
**Last Updated:** April 4, 2026 | Day 40 | Week 6 Opening — Critical Deadline Edition

> **Stack note (2026-04):** This project was originally planned on AWS Amplify Gen 2
> (Cognito + AppSync + DynamoDB + Aurora Serverless v2 via RDS Data API). It has since
> been migrated to **Supabase (Auth + Postgres) on Vercel**. All implementation
> sections below describe the current Supabase architecture. The analytical paste
> block, scenario definitions, and current-state summary are unchanged — they describe
> the model itself, not the platform.

---

## PASTE THIS BLOCK INTO A NEW CHAT TO RESUME THE MODEL

```
You are running the Iran War Intelligence Model v3+ — Day 40, April 4, 2026.

WAR: Operation Epic Fury | Started: February 28, 2026 | Current: Day 40 / Week 6
APRIL 6 DEADLINE: 48 HOURS — Trump: "All Hell will reign down on them. Glory be to GOD!"

═══════════════════════════════════════════════════════
CURRENT MODEL PROBABILITIES (Day 40)
═══════════════════════════════════════════════════════


  S1 Negotiated Deal:   10%  Brent $72-82   Gas $3.00-3.30  S&P 6,970-7,230
  S2 Managed Attrition: 12%  Brent $95-115  Gas $4.20-4.80  S&P 5,786-6,049
  S3 Yanbu/Recession:   25%  Brent $140-170 Gas $5.50-7.00+ S&P 4,603-5,260  ← CO-LEADER
  S4 Regime Collapse:    5%  Brent $65-78   Gas $2.80-3.20  S&P 7,561-7,890
  S5 Ground War:        21%  Brent $120-145 Gas $4.80-5.80  S&P 5,260-5,786  ← CO-LEADER
  S6 Frozen Conflict:   22%  Brent $88-105  Gas $3.60-4.20  S&P 6,180-6,377
  S8 Regional War:      11%  Brent $155-185 Gas $6.00-8.50+ S&P <4,603       ← RISING
  Expected Brent A: ~$118


═══════════════════════════════════════════════════════
LIVE MARKET DATA (April 4, 2026)
═══════════════════════════════════════════════════════
Brent Crude:    ~$118/bbl expected open Monday (was $65 Feb 28 — +82%)
US Gas (AAA):   $4.081/gal last read (was $3.00 Feb 28 — +$1.08, +36%)
  Yesterday: $4.064  |  Week ago: $3.981  |  Month ago: $2.997
  Diesel: $5.507/gal
S&P 500:        ~6,500 (was 6,845 Dec 31 2025 — -5.0% YTD est.)
  April 6 deadline will drive extreme Monday volatility

═══════════════════════════════════════════════════════
DAY 40 — FOUR SIMULTANEOUS CRISES
═══════════════════════════════════════════════════════

CRISIS 1 — FOUR US AIRCRAFT DOWN (April 3-4):
- F-15E Strike Eagle: CONFIRMED DOWN over Kohgiluyeh Province, Iran
  * One crew member rescued, ONE STILL MISSING (Iran hunting them)
  * First fighter jet downed in combat in 20+ years
- A-10 Warthog: downed near Strait of Hormuz during rescue attempt
  * Pilot safely ejected into Kuwait
- Two US SAR helicopters: downed during rescue operation
  * Crews rescued
- Iran celebrating in streets of Tehran

CRISIS 2 — APRIL 6 DEADLINE (48 HOURS):
- Trump Truth Social (April 4 AM): "Time is running out - 48 hours before
  all Hell will reign down on them. Glory be to GOD!"
- Iran REJECTED US 48-hour ceasefire proposal (sent via 3rd country)
- Pakistan FM: mediation efforts "right on track"
- Iran partially opened Hormuz for "essential goods to Iranian ports" —
  NOT the "open, free, and clear" condition Trump set
- Graham: "totally supports" energy strikes if deadline not met
- Missing crew member is the decisive wildcard — Trump cannot launch
  energy strikes with a pilot potentially in Iranian custody

CRISIS 3 — BUSHEHR NUCLEAR PLANT STRUCK (4th time):
- Projectile hit perimeter, killed one security guard
- IAEA: "NPP sites must never be attacked" — no radiation detected
- Rosatom: evacuating 198 more staff — "main wave" of evacuations
- Putin briefed personally by Rosatom CEO
- Iranian FM: "Radioactive fallout will end life in GCC capitals, not Tehran"
- 4th attack raises S8 risk sharply

CRISIS 4 — IRAN PARTIALLY OPENS HORMUZ (conditional):
- Iran authorised ships carrying "essential goods" to Iranian ports
- Must coordinate with IRGC, comply with protocols = toll-booth model
- This is NOT Trump's condition — he requires full, free, clear opening
- Iran also rejected 15-point US peace plan from Pakistan
- But "left open possibility of further negotiations"

═══════════════════════════════════════════════════════
TRUMP NARRATIVE MODEL (Model C)
═══════════════════════════════════════════════════════
States: N1 Victory | N2 Deal Imminent | N3 Ultimatum | N4 Diplomatic | N5 Frustrated
Current: N3 AT MAXIMUM INTENSITY
- "All Hell will reign down" + "Glory be to GOD!" = strongest N3 in 40 days
- Pattern: N3 peak → execution (S3) OR sudden N2 pivot (deal)
- Historical: N3 has previously resolved via extension (3x) or N2 pivot
- BREAKING FACTOR: Missing crew member = Trump may not execute while
  pilot status unknown (political/humane constraint)
- 48-72hr N3 peak window = watch for N2 pivot or deadline execution

Cycle history: N3→N1→N2→N5→N4→N3 (current)
Next expected: N2 (deal signal) OR N3 execution (energy strikes)

═══════════════════════════════════════════════════════
THREE-HORIZON FORECAST
═══════════════════════════════════════════════════════

Day +1 (Apr 5) — T-24HRS TO DEADLINE:
  S3 27%, S5 21%, S6 21% | Brent ~$122 | Gas ~$4.30-4.60
  Key: Crew member status resolution, Pakistan deal signal

Day +3 (Apr 7) — POST-DEADLINE:
  If extended: S6 32%, S3 18%, S5 18% | Brent ~$108
  If executed: S3 40%, S8 15% | Brent $140-155 | Gas $5.50+
  If deal: S1 30%, S6 25% | Brent ~$90 | Gas ~$3.60

Day +7 (Apr 11) — RESOLUTION:
  S6 25%, S5 22%, S3 18% | Brent ~$112 | Gas ~$4.20-4.50
  War Powers clock: Day 47 of 60 — April 28 congressional deadline

APRIL 6 DECISION TREE:
  Extension 5th time:   25%  → S6 recovers, gas eases
  Energy strikes:       38%  → S3 spikes, Brent $145+, gas $5.50+
  Deal announced:       10%  → S1, Brent -$30 immediate
  Crew crisis delays:   20%  → Limbo, S2 +5pp
  Mixed/partial:         7%  → S2 dominant

═══════════════════════════════════════════════════════
EIGHT INTELLIGENCE LAYERS (Current Status)
═══════════════════════════════════════════════════════

L1 Maritime:    Hormuz -95%. Partial "essential goods" opening announced.
                Toll-booth model now formalised. Brent ~$118 expected.
L2 Satellite:   4 US aircraft down. AWACS gone. Iran air defenses NOT flat.
                B-52 deployment may need reassessment.
L3 Iran:        Internet 1% (TRIGGER 6 FULLY ACTIVATED). Fuel rationing.
                Executions of political prisoners continue. 3M+ displaced.
L4 Military:    F-15E down + A-10 down + 2 SAR helos = worst aircraft day.
                PAC-3 critical min APRIL 20. USS Bush arriving.
                82nd Airborne 2,000 troops + USS Tripoli 3,500 Marines ARRIVED.
L5 Financial:   Brent ~$118 expected Mon open. Gas $4.081. S&P -5% YTD.
                Fed Chicago president: war risks making rate cuts impossible.
                S&P 500 worst Q1 since Sept 2022.
L6 Proxy:       Kittleson kidnapped Iraq (Kataib Hizballah). 4 US aircraft
                losses. Iran attacking Gulf desalination + refineries daily.
L7 China:       5-point plan with Pakistan. Wang Yi calls EU, Germany, Saudi,
                Bahrain. "Ceasefire is fundamental solution." China blocking
                UN Hormuz military resolution (with Russia, France).
L8 External:    UK 40-nation conference: no agreement, military planners
                meet next week. Macron: military Hormuz opening "unrealistic."
                Rutte WH visit this week. Turkey: "geostrategic impasse."
                Argentina declared IRGC terrorist org.

═══════════════════════════════════════════════════════
NINE EARLY WARNING TRIGGERS (S4 Regime Collapse)
═══════════════════════════════════════════════════════
1. IRGC general defection               NOT TRIGGERED
2. Grand Ayatollah Qom refuses Mojtaba  NOT TRIGGERED
3. State TV dark >6hrs                  NOT TRIGGERED
4. IRGC new loyalty oaths              NOT TRIGGERED
5. Pezeshkian-Vahidi rift public        PARTIAL (IRGC cutting Pezeshkian off)
6. Internet below 2%                    FULLY TRIGGERED (1% confirmed)
7. Tehran blackouts sustained           PARTIAL
8. Bread/fuel prices double             PARTIAL (+40%)
9. IRGC civilian Western infra          TRIGGERED (AWS Bahrain, Oracle Dubai)
Score: 2 FULL + 3 PARTIAL

═══════════════════════════════════════════════════════
WINCHESTER THRESHOLDS
═══════════════════════════════════════════════════════
THAAD:          ~35% depleted
PAC-3 Patriot:  402+ fired — CRITICAL MINIMUM APRIL 20
Tomahawk:       850+ fired — near floor
GBU-57:         WINCHESTER (0-4 remaining)
AWACS:          DESTROYED Prince Sultan AB
F-15Es:         1 CONFIRMED DESTROYED (crew missing)
3rd CSG Bush:   ARRIVED Middle East
USS Tripoli:    ARRIVED — 3,500 Marines (82nd Airborne variant)
82nd Airborne:  2,000 troops ARRIVED

═══════════════════════════════════════════════════════
PAPE ESCALATION TRAP (4 Stages)
═══════════════════════════════════════════════════════
Stage 1: Bomb nuclear sites           ✅ ACTIVE
Stage 2: Panic about dispersed uranium ✅ ACTIVE (Bushehr 4x struck)
Stage 3: Ground option surfaces        ✅ CONFIRMED + Trump "take the oil"
Stage 4: Ground invasion trap          ⚠️  FORCE PACKAGE IN PLACE
         82nd Airborne + Tripoli 3,500 Marines = Kharg Island capable
         Trump "make a fortune" = explicit Stage 4 rationale stated

═══════════════════════════════════════════════════════
L8 EXTERNAL ACTOR LAYER (Full Summary)
═══════════════════════════════════════════════════════

CHINA:
  Status: Active mediator + Hormuz gatekeeper
  Key actions: Wang Yi 5-point plan, calls to EU/Germany/Saudi/Bahrain
  China blocking UN military Hormuz resolution (with Russia, France)
  De facto Hormuz bilateral exemption for Chinese vessels
  Trump May 14-15 Beijing visit = post-war victory lap incentive
  Model impact: S1 structural support, Brent floor in S6

PAKISTAN:
  Status: Primary US-Iran back-channel — "right on track" April 4
  Key actions: FM Dar transmitted US 15-point plan to Iran
  Iran rejected plan but "left open further negotiations"
  Pakistan ready to host talks "in coming days"
  P(Deal via Pakistan) = 45-55% if deadline extended
  Model impact: S1 only viable path runs through Islamabad

EUROPE/EU:
  Status: Won't join military ops, planning post-conflict role
  Spain: airspace closed. Italy: base denied. Germany: "not our war"
  France: carrier in E. Mediterranean (protection, not Hormuz)
  Macron: military Hormuz opening "unrealistic"
  5 EU finance ministers: windfall profit tax on energy companies
  Model impact: 3-6 month delay before Hormuz escort operational

UK (STARMER):
  Status: Leading 40-nation post-conflict framework
  April 2: Yvette Cooper chaired 40-nation Hormuz conference
  Result: No specific agreements, military planners meet next week
  Starmer: EU pivot — "Brexit did deep damage" + closer EU ties
  Model impact: S6 post-conflict mechanism has named lead + coalition

NATO (RUTTE):
  Status: WH visit this week confirmed
  22-country non-NATO coalition forming for Hormuz
  ZERO deployments yet despite months of planning
  Turkey: "geostrategic impasse" — called Rutte April 4
  NATO troops left Iraq for Naples (quiet repositioning)
  France, Russia, China blocking UN Security Council resolution

═══════════════════════════════════════════════════════
FIVE KEY MODEL FINDINGS (Unchanged)
═══════════════════════════════════════════════════════
1. War made Iran's nuclear threat WORSE (Bushehr 4x struck, dispersed uranium)
2. US cannot exit without financial cascade (GCC fund outflows, casino logic)
3. No Nash equilibrium in US-Israel bilateral game (permanent divergence)
4. Russian ISR support confirmed dominant strategy (Trump + Zelensky)
5. Graham/Hannity/Levin/Pahlavi are war architects, not commentators

═══════════════════════════════════════════════════════
20-SOURCE SWEEP PROTOCOL
═══════════════════════════════════════════════════════
When running an update, check in this order:
1.  AAA Gas Prices (gasprices.aaa.com) — daily national average
2.  FRED S&P 500 (fred.stlouisfed.org/series/SP500) — daily close
3.  Kpler Hormuz traffic — vessel count, exemptions
4.  Brent crude live price
5.  Trump Truth Social (last 24hrs) — narrative state
6.  Iran FM Araghchi statements
7.  IRGC official statements + Tasnim/Fars
8.  Ghalibaf/Pezeshkian statements
9.  Pakistan FM Dar (back-channel status)
10. Wang Yi / China MFA (5-point plan progress)
11. Starmer / Cooper UK statements
12. Rutte / NATO statements
13. Hannity / Levin / Kelly (right media narrative)
14. Netanyahu / IDF statements
15. Pahlavi / Iran International (collapse indicators)
16. NetBlocks (internet connectivity — trigger 6)
17. HRANA (casualty/protest data — triggers 7-8)
18. Gulf state reactions (UAE, Saudi, Qatar, Kuwait)
19. Market reactions (Asia open → Europe → US)
20. War Powers clock + congressional statements

ACTIVE BINARIES (April 4, 2026):
1. APRIL 6 8PM ET DEADLINE — 48 hours — MOST CRITICAL
   Energy strikes (38%) | Extension 5th (25%) | Deal (10%) | Crew crisis delay (20%)
2. Missing F-15E crew member — decisive wildcard
   Rescued: strikes proceed | Captured: hostage dynamic | KIA: removes constraint
3. Bushehr nuclear plant 5th strike risk
   Radiation incident would force Russia/China into direct involvement (S8)
4. Pakistan direct talks "in coming days" — April 5-7 window
5. NATO Rutte WH visit (this week) — alliance crisis or handshake
6. PAC-3 critical minimum April 20 — NK provocation window
7. War Powers Act — April 28 = Day 60 (only 20 days away)

COMMANDS: "Update" | "scenarios" | "scenario pdf" | "forecast pdf" | "Regenerate papers"
```

---

## 1. PROJECT OVERVIEW

**Site:** predictoratlas.com
**Stack:** Next.js 16 (App Router) + Supabase (Auth + PostgreSQL) + Anthropic API (claude-sonnet-4-6) + Vercel
**Build plan:** 5 Claude Code sessions (see Section 6) — these describe the *Iran War Model feature build* on top of the already-shipped generic prediction platform.

PredictorAtlas applies game theory and Nash equilibrium to forecast real-world events.
The generic prediction/forecasting platform is shipped. The **Iran War Intelligence
Model** is the planned flagship live feature — a dual-framework Bayesian intelligence
model with 20-source automated sweep and analyst review queue. It runs the sweep via
Anthropic API and stores live data in Supabase Postgres alongside the existing
prediction tables.

---

## 2. PROJECT CLAUDE.md (current — see `/CLAUDE.md` in repo root for the live version)

The repo root already has a `CLAUDE.md` describing the shipped platform (auth,
data layer, API routes, file map). The Iran War Model add-on adds the following
on top of that base:

```markdown
## Iran War Intelligence Model — addendum to CLAUDE.md

### Architecture
- All Iran War Model data lives in **Supabase Postgres**, alongside the existing
  generic prediction tables (Prediction / Outcome / Forecast / GameTheoryModel).
- Queries use the existing `lib/db.ts` (`pg` driver via Supabase connection
  pooler in transaction mode) — same pattern as the rest of the app.
- Auth: same Supabase Auth as the rest of the app. The analyst-review endpoints
  (`/api/intel/sweep`, `/api/model/update`) require admin role
  (`app_metadata.role = "admin"`) via `requireAdmin()` from `lib/auth.ts`.
- Anthropic calls run server-side only, in `/api/intel/sweep`.

### Server/Client Split
- app/iran-model/page.tsx       — client component (live data)
- All `/api/intel/*` and `/api/model/*` routes — server only

### API Routes (Iran War Model)
- app/api/model/route.ts            — GET current dual-model probabilities
- app/api/model/update/route.ts     — POST analyst-approved probability update (admin)
- app/api/intel/sweep/route.ts      — POST trigger 20-source Anthropic sweep (admin)
- app/api/market/route.ts           — GET live gas/brent/sp500 data
- app/api/forecast/route.ts         — GET D+1/D+3/D+7 horizon forecasts

### Iran War Model file additions
app/
  api/
    model/route.ts
    model/update/route.ts
    intel/sweep/route.ts
    market/route.ts
    forecast/route.ts
  iran-model/page.tsx
lib/
  anthropic.ts              # Anthropic singleton — server-side only
  bayesian/
    update.ts               # probability update logic
    scenarios.ts            # S1-S8 definitions with all ranges
    forecast.ts             # D+1/D+3/D+7 horizon calculator
  market/
    aaa.ts                  # AAA gas price fetcher
    fred.ts                 # S&P 500 FRED API fetcher
    brent.ts                # Brent crude fetcher
app/components/iran-model/
  DualModelTable.tsx        # S1-S8 with A/B probs + Brent + Gas + S&P
  NarrativeTracker.tsx      # N1-N5 states
  EarlyWarningPanel.tsx     # 9 triggers with status
  IntelFeed.tsx             # Last 5 source updates
  ForecastHorizons.tsx      # D+1/D+3/D+7 tables
  ExternalActorLayer.tsx    # China/Pakistan/EU/UK/NATO status
  MarketStrip.tsx           # Live Brent/Gas/S&P bar
  ConsumerImpact.tsx        # Monthly car fill cost per scenario

### Data Models — generic platform (already shipped)
- Prediction       — event to forecast (title, category, status, resolution date, owner)
- Outcome          — possible outcomes with probabilities (cascade-deletes with prediction)
- Forecast         — a user's confidence on an outcome (unique per owner+outcome, upsert)
- GameTheoryModel  — players, payoff matrix, Nash equilibria (one per prediction)

### Data Models — Iran War Model (Postgres tables, see Section 3 schema)
- model_states              — S1-S8 (model_a_prob, model_b_prob, ranges, updated_at)
- narrative_states          — N1-N5 Trump narrative tracker
- intelligence_updates      — sweep results (source, weight, reasoning, impact)
- early_warning_triggers    — 9 triggers (status: triggered/partial/clear, evidence)
- market_data               — gas_aaa, brent, sp500, diesel, recorded_at
- forecast_horizons         — D1/D3/D7 probabilities per scenario
- external_actors           — L8 layer (China/Pakistan/EU/UK/NATO status)
- source_sweep_log          — 20-source sweep history with timestamps
- winchester_status         — PAC-3/Tomahawk/GBU57 depletion levels
- consumer_impact           — per-scenario monthly car-fill delta

### Environment Variables (additions)
ANTHROPIC_API_KEY=            # already set for /api/analyze; reused by Iran War sweep
FRED_API_KEY=                 # S&P 500 (fred.stlouisfed.org)
AAA_GAS_URL=https://gasprices.aaa.com/
# Existing Supabase vars (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL) are reused — no new DB connection.

### Never (Iran War Model–specific — see root CLAUDE.md for general rules)
- Never bypass `requireAdmin()` on `/api/intel/*` or `/api/model/update`
- Never store probabilities as percentages in DB — use floats (0.16 not 16)
- Never store S&P as percentage change — use actual index level (6575 not -3.9)
- Never store gas price as percentage change — use $/gallon (4.081)

### Key Constants (Iran War Model)
- AI Model: claude-sonnet-4-6
- Scenarios: S1, S2, S3, S4, S5, S6, S8 (no S7)
- Narrative states: N1-N5
- Early warning triggers: 9 total (trigger 6 and 9 currently TRIGGERED)
- Source sweep: 20 sources, on-demand or scheduled
- Forecast horizons: D+1 (24hr), D+3 (72hr), D+7 (7-day)
- Market data sources: AAA (gas), FRED (S&P), live feed (Brent)
- War started: February 28, 2026 (Day 0)
- War Powers deadline: April 28, 2026 (Day 60)
```

---

## 3. Supabase Postgres Schema (Iran War Model tables)

Run these against Supabase via the SQL Editor (or check into a migration file
under `scripts/` and apply via `psql $DATABASE_URL`).

```sql
-- Core probability table
CREATE TABLE model_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_code TEXT NOT NULL, -- S1,S2,S3,S4,S5,S6,S8
  scenario_label TEXT NOT NULL,
  model_a_prob FLOAT NOT NULL, -- 0.0 to 1.0
  model_b_prob FLOAT NOT NULL,
  brent_low INT,  brent_high INT,    -- $/bbl
  gas_low FLOAT,  gas_high FLOAT,    -- $/gallon (AAA)
  sp500_low INT,  sp500_high INT,    -- actual index level
  recession_label TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Live market data (fetched daily)
CREATE TABLE market_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brent_price FLOAT,           -- $/bbl
  gas_aaa FLOAT,               -- $/gallon national average
  gas_yesterday FLOAT,
  gas_week_ago FLOAT,
  gas_month_ago FLOAT,
  gas_prewar FLOAT DEFAULT 3.00,
  sp500_close INT,             -- actual index level
  sp500_prewar INT DEFAULT 6845,
  diesel FLOAT,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- Forecast horizons (D+1, D+3, D+7)
CREATE TABLE forecast_horizons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  horizon TEXT NOT NULL,       -- 'D1', 'D3', 'D7'
  horizon_date DATE,
  scenario_code TEXT NOT NULL,
  model_a_prob FLOAT,
  model_b_prob FLOAT,
  exp_brent_a FLOAT,
  exp_brent_b FLOAT,
  exp_gas_a FLOAT,
  exp_sp500_low INT,
  exp_sp500_high INT,
  gas_scenario_low FLOAT,
  gas_scenario_high FLOAT,
  key_driver TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trump narrative tracker
CREATE TABLE narrative_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code TEXT NOT NULL,    -- N1-N5
  label TEXT,
  description TEXT,
  is_current BOOLEAN DEFAULT false,
  triggered_at TIMESTAMPTZ DEFAULT now()
);

-- Intelligence source updates (sweep results)
CREATE TABLE intelligence_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name TEXT NOT NULL,
  source_weight FLOAT,
  content TEXT NOT NULL,
  impact_assessment TEXT,
  scenario_impacts JSONB,      -- {"S1": 0.02, "S6": -0.01}
  sweep_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Early warning system
CREATE TABLE early_warning_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_number INT UNIQUE,
  description TEXT,
  status TEXT DEFAULT 'clear', -- 'clear', 'partial', 'triggered'
  evidence TEXT,
  model_impact TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Winchester thresholds
CREATE TABLE winchester_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_name TEXT UNIQUE,
  status TEXT,                 -- 'nominal', 'depleted', 'winchester', 'destroyed'
  depletion_pct INT,
  critical_date DATE,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- External actor layer (L8)
CREATE TABLE external_actors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_name TEXT UNIQUE,      -- 'China', 'Pakistan', 'UK', 'EU', 'NATO'
  position TEXT,
  key_signal TEXT,
  model_impact TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Consumer impact per scenario (monthly car fill at 15 gallons)
CREATE TABLE consumer_impact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_code TEXT UNIQUE,
  monthly_fill_delta FLOAT,    -- $ vs current price
  gas_range_low FLOAT,
  gas_range_high FLOAT,
  sp500_direction TEXT,
  recession_risk TEXT,
  when_realized TEXT
);

-- 20-source sweep log
CREATE TABLE source_sweep_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sweep_id UUID DEFAULT gen_random_uuid(),
  sources_checked INT,
  probability_changes JSONB,
  narrative_change TEXT,
  analyst_approved BOOLEAN DEFAULT false,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

> **RLS note:** these tables are all read-public, write-admin. Either keep them
> outside the Supabase Auth RLS surface (server-only access via the existing
> `pg` pool with the service role) or enable RLS with policies allowing
> `auth.jwt() ->> 'role' = 'admin'` on writes. The existing app uses the former
> pattern via `lib/db.ts` — stick with it.

---

## 4. SCENARIO DEFINITIONS (Full — with Gas and S&P)

```typescript
// lib/bayesian/scenarios.ts
export const SCENARIOS = {
  S1: {
    code: 'S1', label: 'Negotiated Deal',
    brent: { low: 72, high: 82 },
    gas: { low: 3.00, high: 3.30 },      // AAA $/gallon
    sp500: { low: 6970, high: 7230 },     // actual index level
    recession: 'Avoided',
    monthlyFillDelta: -13,               // $ vs $4.08 current (15 gal)
    color: '#58A6FF'
  },
  S2: {
    code: 'S2', label: 'Managed Attrition',
    brent: { low: 95, high: 115 },
    gas: { low: 4.20, high: 4.80 },
    sp500: { low: 5786, high: 6049 },
    recession: 'Stagflation',
    monthlyFillDelta: 4,
    color: '#FF7B45'
  },
  S3: {
    code: 'S3', label: 'Yanbu/Recession',
    brent: { low: 140, high: 170 },
    gas: { low: 5.50, high: 7.00 },
    sp500: { low: 4603, high: 5260 },
    recession: 'Certain',
    monthlyFillDelta: 35,
    color: '#F85149'
  },
  S4: {
    code: 'S4', label: 'Regime Collapse',
    brent: { low: 65, high: 78 },
    gas: { low: 2.80, high: 3.20 },
    sp500: { low: 7561, high: 7890 },
    recession: 'Avoided',
    monthlyFillDelta: -19,
    color: '#BC8CFF'
  },
  S5: {
    code: 'S5', label: 'Ground War',
    brent: { low: 120, high: 145 },
    gas: { low: 4.80, high: 5.80 },
    sp500: { low: 5260, high: 5786 },
    recession: 'Very likely',
    monthlyFillDelta: 26,
    color: '#FF7B45'
  },
  S6: {
    code: 'S6', label: 'Frozen Conflict',
    brent: { low: 88, high: 105 },
    gas: { low: 3.60, high: 4.20 },
    sp500: { low: 6180, high: 6377 },
    recession: 'Mild risk',
    monthlyFillDelta: -3,
    color: '#3FB950'
  },
  S8: {
    code: 'S8', label: 'Regional War',
    brent: { low: 155, high: 185 },
    gas: { low: 6.00, high: 8.50 },
    sp500: { low: 0, high: 4603 },       // <4,603
    recession: 'Certain',
    monthlyFillDelta: 67,
    color: '#F85149'
  }
}

// Market data constants
export const PRE_WAR = {
  brent: 65,
  gas: 3.00,          // AAA $/gallon Feb 28
  sp500: 6845,        // Dec 31, 2025
  diesel: 3.77,
  warStartDate: '2026-02-28',
  warPowersDeadline: '2026-04-28'  // Day 60
}
```

---

## 5. API ROUTE SPECIFICATIONS

```typescript
// app/api/market/route.ts
// Fetches AAA gas, FRED S&P, live Brent. No auth required.
GET /api/market
Response: {
  brent: number,           // $/bbl
  gas_aaa: number,         // $/gallon
  gas_yesterday: number,
  gas_week_ago: number,
  gas_month_ago: number,
  gas_prewar: 3.00,
  gas_change_since_war: number,  // dollar change
  gas_change_pct: number,        // % change
  sp500: number,           // actual index level e.g. 6500
  sp500_prewar: 6845,
  sp500_ytd_pct: number,
  diesel: number,
  recorded_at: string
}

// app/api/model/route.ts — no auth required
GET /api/model
Response: {
  war_day: number,
  scenarios: Array<{
    code: string,
    label: string,
    model_a: number,        // 0.0-1.0
    model_b: number,
    brent_range: string,    // "$72-82"
    gas_range: string,      // "$3.00-3.30"
    sp500_range: string,    // "6,970-7,230"
    recession: string,
    monthly_fill_delta: number  // $ vs current price
  }>,
  narrative_state: { code: string, label: string },
  expected_brent_a: number,
  expected_brent_b: number,
  updated_at: string
}

// app/api/forecast/route.ts — no auth required
GET /api/forecast
Response: {
  horizons: {
    D1: { date: string, scenarios: Array<ForecastScenario>, exp_brent: number, exp_gas: number },
    D3: { date: string, scenarios: Array<ForecastScenario>, exp_brent: number, exp_gas: number },
    D7: { date: string, scenarios: Array<ForecastScenario>, exp_brent: number, exp_gas: number }
  },
  april6_decision_tree: {
    extension: 0.25,
    energy_strikes: 0.38,
    deal: 0.10,
    crew_crisis_delay: 0.20,
    mixed: 0.07
  }
}

// app/api/intel/sweep/route.ts — admin only (requireAdmin())
POST /api/intel/sweep
Body: { force?: boolean }
Response: {
  sweep_id: string,
  sources_checked: 20,
  probability_deltas: Record<string, { model_a: number, model_b: number }>,
  narrative_assessment: string,
  top_signals: Array<{ source: string, impact: string }>,
  requires_analyst_review: boolean
}

// app/api/model/update/route.ts — admin only
POST /api/model/update
Body: { sweep_id: string, approved_changes: Record<string, { model_a: number, model_b: number }> }
Response: { success: true, updated_states: number }
```

---

## 6. FIVE-SESSION BUILD PLAN (Claude Code) — Iran War Model on top of shipped platform

### Session 1 — Schema + Seed + Market Fetchers
```
Goal: Add Iran War Model tables to Supabase, seed Day 40 data, build market fetchers.
Read /CLAUDE.md first (covers existing Supabase + lib/db.ts patterns). Then:
1. Create scripts/migrations/iran-war-model.sql with full schema (Section 3)
2. Apply via psql $DATABASE_URL or Supabase SQL editor
3. Seed model_states with 7 scenarios + Day 40 probabilities
4. Seed market_data with current values
5. Seed early_warning_triggers (9 rows; triggers 6+9 = TRIGGERED)
6. Seed winchester_status, external_actors, consumer_impact
7. lib/market/aaa.ts — scrape gasprices.aaa.com
8. lib/market/fred.ts — FRED API series SP500
9. lib/market/brent.ts — Brent crude live price
10. app/api/market/route.ts — combine and return (uses existing lib/db.ts)
11. Schedule daily refresh — Vercel Cron (vercel.json) hitting an admin endpoint
Test: SELECT * FROM model_states returns 7 rows + GET /api/market returns live values
```

### Session 2 — Model API + AI Orchestrator
```
Goal: Build the probability update system.
1. app/api/model/route.ts — GET current state via lib/db.ts
2. lib/bayesian/update.ts — probability update logic
3. lib/anthropic.ts — Anthropic client singleton (claude-sonnet-4-6)
   * Reuse existing ANTHROPIC_API_KEY env var (already used by /api/analyze)
4. app/api/intel/sweep/route.ts — 20-source sweep via Anthropic API
   * Gate with requireAdmin() from lib/auth.ts
5. Analyst review queue (accept/reject proposed changes via /api/model/update)
Test: POST /api/intel/sweep (as admin) returns proposed probability changes
```

### Session 3 — Forecast Horizons
```
Goal: Build D+1/D+3/D+7 forecast system.
1. lib/bayesian/forecast.ts — horizon calculator
2. app/api/forecast/route.ts — GET forecast data
3. April 6 decision tree integration
4. Consumer impact calculator (monthly car fill at 15 gallons)
Test: GET /api/forecast returns all three horizons
```

### Session 4 — Iran Model Page (Frontend Core)
```
Goal: Build app/iran-model/page.tsx with core data display components.
Components (in order):
1. MarketStrip — live Brent/Gas/S&P bar with vs-prewar comparison
2. DualModelTable — S1-S8 with A/B probs + Brent + Gas + S&P columns
3. NarrativeTracker — N1-N5 current state indicator
4. ForecastHorizons — D+1/D+3/D+7 tables side by side
5. ConsumerImpact — monthly car fill cost per scenario table
Use existing lib/api-client.ts (apiFetch) for client-side fetches.
Test: iran-model page renders with live data from Sessions 1-3
```

### Session 5 — Iran Model Page (Intelligence & Analysis Components)
```
Goal: Add remaining intelligence and analysis components to iran-model page.
Components (in order):
1. EarlyWarningPanel — 9 triggers with status badges
2. ExternalActorLayer — L8 accordion (China/Pakistan/EU/UK/NATO)
3. WinchesterStatus — depletion indicators
4. IntelFeed — last 5 source updates from intelligence_updates table
Test: Full iran-model page renders all 9 components with live data
```

---

## 7. CURRENT STATE SUMMARY (Day 40)

| Metric | Value | Note |
|--------|-------|------|
| War day | 40 | Week 6 |
| Leading scenario (A) | S3 25% | Tied with S5 |
| Leading scenario (B) | S4 35% | Collapse thesis |
| Brent (expected Mon) | ~$118 | +82% since war |
| US Gas (AAA) | $4.081/gal | +36% since war |
| S&P 500 | ~6,500 | -5.0% YTD est. |
| April 6 deadline | 48 hours | Energy strike or ext. |
| Missing crew member | ACTIVE SEARCH | Decisive wildcard |
| Bushehr strikes | 4 (killing 1) | Nuclear risk rising |
| Internet in Iran | 1% | Trigger 6 TRIGGERED |
| War Powers clock | Day 40/60 | April 28 deadline |

---

## 8. OUTPUT FILES

| File | Description | Date |
|------|-------------|------|
| iran_forecast_enhanced.pdf | Forecast with AAA gas + S&P levels | Day 36 |
| iran_forecast_scenarios.pdf | 3-horizon forecast | Day 36 |
| iran_model_scenarios_day35.pdf | Full scenario PDF pre-speech | Day 35 |
| PREDICTORATLAS_CLAUDE_CODE_D40.md | THIS FILE — Day 40 (Supabase) | Day 40 |
| PREDICTORATLAS_CLAUDE_CODE_D36.md | Previous version (AWS Amplify plan) | Day 36 |

---

*Iran War Intelligence Model v3+ | PredictorAtlas.com | Day 40 | April 4, 2026*
*Stack: Next.js 16 + Supabase + Vercel | Model A: Pape/Nasr/Jiang | Model B: Pahlavi/IranIntl/Fox | Gas: AAA | S&P: FRED*
