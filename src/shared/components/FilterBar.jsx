export function FilterBar({ filters, values, onChange }) {
  return (
    <div className="tw:flex tw:flex-wrap tw:gap-2 tw:mb-4">
      {filters.map((filter) => (
        <select
          key={filter.name}
          value={values[filter.name] || ''}
          onChange={(e) => onChange(filter.name, e.target.value)}
          className="tw:px-3 tw:py-1.5 tw:text-sm tw:border tw:border-gray-200 tw:rounded-lg tw:bg-white focus:tw:outline-none focus:tw:ring-2 focus:tw:ring-indigo-500 focus:tw:border-transparent tw:transition"
        >
          <option value="">{filter.label}</option>
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}
      {Object.values(values).some((v) => v) && (
        <button
          onClick={() => {
            const cleared = {}
            filters.forEach((f) => { cleared[f.name] = '' })
            Object.keys(cleared).forEach((k) => onChange(k, ''))
          }}
          className="tw:px-3 tw:py-1.5 tw:text-sm tw:text-gray-500 hover:tw:text-gray-700 tw:underline tw:transition"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
