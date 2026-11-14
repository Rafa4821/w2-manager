const variants = {
  active: 'tw:bg-emerald-50 tw:text-emerald-700 tw:ring-emerald-600/20',
  inactive: 'tw:bg-gray-50 tw:text-gray-600 tw:ring-gray-500/10',
  completed: 'tw:bg-emerald-50 tw:text-emerald-700 tw:ring-emerald-600/20',
  pending: 'tw:bg-amber-50 tw:text-amber-700 tw:ring-amber-600/20',
  draft: 'tw:bg-blue-50 tw:text-blue-700 tw:ring-blue-700/10',
  error: 'tw:bg-rose-50 tw:text-rose-700 tw:ring-rose-600/10',
  info: 'tw:bg-sky-50 tw:text-sky-700 tw:ring-sky-700/10',
  default: 'tw:bg-gray-50 tw:text-gray-600 tw:ring-gray-500/10',
}

export function Badge({ children, variant = 'default' }) {
  return (
    <span className={`tw:inline-flex tw:items-center tw:rounded-full tw:px-2 tw:py-0.5 tw:text-xs tw:font-medium tw:ring-1 tw:ring-inset ${variants[variant] || variants.default}`}>
      {children}
    </span>
  )
}
