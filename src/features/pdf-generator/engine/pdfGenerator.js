/**
 * PDF Generator — renders SVG pages with background images for maximum fidelity.
 *
 * Strategy priority:
 * 1. svg: Build SVG with background PNG + text fields → Canvas → PDF (best quality)
 * 2. base-overlay: Load blank-base.pdf, overlay fields via mapping coordinates
 * 3. scratch: Create blank PDF pages and place fields (lowest fidelity)
 */
import { getTemplate, getPdfBase, getBackgroundImages, adaptDocumentForTemplate } from '../../../templates'
import { generateFromSvg } from './pdfSvgGenerator'
import { generateFromBase } from './pdfOverlayGenerator'
import { generateFromScratch } from './pdfScratchGenerator'

/**
 * Generate a PDF for a W-2 document using the specified template.
 */
export async function generatePdf(doc, templateId) {
  const template = getTemplate(templateId)
  if (!template) throw new Error(`Template "${templateId}" is not registered.`)

  const adaptedData = adaptDocumentForTemplate(doc)
  const mapping = template.mapping
  const manifest = template.manifest

  let result
  const bgImages = getBackgroundImages(templateId)
  if (bgImages && bgImages.length > 0) {
    // Best strategy: SVG rendering with background images
    result = await generateFromSvg(bgImages, mapping, adaptedData, manifest)
  } else {
    const pdfBaseUrl = getPdfBase(templateId)
    if (pdfBaseUrl) {
      result = await generateFromBase(pdfBaseUrl, mapping, adaptedData)
    } else {
      result = await generateFromScratch(mapping, adaptedData, manifest)
    }
  }

  const empName = doc.employeeSnapshot
    ? `${doc.employeeSnapshot.lastName}_${doc.employeeSnapshot.firstName}`
    : 'Unknown'
  const year = doc.taxYear || 'XXXX'
  const filename = `W2_${year}_${empName}_${templateId}.pdf`.replace(/\s+/g, '_')

  return {
    pdfBytes: result.pdfBytes,
    filename,
    stats: result.stats,
    warnings: result.warnings,
    strategy: result.stats.strategy,
  }
}

/**
 * Generate PDFs for multiple documents.
 */
export async function generateBatch(docs, templateId, onProgress) {
  const results = []
  for (let i = 0; i < docs.length; i++) {
    try {
      const r = await generatePdf(docs[i], templateId)
      results.push({ docId: docs[i].id, success: true, ...r })
    } catch (err) {
      results.push({ docId: docs[i].id, success: false, error: err.message })
    }
    onProgress?.(i + 1, docs.length, results[results.length - 1])
  }
  return results
}

/** Create an object URL for previewing a PDF in the browser. */
export function createPdfUrl(pdfBytes) {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  return URL.createObjectURL(blob)
}

/** Trigger a file download in the browser. */
export function downloadPdf(pdfBytes, filename) {
  const url = createPdfUrl(pdfBytes)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
