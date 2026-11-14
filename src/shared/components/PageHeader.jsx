export function PageHeader({ title, description, children }) {
  return (
    <div className="tw:mb-6">
      <div className="tw:flex tw:items-center tw:justify-between">
        <div>
          <h1 className="tw:text-2xl tw:font-bold tw:text-gray-900">{title}</h1>
          {description && (
            <p className="tw:mt-1 tw:text-sm tw:text-gray-500">{description}</p>
          )}
        </div>
        {children && <div className="tw:flex tw:gap-2">{children}</div>}
      </div>
    </div>
  )
}
