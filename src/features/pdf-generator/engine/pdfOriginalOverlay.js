/**
 * PDF Original Overlay Engine
 * 
 * Loads the original filled PDF, whites out variable data areas,
 * then overlays new data at the exact same positions.
 * This produces output identical to the original form structure.
 */
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

const WHITE = rgb(1, 1, 1)
const BLACK = rgb(0, 0, 0)

function sanitizeText(str) {
  if (!str) return ''
  return String(str)
    .replace(/[\u2018\u2019\u201A]/g, "'")
    .replace(/[\u201C\u201D\u201E]/g, '"')
    .replace(/\u2026/g, '...')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '')
}

function formatMoney(value) {
  if (value === null || value === undefined || value === '') return ''
  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[,$]/g, ''))
  if (isNaN(num)) return ''
  if (num === 0) return ''
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * Resolve a field value from the W-2 document data.
 */
export function resolveFieldValue(doc, fieldId) {
  if (!doc) return ''
  const comp = doc.companySnapshot || {}
  const emp = doc.employeeSnapshot || {}
  const sl = (doc.stateLocal || [])[0] || {}

  switch (fieldId) {
    case 'employee.ssn': return emp.ssn || ''
    case 'employer.ein': return comp.ein || ''
    case 'taxYear': return String(doc.taxYear || '')
    case 'employer.name': return (comp.name || '').toUpperCase()
    case 'employer.addressLine1': return [comp.address, comp.address2].filter(Boolean).join(', ').toUpperCase()
    case 'employer.cityStateZip': return [comp.city, comp.state, comp.zipCode].filter(Boolean).join(' ').toUpperCase()
    case 'employee.name': return [emp.firstName, emp.middleInitial, emp.lastName, emp.suffix].filter(Boolean).join(' ').toUpperCase()
    case 'employee.addressLine1': return [emp.address, emp.address2].filter(Boolean).join(', ').toUpperCase()
    case 'employee.cityStateZip': return [emp.city, emp.state, emp.zipCode].filter(Boolean).join(' ').toUpperCase()
    case 'controlNumber': return doc.controlNumber || ''
    case 'box1': return formatMoney(doc.box1_wagesTips)
    case 'box2': return formatMoney(doc.box2_federalTaxWithheld)
    case 'box3': return formatMoney(doc.box3_socialSecurityWages)
    case 'box4': return formatMoney(doc.box4_socialSecurityTax)
    case 'box5': return formatMoney(doc.box5_medicareWages)
    case 'box6': return formatMoney(doc.box6_medicareTax)
    case 'box7': return formatMoney(doc.box7_socialSecurityTips)
    case 'box8': return formatMoney(doc.box8_allocatedTips)
    case 'box10': return formatMoney(doc.box10_dependentCareBenefits)
    case 'box11': return formatMoney(doc.box11_nonqualifiedPlans)
    case 'box12a': return fmtBox12(doc, 0)
    case 'box12b': return fmtBox12(doc, 1)
    case 'box12c': return fmtBox12(doc, 2)
    case 'box12d': return fmtBox12(doc, 3)
    case 'box13.statutory': return doc.box13_statutoryEmployee ? 'X' : ''
    case 'box13.retirement': return doc.box13_retirementPlan ? 'X' : ''
    case 'box13.thirdParty': return doc.box13_thirdPartySickPay ? 'X' : ''
    case 'box14': return (doc.box14 || []).map(e => `${e.description}: ${formatMoney(e.amount)}`).join('; ')
    case 'box15.state': return sl.state || ''
    case 'box15.employerId': return sl.employerStateId || ''
    case 'box16': return formatMoney(sl.stateWages)
    case 'box17': return formatMoney(sl.stateTax)
    case 'box18': return formatMoney(sl.localWages)
    case 'box19': return formatMoney(sl.localTax)
    case 'box20': return sl.localityName || ''
    case 'flags.void': return ''
    default: return ''
  }
}

function fmtBox12(doc, idx) {
  const e = (doc.box12 || [])[idx]
  if (!e || !e.code) return ''
  return `${e.code}  ${formatMoney(e.amount)}`
}

/**
 * Generate a PDF by overlaying data on the original filled PDF.
 *
 * @param {Uint8Array} originalPdfBytes - The original filled PDF bytes
 * @param {Object} fieldMap - pdfMapping.json content
 * @param {Object} doc - W-2 document data from the repository
 * @returns {Promise<{ pdfBytes: Uint8Array, stats: Object, warnings: string[] }>}
 */
export async function generateFromOriginal(originalPdfBytes, fieldMap, doc) {
  const pdfDoc = await PDFDocument.load(originalPdfBytes)
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const warnings = []
  let fieldsDrawn = 0
  let fieldsBlanked = 0

  for (const pageMap of fieldMap.pages) {
    const page = pdfDoc.getPage(pageMap.pageIndex)
    if (!page) { warnings.push(`Page ${pageMap.pageIndex} not found`); continue }

    for (const field of pageMap.fields) {
      const value = sanitizeText(resolveFieldValue(doc, field.field))
      const fontSize = field.fontSize || 8
      const maxW = field.maxWidth || 150

      // Step 1: blank the original text with a white rectangle
      page.drawRectangle({
        x: field.x - 2,
        y: field.pdfY - 3,
        width: maxW + 6,
        height: fontSize + 6,
        color: WHITE,
      })
      fieldsBlanked++

      // Step 2: draw new value
      if (value) {
        const font = field.bold ? helveticaBold : helvetica
        const textWidth = font.widthOfTextAtSize(value, fontSize)

        // Respect alignment
        let drawX = field.x
        if (field.align === 'end') {
          drawX = field.x - textWidth
        } else if (field.align === 'center') {
          drawX = field.x - textWidth / 2
        }

        // Truncate if too wide
        let finalValue = value
        if (textWidth > maxW && maxW > 20) {
          while (font.widthOfTextAtSize(finalValue + '…', fontSize) > maxW && finalValue.length > 1) {
            finalValue = finalValue.slice(0, -1)
          }
          finalValue += '…'
          if (field.align === 'end') drawX = field.x - font.widthOfTextAtSize(finalValue, fontSize)
        }

        page.drawText(finalValue, { x: drawX, y: field.pdfY, size: fontSize, font, color: BLACK })
        fieldsDrawn++
      }
    }
  }

  return {
    pdfBytes: await pdfDoc.save(),
    stats: { strategy: 'original-overlay', fieldsBlanked, fieldsDrawn, pages: pdfDoc.getPageCount() },
    warnings,
  }
}
