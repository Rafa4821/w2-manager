/**
 * Shared logic for drawing mapped fields onto pdf-lib pages.
 *
 * Coordinates in mapping.json use PDF-point units with a top-left origin
 * (matching the SVG viewBox). pdf-lib uses a bottom-left origin, so we
 * convert: pdfY = pageHeight - svgY.
 */
import { rgb, StandardFonts } from 'pdf-lib'

/** Embed the four standard fonts we need. */
export async function embedFonts(pdfDoc) {
  return {
    helvetica: await pdfDoc.embedFont(StandardFonts.Helvetica),
    helveticaBold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
    courier: await pdfDoc.embedFont(StandardFonts.Courier),
    courierBold: await pdfDoc.embedFont(StandardFonts.CourierBold),
  }
}

/** Pick the correct font for a field. */
function pickFont(field, fonts) {
  const family = (field.fontFamily || '').toLowerCase()
  const bold = field.fontWeight >= 700
  if (family.includes('courier')) return bold ? fonts.courierBold : fonts.courier
  return bold ? fonts.helveticaBold : fonts.helvetica
}

/** Resolve a dotted path against the adapted data. */
function resolvePath(data, path) {
  return path.split('.').reduce((obj, key) => obj?.[key], data)
}

/** Get the display string for a field from adapted document data. */
export function resolveFieldValue(data, field) {
  const path = field.path || field.key
  if (!path) return ''

  const raw = resolvePath(data, path)

  // Null / undefined / empty → skip
  if (raw == null || raw === '') return ''

  // Year field → integer, never decimal
  if (path === 'year') return String(Math.round(Number(raw)))

  // Checkbox fields (boxes.13.*)
  if (path.startsWith('boxes.13.') || field.type === 'checkbox') {
    return raw === true ? 'X' : ''
  }

  // Boolean values → never show "false" or "true"
  if (typeof raw === 'boolean') return raw ? 'X' : ''

  // Money fields (boxes.1 through boxes.20, excluding 13 and non-numeric)
  if (typeof raw === 'number') {
    // Zero values → don't show
    if (raw === 0) return ''
    // Format as money with 2 decimals
    return raw.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return String(raw)
}

/** Truncate text so it fits within maxWidth points. */
function truncateToFit(text, font, size, maxWidth) {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text
  let t = text
  while (t.length > 0 && font.widthOfTextAtSize(t + '...', size) > maxWidth) {
    t = t.slice(0, -1)
  }
  return t.length < text.length ? t + '...' : text
}

/**
 * Sanitise a string so pdf-lib can encode it.
 */
function sanitiseForStandardFont(text) {
  return text
    .replace(/[\u2018\u2019\u201A]/g, "'")
    .replace(/[\u201C\u201D\u201E]/g, '"')
    .replace(/\u2026/g, '...')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[^\u0020-\u007E\u00A0-\u00FF]/g, '')
}

/**
 * Draw all fields for a given page onto a pdf-lib page.
 */
export function drawFieldsOnPage(page, fields, fonts, data) {
  const { height } = page.getSize()
  const textColor = rgb(0.08, 0.08, 0.08)
  let drawn = 0
  let skipped = 0
  const clipped = []

  for (const field of fields) {
    const value = resolveFieldValue(data, field)
    if (!value) { skipped++; continue }

    const font = pickFont(field, fonts)
    const size = field.fontSize || 8
    const ySource = field.y ?? field.baselineY ?? 0
    const pdfY = height - ySource
    let x = field.x ?? 0

    if (field.align === 'end') {
      x -= font.widthOfTextAtSize(value, size)
    }

    let displayText = sanitiseForStandardFont(value)
    if (field.maxWidth) {
      const before = displayText
      displayText = truncateToFit(displayText, font, size, field.maxWidth)
      if (displayText !== before) clipped.push(field.id || field.path)
    }

    page.drawText(displayText, { x, y: pdfY, size, font, color: textColor })
    drawn++
  }

  return { drawn, skipped, clipped }
}

/**
 * Group mapping fields by their page index (0-based).
 */
export function groupFieldsByPage(fields, totalPages) {
  const groups = {}
  for (let i = 0; i < (totalPages || 1); i++) groups[i] = []
  for (const field of fields) {
    let pageIdx = field.page ?? 0
    if (totalPages && pageIdx >= totalPages && pageIdx > 0) pageIdx -= 1
    if (!groups[pageIdx]) groups[pageIdx] = []
    groups[pageIdx].push(field)
  }
  return groups
}
