import { CheckCircle2, Clock, FileEdit, AlertCircle } from 'lucide-react'

export function DocumentStatusChart({ completed, pending, draft, error }) {
  const total = completed + pending + draft + error
  if (total === 0) return null

  const items = [
    { label: 'Completed', count: completed, color: 'tw:bg-emerald-500', icon: CheckCircle2, textColor: 'tw:text-emerald-600' },
    { label: 'Pending', count: pending, color: 'tw:bg-amber-500', icon: Clock, textColor: 'tw:text-amber-600' },
    { label: 'Draft', count: draft, color: 'tw:bg-blue-500', icon: FileEdit, textColor: 'tw:text-blue-600' },
    { label: 'Error', count: error, color: 'tw:bg-rose-500', icon: AlertCircle, textColor: 'tw:text-rose-600' },
  ]

  return (
    <div className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:shadow-sm tw:p-5 tw:h-full">
      <h3 className="tw:text-sm tw:font-semibold tw:text-gray-900 tw:mb-4">Document Status Overview</h3>

      {/* Progress bar */}
      <div className="tw:flex tw:rounded-full tw:overflow-hidden tw:h-3 tw:mb-6 tw:bg-gray-100">
        {items.map((item) => (
          item.count > 0 && (
            <div
              key={item.label}
              className={`${item.color} tw:transition-all tw:duration-500`}
              style={{ width: `${(item.count / total) * 100}%` }}
            />
          )
        ))}
      </div>

      {/* Legend */}
      <div className="tw:grid tw:grid-cols-2 tw:gap-4">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="tw:flex tw:items-center tw:gap-3 tw:p-3 tw:rounded-lg tw:bg-gray-50/50">
              <Icon className={`tw:h-5 tw:w-5 ${item.textColor}`} />
              <div>
                <p className="tw:text-xl tw:font-bold tw:text-gray-900">{item.count}</p>
                <p className="tw:text-xs tw:text-gray-500">{item.label}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
