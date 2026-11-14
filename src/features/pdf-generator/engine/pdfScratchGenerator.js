/**
 * PDF Scratch Generator — creates a PDF from scratch using pdf-lib
 * when no blank-base.pdf is available. Places mapped fields on blank
 * pages at the correct coordinates. Less visually faithful than the
 * overlay strategy, but functional for any template.
 */
import { PDFDocument } from 'pdf-lib'
import { embedFonts, drawFieldsOnPage, groupFieldsByPage } from './pdfFieldRenderer'

/**
 * Generate a PDF from scratch with mapped field data.
 *
 * @param {Object} mapping   – template mapping.json content
 * @param {Object} data      – adapted document data
 * @param {Object} manifest  – template manifest (pages, pageSize)
 * @returns {Promise<{ pdfBytes: Uint8Array, stats: Object, warnings: string[] }>}
 */
export async function generateFromScratch(mapping, data, manifest) {
  const warnings = []
  warnings.push('No base PDF available — generated from scratch without form background.')

  const pdfDoc = await PDFDocument.create()
  const fonts = await embedFonts(pdfDoc)

  // Determine page dimensions in PDF points (72 pt/in)
  const pageSizePt = mapping.pageSizePt || [
    (manifest.pageSize?.width || 8.5) * 72,
    (manifest.pageSize?.height || 11) * 72,
  ]
  const numPages = manifest.pages || 1

  // Create pages
  const pages = []
  for (let i = 0; i < numPages; i++) {
    pages.push(pdfDoc.addPage(pageSizePt))
  }

  // Group and draw fields
  const fields = mapping.fields || []
  const fieldsByPage = groupFieldsByPage(fields, numPages)

  let totalDrawn = 0
  let totalSkipped = 0
  const allClipped = []

  for (const [pageIdx, pageFields] of Object.entries(fieldsByPage)) {
    const page = pages[parseInt(pageIdx)]
    if (!page) continue
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
      strategy: 'scratch',
      pages: numPages,
      fieldsDrawn: totalDrawn,
      fieldsSkipped: totalSkipped,
      fieldsTruncated: allClipped.length,
    },
    warnings,
  }
}
