/**
 * Template Registry — central catalog of all registered templates.
 *
 * Templates register themselves by calling registerTemplate() with their
 * manifest, mapping, and React component. The registry validates the
 * manifest structure and makes templates available to the rest of the app.
 */

const templates = new Map()

/**
 * Manifest shape (validated on registration):
 * {
 *   id:          string   – unique slug (folder name)
 *   name:        string   – human-readable name
 *   description: string   – short description
 *   version:     string   – semver or year
 *   author:      string   – who created it
 *   category:    string   – 'standard' | 'multi-state' | 'benefits' | 'correction' | 'custom'
 *   taxYears:    number[] – which tax years this template supports
 *   pages:       number   – how many pages this template renders (default 1)
 *   pageSize:    { width: number, height: number, unit: 'in' | 'mm' }
 *   isDefault:   boolean  – whether this is the fallback template
 * }
 */

const REQUIRED_MANIFEST_KEYS = ['id', 'name', 'version', 'category']

function validateManifest(manifest) {
  const missing = REQUIRED_MANIFEST_KEYS.filter((k) => !manifest[k])
  if (missing.length > 0) {
    throw new Error(`Template manifest missing required fields: ${missing.join(', ')}`)
  }
  if (manifest.pageSize) {
    const { width, height } = manifest.pageSize
    if (typeof width !== 'number' || typeof height !== 'number') {
      throw new Error(`Template "${manifest.id}": pageSize.width and pageSize.height must be numbers`)
    }
  }
}

/**
 * Register a template.
 *
 * @param {Object}   manifest  – template manifest (metadata + page config)
 * @param {Object}   mapping   – field mapping definition
 * @param {Function} component – React component that renders the template
 * @param {string}   [css]     – optional CSS string for style isolation
 */
export function registerTemplate(manifest, mapping, component, css) {
  validateManifest(manifest)

  if (templates.has(manifest.id)) {
    console.warn(`Template "${manifest.id}" is already registered. Replacing.`)
  }

  templates.set(manifest.id, {
    manifest: {
      pages: 1,
      pageSize: { width: 8.5, height: 11, unit: 'in' },
      isDefault: false,
      taxYears: [],
      author: '',
      description: '',
      ...manifest,
    },
    mapping: mapping || { fields: {} },
    component,
    css: css || null,
  })
}

/** Get a registered template by ID. */
export function getTemplate(id) {
  return templates.get(id) || null
}

/** Get all registered templates as an array. */
export function getAllTemplates() {
  return Array.from(templates.values())
}

/** Get the default template (first one marked isDefault, or first registered). */
export function getDefaultTemplate() {
  for (const t of templates.values()) {
    if (t.manifest.isDefault) return t
  }
  const first = templates.values().next()
  return first.done ? null : first.value
}

/** Get templates compatible with a specific tax year. */
export function getTemplatesForYear(year) {
  return getAllTemplates().filter((t) => {
    if (!t.manifest.taxYears || t.manifest.taxYears.length === 0) return true
    return t.manifest.taxYears.includes(year)
  })
}

/** Check if any templates are registered. */
export function hasTemplates() {
  return templates.size > 0
}

/** Register a PDF base URL for a template (used by PDF generator). */
export function setPdfBase(templateId, url) {
  const t = templates.get(templateId)
  if (t) t.pdfBaseUrl = url
}

/** Get the PDF base URL for a template. */
export function getPdfBase(templateId) {
  return templates.get(templateId)?.pdfBaseUrl || null
}

/** Unregister a template (useful for testing). */
export function unregisterTemplate(id) {
  templates.delete(id)
}

/** Clear all registered templates (testing only). */
export function clearRegistry() {
  templates.clear()
}
