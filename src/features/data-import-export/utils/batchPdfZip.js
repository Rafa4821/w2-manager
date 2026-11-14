/**
 * Batch PDF generation + ZIP bundling.
 * Generates PDFs for multiple documents and packages them into a ZIP file.
 */
import JSZip from 'jszip'
import { generatePdf } from '../../pdf-generator/engine/pdfGenerator'
import { getTemplatesForYear } from '../../../templates'

/**
 * Pick the best template for a document.
 * Uses the document's own templateId if set, otherwise the first
 * production template matching its tax year.
 */
function pickTemplate(doc) {
  if (doc.templateId) return doc.templateId
  const candidates = getTemplatesForYear(doc.taxYear).filter((t) => t.manifest.id !== 'demo-w2')
  return candidates.length > 0 ? candidates[0].manifest.id : null
}

/**
 * Generate PDFs for selected documents and bundle into a ZIP.
 *
 * @param {Object[]} docs          – W-2 documents to process
 * @param {string|null} templateId – template override (null = auto-pick per doc)
 * @param {Function} [onProgress]  – callback(current, total, result)
 * @returns {Promise<{
 *   zipBlob: Blob,
 *   zipFilename: string,
 *   results: Object[],
 *   successCount: number,
 *   failCount: number,
 * }>}
 */
export async function generateBatchZip(docs, templateId, onProgress) {
  const zip = new JSZip()
  const results = []
  let successCount = 0
  let failCount = 0

  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i]
    const tid = templateId || pickTemplate(doc)
    if (!tid) {
      results.push({ docId: doc.id, success: false, error: `No template available for tax year ${doc.taxYear}` })
      failCount++
      onProgress?.(i + 1, docs.length, results[results.length - 1])
      continue
    }
    try {
      const result = await generatePdf(doc, tid)
      zip.file(result.filename, result.pdfBytes)
      results.push({ docId: doc.id, success: true, filename: result.filename, stats: result.stats, warnings: result.warnings })
      successCount++
    } catch (err) {
      results.push({ docId: doc.id, success: false, error: err.message })
      failCount++
    }
    onProgress?.(i + 1, docs.length, results[results.length - 1])
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  const date = new Date().toISOString().split('T')[0]
  const zipFilename = `W2_PDFs_${date}_${successCount}docs.zip`

  return { zipBlob, zipFilename, results, successCount, failCount }
}

/** Trigger download of a Blob. */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
