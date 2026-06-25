import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Política de Privacidade — Cruzei' }

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg text-primary-600 tracking-tight">✕ Cruzei</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-14">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Política de Privacidade</h1>
        <p className="text-sm text-gray-400 mb-10">Última atualização: 25 de junho de 2026</p>

        <div className="space-y-8 text-sm text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">1. Quem somos</h2>
            <p>O Cruzei (<strong>cruzei.primetitec.com.br</strong>) é um serviço de conciliação financeira para vendedores de marketplace, operado sob responsabilidade do titular da conta <strong>sm.servicosetecnologia@gmail.com</strong>. Esta política descreve como coletamos, usamos e protegemos seus dados, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018).</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">2. Dados que coletamos</h2>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li><strong>Dados de cadastro:</strong> nome completo e endereço de e-mail fornecidos no momento do registro.</li>
              <li><strong>Dados de pagamento:</strong> processados diretamente pela Stripe. O Cruzei não armazena números de cartão.</li>
              <li><strong>Dados de uso:</strong> resultados das conciliações (valores, datas, taxas, status de conciliação). Os arquivos CSV originais não são armazenados — são processados localmente no seu navegador.</li>
              <li><strong>Dados técnicos:</strong> endereço IP e dados de sessão necessários para autenticação segura.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">3. Como usamos seus dados</h2>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>Prestação do serviço de conciliação e manutenção do histórico de resultados.</li>
              <li>Gestão da assinatura e cobranças recorrentes via Stripe.</li>
              <li>Comunicações sobre o serviço (atualizações, manutenções, suporte).</li>
              <li>Cumprimento de obrigações legais.</li>
            </ul>
            <p className="mt-3">Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins de marketing.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">4. Compartilhamento de dados</h2>
            <p>Seus dados podem ser compartilhados apenas com:</p>
            <ul className="list-disc list-inside space-y-2 pl-2 mt-2">
              <li><strong>Supabase</strong> — infraestrutura de banco de dados e autenticação (servidores na UE/EUA com adequação à GDPR).</li>
              <li><strong>Stripe</strong> — processamento de pagamentos (certificado PCI DSS nível 1).</li>
              <li><strong>Vercel</strong> — hospedagem da aplicação.</li>
            </ul>
            <p className="mt-3">Todos os fornecedores são vinculados contratualmente à proteção dos dados.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">5. Segurança</h2>
            <p>Utilizamos criptografia em trânsito (HTTPS/TLS) e em repouso. O acesso aos dados é restrito à conta do próprio usuário via Row Level Security no banco de dados. Senhas não são armazenadas em texto puro.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">6. Seus direitos (LGPD)</h2>
            <p>Como titular dos dados, você tem direito a:</p>
            <ul className="list-disc list-inside space-y-2 pl-2 mt-2">
              <li>Confirmar a existência do tratamento e acessar seus dados.</li>
              <li>Solicitar correção de dados incompletos ou inexatos.</li>
              <li>Solicitar a exclusão dos seus dados pessoais.</li>
              <li>Revogar o consentimento a qualquer momento.</li>
              <li>Portabilidade dos dados.</li>
            </ul>
            <p className="mt-3">Para exercer qualquer desses direitos, entre em contato pelo e-mail <a href="mailto:sm.servicosetecnologia@gmail.com" className="text-primary-600 underline">sm.servicosetecnologia@gmail.com</a>. Responderemos em até 15 dias úteis.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">7. Retenção de dados</h2>
            <p>Seus dados são mantidos enquanto sua conta estiver ativa. Após o cancelamento, os dados são excluídos em até 90 dias, salvo obrigação legal de retenção.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">8. Cookies</h2>
            <p>O Cruzei utiliza cookies de sessão estritamente necessários para autenticação. Não utilizamos cookies de rastreamento ou publicidade.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">9. Alterações nesta política</h2>
            <p>Mudanças relevantes serão comunicadas por e-mail com antecedência mínima de 15 dias. A versão vigente é sempre a publicada nesta página.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">10. Contato e encarregado (DPO)</h2>
            <p>Dúvidas ou solicitações relacionadas à privacidade: <a href="mailto:sm.servicosetecnologia@gmail.com" className="text-primary-600 underline">sm.servicosetecnologia@gmail.com</a>.</p>
          </section>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-6 px-6 text-xs text-center mt-10">
        <p>© 2026 Cruzei · <Link href="/termos" className="hover:text-white">Termos de Uso</Link></p>
      </footer>
    </div>
  )
}
