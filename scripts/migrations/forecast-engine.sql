-- Forecast Engine — Session 1 schema
-- Apply with: psql "$DATABASE_URL" -f scripts/migrations/forecast-engine.sql
-- Or paste into Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS prediction_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id TEXT NOT NULL REFERENCES "Prediction"(id) ON DELETE CASCADE,
  playbook_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  -- queued | researching | modeling | reviewing | completed | failed
  triggered_by TEXT NOT NULL,
  error TEXT,
  input_tokens INT NOT NULL DEFAULT 0,
  output_tokens INT NOT NULL DEFAULT 0,
  cost_usd DOUBLE PRECISION NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prediction_runs_prediction
  ON prediction_runs(prediction_id);
CREATE INDEX IF NOT EXISTS idx_prediction_runs_status
  ON prediction_runs(status);
CREATE INDEX IF NOT EXISTS idx_prediction_runs_triggered_by
  ON prediction_runs(triggered_by);

CREATE TABLE IF NOT EXISTS evidence_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES prediction_runs(id) ON DELETE CASCADE,
  source_name TEXT NOT NULL,
  content TEXT NOT NULL,
  key_signals JSONB NOT NULL DEFAULT '[]'::jsonb,
  weight DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  citations JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_evidence_items_run
  ON evidence_items(run_id);

CREATE TABLE IF NOT EXISTS model_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES prediction_runs(id) ON DELETE CASCADE,
  proposed_probabilities JSONB NOT NULL,
  reasoning TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_model_outputs_run
  ON model_outputs(run_id);

CREATE TABLE IF NOT EXISTS critic_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES prediction_runs(id) ON DELETE CASCADE,
  verdict TEXT NOT NULL,
  -- approve | reject | revise
  notes TEXT,
  applied BOOLEAN NOT NULL DEFAULT FALSE,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_critic_reviews_run
  ON critic_reviews(run_id);
