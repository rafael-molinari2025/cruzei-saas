import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Como funciona — Cruzei' }

const steps = [
  {
    num: '01',
    title: 'Faça upload dos seus arquivos',
    desc: 'Exporte o relatório de vendas do marketplace (Shopee, Mercado Livre, Etsy, Amazon) e o extrato bancário do mesmo período. Arraste e solte no Cruzei — nenhum programa extra necessário.',
    mock: (
      <div className="bg-white rounded-xl shadow border border-gray-100 p-5">
        <p className="text-xs font-bold text-gray-400 uppercase mb-3">Upload de arquivos</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="border-2 border-dashed border-primary-300 rounded-xl p-4 text-center bg-primary-50">
            <div className="text-2xl mb-1">📋</div>
            <p className="text-xs font-bold text-primary-700">Relatório de vendas</p>
            <p className="text-xs text-gray-400 mt-0.5">vendas_maio.csv</p>
          </div>
          <div className="border-2 border-dashed border-emerald-300 rounded-xl p-4 text-center bg-emerald-50">
            <div className="text-2xl mb-1">🏦</div>
            <p className="text-xs font-bold text-emerald-700">Extrato bancário</p>
            <p className="text-xs text-gray-400 mt-0.5">extrato_maio.csv</p>
          </div>
        </div>
        <div className="mt-3 bg-gray-50 rounded-lg px-4 py-2.5 flex items-center gap-2">
          <span className="text-sm">🛍</span>
          <span className="text-xs font-medium text-gray-600">Marketplace: Shopee</span>
        </div>
      </div>
    ),
  },
  {
    num: '02',
    title: 'Configure as taxas do marketplace',
    desc: 'Informe os percentuais de comissão e taxa de pagamento do seu marketplace. O Cruzei calcula automaticamente o líquido esperado de cada venda para comparar com os depósitos.',
    mock: (
      <div className="bg-white rounded-xl shadow border border-gray-100 p-5">
        <p className="text-xs font-bold text-gray-400 uppercase mb-3">Configuração de taxas</p>
        <div className="space-y-2.5">
          {[
            { label: 'Comissão Shopee', value: '14%' },
            { label: 'Taxa de pagamento', value: '2%' },
            { label: 'Janela de dias', value: '5 dias' },
            { label: 'Modo', value: 'Batch (N→1)' },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between text-xs py-2 border-b border-gray-50 last:border-0">
              <span className="text-gray-500">{r.label}</span>
              <span className="font-bold text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded-lg">{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    num: '03',
    title: 'O algoritmo cruza tudo em segundos',
    desc: 'O Cruzei compara cada venda com o depósito correspondente, considerando taxas, datas e agrupamentos de N vendas em 1 depósito — comum em Shopee e Mercado Livre.',
    mock: (
      <div className="bg-white rounded-xl shadow border border-gray-100 p-5">
        <p className="text-xs font-bold text-gray-400 uppercase mb-3">Processando...</p>
        <div className="space-y-2">
          {[
            { id: '#4521', valor: 'R$ 89,90', status: 'conciliado', color: 'bg-emerald-100 text-emerald-700' },
            { id: '#4522', valor: 'R$ 45,00', status: 'divergência', color: 'bg-amber-100 text-amber-700' },
            { id: '#4523', valor: 'R$ 127,50', status: 'conciliado', color: 'bg-emerald-100 text-emerald-700' },
            { id: '#4524', valor: 'R$ 33,00', status: 'pendente', color: 'bg-red-100 text-red-700' },
          ].map(r => (
            <div key={r.id} className="flex items-center justify-between text-xs py-1.5">
              <span className="font-mono text-gray-500">{r.id}</span>
              <span className="font-semibold text-gray-800">{r.valor}</span>
              <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${r.color}`}>{r.status}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
          <span className="text-gray-400">Taxa de conciliação</span>
          <span className="font-extrabold text-emerald-600 text-sm">75%</span>
        </div>
      </div>
    ),
  },
  {
    num: '04',
    title: 'Analise o relatório e exporte',
    desc: 'Visualize em detalhes o que foi pago corretamente, o que chegou com divergência de valor e o que ainda não foi depositado. Exporte tudo para Excel com um clique.',
    mock: (
      <div className="bg-white rounded-xl shadow border border-gray-100 p-5">
        <p className="text-xs font-bold text-gray-400 uppercase mb-3">Resumo da conciliação</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Conciliadas', val: '38', color: 'border-emerald-500 text-emerald-700' },
            { label: 'Divergências', val: '7', color: 'border-amber-500 text-amber-700' },
            { label: 'Pendentes', val: '5', color: 'border-red-400 text-red-700' },
          ].map(c => (
            <div key={c.label} className={`border-l-4 ${c.color} pl-2 py-1`}>
              <p className={`text-xl font-extrabold ${c.color.split(' ')[1]}`}>{c.val}</p>
              <p className="text-xs text-gray-400">{c.label}</p>
            </div>
          ))}
        </div>
        <button className="w-full bg-primary-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-primary-700 transition-colors">
          ⬇ Exportar CSV
        </button>
      </div>
    ),
  },
]

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg text-primary-600 tracking-tight">✕ Cruzei</Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/entrar" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Entrar</Link>
            <Link href="/auth/cadastro" className="text-sm bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-semibold">
              Começar grátis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 to-violet-600 text-white py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
            🎬 Tour do produto
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">Veja o Cruzei funcionando</h1>
          <p className="text-white/80 text-lg">
            Da importação do CSV ao relatório final — em menos de 2 minutos.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="space-y-16">
          {steps.map((step, i) => (
            <div
              key={step.num}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center ${i % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}
            >
              {/* Text */}
              <div className={i % 2 === 1 ? 'lg:col-start-2' : ''}>
                <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
                  Passo {step.num}
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-3">{step.title}</h2>
                <p className="text-gray-500 leading-relaxed">{step.desc}</p>
              </div>

              {/* Mock */}
              <div className={`bg-gray-100 rounded-2xl p-6 ${i % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                {step.mock}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Depoimento fictício / prova social */}
      <section className="bg-white border-y border-gray-100 py-14 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-2xl font-bold text-gray-900 mb-6">
            &ldquo;Antes eu ficava horas tentando fechar o mês no Excel.<br/>
            Agora faço em 2 minutos.&rdquo;
          </p>
          <p className="text-sm text-gray-400 font-medium">Vendedor de marketplace · Shopee + Mercado Livre</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-primary-600 text-center">
        <div className="max-w-xl mx-auto text-white">
          <h2 className="text-2xl font-bold mb-3">Pronto para experimentar?</h2>
          <p className="text-white/80 mb-8">Crie sua conta e faça a primeira conciliação grátis. Sem cartão de crédito.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/cadastro" className="bg-white text-primary-700 font-bold px-8 py-3.5 rounded-xl hover:bg-primary-50 transition-colors">
              Criar conta gratuita →
            </Link>
            <Link href="/planos" className="border-2 border-white/40 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors">
              Ver planos e preços
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-8 px-6 text-sm text-center">
        <div className="flex gap-6 justify-center flex-wrap">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/planos" className="hover:text-white transition-colors">Planos</Link>
          <Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
          <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
        </div>
        <p className="mt-4">© 2026 Cruzei · Conciliação Financeira para Marketplace</p>
      </footer>
    </div>
  )
}
