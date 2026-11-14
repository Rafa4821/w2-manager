/**
 * PDF Generator — main orchestrator that selects the best strategy
 * (overlay vs scratch) and produces a downloadable PDF.
 *
 * This module does NOT claim the output is suitable for official tax
 * filing. The generated PDF is a visual representation only; compliance
 * requires verification with the issuing payroll system.
 */
import { getTemplate, getPdfBase, adaptDocumentForTemplate } from '../../../templates'
import { generateFromBase } from './pdfOverlayGenerator'
import { generateFromScratch } from './pdfScratchGenerator'

/**
 * Generate a PDF for a W-2 document using the specified template.
 *
 * @param {Object} doc          – W-2 document from the repository
 * @param {string} templateId   – registered template ID
 * @returns {Promise<{
 *   pdfBytes: Uint8Array,
 *   filename: string,
 *   stats: Object,
 *   warnings: string[],
 *   strategy: 'overlay'|'scratch'
 * }>}
 */
export async function generatePdf(doc, templateId) {
  const template = getTemplate(templateId)
  if (!template) throw new Error(`Template "${templateId}" is not registered.`)

  // Adapt the document data to the template's expected format
  const adaptedData = adaptDocumentForTemplate(doc)
  const mapping = template.mapping
  const manifest = template.manifest

  // Check for a clean base PDF
  const pdfBaseUrl = getPdfBase(templateId)

  let result
  if (pdfBaseUrl) {
    result = await generateFromBase(pdfBaseUrl, mapping, adaptedData)
  } else {
    result = await generateFromScratch(mapping, adaptedData, manifest)
  }

  // Build filename
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
 *
 * @param {Object[]} docs        – array of W-2 documents
 * @param {string}   templateId  – template to use for all
 * @param {Function} [onProgress] – callback(index, total, result|error)
 * @returns {Promise<Object[]>} – array of generation results
 */
export async function generateBatch(docs, templateId, onProgress) {
  const results = []
  for (let i = 0; i < docs.length; i++) {
    try {
      const result = await generatePdf(docs[i], templateId)
      results.push({ docId: docs[i].id, success: true, ...result })
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
