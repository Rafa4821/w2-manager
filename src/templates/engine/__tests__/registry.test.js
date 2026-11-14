import { describe, it, expect, beforeEach } from 'vitest'
import {
  registerTemplate, getTemplate, getAllTemplates, getDefaultTemplate,
  getTemplatesForYear, hasTemplates, unregisterTemplate, clearRegistry,
  setPdfBase, getPdfBase,
} from '../registry'

beforeEach(() => { clearRegistry() })

describe('Template Registry', () => {
  const manifest = { id: 'test-tpl', name: 'Test', version: '1.0', category: 'standard' }
  const mapping = { fields: [{ id: 'f1', path: 'boxes.1', x: 10, y: 20 }] }
  const Component = () => null

  it('registers and retrieves a template', () => {
    registerTemplate(manifest, mapping, Component)
    const t = getTemplate('test-tpl')
    expect(t).not.toBeNull()
    expect(t.manifest.id).toBe('test-tpl')
    expect(t.component).toBe(Component)
  })

  it('applies default manifest values', () => {
    registerTemplate(manifest, mapping, Component)
    const t = getTemplate('test-tpl')
    expect(t.manifest.pages).toBe(1)
    expect(t.manifest.pageSize.width).toBe(8.5)
    expect(t.manifest.pageSize.height).toBe(11)
    expect(t.manifest.isDefault).toBe(false)
    expect(t.manifest.taxYears).toEqual([])
  })

  it('returns null for unregistered template', () => {
    expect(getTemplate('nonexistent')).toBeNull()
  })

  it('lists all registered templates', () => {
    registerTemplate(manifest, mapping, Component)
    registerTemplate({ ...manifest, id: 'test-2' }, mapping, Component)
    expect(getAllTemplates()).toHaveLength(2)
  })

  it('finds default template', () => {
    registerTemplate(manifest, mapping, Component)
    registerTemplate({ ...manifest, id: 'default-tpl', isDefault: true }, mapping, Component)
    expect(getDefaultTemplate().manifest.id).toBe('default-tpl')
  })

  it('filters by tax year', () => {
    registerTemplate({ ...manifest, id: 'y2024', taxYears: [2024] }, mapping, Component)
    registerTemplate({ ...manifest, id: 'y2025', taxYears: [2025] }, mapping, Component)
    registerTemplate({ ...manifest, id: 'yAny', taxYears: [] }, mapping, Component)
    const for2024 = getTemplatesForYear(2024)
    expect(for2024.some((t) => t.manifest.id === 'y2024')).toBe(true)
    expect(for2024.some((t) => t.manifest.id === 'yAny')).toBe(true)
    expect(for2024.some((t) => t.manifest.id === 'y2025')).toBe(false)
  })

  it('hasTemplates returns false when empty', () => {
    expect(hasTemplates()).toBe(false)
  })

  it('hasTemplates returns true after registration', () => {
    registerTemplate(manifest, mapping, Component)
    expect(hasTemplates()).toBe(true)
  })

  it('unregisters a template', () => {
    registerTemplate(manifest, mapping, Component)
    unregisterTemplate('test-tpl')
    expect(getTemplate('test-tpl')).toBeNull()
  })

  it('clears all templates', () => {
    registerTemplate(manifest, mapping, Component)
    clearRegistry()
    expect(hasTemplates()).toBe(false)
  })

  it('throws on missing required manifest fields', () => {
    expect(() => registerTemplate({ id: 'x' }, mapping, Component)).toThrow('missing required')
  })

  it('sets and gets PDF base URL', () => {
    registerTemplate(manifest, mapping, Component)
    setPdfBase('test-tpl', '/assets/blank.pdf')
    expect(getPdfBase('test-tpl')).toBe('/assets/blank.pdf')
  })

  it('returns null for template without PDF base', () => {
    registerTemplate(manifest, mapping, Component)
    expect(getPdfBase('test-tpl')).toBeNull()
  })
})
