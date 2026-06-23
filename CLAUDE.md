# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Cruzei** — SaaS multi-tenant de conciliação financeira para vendedores de marketplace (Shopee, Etsy, Mercado Livre, Amazon). O usuário faz upload de um CSV de vendas + CSV de extrato bancário, o sistema cruza os dados e exibe o que foi pago, o que divergiu e o que está pendente. Os resultados ficam salvos por conta de usuário.

Stack: Next.js 14 (App Router) · TypeScript · Supabase (PostgreSQL + Auth) · Tailwind CSS · Recharts · PapaParse.

## Commands

```bash
npm run dev      # dev server em localhost:3000
npm run build    # build de produção (valida TypeScript + Next.js)
npx tsc --noEmit # type-check sem gerar output
```

Não há testes nem linter. `npm run build` é o único check obrigatório antes de commitar.

## Environment

Copie `.env.local.example` → `.env.local` e preencha:

```
NEXT_PUBLIC_SUPABASE_URL=https://<projeto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Ambos os valores ficam em **Supabase → Settings → API**.

## Banco de dados

Execute `supabase/schema.sql` no SQL Editor do Supabase para criar as tabelas e políticas. O schema é idempotente para tabelas e índices (`IF NOT EXISTS`). As policies usam `DROP POLICY IF EXISTS` antes de `CREATE POLICY` — executar sem esse padrão causa erro `42710: policy already exists`.

Duas tabelas:

- **`reconciliations`** — uma linha por execução de conciliação. Armazena snapshot das taxas aplicadas (commission_pct, payment_pct, etc.) para que registros históricos não mudem quando o usuário edita a configuração depois.
- **`reconciliation_items`** — uma linha por item. `item_type`: `matched | unmatched_sale | unmatched_bank`. `status`: `ok | div | pending | extra`.

RLS está ativo nas duas tabelas. Toda query é automaticamente escopo do `auth.uid() = user_id` — não é necessário filtro adicional no código da aplicação.

## Arquitetura

### Fluxo de dados

```
Upload CSV (browser)
  → PapaParse
  → normalizeSales / normalizeBank      lib/engine/normalizers.ts
  → reconcile(sales, bank, fees, mode)  lib/engine/reconcile.ts
  → ReconciliationResults               (em memória, nunca toca o Supabase)
  → usuário clica "Salvar"
  → INSERT reconciliations              via browser Supabase client
  → INSERT reconciliation_items
  → redirect /dashboard/conciliacao/[id]
  → Server Component lê do Supabase e renderiza
```

### Engine de conciliação (`lib/engine/reconcile.ts`)

Função pura. Recebe `SaleRow[]`, `BankRow[]`, `FeeConfig` e retorna `ReconciliationResults`. Dois modos:

- **`individual`** — 1 venda ↔ 1 depósito. Para cada venda, busca o crédito bancário mais próximo dentro de `fees.window` dias e tolerância ampla (`wideT = max(tolerance × 20, 5)`). A tolerância ampla é intencional: captura divergências que devem ser marcadas como `div` em vez de deixadas sem par.
- **`batch`** — N vendas ↔ 1 depósito. Para cada crédito bancário, tenta encontrar um subconjunto de vendas cujos `expectedNet` somam ao valor do crédito via `greedySubsetSum` (exato simples → par exato → todos os candidatos → acumulação gulosa).

Prioridade de taxa: se a linha de venda já tem `feeCSV > 0` (coluna `taxa_marketplace` no CSV), esse valor é usado diretamente. Caso contrário, calcula pela `FeeConfig` (percentuais + taxa fixa).

### Acesso ao Supabase

Três clientes distintos — não os misture:

| Arquivo | Onde é usado | Como cria |
|---|---|---|
| `lib/supabase/client.ts` | Client Components | `createBrowserClient` |
| `lib/supabase/server.ts` | Server Components | `createServerClient` + `next/headers` |
| `middleware.ts` (inline) | Middleware | `createServerClient` no request/response |

O middleware cria o cliente inline porque a mutação de cookie precisa acontecer no objeto de resposta do Next.js — um cliente compartilhado não consegue fazer isso.

### Normalização de CSV (`lib/engine/normalizers.ts`)

`pickCol()` faz matching de nomes de coluna case-insensitive com normalização de espaços e hífens para `_`. O mesmo engine aceita nomes PT-BR (`data_venda`, `valor_bruto`) e EN (`sale_date`, `gross_amount`) sem configuração. Para adicionar suporte a um novo alias de coluna, inclua a string no array correspondente dentro de `normalizeSales` ou `normalizeBank`.

### Rotas

- `/` — landing page pública (Server Component)
- `/auth/entrar`, `/auth/cadastro` — wrappers do `<AuthForm>` (Client Component com `signInWithPassword` / `signUp`)
- `/auth/callback` — Route Handler que troca o code pelo cookie de sessão do Supabase
- `/dashboard/*` — protegido pelo middleware + `auth.getUser()` no `dashboard/layout.tsx`
- `/dashboard/nova` — monta `<ReconciliationWizard>` (Client Component único que gerencia os 3 passos)
- `/dashboard/conciliacao/[id]/detail-charts.tsx` — `"use client"` separado do `page.tsx` Server Component porque Recharts exige browser APIs

### Utilitários (`lib/utils.ts`)

`fmtBRL`, `fmtDate`, `parseLocalDate`, `toDateStr`, `toNum`, `pickCol`, `dlCSV`. `parseLocalDate` aceita `DD/MM/YYYY`, `YYYY-MM-DD` e `DD-MM-YYYY`. `dlCSV` adiciona BOM UTF-8 para que o Excel pt-BR abra o arquivo corretamente.

## Deploy

Hospedado no Vercel conectado a este repositório. Cada push para `master` dispara deploy automático. Variáveis de ambiente configuradas no painel do Vercel — não no repositório.

Após deploy, configurar no Supabase → Authentication → URL Configuration:
- **Site URL**: `https://<projeto>.vercel.app`
- **Redirect URLs**: `https://<projeto>.vercel.app/auth/callback`
