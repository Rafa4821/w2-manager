import { Library } from 'lucide-react'
import { PageHeader, EmptyState } from '../../../shared/components'

export function TemplateLibraryPage() {
  return (
    <div>
      <PageHeader
        title="Template Library"
        description="Browse and manage W2 document templates"
      />
      <EmptyState
        icon={Library}
        title="No Templates Yet"
        description="Templates for W2 documents will be available here."
      />
    </div>
  )
}
