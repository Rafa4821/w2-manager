import { useState, useMemo } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { PageHeader, DataTable, Badge, FilterBar, ConfirmDialog } from '../../../shared/components'
import { mockEmployees, mockCompanies } from '../../../shared/data'
import { useNotificationStore } from '../../../shared/store'
import { EmployeeFormModal } from './EmployeeFormModal'

export function EmployeesPage() {
  const [employees, setEmployees] = useState(mockEmployees)
  const [formOpen, setFormOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [filters, setFilters] = useState({ status: '', companyId: '' })
  const addNotification = useNotificationStore((s) => s.addNotification)

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      if (filters.status && e.status !== filters.status) return false
      if (filters.companyId && e.companyId !== filters.companyId) return false
      return true
    })
  }, [employees, filters])

  const handleSave = (form) => {
    if (editingEmployee) {
      setEmployees((prev) => prev.map((e) => (e.id === editingEmployee.id ? { ...e, ...form } : e)))
      addNotification({ type: 'success', title: 'Employee Updated', message: `${form.firstName} ${form.lastName} updated.` })
    } else {
      const newEmployee = { ...form, id: `e${Date.now()}`, hireDate: new Date().toISOString().split('T')[0] }
      setEmployees((prev) => [...prev, newEmployee])
      addNotification({ type: 'success', title: 'Employee Added', message: `${form.firstName} ${form.lastName} has been added.` })
    }
    setEditingEmployee(null)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    setEmployees((prev) => prev.filter((e) => e.id !== deleteTarget.id))
    addNotification({ type: 'success', title: 'Employee Deleted', message: `${deleteTarget.firstName} ${deleteTarget.lastName} removed.` })
    setDeleteTarget(null)
  }

  const columns = [
    {
      header: 'Employee',
      accessor: 'firstName',
      render: (row) => (
        <div className="tw:flex tw:items-center tw:gap-3">
          <div className="tw:flex tw:items-center tw:justify-center tw:h-9 tw:w-9 tw:rounded-full tw:bg-blue-50 tw:text-blue-600 tw:font-semibold tw:text-xs tw:flex-shrink-0">
            {row.firstName[0]}{row.lastName[0]}
          </div>
          <div>
            <p className="tw:font-medium tw:text-gray-900">{row.firstName} {row.lastName}</p>
            <p className="tw:text-xs tw:text-gray-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Company',
      accessor: 'companyName',
      render: (row) => <span className="tw:text-gray-600">{row.companyName}</span>,
    },
    {
      header: 'Position',
      accessor: 'position',
      render: (row) => (
        <div>
          <p className="tw:text-gray-900">{row.position}</p>
          <p className="tw:text-xs tw:text-gray-500">{row.department}</p>
        </div>
      ),
    },
    {
      header: 'Salary',
      accessor: 'salary',
      render: (row) => (
        <span className="tw:font-medium tw:text-gray-900">
          ${row.salary?.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge variant={row.status}>{row.status}</Badge>,
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
            onClick={(e) => { e.stopPropagation(); setEditingEmployee(row); setFormOpen(true) }}
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
      <PageHeader title="Employees" description="Manage employee records and personal information">
        <button
          onClick={() => { setEditingEmployee(null); setFormOpen(true) }}
          className="tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-white tw:bg-indigo-600 tw:rounded-lg hover:tw:bg-indigo-700 tw:transition tw:shadow-sm"
        >
          <Plus className="tw:h-4 tw:w-4" />
          Add Employee
        </button>
      </PageHeader>

      <FilterBar
        filters={[
          { name: 'status', label: 'All Status', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
          { name: 'companyId', label: 'All Companies', options: mockCompanies.map((c) => ({ value: c.id, label: c.name })) },
        ]}
        values={filters}
        onChange={(name, value) => setFilters((prev) => ({ ...prev, [name]: value }))}
      />

      <DataTable
        columns={columns}
        data={filteredEmployees}
        searchPlaceholder="Search employees..."
        emptyTitle="No employees found"
        emptyDescription="Add your first employee or adjust your filters."
      />

      <EmployeeFormModal
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditingEmployee(null) }}
        onSave={handleSave}
        employee={editingEmployee}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Employee"
        message={`Are you sure you want to delete "${deleteTarget?.firstName} ${deleteTarget?.lastName}"? This action cannot be undone.`}
        confirmLabel="Delete Employee"
      />
    </div>
  )
}
