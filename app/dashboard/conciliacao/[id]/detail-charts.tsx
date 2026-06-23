'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { fmtBRL, fmtDate } from '@/lib/utils'
import type { DBReconciliationItem } from '@/lib/engine/types'

export default function DetailCharts({ items }: { items: DBReconciliationItem[] }) {
  const byDate: Record<string, { exp: number; act: number }> = {}
  for (const item of items) {
    const k = item.sale_date ? fmtDate(new Date(item.sale_date + 'T00:00:00')) : '—'
    if (!byDate[k]) byDate[k] = { exp: 0, act: 0 }
    byDate[k].exp += item.expected_net ?? 0
    byDate[k].act += item.actual_net ?? 0
  }
  const barData = Object.entries(byDate)
    .sort(([a],[b]) => a.localeCompare(b))
    .map(([k, v]) => ({ date: k, esperado: +v.exp.toFixed(2), recebido: +v.act.toFixed(2) }))

  const totalExp = items.reduce((a, i) => a + (i.expected_net ?? 0), 0)
  const totalFee = items.reduce((a, i) => a + (i.fees ?? 0), 0)
  const pieData = [
    { name: 'Líquido', value: +totalExp.toFixed(2) },
    { name: 'Taxas',   value: +totalFee.toFixed(2) },
  ]

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <p className="text-sm font-bold text-gray-700 mb-3">Composição</p>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
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
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={barData}>
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={v => 'R$' + v} />
            <Tooltip formatter={(v: number) => fmtBRL(v)} />
            <Legend />
            <Bar dataKey="esperado" fill="#6366f1" radius={[3,3,0,0]} />
            <Bar dataKey="recebido" fill="#10b981" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
