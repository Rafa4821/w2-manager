import { useState, useMemo } from 'react'
import { Plus, Edit2, Trash2, Building2 } from 'lucide-react'
import { PageHeader, DataTable, Badge, FilterBar, ConfirmDialog } from '../../../shared/components'
import { mockCompanies } from '../../../shared/data'
import { useNotificationStore } from '../../../shared/store'
import { CompanyFormModal } from './CompanyFormModal'

export function CompaniesPage() {
  const [companies, setCompanies] = useState(mockCompanies)
  const [formOpen, setFormOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [filters, setFilters] = useState({ status: '', state: '' })
  const addNotification = useNotificationStore((s) => s.addNotification)

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      if (filters.status && c.status !== filters.status) return false
      if (filters.state && c.state !== filters.state) return false
      return true
    })
  }, [companies, filters])

  const uniqueStates = [...new Set(companies.map((c) => c.state))].sort()

  const handleSave = (form) => {
    if (editingCompany) {
      setCompanies((prev) => prev.map((c) => (c.id === editingCompany.id ? { ...c, ...form } : c)))
      addNotification({ type: 'success', title: 'Company Updated', message: `${form.name} has been updated successfully.` })
    } else {
      const newCompany = { ...form, id: `c${Date.now()}`, employeeCount: 0, createdAt: new Date().toISOString().split('T')[0] }
      setCompanies((prev) => [...prev, newCompany])
      addNotification({ type: 'success', title: 'Company Created', message: `${form.name} has been added successfully.` })
    }
    setEditingCompany(null)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    setCompanies((prev) => prev.filter((c) => c.id !== deleteTarget.id))
    addNotification({ type: 'success', title: 'Company Deleted', message: `${deleteTarget.name} has been removed.` })
    setDeleteTarget(null)
  }

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const columns = [
    {
      header: 'Company',
      accessor: 'name',
      render: (row) => (
        <div className="tw:flex tw:items-center tw:gap-3">
          <div className="tw:flex tw:items-center tw:justify-center tw:h-9 tw:w-9 tw:rounded-lg tw:bg-indigo-50 tw:flex-shrink-0">
            <Building2 className="tw:h-4 tw:w-4 tw:text-indigo-500" />
          </div>
          <div>
            <p className="tw:font-medium tw:text-gray-900">{row.name}</p>
            <p className="tw:text-xs tw:text-gray-500">EIN: {row.ein}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Location',
      accessor: 'city',
      render: (row) => (
        <span className="tw:text-gray-600">{row.city}, {row.state}</span>
      ),
    },
    {
      header: 'Employees',
      accessor: 'employeeCount',
      render: (row) => (
        <span className="tw:font-medium tw:text-gray-900">{row.employeeCount}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge variant={row.status}>{row.status}</Badge>,
    },
    {
      header: 'Created',
      accessor: 'createdAt',
      render: (row) => <span className="tw:text-gray-500">{row.createdAt}</span>,
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
            onClick={(e) => { e.stopPropagation(); setEditingCompany(row); setFormOpen(true) }}
            className="tw:p-1.5 tw:rounded-md tw:text-gray-400 hover:tw:text-indigo-600 hover:tw:bg-indigo-50 tw:transition"
            title="Edit"
          >
            <Edit2 className="tw:h-4 tw:w-4" />
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

  return (
    <div>
      <PageHeader title="Companies" description="Manage employer information and EIN details">
        <button
          onClick={() => { setEditingCompany(null); setFormOpen(true) }}
          className="tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-white tw:bg-indigo-600 tw:rounded-lg hover:tw:bg-indigo-700 tw:transition tw:shadow-sm"
        >
          <Plus className="tw:h-4 tw:w-4" />
          Add Company
        </button>
      </PageHeader>

      <FilterBar
        filters={[
          { name: 'status', label: 'All Status', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
          { name: 'state', label: 'All States', options: uniqueStates.map((s) => ({ value: s, label: s })) },
        ]}
        values={filters}
        onChange={handleFilterChange}
      />

      <DataTable
        columns={columns}
        data={filteredCompanies}
        searchPlaceholder="Search companies..."
        emptyTitle="No companies found"
        emptyDescription="Add your first company or adjust your filters."
      />

      <CompanyFormModal
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditingCompany(null) }}
        onSave={handleSave}
        company={editingCompany}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Company"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone and will affect all associated employees and documents.`}
        confirmLabel="Delete Company"
      />
    </div>
  )
}
