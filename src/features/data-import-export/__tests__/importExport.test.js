import { describe, it, expect } from 'vitest'
import { parseCsv, toCsv, flattenW2ForCsv } from '../utils/csvUtils'
import { previewJsonImport, previewCsvImport } from '../utils/importEngine'

// ── CSV Utilities ────────────────────────────────────────────────

describe('parseCsv', () => {
  it('parses a simple CSV', () => {
    const csv = 'name,ein,city\nAcme,12-3456789,Phoenix\nGlobo,98-7654321,Tempe'
    const { headers, rows } = parseCsv(csv)
    expect(headers).toEqual(['name', 'ein', 'city'])
    expect(rows).toHaveLength(2)
    expect(rows[0].name).toBe('Acme')
    expect(rows[1].city).toBe('Tempe')
  })

  it('handles quoted fields with commas', () => {
    const csv = 'name,address\n"Acme, Inc.","123 Main St, Suite 4"'
    const { rows } = parseCsv(csv)
    expect(rows[0].name).toBe('Acme, Inc.')
    expect(rows[0].address).toBe('123 Main St, Suite 4')
  })

  it('handles escaped double-quotes', () => {
    const csv = 'name\n"She said ""hello"""'
    const { rows } = parseCsv(csv)
    expect(rows[0].name).toBe('She said "hello"')
  })

  it('returns empty for empty input', () => {
    const { headers, rows } = parseCsv('')
    expect(headers).toEqual([])
    expect(rows).toEqual([])
  })
})

describe('toCsv', () => {
  it('converts objects to CSV', () => {
    const data = [{ name: 'Acme', city: 'Phoenix' }, { name: 'Globo', city: 'Tempe' }]
    const csv = toCsv(data)
    expect(csv).toContain('name,city')
    expect(csv).toContain('Acme,Phoenix')
    expect(csv).toContain('Globo,Tempe')
  })

  it('quotes fields containing commas', () => {
    const data = [{ name: 'Acme, Inc.', city: 'Phoenix' }]
    const csv = toCsv(data)
    expect(csv).toContain('"Acme, Inc."')
  })

  it('returns empty for empty array', () => {
    expect(toCsv([])).toBe('')
  })
})

describe('flattenW2ForCsv', () => {
  it('flattens W2 document for CSV export', () => {
    const doc = {
      taxYear: 2024,
      status: 'completed',
      controlNumber: 'W2-001',
      box1_wagesTips: 75000,
      box2_federalTaxWithheld: 12500,
      box13_statutoryEmployee: true,
      box13_retirementPlan: false,
      box13_thirdPartySickPay: false,
      companySnapshot: { name: 'Acme Corp' },
      employeeSnapshot: { firstName: 'John', lastName: 'Doe' },
    }
    const flat = flattenW2ForCsv(doc)
    expect(flat.taxYear).toBe(2024)
    expect(flat.box1_wagesTips).toBe(75000)
    expect(flat.box13_statutoryEmployee).toBe('true')
    expect(flat.companyName).toBe('Acme Corp')
    expect(flat.employeeName).toBe('John Doe')
  })
})

// ── Import Engine ────────────────────────────────────────────────

describe('previewJsonImport', () => {
  it('detects companies from an array with ein field', () => {
    const json = JSON.stringify([
      { name: 'Fictitious Corp', ein: '11-1111111', address: '100 Fake St', city: 'Testville', state: 'AZ', zipCode: '85001', status: 'active' },
    ])
    const result = previewJsonImport(json)
    expect(result.entityType).toBe('companies')
    expect(result.newRecords).toHaveLength(1)
    expect(result.invalid).toHaveLength(0)
  })

  it('detects employees from an array with ssn field', () => {
    const json = JSON.stringify([
      { firstName: 'Jane', lastName: 'Doe', ssn: '000-00-0001', address: '1 Test Ave', city: 'Test', state: 'CA', zipCode: '90001', companyId: 'test123' },
    ])
    const result = previewJsonImport(json)
    expect(result.entityType).toBe('employees')
    expect(result.newRecords).toHaveLength(1)
  })

  it('reports invalid records', () => {
    const json = JSON.stringify([
      { name: '', ein: 'bad-ein', address: '', city: '', state: '', zipCode: '' },
    ])
    const result = previewJsonImport(json)
    expect(result.entityType).toBe('companies')
    expect(result.invalid.length).toBeGreaterThan(0)
    expect(result.invalid[0].errors.length).toBeGreaterThan(0)
  })

  it('throws on invalid JSON', () => {
    expect(() => previewJsonImport('not json')).toThrow('Invalid JSON')
  })

  it('throws on unrecognized structure', () => {
    expect(() => previewJsonImport('{"random": true}')).toThrow('Could not detect')
  })
})

describe('previewCsvImport', () => {
  it('analyses CSV companies', () => {
    const csv = 'name,ein,address,city,state,zipCode,status\nTest LLC,22-2222222,200 Demo Rd,Sampletown,TX,73301,active'
    const result = previewCsvImport(csv, 'companies')
    expect(result.entityType).toBe('companies')
    expect(result.newRecords).toHaveLength(1)
  })

  it('reports validation errors for bad CSV data', () => {
    const csv = 'name,ein,address,city,state,zipCode\n,invalid,,,,bad'
    const result = previewCsvImport(csv, 'companies')
    expect(result.invalid.length).toBeGreaterThan(0)
  })

  it('throws on empty CSV', () => {
    expect(() => previewCsvImport('', 'companies')).toThrow('empty')
  })
})
