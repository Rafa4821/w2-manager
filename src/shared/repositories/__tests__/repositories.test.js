import { describe, it, expect, beforeEach } from 'vitest'
import { companyRepository } from '../companyRepository'
import { employeeRepository } from '../employeeRepository'
import { w2DocumentRepository } from '../w2DocumentRepository'
import { clearAllData } from '../../persistence'

beforeEach(() => {
  clearAllData()
  localStorage.clear()
})

// ── Company Repository ───────────────────────────────────────────

describe('companyRepository', () => {
  const validCompany = {
    name: 'Fictitious LLC', ein: '11-1111111',
    address: '100 Demo St', city: 'Testville', state: 'AZ', zipCode: '85001',
  }

  it('creates a company with generated id and timestamps', () => {
    const c = companyRepository.create(validCompany)
    expect(c.id).toBeTruthy()
    expect(c.createdAt).toBeTruthy()
    expect(c.updatedAt).toBeTruthy()
    expect(c.name).toBe('Fictitious LLC')
  })

  it('reads back a created company', () => {
    const c = companyRepository.create(validCompany)
    const found = companyRepository.getById(c.id)
    expect(found).not.toBeNull()
    expect(found.ein).toBe('11-1111111')
  })

  it('lists all companies', () => {
    companyRepository.create(validCompany)
    companyRepository.create({ ...validCompany, name: 'Second Corp', ein: '22-2222222' })
    expect(companyRepository.getAll()).toHaveLength(2)
  })

  it('updates a company', () => {
    const c = companyRepository.create(validCompany)
    const updated = companyRepository.update(c.id, { name: 'Updated Corp' })
    expect(updated.name).toBe('Updated Corp')
    expect(updated.ein).toBe('11-1111111')
  })

  it('deletes a company', () => {
    const c = companyRepository.create(validCompany)
    companyRepository.remove(c.id)
    expect(companyRepository.getById(c.id)).toBeNull()
    expect(companyRepository.count()).toBe(0)
  })

  it('searches companies by name', () => {
    companyRepository.create(validCompany)
    companyRepository.create({ ...validCompany, name: 'Other Inc', ein: '33-3333333' })
    const results = companyRepository.searchCompanies('fictitious')
    expect(results).toHaveLength(1)
  })

  it('filters active companies', () => {
    companyRepository.create(validCompany)
    companyRepository.create({ ...validCompany, name: 'Inactive Co', ein: '44-4444444', status: 'inactive' })
    expect(companyRepository.getActive()).toHaveLength(1)
  })

  it('rejects invalid EIN on create', () => {
    expect(() => companyRepository.create({ ...validCompany, ein: 'bad' })).toThrow()
  })

  it('counts records', () => {
    expect(companyRepository.count()).toBe(0)
    companyRepository.create(validCompany)
    expect(companyRepository.count()).toBe(1)
  })

  it('checks existence', () => {
    const c = companyRepository.create(validCompany)
    expect(companyRepository.exists(c.id)).toBe(true)
    expect(companyRepository.exists('nonexistent')).toBe(false)
  })

  it('bulk creates companies', () => {
    const created = companyRepository.bulkCreate([
      validCompany,
      { ...validCompany, name: 'Bulk Corp', ein: '55-5555555' },
    ])
    expect(created).toHaveLength(2)
    expect(companyRepository.count()).toBe(2)
  })
})

// ── Employee Repository ──────────────────────────────────────────

describe('employeeRepository', () => {
  const validEmployee = {
    firstName: 'Jane', lastName: 'Doe', ssn: '000-00-0001',
    address: '200 Test Ln', city: 'Sampletown', state: 'CA', zipCode: '90001',
    companyId: 'c1',
  }

  it('creates and retrieves an employee', () => {
    const e = employeeRepository.create(validEmployee)
    expect(e.id).toBeTruthy()
    const found = employeeRepository.getById(e.id)
    expect(found.firstName).toBe('Jane')
  })

  it('updates an employee', () => {
    const e = employeeRepository.create(validEmployee)
    const updated = employeeRepository.update(e.id, { firstName: 'Janet' })
    expect(updated.firstName).toBe('Janet')
  })

  it('deletes an employee', () => {
    const e = employeeRepository.create(validEmployee)
    employeeRepository.remove(e.id)
    expect(employeeRepository.count()).toBe(0)
  })

  it('rejects missing lastName', () => {
    expect(() => employeeRepository.create({ ...validEmployee, lastName: '' })).toThrow()
  })

  it('filters by company', () => {
    employeeRepository.create(validEmployee)
    employeeRepository.create({ ...validEmployee, firstName: 'Bob', ssn: '000-00-0002', companyId: 'c2' })
    const c1Emps = employeeRepository.getByCompany('c1')
    expect(c1Emps).toHaveLength(1)
    expect(c1Emps[0].firstName).toBe('Jane')
  })
})

// ── W2 Document Repository ───────────────────────────────────────

describe('w2DocumentRepository', () => {
  const validDoc = {
    taxYear: 2024, status: 'draft',
    companyId: 'c1', employeeId: 'e1',
    companySnapshot: { id: 'c1', name: 'Test Co', ein: '12-3456789', address: '1 St', city: 'X', state: 'AZ', zipCode: '85001' },
    employeeSnapshot: { id: 'e1', firstName: 'J', lastName: 'D', ssn: '000-00-0001', address: '2 St', city: 'Y', state: 'CA', zipCode: '90001' },
  }

  it('creates a W2 document with defaults', () => {
    const doc = w2DocumentRepository.create(validDoc)
    expect(doc.id).toBeTruthy()
    expect(doc.box1_wagesTips).toBe(0)
    expect(doc.status).toBe('draft')
  })

  it('updates document status', () => {
    const doc = w2DocumentRepository.create(validDoc)
    const updated = w2DocumentRepository.update(doc.id, { status: 'completed', box1_wagesTips: 50000 })
    expect(updated.status).toBe('completed')
    expect(updated.box1_wagesTips).toBe(50000)
  })

  it('deletes a document', () => {
    const doc = w2DocumentRepository.create(validDoc)
    w2DocumentRepository.remove(doc.id)
    expect(w2DocumentRepository.count()).toBe(0)
  })

  it('filters by status', () => {
    w2DocumentRepository.create(validDoc)
    w2DocumentRepository.create({ ...validDoc, status: 'completed', box1_wagesTips: 1 })
    const completed = w2DocumentRepository.filter((d) => d.status === 'completed')
    expect(completed).toHaveLength(1)
  })
})
