import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Termos de Uso — Cruzei' }

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg text-primary-600 tracking-tight">✕ Cruzei</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-14">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Termos de Uso</h1>
        <p className="text-sm text-gray-400 mb-10">Última atualização: 25 de junho de 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-sm text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">1. Aceitação dos termos</h2>
            <p>Ao criar uma conta ou utilizar o Cruzei (<strong>cruzei.primetitec.com.br</strong>), você concorda com estes Termos de Uso. Caso não concorde, não utilize o serviço.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">2. O serviço</h2>
            <p>O Cruzei é uma plataforma SaaS de conciliação financeira destinada a vendedores de marketplaces. O serviço permite o cruzamento de relatórios de vendas com extratos bancários para identificação de divergências e pendências de pagamento.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">3. Cadastro e conta</h2>
            <p>Você deve fornecer informações verdadeiras no cadastro. É responsabilidade do usuário manter a senha em sigilo. O Cruzei não se responsabiliza por acessos indevidos decorrentes de negligência do usuário com suas credenciais.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">4. Assinatura e pagamento</h2>
            <p>O acesso às funcionalidades do Cruzei está condicionado à contratação de um dos planos disponíveis (Starter ou Pro). Os pagamentos são processados pela Stripe, Inc. O valor é cobrado mensalmente na data de renovação. O cancelamento pode ser feito a qualquer momento pelo portal de assinatura dentro do sistema, sem multa ou fidelidade.</p>
            <p className="mt-2">Em caso de cancelamento, o acesso permanece ativo até o fim do período pago.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">5. Uso aceitável</h2>
            <p>É vedado ao usuário: (a) compartilhar credenciais de acesso com terceiros; (b) utilizar o serviço para fins ilícitos; (c) tentar acessar dados de outros usuários; (d) realizar engenharia reversa, copiar ou redistribuir o software.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">6. Dados e arquivos</h2>
            <p>Os arquivos CSV enviados são processados no navegador do usuário e não ficam armazenados em servidores do Cruzei. Os resultados das conciliações (valores agregados, não os arquivos originais) são salvos vinculados à conta do usuário para formação do histórico.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">7. Limitação de responsabilidade</h2>
            <p>O Cruzei é uma ferramenta de apoio à gestão financeira. Os resultados apresentados dependem da qualidade e veracidade dos arquivos fornecidos pelo usuário. O Cruzei não substitui assessoria contábil ou financeira profissional e não se responsabiliza por decisões tomadas com base nos dados gerados pela plataforma.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">8. Disponibilidade</h2>
            <p>O Cruzei se empenha em manter o serviço disponível, mas não garante disponibilidade ininterrupta. Manutenções programadas serão comunicadas com antecedência sempre que possível.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">9. Alterações nos termos</h2>
            <p>Estes termos podem ser atualizados periodicamente. Alterações relevantes serão comunicadas por e-mail com pelo menos 15 dias de antecedência. O uso contínuo do serviço após a vigência das alterações implica aceitação dos novos termos.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">10. Contato</h2>
            <p>Dúvidas sobre estes termos podem ser enviadas para <a href="mailto:sm.servicosetecnologia@gmail.com" className="text-primary-600 underline">sm.servicosetecnologia@gmail.com</a>.</p>
          </section>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-6 px-6 text-xs text-center mt-10">
        <p>© 2026 Cruzei · <Link href="/privacidade" className="hover:text-white">Política de Privacidade</Link></p>
      </footer>
    </div>
  )
}
