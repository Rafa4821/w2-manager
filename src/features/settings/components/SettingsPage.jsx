import { Settings } from 'lucide-react'
import { PageHeader, EmptyState } from '../../../shared/components'

export function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Configure application preferences"
      />
      <EmptyState
        icon={Settings}
        title="Settings"
        description="Application settings and preferences will be configured here."
      />
    </div>
  )
}
