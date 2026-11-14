import { describe, it, expect } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import { generateFromScratch } from '../engine/pdfScratchGenerator'
import { resolveFieldValue, groupFieldsByPage } from '../engine/pdfFieldRenderer'

// Minimal mapping that mirrors the real template structure
const mockMapping = {
  pageSizePt: [612, 792],
  fields: [
    { id: 'company', path: 'company.name', x: 50, y: 44, fontSize: 8, fontFamily: 'Arial', fontWeight: 400, page: 0 },
    { id: 'ein', path: 'company.ein', x: 300, y: 44, fontSize: 8, fontFamily: 'Arial', fontWeight: 400, page: 0 },
    { id: 'empName', path: 'employee.name', x: 50, y: 100, fontSize: 8, fontFamily: 'Arial', fontWeight: 400, page: 0 },
    { id: 'ssn', path: 'employee.ssnMasked', x: 300, y: 100, fontSize: 8, fontFamily: 'Courier New', fontWeight: 400, page: 0 },
    { id: 'box1', path: 'boxes.1', x: 400, y: 150, fontSize: 9, fontFamily: 'Courier New', fontWeight: 400, type: 'amount', page: 0 },
    { id: 'box2', path: 'boxes.2', x: 400, y: 170, fontSize: 9, fontFamily: 'Courier New', fontWeight: 400, type: 'amount', page: 0 },
    { id: 'box13stat', path: 'flags.statutoryEmployee', x: 350, y: 300, fontSize: 8, type: 'checkbox', page: 0 },
  ],
}

const mockData = {
  year: 2024,
  company: { name: 'ACME CORP', ein: '12-3456789', addressLine1: '123 MAIN ST', cityStateZip: 'PHOENIX AZ 85001' },
  employee: { name: 'JOHN DOE', ssnMasked: '***-**-1234', addressLine1: '456 OAK AVE', cityStateZip: 'TEMPE AZ 85281' },
  boxes: { 1: 75000, 2: 12500, 3: 75000, 4: 4650, 5: 75000, 6: 1087.50 },
  flags: { statutoryEmployee: true, retirementPlan: false, thirdPartySickPay: false, void: false },
  control: { line1: 'W2-2024-001' },
  stateTax: { state: 'AZ', employerId: 'AZ-123456' },
}

const mockManifest = {
  id: 'test-template',
  name: 'Test',
  version: '1.0.0',
  category: 'standard',
  pages: 1,
  pageSize: { width: 8.5, height: 11, unit: 'in' },
}

describe('PDF Scratch Generator', () => {
  it('generates a US Letter PDF (612 x 792 pt)', async () => {
    const { pdfBytes } = await generateFromScratch(mockMapping, mockData, mockManifest)
    const pdf = await PDFDocument.load(pdfBytes)
    const page = pdf.getPage(0)
    const { width, height } = page.getSize()
    expect(width).toBeCloseTo(612, 0)
    expect(height).toBeCloseTo(792, 0)
  })

  it('creates the correct number of pages', async () => {
    const multiManifest = { ...mockManifest, pages: 2 }
    const { pdfBytes } = await generateFromScratch(mockMapping, mockData, multiManifest)
    const pdf = await PDFDocument.load(pdfBytes)
    expect(pdf.getPageCount()).toBe(2)
  })

  it('reports drawn fields in stats', async () => {
    const { stats } = await generateFromScratch(mockMapping, mockData, mockManifest)
    expect(stats.strategy).toBe('scratch')
    expect(stats.fieldsDrawn).toBeGreaterThan(0)
    expect(stats.pages).toBe(1)
  })

  it('includes a warning about missing base PDF', async () => {
    const { warnings } = await generateFromScratch(mockMapping, mockData, mockManifest)
    expect(warnings.some((w) => w.includes('No base PDF'))).toBe(true)
  })

  it('handles empty data without crashing', async () => {
    const { pdfBytes, stats } = await generateFromScratch(mockMapping, {}, mockManifest)
    const pdf = await PDFDocument.load(pdfBytes)
    expect(pdf.getPageCount()).toBe(1)
    expect(stats.fieldsDrawn).toBe(0)
  })
})

describe('resolveFieldValue', () => {
  it('resolves dotted paths', () => {
    expect(resolveFieldValue(mockData, { path: 'company.name' })).toBe('ACME CORP')
  })

  it('formats numbers as money with 2 decimals', () => {
    expect(resolveFieldValue(mockData, { path: 'boxes.1' })).toMatch(/75,000\.00|75000\.00/)
  })

  it('resolves checkbox to X', () => {
    expect(resolveFieldValue(mockData, { path: 'flags.statutoryEmployee', type: 'checkbox' })).toBe('X')
  })

  it('returns empty for false checkbox', () => {
    expect(resolveFieldValue(mockData, { path: 'flags.retirementPlan', type: 'checkbox' })).toBe('')
  })

  it('returns empty for missing paths', () => {
    expect(resolveFieldValue(mockData, { path: 'nonexistent.field' })).toBe('')
  })
})

describe('groupFieldsByPage', () => {
  it('groups fields by page index', () => {
    const fields = [
      { path: 'a', page: 0 }, { path: 'b', page: 0 },
      { path: 'c', page: 1 }, { path: 'd', page: 1 },
    ]
    const groups = groupFieldsByPage(fields, 2)
    expect(groups[0]).toHaveLength(2)
    expect(groups[1]).toHaveLength(2)
  })

  it('defaults fields without page to page 0', () => {
    const fields = [{ path: 'a' }, { path: 'b' }]
    const groups = groupFieldsByPage(fields, 1)
    expect(groups[0]).toHaveLength(2)
  })
})

describe('Field coordinates within page bounds', () => {
  it('all mapping coordinates fit within US Letter (612x792)', () => {
    const PAGE_W = 612
    const PAGE_H = 792
    for (const field of mockMapping.fields) {
      expect(field.x).toBeGreaterThanOrEqual(0)
      expect(field.x).toBeLessThan(PAGE_W)
      expect(field.y).toBeGreaterThanOrEqual(0)
      expect(field.y).toBeLessThan(PAGE_H)
      // PDF y after conversion should also be within bounds
      const pdfY = PAGE_H - field.y
      expect(pdfY).toBeGreaterThan(0)
      expect(pdfY).toBeLessThanOrEqual(PAGE_H)
    }
  })
})
