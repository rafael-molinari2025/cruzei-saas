-- ═══════════════════════════════════════════════════════════════
--  CRUZEI · Schema Supabase
--  Execute no SQL Editor do seu projeto Supabase
-- ═══════════════════════════════════════════════════════════════

-- ─── Tabela: reconciliations ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reconciliations (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name                 TEXT NOT NULL,
  marketplace          TEXT NOT NULL,
  match_mode           TEXT NOT NULL DEFAULT 'individual',
  period_start         DATE,
  period_end           DATE,

  -- Snapshot das taxas aplicadas
  commission_pct       NUMERIC(6,2)  DEFAULT 0,
  payment_pct          NUMERIC(6,2)  DEFAULT 0,
  service_pct          NUMERIC(6,2)  DEFAULT 0,
  fixed_fee            NUMERIC(10,2) DEFAULT 0,
  payment_window_days  INTEGER       DEFAULT 7,
  tolerance            NUMERIC(10,2) DEFAULT 0.05,

  -- Resumo
  total_sales          INTEGER       DEFAULT 0,
  total_gross          NUMERIC(15,2) DEFAULT 0,
  total_fees           NUMERIC(15,2) DEFAULT 0,
  total_expected_net   NUMERIC(15,2) DEFAULT 0,
  total_actual_net     NUMERIC(15,2) DEFAULT 0,
  difference           NUMERIC(15,2) DEFAULT 0,
  match_rate           NUMERIC(6,2)  DEFAULT 0,
  matched_count        INTEGER       DEFAULT 0,

  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Tabela: reconciliation_items ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reconciliation_items (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reconciliation_id    UUID REFERENCES reconciliations(id) ON DELETE CASCADE NOT NULL,

  item_type            TEXT NOT NULL, -- matched | unmatched_sale | unmatched_bank
  status               TEXT,          -- ok | div | pending | extra

  -- Campos de venda
  order_id             TEXT,
  sale_date            DATE,
  product              TEXT,
  gross                NUMERIC(15,2),
  fees                 NUMERIC(15,2),
  expected_net         NUMERIC(15,2),

  -- Campos de banco
  actual_net           NUMERIC(15,2),
  difference           NUMERIC(15,2),
  bank_date            DATE,
  bank_description     TEXT,
  bank_credit          NUMERIC(15,2),

  -- Lote
  is_batch             BOOLEAN DEFAULT FALSE,
  batch_size           INTEGER DEFAULT 1
);

-- ─── Índices ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_reconciliations_user ON reconciliations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_reconciliation ON reconciliation_items(reconciliation_id);

-- ─── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE reconciliations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliation_items ENABLE ROW LEVEL SECURITY;

-- Políticas: usuário acessa apenas seus próprios dados
CREATE POLICY "own_reconciliations" ON reconciliations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "own_items" ON reconciliation_items
  FOR ALL USING (
    reconciliation_id IN (
      SELECT id FROM reconciliations WHERE user_id = auth.uid()
    )
  );
