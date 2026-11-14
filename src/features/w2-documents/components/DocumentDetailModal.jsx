import { Modal, Badge } from '../../../shared/components'
import { FileText, DollarSign, Calendar } from 'lucide-react'

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

  const fmt = (n) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}`

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
              <p className="tw:font-semibold tw:text-gray-900">{document.employeeName}</p>
              <p className="tw:text-sm tw:text-gray-500">{document.companyName}</p>
            </div>
          </div>
          <Badge variant={document.status}>{document.status}</Badge>
        </div>

        {/* Tax details */}
        <div>
          <h4 className="tw:text-xs tw:font-bold tw:uppercase tw:tracking-wider tw:text-gray-400 tw:mb-2">Wage & Tax Information</h4>
          <div className="tw:bg-white tw:rounded-lg tw:border tw:border-gray-100 tw:px-4">
            <DetailRow label="Tax Year" value={document.taxYear} icon={Calendar} />
            <DetailRow label="Wages, Tips & Compensation" value={fmt(document.wagesTips)} icon={DollarSign} />
            <DetailRow label="Federal Tax Withheld" value={fmt(document.federalTaxWithheld)} />
            <DetailRow label="Social Security Wages" value={fmt(document.socialSecurityWages)} />
            <DetailRow label="Social Security Tax" value={fmt(document.socialSecurityTax)} />
            <DetailRow label="Medicare Wages" value={fmt(document.medicareWages)} />
            <DetailRow label="Medicare Tax" value={fmt(document.medicareTax)} />
            <DetailRow label="State Tax" value={fmt(document.stateTax)} />
          </div>
        </div>

        {/* Metadata */}
        <div>
          <h4 className="tw:text-xs tw:font-bold tw:uppercase tw:tracking-wider tw:text-gray-400 tw:mb-2">Document Info</h4>
          <div className="tw:bg-white tw:rounded-lg tw:border tw:border-gray-100 tw:px-4">
            <DetailRow label="Created" value={document.createdAt} />
            <DetailRow label="Last Updated" value={document.updatedAt} />
            <DetailRow label="Document ID" value={document.id} />
          </div>
        </div>
      </div>
    </Modal>
  )
}
