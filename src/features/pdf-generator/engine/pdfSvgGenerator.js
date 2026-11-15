/**
 * SVG-based PDF Generator — builds SVG pages with background images and
 * positioned text fields, renders them to high-resolution canvases, and
 * embeds the resulting images in a PDF via pdf-lib.
 *
 * This approach guarantees the PDF output matches the HTML/SVG preview
 * because both use the same rendering pipeline: background image + text.
 * No "blanking rectangles" are needed.
 */
/* global Image, atob */
import { PDFDocument } from 'pdf-lib'
import { resolveFieldValue, groupFieldsByPage } from './pdfFieldRenderer'

const SCALE = 2 // 2x resolution for crisp text

/**
 * Fetch an image URL and return it as a base64 data-URL string.
 */
async function imageToDataUrl(url) {
  const res = await fetch(url)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Escape text for safe inclusion in SVG markup.
 */
function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

/**
 * Build an SVG string for one page with inlined background and text fields.
 */
function buildPageSvg(bgDataUrl, fields, data, pageW, pageH) {
  const lines = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${pageW}" height="${pageH}" viewBox="0 0 ${pageW} ${pageH}">`,
  ]

  if (bgDataUrl) {
    lines.push(`<image href="${bgDataUrl}" x="0" y="0" width="${pageW}" height="${pageH}" />`)
  }

  for (const field of fields) {
    const value = resolveFieldValue(data, field)
    if (!value) continue

    const x = field.x ?? 0
    const y = field.baselineY ?? field.y ?? 0
    const fs = field.fontSize || 8
    const fw = field.fontWeight || 'normal'
    const ff = field.fontFamily || 'Arial, Helvetica, sans-serif'
    const anchor = field.align === 'end' ? 'end' : 'start'

    lines.push(
      `<text x="${x}" y="${y}" font-size="${fs}" font-weight="${fw}" ` +
      `font-family="${ff}" fill="#141414" text-anchor="${anchor}" ` +
      `text-rendering="geometricPrecision">${escapeXml(value)}</text>`
    )
  }

  lines.push('</svg>')
  return lines.join('\n')
}

/**
 * Render an SVG string to a canvas and return PNG bytes.
 */
async function svgToCanvas(svgString, width, height) {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const img = new Image()
  img.width = width
  img.height = height

  await new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = (e) => reject(new Error('SVG render failed: ' + e))
    img.src = url
  })

  const canvas = document.createElement('canvas')
  canvas.width = width * SCALE
  canvas.height = height * SCALE
  const ctx = canvas.getContext('2d')
  ctx.scale(SCALE, SCALE)
  ctx.drawImage(img, 0, 0, width, height)

  URL.revokeObjectURL(url)
  return canvas
}

/**
 * Generate a PDF by rendering SVG pages with background images.
 *
 * @param {string[]} backgroundUrls - URLs of background PNGs (one per page)
 * @param {Object}   mapping        - template mapping.json
 * @param {Object}   data           - adapted document data
 * @param {Object}   [manifest]     - template manifest for page size info
 * @returns {Promise<{ pdfBytes: Uint8Array, stats: Object, warnings: string[] }>}
 */
export async function generateFromSvg(backgroundUrls, mapping, data, _manifest) {
  const warnings = []
  const fields = mapping.fields || []

  // Determine page dimensions
  const pageSizePt = mapping.pageSizePt || [612, 792]
  const pageW = pageSizePt[0]
  const pageH = pageSizePt[1]
  const numPages = Math.max(backgroundUrls.length, mapping.pages || 1)

  // Convert background images to data URLs (inline for SVG)
  const bgDataUrls = []
  for (const url of backgroundUrls) {
    try {
      bgDataUrls.push(await imageToDataUrl(url))
    } catch {
      bgDataUrls.push(null)
      warnings.push('Failed to load background image: ' + url)
    }
  }

  // Group fields by page
  const fieldsByPage = groupFieldsByPage(fields, numPages)

  // Build and render each page
  const pdfDoc = await PDFDocument.create()
  let totalDrawn = 0

  for (let i = 0; i < numPages; i++) {
    const bgDataUrl = bgDataUrls[i] || bgDataUrls[0] || null
    const pageFields = fieldsByPage[i] || []

    const svgString = buildPageSvg(bgDataUrl, pageFields, data, pageW, pageH)
    const drawnCount = pageFields.filter(f => resolveFieldValue(data, f)).length
    totalDrawn += drawnCount

    try {
      const canvas = await svgToCanvas(svgString, pageW, pageH)
      const pngDataUrl = canvas.toDataURL('image/png')
      const pngBytes = Uint8Array.from(atob(pngDataUrl.split(',')[1]), c => c.charCodeAt(0))
      const pngImage = await pdfDoc.embedPng(pngBytes)
      const page = pdfDoc.addPage([pageW, pageH])
      page.drawImage(pngImage, { x: 0, y: 0, width: pageW, height: pageH })
    } catch (err) {
      warnings.push(`Page ${i}: SVG render failed — ${err.message}`)
      // Add blank page as fallback
      pdfDoc.addPage([pageW, pageH])
    }
  }

  const pdfBytes = await pdfDoc.save()

  return {
    pdfBytes,
    stats: {
      strategy: 'svg',
      pages: numPages,
      fieldsDrawn: totalDrawn,
    },
    warnings,
  }
}
