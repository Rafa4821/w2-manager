/**
 * CSV parser and exporter — pure browser-side, no dependencies.
 * Handles quoted fields, embedded commas, newlines inside quotes,
 * and escaped double-quotes (RFC 4180).
 */

// ── CSV Parsing ──────────────────────────────────────────────────

/**
 * Parse a CSV string into an array of objects keyed by header names.
 * @param {string} text  – raw CSV content
 * @returns {{ headers: string[], rows: Object[], rawRows: string[][] }}
 */
export function parseCsv(text) {
  const lines = tokenize(text)
  if (lines.length === 0) return { headers: [], rows: [], rawRows: [] }

  const headers = lines[0].map((h) => h.trim())
  const rawRows = lines.slice(1).filter((r) => r.some((c) => c.trim() !== ''))
  const rows = rawRows.map((cells) => {
    const obj = {}
    headers.forEach((h, i) => { obj[h] = (cells[i] ?? '').trim() })
    return obj
  })
  return { headers, rows, rawRows }
}

/** RFC-4180 tokenizer. */
function tokenize(text) {
  const rows = []
  let current = []
  let cell = ''
  let inQuotes = false
  let i = 0

  while (i < text.length) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cell += '"'; i += 2 }
        else { inQuotes = false; i++ }
      } else { cell += ch; i++ }
    } else {
      if (ch === '"') { inQuotes = true; i++ }
      else if (ch === ',') { current.push(cell); cell = ''; i++ }
      else if (ch === '\r' || ch === '\n') {
        current.push(cell); cell = ''; rows.push(current); current = []
        if (ch === '\r' && text[i + 1] === '\n') i++
        i++
      } else { cell += ch; i++ }
    }
  }
  if (cell || current.length > 0) { current.push(cell); rows.push(current) }
  return rows
}

// ── CSV Generation ───────────────────────────────────────────────

/**
 * Convert an array of objects to a CSV string.
 * @param {Object[]} data    – array of flat objects
 * @param {string[]} [columns] – explicit column order (defaults to all keys)
 */
export function toCsv(data, columns) {
  if (!data || data.length === 0) return ''
  const cols = columns || Object.keys(data[0])
  const escape = (v) => {
    const s = v == null ? '' : String(v)
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }
  const header = cols.map(escape).join(',')
  const rows = data.map((row) => cols.map((c) => escape(row[c])).join(','))
  return [header, ...rows].join('\r\n')
}

// ── Column Definitions ───────────────────────────────────────────

export const COMPANY_CSV_COLUMNS = [
  'name', 'ein', 'address', 'address2', 'city', 'state', 'zipCode',
  'phone', 'email', 'contactName', 'stateEmployerId', 'status',
]

export const EMPLOYEE_CSV_COLUMNS = [
  'firstName', 'middleInitial', 'lastName', 'suffix', 'ssn',
  'address', 'address2', 'city', 'state', 'zipCode',
  'email', 'phone', 'companyId', 'position', 'department',
  'hireDate', 'status',
]

export const W2_CSV_COLUMNS = [
  'taxYear', 'status', 'controlNumber', 'templateId',
  'box1_wagesTips', 'box2_federalTaxWithheld',
  'box3_socialSecurityWages', 'box4_socialSecurityTax',
  'box5_medicareWages', 'box6_medicareTax',
  'box7_socialSecurityTips', 'box8_allocatedTips',
  'box10_dependentCareBenefits', 'box11_nonqualifiedPlans',
  'box13_statutoryEmployee', 'box13_retirementPlan', 'box13_thirdPartySickPay',
]

/**
 * Flatten a W2 document for CSV export (selected scalar fields only).
 */
export function flattenW2ForCsv(doc) {
  return {
    taxYear: doc.taxYear,
    status: doc.status,
    controlNumber: doc.controlNumber || '',
    templateId: doc.templateId || '',
    box1_wagesTips: doc.box1_wagesTips ?? '',
    box2_federalTaxWithheld: doc.box2_federalTaxWithheld ?? '',
    box3_socialSecurityWages: doc.box3_socialSecurityWages ?? '',
    box4_socialSecurityTax: doc.box4_socialSecurityTax ?? '',
    box5_medicareWages: doc.box5_medicareWages ?? '',
    box6_medicareTax: doc.box6_medicareTax ?? '',
    box7_socialSecurityTips: doc.box7_socialSecurityTips ?? '',
    box8_allocatedTips: doc.box8_allocatedTips ?? '',
    box10_dependentCareBenefits: doc.box10_dependentCareBenefits ?? '',
    box11_nonqualifiedPlans: doc.box11_nonqualifiedPlans ?? '',
    box13_statutoryEmployee: doc.box13_statutoryEmployee ? 'true' : 'false',
    box13_retirementPlan: doc.box13_retirementPlan ? 'true' : 'false',
    box13_thirdPartySickPay: doc.box13_thirdPartySickPay ? 'true' : 'false',
    companyName: doc.companySnapshot?.name || '',
    employeeName: doc.employeeSnapshot
      ? `${doc.employeeSnapshot.firstName} ${doc.employeeSnapshot.lastName}`
      : '',
  }
}
