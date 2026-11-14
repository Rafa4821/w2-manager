import { LayoutDashboard } from 'lucide-react'
import { PageHeader, EmptyState } from '../../../shared/components'

export function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your W2 management system"
      />
      <EmptyState
        icon={LayoutDashboard}
        title="Dashboard"
        description="Summary statistics and quick actions will appear here."
      />
    </div>
  )
}
