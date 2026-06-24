'use client'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { fmtBRL } from '@/lib/utils'

interface MonthData {
  month: string
  gross: number
  fees: number
  net: number
  count: number
}

export default function MonthlyChart({ data }: { data: MonthData[] }) {
  if (data.length === 0) return null
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
      <h2 className="font-bold text-gray-800 mb-4">Evolução mensal</h2>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="gGross" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
            </linearGradient>
            <linearGradient id="gNet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2}  />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}    />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={v => 'R$' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v)} />
          <Tooltip formatter={(v: number, name: string) => [fmtBRL(v), name === 'gross' ? 'Bruto' : name === 'fees' ? 'Taxas' : 'Líquido']} />
          <Legend formatter={v => v === 'gross' ? 'Bruto' : v === 'fees' ? 'Taxas' : 'Líquido'} />
          <Area type="monotone" dataKey="gross" stroke="#6366f1" fill="url(#gGross)" strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="fees"  stroke="#ef4444" fill="none"          strokeWidth={2} dot={false} strokeDasharray="4 2" />
          <Area type="monotone" dataKey="net"   stroke="#10b981" fill="url(#gNet)"    strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
