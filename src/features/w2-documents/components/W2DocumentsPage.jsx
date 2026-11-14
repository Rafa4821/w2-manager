import { useState, useMemo } from 'react'
import { FileText, Eye, Download, DollarSign } from 'lucide-react'
import { PageHeader, DataTable, Badge, FilterBar, StatCard } from '../../../shared/components'
import { mockDocuments, mockCompanies } from '../../../shared/data'
import { useNotificationStore } from '../../../shared/store'
import { DocumentDetailModal } from './DocumentDetailModal'

export function W2DocumentsPage() {
  const [documents] = useState(mockDocuments)
  const [detailDoc, setDetailDoc] = useState(null)
  const [filters, setFilters] = useState({ status: '', companyId: '', taxYear: '' })
  const addNotification = useNotificationStore((s) => s.addNotification)

  const filteredDocs = useMemo(() => {
    return documents.filter((d) => {
      if (filters.status && d.status !== filters.status) return false
      if (filters.companyId && d.companyId !== filters.companyId) return false
      if (filters.taxYear && String(d.taxYear) !== filters.taxYear) return false
      return true
    })
  }, [documents, filters])

  const completedCount = documents.filter((d) => d.status === 'completed').length
  const pendingCount = documents.filter((d) => d.status === 'pending').length
  const totalWages = documents.reduce((sum, d) => sum + d.wagesTips, 0)

  const fmt = (n) => `$${(n / 1000).toFixed(0)}K`

  const columns = [
    {
      header: 'Employee',
      accessor: 'employeeName',
      render: (row) => (
        <div className="tw:flex tw:items-center tw:gap-3">
          <div className="tw:flex tw:items-center tw:justify-center tw:h-9 tw:w-9 tw:rounded-lg tw:bg-indigo-50 tw:flex-shrink-0">
            <FileText className="tw:h-4 tw:w-4 tw:text-indigo-500" />
          </div>
          <div>
            <p className="tw:font-medium tw:text-gray-900">{row.employeeName}</p>
            <p className="tw:text-xs tw:text-gray-500">{row.companyName}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Tax Year',
      accessor: 'taxYear',
      render: (row) => <span className="tw:font-medium tw:text-gray-700">{row.taxYear}</span>,
    },
    {
      header: 'Wages',
      accessor: 'wagesTips',
      render: (row) => (
        <span className="tw:font-medium tw:text-gray-900">
          ${row.wagesTips.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Fed. Tax',
      accessor: 'federalTaxWithheld',
      render: (row) => (
        <span className="tw:text-gray-600">
          ${row.federalTaxWithheld.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge variant={row.status}>{row.status}</Badge>,
    },
    {
      header: 'Updated',
      accessor: 'updatedAt',
      render: (row) => <span className="tw:text-gray-500 tw:text-xs">{row.updatedAt}</span>,
    },
    {
      header: '',
      accessor: 'actions',
      sortable: false,
      searchable: false,
      className: 'tw:w-24 tw:text-right',
      render: (row) => (
        <div className="tw:flex tw:items-center tw:justify-end tw:gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setDetailDoc(row) }}
            className="tw:p-1.5 tw:rounded-md tw:text-gray-400 hover:tw:text-indigo-600 hover:tw:bg-indigo-50 tw:transition"
            title="View"
          >
            <Eye className="tw:h-4 tw:w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              addNotification({ type: 'info', title: 'Download', message: `PDF for ${row.employeeName} would be generated here.` })
            }}
            className="tw:p-1.5 tw:rounded-md tw:text-gray-400 hover:tw:text-emerald-600 hover:tw:bg-emerald-50 tw:transition"
            title="Download PDF"
          >
            <Download className="tw:h-4 tw:w-4" />
          </button>
        </div>
      ),
    },
  ]

  const uniqueYears = [...new Set(documents.map((d) => String(d.taxYear)))].sort().reverse()

  return (
    <div>
      <PageHeader title="W2 Documents" description="Create and manage W2 tax documents" />

      {/* Quick stats */}
      <div className="tw:grid tw:grid-cols-2 lg:tw:grid-cols-4 tw:gap-4 tw:mb-6">
        <StatCard title="Total Documents" value={documents.length} icon={FileText} color="indigo" />
        <StatCard title="Completed" value={completedCount} color="green" />
        <StatCard title="Pending Review" value={pendingCount} color="amber" />
        <StatCard title="Total Wages" value={fmt(totalWages)} icon={DollarSign} color="blue" />
      </div>

      <FilterBar
        filters={[
          { name: 'status', label: 'All Status', options: [
            { value: 'completed', label: 'Completed' },
            { value: 'pending', label: 'Pending' },
            { value: 'draft', label: 'Draft' },
            { value: 'error', label: 'Error' },
          ]},
          { name: 'companyId', label: 'All Companies', options: mockCompanies.map((c) => ({ value: c.id, label: c.name })) },
          { name: 'taxYear', label: 'All Years', options: uniqueYears.map((y) => ({ value: y, label: y })) },
        ]}
        values={filters}
        onChange={(name, value) => setFilters((prev) => ({ ...prev, [name]: value }))}
      />

      <DataTable
        columns={columns}
        data={filteredDocs}
        searchPlaceholder="Search documents..."
        emptyTitle="No documents found"
        emptyDescription="Create your first W2 document or adjust filters."
        onRowClick={(row) => setDetailDoc(row)}
      />

      <DocumentDetailModal
        isOpen={!!detailDoc}
        onClose={() => setDetailDoc(null)}
        document={detailDoc}
      />
    </div>
  )
}
