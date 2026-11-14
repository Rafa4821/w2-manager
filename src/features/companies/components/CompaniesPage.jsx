import { Building2 } from 'lucide-react'
import { PageHeader, EmptyState } from '../../../shared/components'

export function CompaniesPage() {
  return (
    <div>
      <PageHeader
        title="Companies"
        description="Manage employer information and EIN details"
      />
      <EmptyState
        icon={Building2}
        title="No Companies Yet"
        description="Add your first company to start managing W2 documents."
      />
    </div>
  )
}
