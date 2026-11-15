/**
 * PDF Generator — renders HTML/CSS templates via html2canvas → pdf-lib.
 *
 * Strategy:
 * 1. html: Render React template component to hidden DOM → capture with html2canvas → embed in PDF
 * 2. base-overlay: (fallback) Load blank-base.pdf + vector text overlay
 * 3. scratch: (fallback) Create blank PDF pages and place fields
 */
import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import html2canvas from 'html2canvas'
import { PDFDocument } from 'pdf-lib'
import { getTemplate, getPdfBase, adaptDocumentForTemplate } from '../../../templates'
import { generateFromBase } from './pdfOverlayGenerator'
import { generateFromScratch } from './pdfScratchGenerator'

/**
 * Render a React template component to a hidden container,
 * capture each .w2page with html2canvas, and create a PDF.
 */
async function generateFromHtml(template, adaptedData, doc) {
  const Component = template.component

  // Create hidden container
  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1;'
  document.body.appendChild(container)

  // Inject template CSS
  let styleEl = null
  if (template.css) {
    styleEl = document.createElement('style')
    styleEl.textContent = template.css
    document.head.appendChild(styleEl)
  }

  // Also inject the w2copy.css
  let w2copyStyle = null
  try {
    const cssModule = await import('../../../templates/engine/w2copy.css?inline')
    w2copyStyle = document.createElement('style')
    w2copyStyle.textContent = cssModule.default
    document.head.appendChild(w2copyStyle)
  } catch {
    // CSS may already be loaded via import
  }

  try {
    // Render the template component
    const root = createRoot(container)
    await new Promise((resolve) => {
      root.render(createElement(Component, { data: adaptedData, doc }))
      // Wait for React to flush
      setTimeout(resolve, 100)
    })

    // Find all page elements
    const pages = container.querySelectorAll('.w2page')
    if (!pages.length) {
      throw new Error('Template did not render any .w2page elements')
    }

    const pdfDoc = await PDFDocument.create()

    for (const pageEl of pages) {
      const isLandscape = pageEl.classList.contains('w2page-landscape')
      const pageW = isLandscape ? 792 : 612
      const pageH = isLandscape ? 612 : 792

      const canvas = await html2canvas(pageEl, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        width: pageW,
        height: pageH,
      })

      const dataUrl = canvas.toDataURL('image/png')
      const base64 = dataUrl.split(',')[1]
      const pngBytes = Uint8Array.from(window.atob(base64), (c) => c.charCodeAt(0))
      const pngImage = await pdfDoc.embedPng(pngBytes)
      const pdfPage = pdfDoc.addPage([pageW, pageH])
      pdfPage.drawImage(pngImage, { x: 0, y: 0, width: pageW, height: pageH })
    }

    const pdfBytes = await pdfDoc.save()

    // Cleanup
    root.unmount()

    return {
      pdfBytes,
      stats: { strategy: 'html', pages: pages.length },
      warnings: [],
    }
  } finally {
    document.body.removeChild(container)
    if (styleEl) document.head.removeChild(styleEl)
    if (w2copyStyle) document.head.removeChild(w2copyStyle)
  }
}

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

  // Use HTML rendering if the template is self-contained (HTML/CSS based)
  if (manifest?.selfContained) {
    result = await generateFromHtml(template, adaptedData, doc)
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
