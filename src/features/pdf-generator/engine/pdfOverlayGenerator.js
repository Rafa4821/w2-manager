/**
 * PDF Overlay Generator — loads a blank-base.pdf and overlays mapped
 * text fields using pdf-lib. This preserves the maximum visual fidelity
 * of the original form because the vector/raster base is untouched.
 */
import { PDFDocument } from 'pdf-lib'
import { embedFonts, drawFieldsOnPage, groupFieldsByPage } from './pdfFieldRenderer'

/**
 * Generate a PDF by overlaying data onto a clean base PDF.
 *
 * @param {string} pdfBaseUrl  – URL of the blank-base.pdf asset
 * @param {Object} mapping     – template mapping.json content
 * @param {Object} data        – adapted document data (from documentAdapter)
 * @returns {Promise<{ pdfBytes: Uint8Array, stats: Object, warnings: string[] }>}
 */
export async function generateFromBase(pdfBaseUrl, mapping, data) {
  const warnings = []

  // Fetch and load the base PDF
  const response = await fetch(pdfBaseUrl)
  if (!response.ok) throw new Error(`Failed to fetch PDF base: ${response.status}`)
  const baseBytes = await response.arrayBuffer()
  const pdfDoc = await PDFDocument.load(baseBytes)
  const fonts = await embedFonts(pdfDoc)
  const pages = pdfDoc.getPages()

  if (pages.length === 0) throw new Error('Base PDF has no pages')

  // Group mapping fields by page
  const fields = mapping.fields || []
  const fieldsByPage = groupFieldsByPage(fields, pages.length)

  let totalDrawn = 0
  let totalSkipped = 0
  const allClipped = []

  for (const [pageIdx, pageFields] of Object.entries(fieldsByPage)) {
    const page = pages[parseInt(pageIdx)]
    if (!page) {
      if (pageFields.length > 0) {
        warnings.push(`Page ${pageIdx} has ${pageFields.length} fields but PDF only has ${pages.length} pages`)
      }
      continue
    }
    const result = drawFieldsOnPage(page, pageFields, fonts, data)
    totalDrawn += result.drawn
    totalSkipped += result.skipped
    if (result.clipped.length > 0) allClipped.push(...result.clipped)
  }

  if (allClipped.length > 0) {
    warnings.push(`${allClipped.length} field(s) were truncated to fit: ${allClipped.join(', ')}`)
  }

  const pdfBytes = await pdfDoc.save()

  return {
    pdfBytes,
    stats: {
      strategy: 'overlay',
      pages: pages.length,
      fieldsDrawn: totalDrawn,
      fieldsSkipped: totalSkipped,
      fieldsTruncated: allClipped.length,
    },
    warnings,
  }
}
