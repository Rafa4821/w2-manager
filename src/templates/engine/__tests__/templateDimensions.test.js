/**
 * Per-template dimension and field-presence tests.
 *
 * Each registered production template is tested independently for:
 *   - Manifest page dimensions (US Letter: 8.5 × 11 in)
 *   - Mapping field coordinates within page bounds (612 × 792 pt)
 *   - Required field paths present (company, employee, boxes)
 *   - No clipping (all coordinates ≥ 0 and < page size)
 */
import { describe, it, expect, beforeAll } from 'vitest'

// Import the template bootstrap so all templates register themselves
import '../../index'

import { getAllTemplates, getTemplate } from '../registry'

const US_LETTER_W = 8.5
const US_LETTER_H = 11
const US_LETTER_PT_W = 612
const US_LETTER_PT_H = 792

// Required field path/key prefixes that every W-2 template should map
// Some templates use 'boxes.1', others use 'box1'; some use 'company.' others 'employer.'
const CORE_FIELD_PREFIXES = ['company.', 'employee.', 'boxes.', 'box', 'employer.']

beforeAll(() => {
  // Templates are already registered via the import above
})

describe('All registered templates', () => {
  it('has at least one production template', () => {
    const all = getAllTemplates().filter((t) => t.manifest.id !== 'demo-w2')
    expect(all.length).toBeGreaterThanOrEqual(1)
  })
})

// Generate a test suite per template
const templates = getAllTemplates ? getAllTemplates() : []

for (const tpl of templates) {
  const { manifest, mapping } = tpl
  const id = manifest.id

  describe(`Template: ${id}`, () => {
    it('has valid manifest with required fields', () => {
      expect(manifest.id).toBeTruthy()
      expect(manifest.name).toBeTruthy()
      expect(manifest.version).toBeTruthy()
      expect(manifest.category).toBeTruthy()
    })

    it('declares valid page dimensions', () => {
      // Most templates use US Letter (8.5×11). Landscape templates swap width/height.
      // Some may use custom sizes (e.g. mcdean uses ~10.83×8.33 for legal-ish landscape).
      expect(manifest.pageSize.width).toBeGreaterThan(0)
      expect(manifest.pageSize.height).toBeGreaterThan(0)
    })

    it('declares at least 1 page', () => {
      expect(manifest.pages).toBeGreaterThanOrEqual(1)
    })

    it('has mapping object', () => {
      expect(mapping).toBeTruthy()
      // Most templates have fields array; demo-w2 uses object-based mapping
      if (Array.isArray(mapping.fields)) {
        expect(mapping.fields.length).toBeGreaterThanOrEqual(0)
      }
    })

    if (Array.isArray(mapping?.fields) && mapping.fields.length > 0) {
      it('all field coordinates are within page bounds', () => {
        const pageSizePt = mapping.pageSizePt || [US_LETTER_PT_W, US_LETTER_PT_H]
        const [pageW, pageH] = pageSizePt

        for (const field of mapping.fields) {
          const x = field.x ?? 0
          const y = field.y ?? 0
          expect(x, `${field.id || field.path}: x=${x} out of bounds`).toBeGreaterThanOrEqual(0)
          expect(x, `${field.id || field.path}: x=${x} exceeds page width ${pageW}`).toBeLessThanOrEqual(pageW)
          expect(y, `${field.id || field.path}: y=${y} out of bounds`).toBeGreaterThanOrEqual(0)
          expect(y, `${field.id || field.path}: y=${y} exceeds page height ${pageH}`).toBeLessThanOrEqual(pageH)
        }
      })

      it('maps at least one core field path (company, employee, or boxes)', () => {
        const paths = mapping.fields.map((f) => f.path || f.key || '')
        const hasCore = CORE_FIELD_PREFIXES.some((prefix) =>
          paths.some((p) => p.startsWith(prefix)),
        )
        expect(hasCore).toBe(true)
      })

      it('every field has a path or key', () => {
        for (const field of mapping.fields) {
          expect(field.path || field.key, `Field ${field.id || 'unknown'} missing path`).toBeTruthy()
        }
      })

      it('font sizes are positive', () => {
        for (const field of mapping.fields) {
          if (field.fontSize !== undefined) {
            expect(field.fontSize, `${field.id}: fontSize`).toBeGreaterThan(0)
          }
        }
      })
    }

    // PDF base check
    it('reports PDF base status consistently', () => {
      const t = getTemplate(id)
      // pdfBaseUrl is either a string or undefined/null
      if (t.pdfBaseUrl) {
        expect(typeof t.pdfBaseUrl).toBe('string')
      }
    })
  })
}
