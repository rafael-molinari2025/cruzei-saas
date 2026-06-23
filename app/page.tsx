import Link from 'next/link'

const features = [
  { icon: '📋', title: 'Upload de CSV', desc: 'Importe o relatório de vendas e o extrato bancário de qualquer marketplace.' },
  { icon: '🔄', title: 'Cruzamento automático', desc: 'Algoritmo inteligente cruza vendas × depósitos com tolerância de data e valor.' },
  { icon: '📊', title: 'Relatório completo', desc: 'Veja exatamente o que conciliou, o que divergiu e o que ainda está pendente.' },
  { icon: '💾', title: 'Histórico persistente', desc: 'Todas as conciliações ficam salvas. Compare meses, acompanhe tendências.' },
]

const marketplaces = ['Shopee', 'Etsy', 'Mercado Livre', 'Amazon', 'Personalizado']

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-bold text-lg text-primary-600 tracking-tight">✕ Cruzei</span>
          <div className="flex items-center gap-3">
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
            <Link href="/auth/entrar" className="border-2 border-white/40 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors text-base">
              Já tenho conta
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

      {/* Features */}
      <section className="py-20 px-6">
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

      {/* CTA */}
      <section className="py-16 px-6 bg-primary-600">
        <div className="max-w-xl mx-auto text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Pronto para cruzar seus dados?</h2>
          <p className="text-white/80 mb-8">Crie sua conta grátis e faça a primeira conciliação em menos de 2 minutos.</p>
          <Link href="/auth/cadastro" className="bg-white text-primary-700 font-bold px-8 py-3.5 rounded-xl hover:bg-primary-50 transition-colors inline-block">
            Começar agora →
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-8 px-6 text-center text-sm mt-auto">
        <p>© 2026 Cruzei · Conciliação Financeira para Marketplace</p>
      </footer>
    </div>
  )
}
