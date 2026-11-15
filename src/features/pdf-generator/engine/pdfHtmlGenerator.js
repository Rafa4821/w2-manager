/**
 * pdfHtmlGenerator — Renders HTML template to canvas, then embeds in PDF.
 *
 * Uses html2canvas to capture the rendered HTML W-2 form,
 * then embeds each page as a high-resolution image in a pdf-lib document.
 */
import html2canvas from 'html2canvas'
import { PDFDocument } from 'pdf-lib'

/**
 * Generate a PDF from the rendered HTML template.
 *
 * @param {HTMLElement} container - DOM element containing the rendered template
 * @param {object} manifest - Template manifest with page info
 * @returns {Promise<Uint8Array>} PDF bytes
 */
export async function generateFromHtml(container, _manifest) {
  const pages = container.querySelectorAll('.w2page')
  if (!pages.length) {
    throw new Error('No .w2page elements found in container')
  }

  const doc = await PDFDocument.create()

  for (const pageEl of pages) {
    const isLandscape = pageEl.classList.contains('w2page-landscape')
    const pageW = isLandscape ? 792 : 612
    const pageH = isLandscape ? 612 : 792

    // Render to canvas at 2x resolution for crisp output
    const canvas = await html2canvas(pageEl, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
      width: pageW,
      height: pageH,
    })

    // Convert canvas to PNG
    const dataUrl = canvas.toDataURL('image/png')
    const base64 = dataUrl.split(',')[1]
    const pngBytes = Uint8Array.from(window.atob(base64), (c) => c.charCodeAt(0))

    // Embed in PDF
    const pngImage = await doc.embedPng(pngBytes)
    const pdfPage = doc.addPage([pageW, pageH])
    pdfPage.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: pageW,
      height: pageH,
    })
  }

  return await doc.save()
}
