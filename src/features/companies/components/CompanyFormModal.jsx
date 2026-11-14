import { useState, useMemo } from 'react'
import { Modal, FormField } from '../../../shared/components'

const US_STATES = [
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' }, { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' }, { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' }, { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' }, { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' }, { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' }, { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
  { value: 'MA', label: 'Massachusetts' }, { value: 'MD', label: 'Maryland' }, { value: 'ME', label: 'Maine' },
  { value: 'MI', label: 'Michigan' }, { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' }, { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' }, { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' }, { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' }, { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' }, { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' }, { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' }, { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' }, { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' },
]

const emptyForm = { name: '', ein: '', address: '', city: '', state: '', zipCode: '', phone: '', email: '', status: 'active' }

function CompanyForm({ company, onSave, onClose }) {
  const initialForm = useMemo(() => company ? { ...emptyForm, ...company } : emptyForm, [company])
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const isEditing = !!company

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Company name is required'
    if (!form.ein.trim()) e.ein = 'EIN is required'
    else if (!/^\d{2}-?\d{7}$/.test(form.ein.replace(/-/g, ''))) e.ein = 'Invalid EIN format'
    if (!form.address.trim()) e.address = 'Address is required'
    if (!form.city.trim()) e.city = 'City is required'
    if (!form.state) e.state = 'State is required'
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

  return (
    <>
      <div className="tw:grid tw:grid-cols-1 sm:tw:grid-cols-2 tw:gap-x-4">
        <div className="sm:tw:col-span-2">
          <FormField label="Company Name" name="name" value={form.name} onChange={handleChange} error={errors.name} required placeholder="e.g. Acme Corporation" />
        </div>
        <FormField label="EIN" name="ein" value={form.ein} onChange={handleChange} error={errors.ein} required placeholder="XX-XXXXXXX" />
        <FormField label="Status" name="status" type="select" value={form.status} onChange={handleChange} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
        <div className="sm:tw:col-span-2">
          <FormField label="Address" name="address" value={form.address} onChange={handleChange} error={errors.address} required placeholder="Street address" />
        </div>
        <FormField label="City" name="city" value={form.city} onChange={handleChange} error={errors.city} required placeholder="City" />
        <div className="tw:grid tw:grid-cols-2 tw:gap-4">
          <FormField label="State" name="state" type="select" value={form.state} onChange={handleChange} error={errors.state} required options={US_STATES} />
          <FormField label="ZIP Code" name="zipCode" value={form.zipCode} onChange={handleChange} error={errors.zipCode} required placeholder="XXXXX" />
        </div>
        <FormField label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="(XXX) XXX-XXXX" />
        <FormField label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="contact@company.com" />
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
          {isEditing ? 'Update Company' : 'Create Company'}
        </button>
      </div>
    </>
  )
}

export function CompanyFormModal({ isOpen, onClose, onSave, company }) {
  const isEditing = !!company

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Company' : 'Add New Company'}
      size="lg"
    >
      {isOpen && (
        <CompanyForm
          key={company?.id || 'new'}
          company={company}
          onSave={onSave}
          onClose={onClose}
        />
      )}
    </Modal>
  )
}
