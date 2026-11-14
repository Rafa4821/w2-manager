import { useState, useMemo, useEffect } from 'react'
import { FileText, Eye, DollarSign, Plus, Edit2, Trash2, Copy } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageHeader, DataTable, Badge, FilterBar, StatCard, ConfirmDialog } from '../../../shared/components'
import { useNotificationStore } from '../../../shared/store'
import { useW2DocumentsStore } from '../store/useW2DocumentsStore'
import { useCompaniesStore } from '../../companies/store/useCompaniesStore'
import { DocumentDetailModal } from './DocumentDetailModal'

export function W2DocumentsPage() {
  const { documents, load, remove } = useW2DocumentsStore()
  const { companies, load: loadCompanies } = useCompaniesStore()
  const [detailDoc, setDetailDoc] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [filters, setFilters] = useState({ status: '', companyId: '', taxYear: '' })
  const addNotification = useNotificationStore((s) => s.addNotification)
  const navigate = useNavigate()

  useEffect(() => { load(); loadCompanies() }, [load, loadCompanies])

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
  const totalWages = documents.reduce((sum, d) => sum + (d.box1_wagesTips || d.wagesTips || 0), 0)

  const fmt = (n) => `$${(n / 1000).toFixed(0)}K`

  const handleDelete = () => {
    if (!deleteTarget) return
    try {
      remove(deleteTarget.id)
      addNotification({ type: 'success', title: 'Document Deleted', message: 'W2 document has been removed.' })
    } catch (err) {
      addNotification({ type: 'error', title: 'Error', message: err.message })
    }
    setDeleteTarget(null)
  }

  const columns = [
    {
      header: 'Employee',
      accessor: 'employeeName',
      render: (row) => {
        const name = row.employeeSnapshot
          ? `${row.employeeSnapshot.firstName} ${row.employeeSnapshot.lastName}`
          : row.employeeName || '—'
        const company = row.companySnapshot?.name || row.companyName || '—'
        return (
          <div className="tw:flex tw:items-center tw:gap-3">
            <div className="tw:flex tw:items-center tw:justify-center tw:h-9 tw:w-9 tw:rounded-lg tw:bg-indigo-50 tw:flex-shrink-0">
              <FileText className="tw:h-4 tw:w-4 tw:text-indigo-500" />
            </div>
            <div>
              <p className="tw:font-medium tw:text-gray-900">{name}</p>
              <p className="tw:text-xs tw:text-gray-500">{company}</p>
            </div>
          </div>
        )
      },
    },
    {
      header: 'Tax Year',
      accessor: 'taxYear',
      render: (row) => <span className="tw:font-medium tw:text-gray-700">{row.taxYear}</span>,
    },
    {
      header: 'Wages',
      accessor: 'box1_wagesTips',
      render: (row) => (
        <span className="tw:font-medium tw:text-gray-900">
          ${(row.box1_wagesTips || row.wagesTips || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Fed. Tax',
      accessor: 'box2_federalTaxWithheld',
      render: (row) => (
        <span className="tw:text-gray-600">
          ${(row.box2_federalTaxWithheld || row.federalTaxWithheld || 0).toLocaleString()}
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
      render: (row) => <span className="tw:text-gray-500 tw:text-xs">{row.updatedAt?.split('T')[0]}</span>,
    },
    {
      header: '',
      accessor: 'actions',
      sortable: false,
      searchable: false,
      className: 'tw:w-40 tw:text-right',
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
            onClick={(e) => { e.stopPropagation(); navigate(`/w2-documents/edit/${row.id}`) }}
            className="tw:p-1.5 tw:rounded-md tw:text-gray-400 hover:tw:text-blue-600 hover:tw:bg-blue-50 tw:transition"
            title="Edit"
          >
            <Edit2 className="tw:h-4 tw:w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/w2-documents/new?duplicate=${row.id}`) }}
            className="tw:p-1.5 tw:rounded-md tw:text-gray-400 hover:tw:text-emerald-600 hover:tw:bg-emerald-50 tw:transition"
            title="Duplicate"
          >
            <Copy className="tw:h-4 tw:w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(row) }}
            className="tw:p-1.5 tw:rounded-md tw:text-gray-400 hover:tw:text-rose-600 hover:tw:bg-rose-50 tw:transition"
            title="Delete"
          >
            <Trash2 className="tw:h-4 tw:w-4" />
          </button>
        </div>
      ),
    },
  ]

  const uniqueYears = [...new Set(documents.map((d) => String(d.taxYear)))].sort().reverse()

  return (
    <div>
      <PageHeader title="W2 Documents" description="Create and manage W2 tax documents">
        <button
          onClick={() => navigate('/w2-documents/new')}
          className="tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-white tw:bg-indigo-600 tw:rounded-lg hover:tw:bg-indigo-700 tw:transition tw:shadow-sm"
        >
          <Plus className="tw:h-4 tw:w-4" />
          New W2 Document
        </button>
      </PageHeader>

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
          { name: 'companyId', label: 'All Companies', options: companies.map((c) => ({ value: c.id, label: c.name })) },
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
        emptyDescription="Create your first W2 document to get started."
        onRowClick={(row) => setDetailDoc(row)}
      />

      <DocumentDetailModal
        isOpen={!!detailDoc}
        onClose={() => setDetailDoc(null)}
        document={detailDoc}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete W2 Document"
        message="Are you sure you want to delete this W2 document? This action cannot be undone."
        confirmLabel="Delete Document"
      />
    </div>
  )
}
