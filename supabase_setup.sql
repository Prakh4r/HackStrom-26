-- Freight Mind: Supabase Predictions Table
-- Run this in your Supabase Dashboard -> SQL Editor

CREATE TABLE IF NOT EXISTS predictions (
  id BIGSERIAL PRIMARY KEY,
  query TEXT,
  parsed_query JSONB,
  risk_score NUMERIC,
  predicted_delay_days NUMERIC,
  delay_category TEXT,
  top_risk_factors JSONB,
  weather_data JSONB,
  news_data JSONB,
  mitigations JSONB,
  llm_analysis TEXT,
  model_metrics JSONB,
  job_id TEXT,
  shipper_contact_encrypted TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts and reads (for hackathon demo)
CREATE POLICY "Allow anonymous access" ON predictions
  FOR ALL
  USING (true)
  WITH CHECK (true);
