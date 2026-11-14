/**
 * Import engine — validates, detects duplicates, and previews data
 * before committing to repositories. Supports JSON and CSV.
 */
import { companySchema, employeeSchema, w2DocumentSchema } from '../../../shared/schemas'
import { companyRepository } from '../../../shared/repositories/companyRepository'
import { employeeRepository } from '../../../shared/repositories/employeeRepository'
import { w2DocumentRepository } from '../../../shared/repositories/w2DocumentRepository'
import { parseCsv } from './csvUtils'

// ── Duplicate detection keys per entity ──────────────────────────

function companyKey(r) { return r.ein?.toLowerCase() }
function employeeKey(r) { return r.ssn?.toLowerCase() }
function w2DocKey(r) {
  const emp = r.employeeId || r.employeeSnapshot?.id || ''
  return `${r.taxYear}_${emp}_${r.companyId || r.companySnapshot?.id || ''}`
}

const ENTITY_CONFIG = {
  companies: {
    schema: companySchema,
    repo: companyRepository,
    dupKey: companyKey,
    dupLabel: 'EIN',
    requiredFields: ['name', 'ein', 'address', 'city', 'state', 'zipCode'],
  },
  employees: {
    schema: employeeSchema,
    repo: employeeRepository,
    dupKey: employeeKey,
    dupLabel: 'SSN',
    requiredFields: ['firstName', 'lastName', 'ssn', 'address', 'city', 'state', 'zipCode', 'companyId'],
  },
  w2Documents: {
    schema: w2DocumentSchema,
    repo: w2DocumentRepository,
    dupKey: w2DocKey,
    dupLabel: 'Year+Employee+Company',
    requiredFields: ['taxYear', 'companyId', 'employeeId'],
  },
}

// ── JSON Import ──────────────────────────────────────────────────

/**
 * Analyse a JSON import and return a preview before committing.
 *
 * @param {string} jsonText – raw JSON string
 * @returns {{ entityType: string, records: Object[], valid: Object[],
 *             invalid: { record: Object, errors: string[] }[],
 *             duplicates: { record: Object, existingKey: string }[],
 *             newRecords: Object[] }}
 */
export function previewJsonImport(jsonText) {
  let parsed
  try { parsed = JSON.parse(jsonText) } catch {
    throw new Error('Invalid JSON — file does not contain valid data.')
  }

  // Detect entity type
  let entityType = null
  let records = []

  if (Array.isArray(parsed)) {
    // Try to auto-detect from field names
    entityType = detectEntityType(parsed[0])
    records = parsed
  } else if (typeof parsed === 'object') {
    // Keyed object: { companies: [...], employees: [...], w2Documents: [...] }
    for (const key of ['companies', 'employees', 'w2Documents']) {
      if (Array.isArray(parsed[key]) && parsed[key].length > 0) {
        entityType = key
        records = parsed[key]
        break
      }
    }
  }

  if (!entityType || records.length === 0) {
    throw new Error('Could not detect entity type. Provide an array or an object with a companies/employees/w2Documents key.')
  }

  return analyseRecords(entityType, records)
}

/**
 * Analyse a CSV import.
 * @param {string} csvText    – raw CSV content
 * @param {string} entityType – 'companies' | 'employees' | 'w2Documents'
 */
export function previewCsvImport(csvText, entityType) {
  if (!ENTITY_CONFIG[entityType]) throw new Error(`Unknown entity type: ${entityType}`)
  const { rows } = parseCsv(csvText)
  if (rows.length === 0) throw new Error('CSV file is empty or has no data rows.')

  // Cast numeric fields for w2Documents
  const records = entityType === 'w2Documents'
    ? rows.map(castW2Numbers)
    : rows

  return analyseRecords(entityType, records)
}

/** Cast W2 numeric strings from CSV to actual numbers. */
function castW2Numbers(row) {
  const numFields = [
    'taxYear', 'box1_wagesTips', 'box2_federalTaxWithheld',
    'box3_socialSecurityWages', 'box4_socialSecurityTax',
    'box5_medicareWages', 'box6_medicareTax',
    'box7_socialSecurityTips', 'box8_allocatedTips',
    'box10_dependentCareBenefits', 'box11_nonqualifiedPlans',
  ]
  const boolFields = ['box13_statutoryEmployee', 'box13_retirementPlan', 'box13_thirdPartySickPay']
  const out = { ...row }
  for (const f of numFields) {
    if (out[f] !== undefined && out[f] !== '') out[f] = Number(out[f])
  }
  for (const f of boolFields) {
    if (out[f] !== undefined) out[f] = out[f] === 'true' || out[f] === '1'
  }
  return out
}

/** Detect entity type from a sample record's keys. */
function detectEntityType(sample) {
  if (!sample) return null
  if ('ein' in sample) return 'companies'
  if ('ssn' in sample || 'firstName' in sample) return 'employees'
  if ('taxYear' in sample || 'box1_wagesTips' in sample) return 'w2Documents'
  return null
}

/**
 * Core analysis: validate, detect duplicates, split into valid/invalid/duplicate.
 */
function analyseRecords(entityType, records) {
  const config = ENTITY_CONFIG[entityType]
  const existingItems = config.repo.getAll()
  const existingKeys = new Set(existingItems.map(config.dupKey).filter(Boolean))
  const seenKeys = new Set()

  const valid = []
  const invalid = []
  const duplicates = []

  for (const record of records) {
    // Validate with schema (omit id/timestamps — repository generates them)
    const toValidate = {
      ...record,
      id: record.id || 'temp',
      createdAt: record.createdAt || new Date().toISOString(),
      updatedAt: record.updatedAt || new Date().toISOString(),
    }
    const result = config.schema.safeParse(toValidate)

    if (!result.success) {
      invalid.push({
        record,
        errors: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      })
      continue
    }

    // Check duplicates against existing data and within the import set
    const key = config.dupKey(record)
    if (key && existingKeys.has(key)) {
      duplicates.push({ record, existingKey: `${config.dupLabel}: ${key}` })
      continue
    }
    if (key && seenKeys.has(key)) {
      duplicates.push({ record, existingKey: `Duplicate within import: ${key}` })
      continue
    }
    if (key) seenKeys.add(key)

    valid.push(record)
  }

  return { entityType, records, valid, invalid, duplicates, newRecords: valid }
}

/**
 * Commit validated records to the repository.
 * @param {string}   entityType – 'companies' | 'employees' | 'w2Documents'
 * @param {Object[]} records    – validated records to import
 * @param {boolean}  [includeDuplicates] – also import duplicate records
 * @param {Object[]} [duplicateRecords]  – the duplicate records if includeDuplicates
 * @returns {{ imported: number }}
 */
export function commitImport(entityType, records, includeDuplicates = false, duplicateRecords = []) {
  const config = ENTITY_CONFIG[entityType]
  const toImport = includeDuplicates ? [...records, ...duplicateRecords] : records
  // Strip existing id/timestamps so the repository generates fresh ones
  const cleaned = toImport.map((r) => {
    const copy = { ...r }
    delete copy.id; delete copy.createdAt; delete copy.updatedAt
    return copy
  })
  config.repo.bulkCreate(cleaned)
  return { imported: cleaned.length }
}
