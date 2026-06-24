-- ═══════════════════════════════════════════════════════════════
--  CRUZEI · Migration 002 — Profiles, planos e admin
--  Execute no SQL Editor do Supabase (após 001_schema.sql)
-- ═══════════════════════════════════════════════════════════════

-- ─── Tabela: profiles ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id                     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name              TEXT,
  role                   TEXT NOT NULL DEFAULT 'user',        -- user | admin
  status                 TEXT NOT NULL DEFAULT 'pending',     -- pending | active | suspended
  plan                   TEXT NOT NULL DEFAULT 'none',        -- none | starter | pro
  stripe_customer_id     TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  subscription_status    TEXT,  -- active | canceled | past_due | trialing
  plan_expires_at        TIMESTAMPTZ,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role   ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);

-- ─── Trigger: cria profile automaticamente no cadastro ───────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, status, plan)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user',
    'pending',
    'none'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── Tabela: marketplace_connections ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS marketplace_connections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  marketplace     TEXT NOT NULL,  -- ml | shopee | etsy | amazon
  access_token    TEXT,
  refresh_token   TEXT,
  token_expires_at TIMESTAMPTZ,
  seller_id       TEXT,
  seller_name     TEXT,
  connected_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, marketplace)
);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE profiles                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_connections  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_profile_select" ON profiles;
CREATE POLICY "own_profile_select" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "own_profile_update" ON profiles;
CREATE POLICY "own_profile_update" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "own_connections" ON marketplace_connections;
CREATE POLICY "own_connections" ON marketplace_connections
  FOR ALL USING (auth.uid() = user_id);

-- ─── Para admins existentes: criar profiles manualmente se necessário ─────────
-- UPDATE profiles SET role = 'admin' WHERE id = '<uuid-do-seu-usuario>';
