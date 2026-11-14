export function FormField({ label, name, type = 'text', value, onChange, error, required, placeholder, options, rows, disabled }) {
  const baseClass = 'tw:w-full tw:px-3 tw:py-2 tw:text-sm tw:border tw:rounded-lg tw:transition focus:tw:outline-none focus:tw:ring-2 focus:tw:ring-indigo-500 focus:tw:border-transparent'
  const errorClass = error ? 'tw:border-rose-300 tw:bg-rose-50/30' : 'tw:border-gray-200'

  const handleChange = (e) => {
    onChange(name, e.target.value)
  }

  return (
    <div className="tw:mb-4">
      {label && (
        <label className="tw:block tw:text-sm tw:font-medium tw:text-gray-700 tw:mb-1.5">
          {label}
          {required && <span className="tw:text-rose-500 tw:ml-0.5">*</span>}
        </label>
      )}
      {type === 'select' ? (
        <select
          name={name}
          value={value || ''}
          onChange={handleChange}
          disabled={disabled}
          className={`${baseClass} ${errorClass}`}
        >
          <option value="">{placeholder || 'Select...'}</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          name={name}
          value={value || ''}
          onChange={handleChange}
          placeholder={placeholder}
          rows={rows || 3}
          disabled={disabled}
          className={`${baseClass} ${errorClass} tw:resize-none`}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value || ''}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`${baseClass} ${errorClass}`}
        />
      )}
      {error && <p className="tw:mt-1 tw:text-xs tw:text-rose-500">{error}</p>}
    </div>
  )
}
