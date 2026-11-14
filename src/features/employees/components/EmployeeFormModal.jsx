import { useState, useMemo } from 'react'
import { Modal, FormField } from '../../../shared/components'
import { useCompaniesStore } from '../../companies/store/useCompaniesStore'

const emptyForm = {
  firstName: '', middleInitial: '', lastName: '', suffix: '',
  ssn: '', email: '', phone: '',
  address: '', address2: '', city: '', state: '', zipCode: '',
  companyId: '', position: '', department: '', hireDate: '', status: 'active',
}

function EmployeeForm({ employee, onSave, onClose }) {
  const companies = useCompaniesStore((s) => s.companies)
  const initialForm = useMemo(
    () => employee ? { ...emptyForm, ...employee } : emptyForm,
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
    if (!form.ssn.trim()) e.ssn = 'SSN is required'
    if (!form.address.trim()) e.address = 'Address is required'
    if (!form.city.trim()) e.city = 'City is required'
    if (!form.state.trim()) e.state = 'State is required'
    if (!form.zipCode.trim()) e.zipCode = 'ZIP code is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      onSave(form)
      onClose()
    }
  }

  const companyOptions = companies
    .filter((c) => c.status === 'active')
    .map((c) => ({ value: c.id, label: c.name }))

  return (
    <>
      <div className="tw:grid tw:grid-cols-1 sm:tw:grid-cols-2 tw:gap-x-4">
        <FormField label="First Name" name="firstName" value={form.firstName} onChange={handleChange} error={errors.firstName} required placeholder="John" />
        <FormField label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} error={errors.lastName} required placeholder="Smith" />
        <FormField label="Middle Initial" name="middleInitial" value={form.middleInitial} onChange={handleChange} placeholder="M" />
        <FormField label="Suffix" name="suffix" value={form.suffix} onChange={handleChange} placeholder="Jr., Sr., III" />
        <FormField label="SSN" name="ssn" value={form.ssn} onChange={handleChange} error={errors.ssn} required placeholder="000-00-0000" />
        <FormField label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.com" />
        <FormField label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="(XXX) XXX-XXXX" />
        <FormField label="Company (optional)" name="companyId" type="select" value={form.companyId} onChange={handleChange} options={companyOptions} placeholder="No company assigned" />
        <FormField label="Position" name="position" value={form.position} onChange={handleChange} placeholder="e.g. Senior Engineer" />
        <FormField label="Department" name="department" value={form.department} onChange={handleChange} placeholder="e.g. Engineering" />
        <FormField label="Hire Date" name="hireDate" type="date" value={form.hireDate} onChange={handleChange} />
        <FormField label="Status" name="status" type="select" value={form.status} onChange={handleChange} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
        <div className="sm:tw:col-span-2">
          <FormField label="Address" name="address" value={form.address} onChange={handleChange} error={errors.address} required placeholder="Street address" />
        </div>
        <div className="sm:tw:col-span-2">
          <FormField label="Address Line 2" name="address2" value={form.address2} onChange={handleChange} placeholder="Apt, Suite, Unit" />
        </div>
        <FormField label="City" name="city" value={form.city} onChange={handleChange} error={errors.city} required placeholder="City" />
        <div className="tw:grid tw:grid-cols-2 tw:gap-4">
          <FormField label="State" name="state" value={form.state} onChange={handleChange} error={errors.state} required placeholder="NY" />
          <FormField label="ZIP" name="zipCode" value={form.zipCode} onChange={handleChange} error={errors.zipCode} required placeholder="00000" />
        </div>
      </div>
      <div className="tw:flex tw:items-center tw:justify-end tw:gap-2 tw:pt-4 tw:border-t tw:border-gray-100 tw:mt-4">
        <button onClick={onClose} className="tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-gray-700 tw:bg-white tw:border tw:border-gray-300 tw:rounded-lg hover:tw:bg-gray-50 tw:transition">Cancel</button>
        <button onClick={handleSubmit} className="tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-white tw:bg-indigo-600 tw:rounded-lg hover:tw:bg-indigo-700 tw:transition">{isEditing ? 'Update Employee' : 'Add Employee'}</button>
      </div>
    </>
  )
}

export function EmployeeFormModal({ isOpen, onClose, onSave, employee }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={employee ? 'Edit Employee' : 'Add New Employee'} size="lg">
      {isOpen && <EmployeeForm key={employee?.id || 'new'} employee={employee} onSave={onSave} onClose={onClose} />}
    </Modal>
  )
}
