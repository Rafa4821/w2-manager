export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="tw:flex tw:flex-col tw:items-center tw:justify-center tw:py-16 tw:text-center">
      {Icon && <Icon className="tw:h-12 tw:w-12 tw:text-gray-400 tw:mb-4" />}
      <h3 className="tw:text-lg tw:font-medium tw:text-gray-900">{title}</h3>
      {description && (
        <p className="tw:mt-1 tw:text-sm tw:text-gray-500">{description}</p>
      )}
    </div>
  )
}
