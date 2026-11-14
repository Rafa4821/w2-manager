import { FileText } from 'lucide-react'
import { PageHeader, EmptyState } from '../../../shared/components'

export function W2DocumentsPage() {
  return (
    <div>
      <PageHeader
        title="W2 Documents"
        description="Create and manage W2 tax documents"
      />
      <EmptyState
        icon={FileText}
        title="No W2 Documents Yet"
        description="Create W2 documents for your employees."
      />
    </div>
  )
}
