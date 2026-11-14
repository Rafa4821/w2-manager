import { Printer } from 'lucide-react'
import { PageHeader, EmptyState } from '../../../shared/components'

export function PdfGeneratorPage() {
  return (
    <div>
      <PageHeader
        title="PDF Generator"
        description="Generate and download W2 documents as PDF"
      />
      <EmptyState
        icon={Printer}
        title="PDF Generator"
        description="Select documents to generate PDF files."
      />
    </div>
  )
}
