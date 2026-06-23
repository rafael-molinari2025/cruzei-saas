import ReconciliationWizard from '@/components/reconciliation/wizard'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Nova conciliação' }

export default function NovaPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nova conciliação</h1>
      <ReconciliationWizard />
    </div>
  )
}
