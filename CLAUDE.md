# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Cruzei** — SaaS multi-tenant de conciliação financeira para vendedores de marketplace (Shopee, Etsy, Mercado Livre, Amazon). Usuário faz upload de CSV de vendas + extrato bancário, o sistema cruza os dados e salva o resultado por conta. Acesso controlado por assinatura Stripe.

Stack: Next.js 14 (App Router) · TypeScript · Supabase (PostgreSQL + Auth) · Stripe · Tailwind CSS · Recharts · PapaParse.

## Commands

```bash
npm run dev      # dev server em localhost:3000
npm run build    # build de produção (valida TypeScript + Next.js)
npx tsc --noEmit # type-check sem gerar output
```

Não há testes nem linter. `npm run build` é o único check obrigatório antes de commitar. Sempre push para `main` — o Vercel monitora essa branch.

## Environment

Copie `.env.local.example` → `.env.local`:

```
# Supabase (Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://<id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # nunca expor ao cliente

# Stripe (Developers → API Keys)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_...

# Mercado Livre (opcional)
ML_APP_ID=
ML_CLIENT_SECRET=
ML_REDIRECT_URI=https://cruzei.primetitec.com.br/api/marketplace/ml/callback
```

## Banco de dados

Execute os dois arquivos em ordem no SQL Editor do Supabase:

1. `supabase/schema.sql` — tabelas `reconciliations` e `reconciliation_items`
2. `supabase/002_profiles.sql` — tabela `profiles`, trigger de criação automática e `marketplace_connections`

Ambos são idempotentes. As policies usam `DROP POLICY IF EXISTS` antes de `CREATE POLICY` para evitar erro `42710`.

### Tabelas

- **`reconciliations`** — uma linha por execução. Snapshot das taxas aplicadas (não muda retroativamente).
- **`reconciliation_items`** — uma linha por item. `item_type`: `matched | unmatched_sale | unmatched_bank`.
- **`profiles`** — estende `auth.users`. Campos críticos: `role` (`user | admin`), `status` (`pending | active | suspended`), `plan` (`none | starter | pro`), `stripe_customer_id`, `stripe_subscription_id`.
- **`marketplace_connections`** — tokens OAuth por marketplace por usuário.

O trigger `handle_new_user` cria automaticamente um profile com `status='pending'` e `plan='none'` a cada novo cadastro.

Para promover um usuário a admin:
```sql
UPDATE profiles SET role = 'admin', status = 'active' WHERE id = '<uuid>';
```

## Arquitetura

### Fluxo de acesso

```
Novo usuário cadastra
  → trigger cria profiles com status='pending'
  → middleware redireciona para /dashboard/bloqueado
  → usuário acessa /planos → Stripe Checkout
  → pagamento confirmado → webhook atualiza profiles
    (status='active', plan='starter'|'pro')
  → acesso liberado ao /dashboard
```

### Fluxo de conciliação

```
Upload CSV (browser)
  → PapaParse → normalizeSales / normalizeBank  (lib/engine/normalizers.ts)
  → reconcile()                                  (lib/engine/reconcile.ts)
  → ReconciliationResults (em memória)
  → usuário clica "Salvar"
  → INSERT reconciliations + reconciliation_items (browser Supabase client)
  → redirect /dashboard/conciliacao/[id]
```

### Engine de conciliação (`lib/engine/reconcile.ts`)

Função pura — nunca toca o Supabase. Dois modos:

- **`individual`** — 1 venda ↔ 1 depósito. `wideT = max(tolerance × 20, 5)` — tolerância intencional para capturar divergências em vez de deixar sem par.
- **`batch`** — N vendas ↔ 1 depósito via `greedySubsetSum` (exato simples → par → todos candidatos → acumulação gulosa).

Prioridade de taxa: `feeCSV > 0` (coluna `taxa_marketplace` no CSV) sobrepõe os percentuais da `FeeConfig`.

### Clientes Supabase — não misture

| Arquivo | Contexto | Observação |
|---|---|---|
| `lib/supabase/client.ts` | Client Components | `createBrowserClient` |
| `lib/supabase/server.ts` | Server Components | `createServerClient` + `next/headers` |
| `lib/supabase/admin.ts` | API Routes server-side | service role key, bypassa RLS |
| `middleware.ts` (inline) | Middleware | inline obrigatório — mutação de cookie no response |

O cliente admin (`createAdminClient`) só pode ser usado em API routes — nunca em Client Components nem Server Components acessíveis pelo usuário.

### Stripe (`lib/stripe/`)

`lib/stripe/index.ts` exporta `stripe` como Proxy com lazy init — o cliente Stripe só é instanciado na primeira requisição, não no build. Todas as rotas de API do Stripe têm `export const dynamic = 'force-dynamic'` para impedir pré-renderização estática.

Fluxo de pagamento:
1. `POST /api/stripe/checkout` — cria Checkout Session com `metadata.supabase_id`
2. Stripe redireciona para `/dashboard?plano=ativado` após pagamento
3. `POST /api/stripe/webhook` — recebe eventos de subscription, identifica o plano pelo `price_id` comparado com as env vars, atualiza `profiles`
4. `POST /api/stripe/portal` — abre portal de gerenciamento de assinatura para o cliente

### Rotas

- `/` — landing page pública
- `/planos` — página de preços com botões de checkout Stripe
- `/auth/entrar`, `/auth/cadastro` — ambas têm `export const dynamic = 'force-dynamic'`
- `/auth/callback` — troca code Supabase por cookie de sessão
- `/dashboard/*` — gate no middleware: `status !== 'active'` → `/dashboard/bloqueado`
- `/dashboard/bloqueado` — tela de assinatura pendente ou conta suspensa
- `/dashboard/nova` — `<ReconciliationWizard>` (Client Component, 3 passos)
- `/dashboard/conexoes` — gerencia conexões OAuth com marketplaces
- `/dashboard/conciliacao/[id]` — Server Component + `detail-charts.tsx` separado (`"use client"` por causa do Recharts)
- `/admin` — painel administrativo, protegido por `role === 'admin'` no layout
- `/admin/usuarios` — lista todos os usuários via `auth.admin.listUsers()` + join com profiles
- `/admin/usuarios/[id]` — gerencia status/plano/função de um usuário
- `/api/admin/users` e `/api/admin/users/[id]` — usam `createAdminClient` para bypassar RLS

### Middleware

Protege `/dashboard/*` e `/admin/*` (redireciona não autenticados para `/auth/entrar`). Para rotas de dashboard que não sejam `/dashboard/bloqueado`, verifica `profiles.status` via Supabase — `pending` ou `suspended` → `/dashboard/bloqueado`.

### Sidebar

`components/layout/sidebar.tsx` é Client Component e recebe `role`, `plan` e `userEmail` como props vindas do Server Component `app/dashboard/layout.tsx` (que lê o profile via `createAdminClient`). O link **Admin** só aparece quando `role === 'admin'`. O badge de plano abre o portal Stripe se já houver assinatura, ou redireciona para `/planos` se não houver.

## Deploy

- Vercel projeto `cruzei-saas`, branch `main`, deploy automático a cada push
- Domínio: `cruzei.primetitec.com.br`
- Supabase → Authentication → URL Configuration: Site URL e Redirect URL apontando para o domínio
- Stripe webhook: `https://cruzei.primetitec.com.br/api/stripe/webhook` — eventos `customer.subscription.created/updated/deleted`
