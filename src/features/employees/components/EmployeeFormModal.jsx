import { useState, useMemo } from 'react'
import { Modal, FormField } from '../../../shared/components'
import { mockCompanies } from '../../../shared/data'

const emptyForm = {
  firstName: '', lastName: '', ssn: '', email: '', phone: '',
  address: '', city: '', state: '', zipCode: '',
  companyId: '', position: '', department: '', salary: '', status: 'active',
}

function EmployeeForm({ employee, onSave, onClose }) {
  const initialForm = useMemo(
    () => employee ? { ...emptyForm, ...employee, salary: String(employee.salary || '') } : emptyForm,
    [employee]
  )
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const isEditing = !!employee

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.firstName.trim()) e.firstName = 'First name is required'
    if (!form.lastName.trim()) e.lastName = 'Last name is required'
    if (!form.companyId) e.companyId = 'Company is required'
    if (!form.position.trim()) e.position = 'Position is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      const company = mockCompanies.find((c) => c.id === form.companyId)
      onSave({
        ...form,
        salary: Number(form.salary) || 0,
        companyName: company?.name || '',
      })
      onClose()
    }
  }

  const companyOptions = mockCompanies
    .filter((c) => c.status === 'active')
    .map((c) => ({ value: c.id, label: c.name }))

  return (
    <>
      <div className="tw:grid tw:grid-cols-1 sm:tw:grid-cols-2 tw:gap-x-4">
        <FormField label="First Name" name="firstName" value={form.firstName} onChange={handleChange} error={errors.firstName} required placeholder="John" />
        <FormField label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} error={errors.lastName} required placeholder="Smith" />
        <FormField label="SSN" name="ssn" value={form.ssn} onChange={handleChange} placeholder="XXX-XX-XXXX" />
        <FormField label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@company.com" />
        <FormField label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="(XXX) XXX-XXXX" />
        <FormField label="Company" name="companyId" type="select" value={form.companyId} onChange={handleChange} error={errors.companyId} required options={companyOptions} placeholder="Select company" />
        <FormField label="Position" name="position" value={form.position} onChange={handleChange} error={errors.position} required placeholder="e.g. Senior Engineer" />
        <FormField label="Department" name="department" value={form.department} onChange={handleChange} placeholder="e.g. Engineering" />
        <FormField label="Annual Salary" name="salary" type="number" value={form.salary} onChange={handleChange} placeholder="0.00" />
        <FormField label="Status" name="status" type="select" value={form.status} onChange={handleChange} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
        <div className="sm:tw:col-span-2">
          <FormField label="Address" name="address" value={form.address} onChange={handleChange} placeholder="Street address" />
        </div>
        <FormField label="City" name="city" value={form.city} onChange={handleChange} placeholder="City" />
        <div className="tw:grid tw:grid-cols-2 tw:gap-4">
          <FormField label="State" name="state" value={form.state} onChange={handleChange} placeholder="NY" />
          <FormField label="ZIP" name="zipCode" value={form.zipCode} onChange={handleChange} placeholder="XXXXX" />
        </div>
      </div>
      <div className="tw:flex tw:items-center tw:justify-end tw:gap-2 tw:pt-4 tw:border-t tw:border-gray-100 tw:mt-4">
        <button
          onClick={onClose}
          className="tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-gray-700 tw:bg-white tw:border tw:border-gray-300 tw:rounded-lg hover:tw:bg-gray-50 tw:transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-white tw:bg-indigo-600 tw:rounded-lg hover:tw:bg-indigo-700 tw:transition"
        >
          {isEditing ? 'Update Employee' : 'Add Employee'}
        </button>
      </div>
    </>
  )
}

export function EmployeeFormModal({ isOpen, onClose, onSave, employee }) {
  const isEditing = !!employee

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Employee' : 'Add New Employee'}
      size="lg"
    >
      {isOpen && (
        <EmployeeForm
          key={employee?.id || 'new'}
          employee={employee}
          onSave={onSave}
          onClose={onClose}
        />
      )}
    </Modal>
  )
}
