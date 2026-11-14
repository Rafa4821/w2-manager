import { useState } from 'react'
import { round2 } from '../utils/currency'

/**
 * Currency input that preserves decimals while typing and commits
 * a rounded-to-2-decimals number on blur. Shows $ prefix inline.
 */
export function CurrencyField({ label, name, value, onChange, error, required, placeholder = '0.00', disabled }) {
  // While focused we let the user type freely; on blur we round to 2dp
  const [localValue, setLocalValue] = useState(null) // null = use prop

  const displayed = localValue !== null ? localValue : (value ? String(value) : '')

  const handleFocus = () => {
    setLocalValue(value ? String(value) : '')
  }

  const handleChange = (e) => {
    const raw = e.target.value
    // Allow digits, one dot, optional leading minus
    if (/^-?\d*\.?\d{0,2}$/.test(raw) || raw === '') {
      setLocalValue(raw)
    }
  }

  const handleBlur = () => {
    const rounded = round2(localValue)
    setLocalValue(null)
    onChange(name, rounded)
  }

  const baseClass = 'tw:w-full tw:pl-7 tw:pr-3 tw:py-2 tw:text-sm tw:border tw:rounded-lg tw:transition focus:tw:outline-none focus:tw:ring-2 focus:tw:ring-indigo-500 focus:tw:border-transparent'
  const errorClass = error ? 'tw:border-rose-300 tw:bg-rose-50/30' : 'tw:border-gray-200'

  return (
    <div className="tw:mb-4">
      {label && (
        <label className="tw:block tw:text-sm tw:font-medium tw:text-gray-700 tw:mb-1.5">
          {label}
          {required && <span className="tw:text-rose-500 tw:ml-0.5">*</span>}
        </label>
      )}
      <div className="tw:relative">
        <span className="tw:absolute tw:left-2.5 tw:top-1/2 tw:-translate-y-1/2 tw:text-gray-400 tw:text-sm tw:select-none">$</span>
        <input
          type="text"
          inputMode="decimal"
          name={name}
          value={displayed}
          onFocus={handleFocus}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`${baseClass} ${errorClass}`}
        />
      </div>
      {error && <p className="tw:mt-1 tw:text-xs tw:text-rose-500">{error}</p>}
    </div>
  )
}
