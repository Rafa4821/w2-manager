import { ArrowDownUp } from 'lucide-react'
import { PageHeader, EmptyState } from '../../../shared/components'

export function DataImportExportPage() {
  return (
    <div>
      <PageHeader
        title="Data Import / Export"
        description="Import and export data in various formats"
      />
      <EmptyState
        icon={ArrowDownUp}
        title="Import & Export"
        description="Import data from CSV/JSON or export your records."
      />
    </div>
  )
}
