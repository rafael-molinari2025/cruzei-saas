import Link from 'next/link'

const features = [
  { icon: '📋', title: 'Upload de CSV', desc: 'Importe o relatório de vendas e o extrato bancário de qualquer marketplace em segundos.' },
  { icon: '🔄', title: 'Cruzamento automático', desc: 'Algoritmo inteligente cruza vendas × depósitos com tolerância de data e valor.' },
  { icon: '📊', title: 'Relatório completo', desc: 'Veja exatamente o que conciliou, o que divergiu e o que ainda está pendente.' },
  { icon: '💾', title: 'Histórico persistente', desc: 'Todas as conciliações ficam salvas. Compare meses, acompanhe tendências.' },
]

const steps = [
  { num: '1', title: 'Faça upload dos CSVs', desc: 'Exporte o relatório de vendas do marketplace e o extrato bancário. Arraste e solte no Cruzei.' },
  { num: '2', title: 'Cruzamento em segundos', desc: 'Nosso algoritmo compara cada venda com o depósito correspondente, considerando taxas e datas.' },
  { num: '3', title: 'Analise e exporte', desc: 'Veja o que foi pago, o que divergiu e o que está pendente. Exporte para Excel com um clique.' },
]

const faqs = [
  {
    q: 'Quais marketplaces são compatíveis?',
    a: 'Shopee, Mercado Livre, Etsy, Amazon e qualquer marketplace que exporte CSV. O Cruzei aceita colunas em português e inglês automaticamente.',
  },
  {
    q: 'Meus dados ficam seguros?',
    a: 'Sim. Cada conta só acessa os próprios dados — segurança garantida pelo Supabase com Row Level Security. Seus CSVs são processados no navegador e nunca ficam em disco no servidor.',
  },
  {
    q: 'Preciso instalar algum programa?',
    a: 'Não. O Cruzei é 100% web — funciona em qualquer navegador moderno, no computador ou no celular.',
  },
  {
    q: 'Posso cancelar quando quiser?',
    a: 'Sim. Cancele a qualquer momento pelo portal de assinatura dentro do próprio sistema. Sem fidelidade, sem multa.',
  },
  {
    q: 'O que é modo batch vs. individual?',
    a: 'Individual cruza 1 venda ↔ 1 depósito. Batch agrupa várias vendas que chegam num único depósito — comum em Shopee e Mercado Livre.',
  },
]

const marketplaces = ['Shopee', 'Etsy', 'Mercado Livre', 'Amazon', 'Personalizado']

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-bold text-lg text-primary-600 tracking-tight">✕ Cruzei</span>
          <div className="flex items-center gap-4">
            <Link href="#precos" className="text-sm text-gray-600 hover:text-gray-900 font-medium hidden sm:block">Preços</Link>
            <Link href="#faq" className="text-sm text-gray-600 hover:text-gray-900 font-medium hidden sm:block">FAQ</Link>
            <Link href="/auth/entrar" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Entrar</Link>
            <Link href="/auth/cadastro" className="text-sm bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-semibold">
              Começar grátis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-violet-600 text-white py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            🚀 Conciliação para vendedores de marketplace
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-5 leading-tight">
            Cruzei meus dados.<br/>Sei o que recebi.
          </h1>
          <p className="text-xl text-white/80 mb-10 max-w-xl mx-auto">
            Cruze o relatório de vendas do marketplace com o extrato bancário e descubra exatamente o que foi pago, o que divergiu e o que ainda está pendente.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/cadastro" className="bg-white text-primary-700 font-bold px-8 py-3.5 rounded-xl hover:bg-primary-50 transition-colors text-base shadow-lg">
              Criar conta gratuita →
            </Link>
            <Link href="#como-funciona" className="border-2 border-white/40 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors text-base">
              Ver como funciona
            </Link>
          </div>
        </div>
      </section>

      {/* Marketplaces */}
      <div className="bg-gray-50 border-b border-gray-200 py-4">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-center gap-6 flex-wrap">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Compatível com</span>
          {marketplaces.map(mp => (
            <span key={mp} className="text-sm font-semibold text-gray-600">{mp}</span>
          ))}
        </div>
      </div>

      {/* Como funciona */}
      <section id="como-funciona" className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Como funciona</h2>
          <p className="text-center text-gray-500 mb-14">Concilie um mês inteiro de vendas em menos de 2 minutos.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map(s => (
              <div key={s.num} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary-600 text-white font-extrabold text-xl flex items-center justify-center mx-auto mb-4">
                  {s.num}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-14">
            Tudo que você precisa para fechar o mês
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preços */}
      <section id="precos" className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Preços simples e transparentes</h2>
          <p className="text-center text-gray-500 mb-14">Sem taxas ocultas. Cancele quando quiser.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Starter */}
            <div className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Starter</h3>
              <p className="text-sm text-gray-500 mt-1">Para vendedores individuais</p>
              <p className="text-4xl font-extrabold text-gray-900 mt-4">R$ 49<span className="text-lg font-normal text-gray-400">/mês</span></p>
              <ul className="mt-6 space-y-3 text-sm text-gray-700">
                {['1 marketplace conectado', 'Conciliações ilimitadas', 'Histórico completo', 'Exportação CSV', 'Suporte por e-mail'].map(f => (
                  <li key={f} className="flex items-center gap-2.5"><span className="text-emerald-500 font-bold">✓</span> {f}</li>
                ))}
              </ul>
              <Link href="/auth/cadastro" className="mt-8 block w-full text-center bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors">
                Começar agora →
              </Link>
            </div>
            {/* Pro */}
            <div className="bg-primary-600 rounded-2xl p-8 border-2 border-primary-600 relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-white text-primary-700 text-xs font-bold px-4 py-1.5 rounded-full">
                Mais popular
              </div>
              <h3 className="text-xl font-bold text-white">Pro</h3>
              <p className="text-sm text-white/70 mt-1">Para múltiplos canais</p>
              <p className="text-4xl font-extrabold text-white mt-4">R$ 99<span className="text-lg font-normal text-white/60">/mês</span></p>
              <ul className="mt-6 space-y-3 text-sm text-white/90">
                {['Todos os marketplaces', 'Conciliações ilimitadas', 'Importação automática via API', 'Dashboard de tendências', 'Exportação CSV', 'Suporte prioritário'].map(f => (
                  <li key={f} className="flex items-center gap-2.5"><span className="text-white font-bold">✓</span> {f}</li>
                ))}
              </ul>
              <Link href="/auth/cadastro" className="mt-8 block w-full text-center bg-white text-primary-700 font-bold py-3 rounded-xl hover:bg-primary-50 transition-colors">
                Começar agora →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-14">Perguntas frequentes</h2>
          <div className="space-y-4">
            {faqs.map(item => (
              <div key={item.q} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 px-6 bg-primary-600">
        <div className="max-w-xl mx-auto text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Pronto para cruzar seus dados?</h2>
          <p className="text-white/80 mb-8">Crie sua conta grátis e faça a primeira conciliação em menos de 2 minutos.</p>
          <Link href="/auth/cadastro" className="bg-white text-primary-700 font-bold px-8 py-3.5 rounded-xl hover:bg-primary-50 transition-colors inline-block">
            Começar agora →
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-8 px-6 text-sm mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Cruzei · Conciliação Financeira para Marketplace</p>
          <div className="flex gap-6">
            <Link href="/planos" className="hover:text-white transition-colors">Planos</Link>
            <Link href="/auth/entrar" className="hover:text-white transition-colors">Entrar</Link>
            <Link href="/auth/cadastro" className="hover:text-white transition-colors">Criar conta</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
