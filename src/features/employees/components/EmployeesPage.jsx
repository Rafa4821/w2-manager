import { Users } from 'lucide-react'
import { PageHeader, EmptyState } from '../../../shared/components'

export function EmployeesPage() {
  return (
    <div>
      <PageHeader
        title="Employees"
        description="Manage employee records and personal information"
      />
      <EmptyState
        icon={Users}
        title="No Employees Yet"
        description="Add employees to start generating W2 documents."
      />
    </div>
  )
}
