import { Modal, Badge } from '../../../shared/components'
import { FileText, DollarSign, Calendar } from 'lucide-react'
import { W2Preview } from './W2Preview'

function DetailRow({ label, value, icon: Icon }) {
  return (
    <div className="tw:flex tw:items-center tw:justify-between tw:py-2.5 tw:border-b tw:border-gray-50 last:tw:border-0">
      <div className="tw:flex tw:items-center tw:gap-2 tw:text-sm tw:text-gray-500">
        {Icon && <Icon className="tw:h-4 tw:w-4" />}
        {label}
      </div>
      <span className="tw:text-sm tw:font-medium tw:text-gray-900">{value}</span>
    </div>
  )
}

export function DocumentDetailModal({ isOpen, onClose, document }) {
  if (!document) return null

  const fmt = (n) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`

  // Support both old flat fields and new box_ fields
  const empName = document.employeeSnapshot
    ? `${document.employeeSnapshot.firstName} ${document.employeeSnapshot.lastName}`
    : document.employeeName || '—'
  const compName = document.companySnapshot?.name || document.companyName || '—'
  const wages = document.box1_wagesTips ?? document.wagesTips ?? 0
  const fedTax = document.box2_federalTaxWithheld ?? document.federalTaxWithheld ?? 0
  const ssWages = document.box3_socialSecurityWages ?? document.socialSecurityWages ?? 0
  const ssTax = document.box4_socialSecurityTax ?? document.socialSecurityTax ?? 0
  const medWages = document.box5_medicareWages ?? document.medicareWages ?? 0
  const medTax = document.box6_medicareTax ?? document.medicareTax ?? 0

  const hasFullSchema = !!document.companySnapshot

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="W2 Document Details" size="lg">
      <div className="tw:space-y-5">
        {/* Header info */}
        <div className="tw:flex tw:items-center tw:justify-between tw:p-4 tw:bg-gray-50 tw:rounded-lg">
          <div className="tw:flex tw:items-center tw:gap-3">
            <div className="tw:p-2 tw:bg-white tw:rounded-lg tw:shadow-sm">
              <FileText className="tw:h-5 tw:w-5 tw:text-indigo-500" />
            </div>
            <div>
              <p className="tw:font-semibold tw:text-gray-900">{empName}</p>
              <p className="tw:text-sm tw:text-gray-500">{compName}</p>
            </div>
          </div>
          <Badge variant={document.status}>{document.status}</Badge>
        </div>

        {/* Full W-2 preview if new schema */}
        {hasFullSchema ? (
          <W2Preview doc={document} />
        ) : (
          <div>
            <h4 className="tw:text-xs tw:font-bold tw:uppercase tw:tracking-wider tw:text-gray-400 tw:mb-2">Wage & Tax Information</h4>
            <div className="tw:bg-white tw:rounded-lg tw:border tw:border-gray-100 tw:px-4">
              <DetailRow label="Tax Year" value={document.taxYear} icon={Calendar} />
              <DetailRow label="Wages, Tips & Compensation" value={fmt(wages)} icon={DollarSign} />
              <DetailRow label="Federal Tax Withheld" value={fmt(fedTax)} />
              <DetailRow label="Social Security Wages" value={fmt(ssWages)} />
              <DetailRow label="Social Security Tax" value={fmt(ssTax)} />
              <DetailRow label="Medicare Wages" value={fmt(medWages)} />
              <DetailRow label="Medicare Tax" value={fmt(medTax)} />
            </div>
          </div>
        )}

        {/* Metadata */}
        <div>
          <h4 className="tw:text-xs tw:font-bold tw:uppercase tw:tracking-wider tw:text-gray-400 tw:mb-2">Document Info</h4>
          <div className="tw:bg-white tw:rounded-lg tw:border tw:border-gray-100 tw:px-4">
            <DetailRow label="Created" value={document.createdAt?.split('T')[0] || document.createdAt} />
            <DetailRow label="Last Updated" value={document.updatedAt?.split('T')[0] || document.updatedAt} />
            <DetailRow label="Document ID" value={document.id} />
          </div>
        </div>
      </div>
    </Modal>
  )
}
