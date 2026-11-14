/**
 * Currency and decimal helpers for W-2 monetary fields.
 *
 * All W-2 amounts are stored as plain numbers with at most 2 decimal places.
 * These helpers ensure consistent rounding and display throughout the editor.
 */

/**
 * Round a number to exactly 2 decimal places using banker's-style rounding.
 * Returns a number, not a string.
 */
export function round2(value) {
  if (value === '' || value === null || value === undefined) return 0
  const n = typeof value === 'string' ? parseFloat(value) : value
  if (Number.isNaN(n)) return 0
  return Math.round((n + Number.EPSILON) * 100) / 100
}

/**
 * Parse a user-typed string into a number preserving up to 2 decimals.
 * Allows the user to type while the field still contains a trailing dot
 * or incomplete decimal (e.g. "123." or "123.4").
 */
export function parseCurrency(raw) {
  if (raw === '' || raw === null || raw === undefined) return 0
  const str = String(raw).replace(/[^0-9.-]/g, '')
  const n = parseFloat(str)
  if (Number.isNaN(n)) return 0
  return round2(n)
}

/**
 * Format a number as a display-ready USD string (no $ sign — that is added
 * by the component). Returns '' for zero so inputs show placeholder.
 */
export function formatCurrencyInput(value) {
  if (value === 0 || value === '' || value === null || value === undefined) return ''
  return String(value)
}

/**
 * Format for display (read-only contexts) with $ sign and commas.
 */
export function formatUSD(value) {
  const n = typeof value === 'number' ? value : parseFloat(value) || 0
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
