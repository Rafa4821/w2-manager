import { describe, it, expect } from 'vitest'
import { companySchema, employeeSchema, w2DocumentSchema } from '../index'

// ── Company Schema ───────────────────────────────────────────────

describe('companySchema', () => {
  const validCompany = {
    id: 'c1', name: 'Fictitious Corp', ein: '12-3456789',
    address: '100 Demo Blvd', city: 'Testville', state: 'AZ', zipCode: '85001',
    status: 'active', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z',
  }

  it('accepts a valid company', () => {
    expect(companySchema.safeParse(validCompany).success).toBe(true)
  })

  it('rejects missing name', () => {
    const r = companySchema.safeParse({ ...validCompany, name: '' })
    expect(r.success).toBe(false)
  })

  it('rejects invalid EIN format', () => {
    const r = companySchema.safeParse({ ...validCompany, ein: '123456789' })
    expect(r.success).toBe(false)
  })

  it('rejects invalid ZIP code', () => {
    const r = companySchema.safeParse({ ...validCompany, zipCode: 'ABCDE' })
    expect(r.success).toBe(false)
  })

  it('accepts ZIP+4 format', () => {
    const r = companySchema.safeParse({ ...validCompany, zipCode: '85001-1234' })
    expect(r.success).toBe(true)
  })

  it('rejects invalid status', () => {
    const r = companySchema.safeParse({ ...validCompany, status: 'deleted' })
    expect(r.success).toBe(false)
  })

  it('defaults optional fields', () => {
    const r = companySchema.safeParse(validCompany)
    expect(r.data.phone).toBe('')
    expect(r.data.contactName).toBe('')
  })
})

// ── Employee Schema ──────────────────────────────────────────────

describe('employeeSchema', () => {
  const validEmployee = {
    id: 'e1', firstName: 'Jane', lastName: 'Doe', ssn: '000-00-0001',
    address: '200 Test Ln', city: 'Sampletown', state: 'CA', zipCode: '90001',
    companyId: 'c1', status: 'active',
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z',
  }

  it('accepts a valid employee', () => {
    expect(employeeSchema.safeParse(validEmployee).success).toBe(true)
  })

  it('rejects missing firstName', () => {
    const r = employeeSchema.safeParse({ ...validEmployee, firstName: '' })
    expect(r.success).toBe(false)
  })

  it('rejects missing companyId', () => {
    const r = employeeSchema.safeParse({ ...validEmployee, companyId: '' })
    expect(r.success).toBe(false)
  })

  it('rejects state longer than 2 chars', () => {
    const r = employeeSchema.safeParse({ ...validEmployee, state: 'CAL' })
    expect(r.success).toBe(false)
  })

  it('defaults optional middleInitial to empty', () => {
    const r = employeeSchema.safeParse(validEmployee)
    expect(r.data.middleInitial).toBe('')
  })
})

// ── W2 Document Schema ──────────────────────────────────────────

describe('w2DocumentSchema', () => {
  const validDoc = {
    id: 'd1', taxYear: 2024, status: 'draft',
    companyId: 'c1', employeeId: 'e1',
    companySnapshot: { id: 'c1', name: 'Test Co', ein: '12-3456789', address: '1 St', city: 'X', state: 'AZ', zipCode: '85001' },
    employeeSnapshot: { id: 'e1', firstName: 'J', lastName: 'D', ssn: '000-00-0001', address: '2 St', city: 'Y', state: 'CA', zipCode: '90001' },
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z',
  }

  it('accepts a valid draft document', () => {
    expect(w2DocumentSchema.safeParse(validDoc).success).toBe(true)
  })

  it('accepts valid status values', () => {
    for (const s of ['draft', 'pending', 'completed', 'error']) {
      expect(w2DocumentSchema.safeParse({ ...validDoc, status: s }).success).toBe(true)
    }
  })

  it('rejects invalid status', () => {
    const r = w2DocumentSchema.safeParse({ ...validDoc, status: 'archived' })
    expect(r.success).toBe(false)
  })

  it('defaults box values to 0', () => {
    const r = w2DocumentSchema.safeParse(validDoc)
    expect(r.data.box1_wagesTips).toBe(0)
    expect(r.data.box2_federalTaxWithheld).toBe(0)
  })

  it('accepts monetary box values', () => {
    const r = w2DocumentSchema.safeParse({ ...validDoc, box1_wagesTips: 75000.50, box2_federalTaxWithheld: 12500.25 })
    expect(r.success).toBe(true)
    expect(r.data.box1_wagesTips).toBe(75000.50)
  })
})
