/**
 * Field Mapper — maps W-2 document data to template-specific field names.
 *
 * Each template defines a mapping.json that maps its internal field IDs
 * to paths in the W-2 document schema. This module resolves those paths
 * and produces a flat object the template component can consume directly.
 */

import { formatUSD } from '../../shared/utils/currency'

/**
 * Resolve a dot-separated path on an object.
 * e.g. resolvePath(doc, 'companySnapshot.name') → 'Acme Corp'
 */
function resolvePath(obj, path) {
  if (!path || !obj) return undefined
  return path.split('.').reduce((acc, key) => {
    if (acc === null || acc === undefined) return undefined
    // Support array notation: box12[0].code
    const match = key.match(/^(\w+)\[(\d+)]$/)
    if (match) {
      const arr = acc[match[1]]
      return Array.isArray(arr) ? arr[Number(match[2])] : undefined
    }
    return acc[key]
  }, obj)
}

/**
 * Apply a mapping definition to a W-2 document.
 *
 * @param {Object} doc       – The full W-2 document object
 * @param {Object} mapping   – mapping.json content: { fields: { templateFieldId: { path, type, format? } } }
 * @returns {Object}         – Flat { templateFieldId: resolvedValue } ready for the template
 */
export function mapDocumentToTemplate(doc, mapping) {
  if (!mapping?.fields) return {}

  const result = {}

  for (const [fieldId, fieldDef] of Object.entries(mapping.fields)) {
    const raw = resolvePath(doc, fieldDef.path)

    switch (fieldDef.type) {
      case 'currency':
        result[fieldId] = typeof raw === 'number' ? formatUSD(raw) : (raw ?? '—')
        break
      case 'boolean':
        result[fieldId] = !!raw
        break
      case 'array':
        result[fieldId] = Array.isArray(raw) ? raw : []
        break
      case 'number':
        result[fieldId] = typeof raw === 'number' ? raw : (Number(raw) || 0)
        break
      case 'text':
      default:
        result[fieldId] = raw !== undefined && raw !== null ? String(raw) : ''
        break
    }

    // Apply optional format transforms
    if (fieldDef.format === 'uppercase' && typeof result[fieldId] === 'string') {
      result[fieldId] = result[fieldId].toUpperCase()
    }
  }

  return result
}

/**
 * Get the list of required document fields for a given mapping.
 * Useful for validating that a document has the data a template needs.
 */
export function getRequiredFields(mapping) {
  if (!mapping?.fields) return []
  return Object.entries(mapping.fields)
    .filter(([, def]) => def.required)
    .map(([id, def]) => ({ id, path: def.path, label: def.label || id }))
}

/**
 * Check which required fields are missing from a document.
 */
export function getMissingFields(doc, mapping) {
  const required = getRequiredFields(mapping)
  return required.filter((f) => {
    const val = resolvePath(doc, f.path)
    return val === undefined || val === null || val === ''
  })
}
