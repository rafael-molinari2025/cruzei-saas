'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Papa from 'papaparse'
import { normalizeSales, normalizeBank } from '@/lib/engine/normalizers'
import { reconcile, toDBItems } from '@/lib/engine/reconcile'
import { createClient } from '@/lib/supabase/client'
import { fmtBRL, fmtDate, fmtPct, toDateStr, dlCSV } from '@/lib/utils'
import type { FeeConfig, MarketplaceKey, SaleRow, BankRow, ReconciliationResults } from '@/lib/engine/types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

// ─── Constants ───────────────────────────────────────────────────────────────
const MP_PRESETS: Record<MarketplaceKey, Omit<FeeConfig, 'tolerance'>> = {
  shopee:  { commission: 18,  payment: 2,    service: 0, fixed: 0,    window: 7  },
  etsy:    { commission: 6.5, payment: 3,    service: 0, fixed: 0.20, window: 3  },
  ml:      { commission: 14,  payment: 2.99, service: 0, fixed: 0,    window: 2  },
  amazon:  { commission: 12,  payment: 2,    service: 0, fixed: 0,    window: 14 },
  custom:  { commission: 0,   payment: 0,    service: 0, fixed: 0,    window: 7  },
}

const MP_LABELS: Record<MarketplaceKey, string> = {
  shopee: '🛍 Shopee', etsy: '🎨 Etsy', ml: '🛒 Mercado Livre', amazon: '📦 Amazon', custom: '⚙️ Personalizado',
}

const SAMPLE_SALES = `data_venda,id_pedido,produto,quantidade,valor_bruto,taxa_marketplace,valor_liquido
15/01/2026,ORD-001,Camiseta Estampada Azul,2,120.00,21.60,98.40
16/01/2026,ORD-002,Mochila Escolar Premium,1,189.90,34.18,155.72
17/01/2026,ORD-003,Tênis Casual Feminino 36,1,249.00,44.82,204.18
18/01/2026,ORD-004,Fone Bluetooth TWS,1,89.99,16.20,73.79
18/01/2026,ORD-005,Capa iPhone 15 Pro Max,3,45.00,8.10,36.90
20/01/2026,ORD-006,Relógio Smartwatch,1,399.00,71.82,327.18
21/01/2026,ORD-007,Agenda Planner 2026,2,78.00,14.04,63.96
22/01/2026,ORD-008,Kit Meia Esportiva,4,60.00,10.80,49.20
23/01/2026,ORD-009,Perfume Importado 100ml,1,320.00,57.60,262.40
24/01/2026,ORD-010,Kit Skincare Completo,2,156.00,28.08,127.92`

const SAMPLE_BANK = `data,descricao,debito,credito,saldo
22/01/2026,DEP SHOPEE ORD-001,,98.40,5098.40
23/01/2026,DEP SHOPEE ORD-002,,155.72,5254.12
24/01/2026,DEP SHOPEE ORD-003,,204.18,5458.30
25/01/2026,DEP SHOPEE ORD-004,,73.00,5531.30
25/01/2026,DEP SHOPEE ORD-005,,36.90,5568.20
27/01/2026,DEP SHOPEE ORD-006,,327.18,5895.38
28/01/2026,DEP SHOPEE ORD-007,,63.96,5959.34
29/01/2026,DEP SHOPEE ORD-008,,49.20,6008.54
28/01/2026,TED CLIENTE AVULSO,,500.00,6508.54
30/01/2026,DEP SHOPEE ORD-009,,262.40,6770.94
10/01/2026,PAGTO FORNECEDOR,2500.00,,4000.00`

// ─── Helpers ─────────────────────────────────────────────────────────────────
function parseCSVText(text: string): Record<string, unknown>[] {
  return Papa.parse<Record<string, unknown>>(text, { header: true, skipEmptyLines: true, dynamicTyping: false }).data
}

function cn(...cls: (string | boolean | undefined)[]) {
  return cls.filter(Boolean).join(' ')
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function WizardSteps({ step }: { step: number }) {
  const steps = ['Marketplace', 'Upload', 'Resultado']
  return (
    <div className="flex items-center mb-8">
      {steps.map((s, i) => {
        const n = i + 1
        const done   = n < step
        const active = n === step
        return (
          <div key={s} className="flex items-center">
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                done   ? 'bg-emerald-500 text-white' :
                active ? 'bg-primary-600 text-white ring-4 ring-primary-100' :
                         'bg-gray-100 text-gray-400',
              )}>
                {done ? '✓' : n}
              </div>
              <span className={cn('text-sm font-medium', active ? 'text-primary-600' : done ? 'text-emerald-600' : 'text-gray-400')}>
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn('h-0.5 w-12 mx-4', done ? 'bg-emerald-400' : 'bg-gray-200')} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Upload zone ──────────────────────────────────────────────────────────────
function UploadZone({
  label, hint, icon, loaded, filename,
  onFile, onDemoLoad,
}: {
  label: string; hint: string; icon: string; loaded: boolean; filename?: string
  onFile: (file: File) => void; onDemoLoad?: () => void
}) {
  const [drag, setDrag] = useState(false)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDrag(false)
    const f = e.dataTransfer.files[0]
    if (f) onFile(f)
  }

  return (
    <div>
      <label
        className={cn(
          'relative flex flex-col items-center justify-center gap-2 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors min-h-[140px]',
          drag   ? 'border-primary-400 bg-primary-50' :
          loaded ? 'border-emerald-400 bg-emerald-50 border-solid' :
                   'border-gray-200 hover:border-primary-300 hover:bg-gray-50',
        )}
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
      >
        <input type="file" accept=".csv,.txt" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }} />
        <span className="text-3xl">{loaded ? '✅' : icon}</span>
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        {loaded && filename
          ? <span className="text-xs text-emerald-700 font-medium">{filename}</span>
          : <span className="text-xs text-gray-400">{hint}</span>
        }
      </label>
      {onDemoLoad && (
        <button onClick={onDemoLoad} className="text-xs text-primary-600 underline mt-1.5 ml-1">
          Usar dados de demonstração
        </button>
      )}
    </div>
  )
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────
export default function ReconciliationWizard() {
  const router = useRouter()
  const supabase = createClient()

  const [step,  setStep]  = useState<1|2|3>(1)
  const [mp,    setMp]    = useState<MarketplaceKey>('shopee')
  const [fees,  setFees]  = useState<FeeConfig>({ ...MP_PRESETS.shopee, tolerance: 0.05 })
  const [mode,  setMode]  = useState<'individual'|'batch'>('individual')
  const [recName, setRecName] = useState('')

  const [salesFile,  setSalesFile]  = useState<string | null>(null)
  const [bankFile,   setBankFile]   = useState<string | null>(null)
  const [salesRows,  setSalesRows]  = useState<SaleRow[] | null>(null)
  const [bankRows,   setBankRows]   = useState<BankRow[] | null>(null)
  const [results,    setResults]    = useState<ReconciliationResults | null>(null)

  const [saving,  setSaving]  = useState(false)
  const [saveErr, setSaveErr] = useState<string | null>(null)

  // Fee input handler
  function setFee(k: keyof FeeConfig, v: string) {
    setFees(f => ({ ...f, [k]: parseFloat(v) || 0 }))
  }

  function selectMP(key: MarketplaceKey) {
    setMp(key)
    setFees({ ...MP_PRESETS[key], tolerance: fees.tolerance })
  }

  // File parsing
  const handleSalesFile = useCallback((file: File) => {
    setSalesFile(file.name)
    file.text().then(t => setSalesRows(normalizeSales(parseCSVText(t))))
  }, [])

  const handleBankFile = useCallback((file: File) => {
    setBankFile(file.name)
    file.text().then(t => setBankRows(normalizeBank(parseCSVText(t))))
  }, [])

  function loadDemo() {
    setSalesRows(normalizeSales(parseCSVText(SAMPLE_SALES)))
    setBankRows(normalizeBank(parseCSVText(SAMPLE_BANK)))
    setSalesFile('[demo] vendas_jan2026.csv')
    setBankFile('[demo] extrato_jan2026.csv')
    setRecName('Demo · Shopee Janeiro 2026')
  }

  function runReconciliation() {
    if (!salesRows || !bankRows) return
    setResults(reconcile(salesRows, bankRows, fees, mode))
    setStep(3)
  }

  // Save to Supabase
  async function saveReconciliation() {
    if (!results) return
    setSaving(true); setSaveErr(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaveErr('Sessão expirada.'); setSaving(false); return }

    const { summary: su } = results
    const name = recName || `Conciliação ${new Date().toLocaleDateString('pt-BR')}`

    const { data: rec, error: recErr } = await supabase
      .from('reconciliations')
      .insert({
        user_id: user.id, name, marketplace: mp, match_mode: mode,
        period_start: toDateStr(su.periodStart), period_end: toDateStr(su.periodEnd),
        commission_pct:       fees.commission,
        payment_pct:          fees.payment,
        service_pct:          fees.service,
        fixed_fee:            fees.fixed,
        payment_window_days:  fees.window,
        tolerance:            fees.tolerance,
        total_sales:          salesRows!.length,
        total_gross:          su.totalGross,
        total_fees:           su.totalFees,
        total_expected_net:   su.totalExpectedNet,
        total_actual_net:     su.totalActualNet,
        difference:           su.difference,
        match_rate:           su.matchRate,
        matched_count:        su.matchedCount,
      })
      .select('id')
      .single()

    if (recErr || !rec) { setSaveErr('Erro ao salvar: ' + recErr?.message); setSaving(false); return }

    const items = toDBItems(results, rec.id)
    const { error: itemErr } = await supabase.from('reconciliation_items').insert(items)
    if (itemErr) { setSaveErr('Erro ao salvar itens: ' + itemErr.message); setSaving(false); return }

    router.push(`/dashboard/conciliacao/${rec.id}`)
  }

  // CSV Export
  function exportCSV() {
    if (!results) return
    const { matched, unmatchedSales, unmatchedBank } = results
    const rows = [['STATUS','PEDIDO','DATA_VENDA','PRODUTO','BRUTO','TAXAS','LIQ_ESPERADO','RECEBIDO','DIFERENÇA','DATA_DEP','BANCO']]
    for (const m of matched) rows.push([m.status === 'ok' ? 'CONCILIADO' : 'DIVERGÊNCIA', m.sale.order_id, fmtDate(m.sale.date), m.sale.product, String(m.sale.gross), String(m.fees.toFixed(2)), String(m.expectedNet.toFixed(2)), String(m.actualNet.toFixed(2)), String(m.difference.toFixed(2)), fmtDate(m.bank.date), m.bank.description])
    for (const u of unmatchedSales) rows.push(['SEM_DEPÓSITO', u.sale.order_id, fmtDate(u.sale.date), u.sale.product, String(u.sale.gross), String(u.sale.fee.toFixed(2)), String(u.sale.expectedNet.toFixed(2)), '', '', '', ''])
    for (const u of unmatchedBank) rows.push(['SEM_VENDA', '', '', '', '', '', '', String(u.bank.credit.toFixed(2)), '', fmtDate(u.bank.date), u.bank.description])
    dlCSV(rows.map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\r\n'), `cruzei_${new Date().toISOString().slice(0,10)}.csv`)
  }

  const { summary: su } = results ?? {}

  return (
    <div>
      <WizardSteps step={step} />

      {/* ═══ STEP 1 ═══ */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Marketplace selector */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-800 mb-1">Marketplace</h2>
            <p className="text-sm text-gray-500 mb-5">Selecione para pré-carregar as taxas automaticamente.</p>
            <div className="grid grid-cols-5 gap-3 mb-6">
              {(Object.keys(MP_PRESETS) as MarketplaceKey[]).map(key => (
                <button
                  key={key}
                  onClick={() => selectMP(key)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center',
                    mp === key ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300',
                  )}
                >
                  <span className="text-2xl">{MP_LABELS[key].split(' ')[0]}</span>
                  <span className="text-xs font-semibold text-gray-700 leading-tight">{MP_LABELS[key].slice(2)}</span>
                </button>
              ))}
            </div>

            {/* Fee inputs */}
            <div className="grid grid-cols-3 gap-4">
              {([
                { k: 'commission',  label: 'Comissão (%)',          hint: 'Percentual sobre o bruto' },
                { k: 'payment',     label: 'Taxa pagamento (%)',     hint: 'Processamento do meio de pgto' },
                { k: 'service',     label: 'Taxa serviço (%)',       hint: 'Taxas adicionais da plataforma' },
                { k: 'fixed',       label: 'Taxa fixa (R$)',         hint: 'Ex.: listing fee do Etsy' },
                { k: 'window',      label: 'Janela pgto (dias)',     hint: 'Dias entre venda e depósito' },
                { k: 'tolerance',   label: 'Tolerância (R$)',        hint: 'Diferença máxima para OK' },
              ] as { k: keyof FeeConfig; label: string; hint: string }[]).map(({ k, label, hint }) => (
                <div key={k}>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
                  <input
                    type="number" min={0} step={k === 'window' ? 1 : 0.01}
                    value={fees[k]} onChange={e => setFee(k, e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                  <p className="text-xs text-gray-400 mt-1">{hint}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={() => setStep(2)} className="bg-primary-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-primary-700 transition-colors">
              Próximo: Upload →
            </button>
          </div>
        </div>
      )}

      {/* ═══ STEP 2 ═══ */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-800 mb-1">Upload dos arquivos</h2>
            <p className="text-sm text-gray-500 mb-5">Relatório de vendas + extrato bancário em CSV.</p>

            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800 mb-5">
              Não tem os arquivos?{' '}
              <button onClick={loadDemo} className="font-bold underline">Clique aqui para usar dados de demonstração</button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <UploadZone label="Relatório de Vendas" hint="Arraste ou clique para selecionar" icon="📋" loaded={!!salesRows} filename={salesFile ?? undefined} onFile={handleSalesFile} onDemoLoad={() => { setSalesRows(normalizeSales(parseCSVText(SAMPLE_SALES))); setSalesFile('[demo] vendas.csv') }} />
              <UploadZone label="Extrato Bancário" hint="Arraste ou clique para selecionar" icon="🏦" loaded={!!bankRows} filename={bankFile ?? undefined} onFile={handleBankFile} onDemoLoad={() => { setBankRows(normalizeBank(parseCSVText(SAMPLE_BANK))); setBankFile('[demo] extrato.csv') }} />
            </div>

            {/* Mode toggle */}
            <div className="mb-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Modo de conciliação</p>
              <div className="flex gap-3">
                {(['individual', 'batch'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={cn('flex-1 border-2 rounded-xl p-3 text-sm font-semibold transition-all',
                      mode === m ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500 hover:border-primary-300')}
                  >
                    {m === 'individual' ? 'Pedido a pedido' : 'Por lote'}
                    <span className="block text-xs font-normal text-gray-400 mt-0.5">
                      {m === 'individual' ? '1 venda = 1 depósito · Etsy, Amazon' : 'N vendas = 1 depósito · Shopee, ML'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reconciliation name */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Nome da conciliação</label>
              <input
                type="text" value={recName} onChange={e => setRecName(e.target.value)}
                placeholder={`${MP_LABELS[mp]} · ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="text-sm text-gray-600 font-semibold px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
              ← Voltar
            </button>
            <button
              onClick={runReconciliation} disabled={!salesRows || !bankRows}
              className="bg-primary-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-40"
            >
              🔄 Conciliar agora
            </button>
          </div>
        </div>
      )}

      {/* ═══ STEP 3 ═══ */}
      {step === 3 && results && su && (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: 'Vendas brutas',    value: fmtBRL(su.totalGross),      color: 'border-primary-500' },
              { label: 'Taxas marketplace', value: fmtBRL(su.totalFees),       color: 'border-red-400',    valueCls: 'text-red-600' },
              { label: 'Líquido esperado', value: fmtBRL(su.totalExpectedNet), color: 'border-emerald-500' },
              { label: 'Diferença',        value: (su.difference >= 0 ? '+' : '') + fmtBRL(su.difference), color: su.difference < -0.01 ? 'border-red-400' : su.difference > 0.01 ? 'border-amber-400' : 'border-emerald-500', valueCls: su.difference < -0.01 ? 'text-red-600' : su.difference > 0.01 ? 'text-amber-600' : 'text-emerald-600' },
              { label: 'Conciliação',      value: fmtPct(su.matchRate),        color: su.matchRate >= 90 ? 'border-emerald-500' : su.matchRate >= 70 ? 'border-amber-400' : 'border-red-400' },
            ].map(c => (
              <div key={c.label} className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${c.color}`}>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{c.label}</p>
                <p className={`text-xl font-extrabold mt-1 ${c.valueCls ?? 'text-gray-900'}`}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm font-bold text-gray-700 mb-3">Composição</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={[{ name: 'Líquido', value: su.totalExpectedNet }, { name: 'Taxas', value: su.totalFees }]} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip formatter={(v: number) => fmtBRL(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm font-bold text-gray-700 mb-3">Esperado × Recebido por data</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={(() => {
                  const m: Record<string, { exp: number; act: number }> = {}
                  for (const item of results.matched) {
                    const k = fmtDate(item.sale.date)
                    if (!m[k]) m[k] = { exp: 0, act: 0 }
                    m[k].exp += item.expectedNet; m[k].act += item.actualNet
                  }
                  return Object.entries(m).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>({ date: k, esperado: +v.exp.toFixed(2), recebido: +v.act.toFixed(2) }))
                })()}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => 'R$'+v} />
                  <Tooltip formatter={(v: number) => fmtBRL(v)} />
                  <Legend />
                  <Bar dataKey="esperado" fill="#6366f1" radius={[3,3,0,0]} />
                  <Bar dataKey="recebido" fill="#10b981" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Matched table */}
          <ResultsTable
            title={`✅ Conciliadas (${results.matched.length})`}
            empty="Nenhuma transação conciliada"
            head={['Pedido','Data','Produto','Bruto','Taxas','Liq. Esp.','Recebido','Diferença','Status']}
            rows={results.matched.map(m => {
              const d = m.difference
              return [
                <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded" key="id">{m.sale.order_id}</code>,
                fmtDate(m.sale.date),
                <span title={m.sale.product} key="p">{m.sale.product.slice(0,22)}{m.sale.product.length>22?'…':''}</span>,
                fmtBRL(m.sale.gross),
                <span className="text-red-500" key="f">{fmtBRL(m.fees)}</span>,
                fmtBRL(m.expectedNet),
                fmtBRL(m.actualNet),
                <span className={d < -0.01 ? 'text-red-600 font-semibold' : d > 0.01 ? 'text-amber-600 font-semibold' : 'text-gray-400'} key="d">
                  {d >= 0 ? '+' : ''}{fmtBRL(d)}
                </span>,
                <Badge key="s" status={m.status === 'ok' ? 'ok' : 'div'} />,
              ]
            })}
          />

          {/* Unmatched sales */}
          <ResultsTable
            title={`⚠️ Sem depósito (${results.unmatchedSales.length})`}
            empty="Todas as vendas foram conciliadas ✅"
            head={['Pedido','Data','Produto','Bruto','Taxas','Liq. Esp.','Prazo','Status']}
            rows={results.unmatchedSales.map(u => [
              <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded" key="id">{u.sale.order_id}</code>,
              fmtDate(u.sale.date),
              u.sale.product.slice(0,25),
              fmtBRL(u.sale.gross),
              <span className="text-red-500" key="f">{fmtBRL(u.sale.fee)}</span>,
              fmtBRL(u.sale.expectedNet),
              u.sale.date ? `até ${fmtDate(new Date(u.sale.date.getTime() + fees.window * 864e5))}` : '—',
              <Badge key="s" status="pend" />,
            ])}
          />

          {/* Unmatched bank */}
          <ResultsTable
            title={`🏦 Depósitos sem venda (${results.unmatchedBank.filter(u => u.bank.credit > 0).length})`}
            empty="Nenhum depósito extra ✅"
            head={['Data','Descrição','Crédito','Status']}
            rows={results.unmatchedBank.filter(u => u.bank.credit > 0).map(u => [
              fmtDate(u.bank.date),
              u.bank.description,
              <span className="text-emerald-600 font-semibold" key="c">{fmtBRL(u.bank.credit)}</span>,
              <Badge key="s" status="extra" />,
            ])}
          />

          {/* Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            {saveErr && <p className="text-red-600 text-sm mb-3">{saveErr}</p>}
            <div className="flex flex-wrap gap-3">
              <button onClick={saveReconciliation} disabled={saving} className="bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors">
                {saving ? 'Salvando…' : '💾 Salvar conciliação'}
              </button>
              <button onClick={exportCSV} className="bg-emerald-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors">
                ⬇️ Exportar CSV
              </button>
              <button onClick={() => setStep(2)} className="text-sm text-gray-600 font-semibold px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                ← Novo upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Reusable table ───────────────────────────────────────────────────────────
function ResultsTable({ title, empty, head, rows }: {
  title: string; empty: string; head: string[]
  rows: (React.ReactNode | string)[][]
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-800">{title}</h3>
      </div>
      {rows.length === 0 ? (
        <p className="text-center py-8 text-sm text-gray-400">{empty}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>{head.map(h => <th key={h} className="px-5 py-2.5 text-left font-bold">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50/50">
                  {row.map((cell, j) => <td key={j} className="px-5 py-2.5 text-gray-700">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Badge({ status }: { status: 'ok'|'div'|'pend'|'extra' }) {
  const map = {
    ok:    'bg-emerald-100 text-emerald-700',
    div:   'bg-amber-100   text-amber-700',
    pend:  'bg-red-100     text-red-700',
    extra: 'bg-blue-100    text-blue-700',
  }
  const label = { ok: '✓ OK', div: '⚠ Divergência', pend: '⏳ Pendente', extra: '🔍 Sem venda' }
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${map[status]}`}>{label[status]}</span>
}
