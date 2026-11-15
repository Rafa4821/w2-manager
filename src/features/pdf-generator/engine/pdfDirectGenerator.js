/**
 * pdfDirectGenerator — Draws the complete W-2 form using pdf-lib vector primitives.
 * No html2canvas, no rasterization — all text is vector (crisp at any zoom).
 *
 * Each copy layout is defined by a descriptor that specifies the position of
 * every line, box, label, and data field in PDF points (72 dpi).
 */
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(val) {
  if (val == null || val === '' || val === 0) return ''
  if (typeof val === 'number')
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (typeof val === 'boolean') return val ? 'X' : ''
  return String(val)
}

function fmtYear(val) {
  if (!val) return ''
  return String(Math.round(Number(val)))
}

function fmt12(entry) {
  if (!entry) return ''
  if (typeof entry === 'object' && entry.code)
    return `${entry.code}  ${fmt(entry.amount)}`
  return String(entry || '')
}

// ─── W-2 Copy Layout Definition ──────────────────────────────────────────────
// All coordinates in PDF points (origin bottom-left). The layout function
// takes a Y offset for the top of the copy and returns draw commands.

function buildCopyLayout(topY, copyLabel, copyDescLines) {
  // Copy dimensions (measured from original PDF)
  const L = 15       // left margin
  const R = 545      // right edge
  const W = R - L    // total width = 530

  // Column boundaries
  const C1 = 230     // end of left section / start of boxes
  const C2 = 313     // end of box col 1
  const C3 = 392     // end of box col 2
  const C4 = 465     // end of box col 3 / start of right panel

  // Row boundaries (relative offsets from top of copy)
  const rowH = {
    r1: 12,    // SSN/EIN row
    r2: 22,    // box 1-2-3
    r3: 22,    // box 4-5-6
    r4: 22,    // box 7-8-9
    r5: 21,    // control / box 10-11 / 12a
    r6: 22,    // employee top / box 13-14 / 12b
    r7: 22,    // employee mid / 13 cont / 12c
    r8: 22,    // employee bot / 13 cont / 12d
    r9: 12,    // state row
    r10: 8,    // footer
  }

  const totalH = Object.values(rowH).reduce((a, b) => a + b, 0) // ~185

  // Convert top Y (from page top) to PDF Y (from bottom)
  // topY is distance from page top
  const base = topY // we'll use "from top" coordinates and convert at draw time

  // Row Y positions (from top of copy, going down)
  let y = 0
  const ry = {}
  const rowNames = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8', 'r9', 'r10']
  for (const name of rowNames) {
    ry[name] = y
    y += rowH[name]
  }

  return { L, R, W, C1, C2, C3, C4, rowH, ry, totalH, base, copyLabel, copyDescLines }
}

// ─── Draw One Copy ───────────────────────────────────────────────────────────

function drawCopy(page, layout, data, fonts, pageH) {
  const { L, R, C1, C2, C3, C4, rowH, ry, base, copyLabel, copyDescLines } = layout
  const { helvetica, helveticaBold, courier } = fonts
  const co = data.company || {}
  const em = data.employee || {}
  const b = data.boxes || {}
  const st = data.stateTax || {}
  const yr = fmtYear(data.year)
  const black = rgb(0, 0, 0)
  const lineW = 0.5

  // Helper: convert "from-top" Y to PDF Y (from bottom)
  const pY = (fromTop) => pageH - base - fromTop

  // Helper: draw a horizontal line
  const hLine = (x1, x2, fromTop) => {
    page.drawLine({ start: { x: x1, y: pY(fromTop) }, end: { x: x2, y: pY(fromTop) }, thickness: lineW, color: black })
  }
  // Helper: draw a vertical line
  const vLine = (x, fromTop1, fromTop2) => {
    page.drawLine({ start: { x, y: pY(fromTop1) }, end: { x, y: pY(fromTop2) }, thickness: lineW, color: black })
  }
  // Helper: draw text
  const txt = (str, x, fromTop, opts = {}) => {
    if (!str && str !== 0) return
    const s = String(str)
    if (!s) return
    page.drawText(s, {
      x,
      y: pY(fromTop) - (opts.size || 6),
      size: opts.size || 6,
      font: opts.font || helvetica,
      color: black,
    })
  }
  // Helper: draw right-aligned text
  const txtR = (str, xRight, fromTop, opts = {}) => {
    if (!str && str !== 0) return
    const s = String(str)
    if (!s) return
    const font = opts.font || helveticaBold
    const size = opts.size || 8
    const w = font.widthOfTextAtSize(s, size)
    page.drawText(s, {
      x: xRight - w - 2,
      y: pY(fromTop) - size,
      size,
      font,
      color: black,
    })
  }

  // ═══ DRAW BORDERS ═══

  // Outer border (thicker)
  const outerTop = ry.r1
  const outerBot = ry.r10 + rowH.r10
  page.drawRectangle({
    x: L, y: pY(outerBot), width: R - L, height: outerBot - outerTop,
    borderColor: black, borderWidth: 1.2, color: rgb(1, 1, 1),
  })

  // Row 1 bottom
  hLine(L, R, ry.r1 + rowH.r1)
  // Row 1 vertical: SSN | EIN | OMB
  vLine(C1, ry.r1, ry.r1 + rowH.r1)
  vLine(C4, ry.r1, ry.r1 + rowH.r1)

  // Rows 2-4: employer section | box grid | right panel
  // Horizontal lines between box rows
  hLine(C1, C4, ry.r2 + rowH.r2) // between row 2 and 3
  hLine(C1, C4, ry.r3 + rowH.r3) // between row 3 and 4
  hLine(L, R, ry.r4 + rowH.r4)   // between row 4 and 5 (also bottom of employer)

  // Vertical lines for box columns
  vLine(C1, ry.r1 + rowH.r1, ry.r8 + rowH.r8) // left of boxes
  vLine(C2, ry.r1 + rowH.r1, ry.r8 + rowH.r8) // between box col 1 and 2
  vLine(C3, ry.r1 + rowH.r1, ry.r8 + rowH.r8) // between box col 2 and 3
  vLine(C4, ry.r1, ry.r8 + rowH.r8)           // right of boxes / left of right panel

  // Row 5: control | 10 | 11 | 12a
  hLine(L, C1, ry.r5 + rowH.r5) // bottom of control
  hLine(C1, C4, ry.r5 + rowH.r5)

  // Rows 6-8: employee | 13+14 | 12b-d
  // Horizontal between 6 and 7 (for box 14/12b boundary)
  hLine(C2, C4, ry.r6 + rowH.r6)
  // Horizontal between 7 and 8 (for 12c/12d boundary)
  hLine(C3, C4, ry.r7 + rowH.r7)

  // Bottom of employee section
  hLine(L, R, ry.r8 + rowH.r8)

  // State row
  // State row bottom
  hLine(L, R, ry.r9 + rowH.r9)

  // State row vertical dividers
  const stCols = [L, L + 32, L + 110, L + 195, L + 280, L + 365, L + 440, R]
  for (let i = 1; i < stCols.length - 1; i++) {
    vLine(stCols[i], ry.r8 + rowH.r8, ry.r9 + rowH.r9)
  }

  // ═══ DRAW LABELS ═══

  // Row 1
  txt('a', L + 2, ry.r1 + 1, { size: 7, font: helveticaBold })
  txt("Employee's SSN", L + 11, ry.r1 + 1, { size: 5 })
  txt('b', C1 + 2, ry.r1 + 1, { size: 7, font: helveticaBold })
  txt('Employer identification number (EIN)', C1 + 11, ry.r1 + 1, { size: 5 })
  txt('OMB No. 1545-0008', C4 + 4, ry.r1 + 1, { size: 5 })

  // Row 2: employer label + box labels
  txt('c', L + 2, ry.r1 + rowH.r1 + 1, { size: 7, font: helveticaBold })
  txt("Employer's name, address, and ZIP code", L + 11, ry.r1 + rowH.r1 + 1, { size: 5 })

  // Box 1
  txt('1', C1 + 2, ry.r2 + 1, { size: 7, font: helveticaBold })
  txt('Wages, tips, other comp.', C1 + 10, ry.r2 + 1, { size: 4.5 })
  // Box 2
  txt('2', C2 + 2, ry.r2 + 1, { size: 7, font: helveticaBold })
  txt('Federal income tax withheld', C2 + 10, ry.r2 + 1, { size: 4.5 })
  // Box 3
  txt('3', C3 + 2, ry.r3 + 1, { size: 7, font: helveticaBold })
  txt('Social security wages', C3 + 10, ry.r3 + 1, { size: 4.5 })

  // Box 4
  txt('4', C1 + 2, ry.r3 + 1, { size: 7, font: helveticaBold })
  txt('Social security tax withheld', C1 + 10, ry.r3 + 1, { size: 4.5 })
  // Box 5
  txt('5', C2 + 2, ry.r3 + 1, { size: 7, font: helveticaBold })
  txt('Medicare wages & tips', C2 + 10, ry.r3 + 1, { size: 4.5 })
  // Box 6
  txt('6', C3 + 2, ry.r3 + 1, { size: 7, font: helveticaBold })
  txt('Medicare tax withheld', C3 + 10, ry.r3 + 1, { size: 4.5 })

  // Box 7
  txt('7', C1 + 2, ry.r4 + 1, { size: 7, font: helveticaBold })
  txt('Social security tips', C1 + 10, ry.r4 + 1, { size: 4.5 })
  // Box 8
  txt('8', C2 + 2, ry.r4 + 1, { size: 7, font: helveticaBold })
  txt('Allocated tips', C2 + 10, ry.r4 + 1, { size: 4.5 })
  // Box 9
  txt('9', C3 + 2, ry.r4 + 1, { size: 7, font: helveticaBold })

  // Row 5 labels
  txt('d', L + 2, ry.r5 + 1, { size: 7, font: helveticaBold })
  txt('Control number', L + 11, ry.r5 + 1, { size: 5 })
  txt('10', C1 + 2, ry.r5 + 1, { size: 7, font: helveticaBold })
  txt('Dependent care benefits', C1 + 14, ry.r5 + 1, { size: 4.5 })
  txt('11', C2 + 2, ry.r5 + 1, { size: 7, font: helveticaBold })
  txt('Nonqualified plans', C2 + 14, ry.r5 + 1, { size: 4.5 })
  txt('12a', C3 + 2, ry.r5 + 1, { size: 6, font: helveticaBold })
  txt('See inst. for box 12', C3 + 18, ry.r5 + 1, { size: 4 })

  // Row 6 labels
  txt('e', L + 2, ry.r5 + rowH.r5 + 1, { size: 7, font: helveticaBold })
  txt("Employee's name, address, and ZIP code", L + 11, ry.r5 + rowH.r5 + 1, { size: 5 })
  txt('Suff.', C1 - 22, ry.r5 + rowH.r5 + 1, { size: 4.5 })
  txt('13', C1 + 2, ry.r6 + 1, { size: 7, font: helveticaBold })
  txt('14', C2 + 2, ry.r6 + 1, { size: 7, font: helveticaBold })
  txt('Other', C2 + 14, ry.r6 + 1, { size: 4.5 })
  txt('12b', C3 + 2, ry.r6 + 1, { size: 6, font: helveticaBold })

  // Box 13 checkboxes labels
  const chkY1 = ry.r6 + 10
  const chkY2 = ry.r6 + 20
  const chkY3 = ry.r6 + 30
  txt('Statutory employee', C1 + 16, chkY1, { size: 5 })
  txt('Retirement plan', C1 + 16, chkY2, { size: 5 })
  txt('Third-party sick pay', C1 + 16, chkY3, { size: 5 })

  // Checkbox boxes
  const drawChkBox = (x, fromTop, checked) => {
    page.drawRectangle({
      x, y: pY(fromTop + 7), width: 7, height: 7,
      borderColor: black, borderWidth: 0.5, color: rgb(1, 1, 1),
    })
    if (checked) {
      page.drawText('X', { x: x + 1, y: pY(fromTop + 7), size: 6, font: helveticaBold, color: black })
    }
  }
  drawChkBox(C1 + 6, chkY1, b[13]?.statutoryEmployee)
  drawChkBox(C1 + 6, chkY2, b[13]?.retirementPlan)
  drawChkBox(C1 + 6, chkY3, b[13]?.thirdPartySickPay)

  // 12c, 12d labels
  txt('12c', C3 + 2, ry.r7 + 1, { size: 6, font: helveticaBold })
  txt('12d', C3 + 2, ry.r8 + 1, { size: 6, font: helveticaBold })

  // Right panel: Form W-2 title
  const rcx = (C4 + R) / 2 // center of right panel
  txt('Form', rcx - 8, ry.r2 - 2, { size: 6 })

  // W-2 large
  const w2Str = 'W-2'
  const w2W = helveticaBold.widthOfTextAtSize(w2Str, 22)
  page.drawText(w2Str, { x: rcx - w2W / 2, y: pY(ry.r2 + 6) - 22, size: 22, font: helveticaBold, color: black })

  txt('Wage and', rcx - 16, ry.r2 + 28, { size: 9 })
  txt('Tax', rcx - 6, ry.r2 + 38, { size: 9 })
  txt('Statement', rcx - 18, ry.r2 + 48, { size: 9 })

  // Year
  const yrW = helveticaBold.widthOfTextAtSize(yr, 20)
  if (yr) page.drawText(yr, { x: rcx - yrW / 2, y: pY(ry.r5 + 4) - 20, size: 20, font: helveticaBold, color: black })

  // Copy label + description
  if (copyLabel) {
    const clW = helveticaBold.widthOfTextAtSize(copyLabel, 7)
    page.drawText(copyLabel, { x: rcx - clW / 2, y: pY(ry.r6 + 4) - 7, size: 7, font: helveticaBold, color: black })
    if (copyDescLines) {
      const lines = Array.isArray(copyDescLines) ? copyDescLines : [copyDescLines]
      let dy = ry.r6 + 14
      for (const line of lines) {
        const lw = helvetica.widthOfTextAtSize(line, 5)
        page.drawText(line, { x: rcx - lw / 2, y: pY(dy) - 5, size: 5, font: helvetica, color: black })
        dy += 7
      }
    }
  }

  // State row labels
  const stLabels = [
    { n: '15', t: 'State', col: 0 },
    { n: '', t: "Employer's state ID number", col: 1 },
    { n: '16', t: 'State wages, tips, etc.', col: 2 },
    { n: '17', t: 'State income tax', col: 3 },
    { n: '18', t: 'Local wages, tips, etc.', col: 4 },
    { n: '19', t: 'Local income tax', col: 5 },
    { n: '20', t: 'Locality name', col: 6 },
  ]
  const stY = ry.r9
  for (const sl of stLabels) {
    const cx = stCols[sl.col]
    if (sl.n) {
      txt(sl.n, cx + 2, stY + 1, { size: 6, font: helveticaBold })
      txt(sl.t, cx + 2 + (sl.n.length > 1 ? 12 : 8), stY + 1, { size: 4.5 })
    } else {
      txt(sl.t, cx + 2, stY + 1, { size: 4.5 })
    }
  }

  // Footer
  txt('Dept. of the Treasury \u2014 IRS', R - 80, ry.r9 + rowH.r9 + 1, { size: 5 })

  // ═══ DRAW DATA VALUES ═══

  // SSN
  txt(em.ssn, L + 4, ry.r1 + 2, { size: 9, font: courier })
  // EIN
  txt(co.ein, C1 + 4, ry.r1 + 2, { size: 9, font: courier })

  // Employer info
  const empYStart = ry.r2 + 2
  txt(co.name, L + 4, empYStart, { size: 8, font: helveticaBold })
  txt(co.addressLine1, L + 4, empYStart + 10, { size: 8 })
  if (co.addressLine2) {
    txt(co.addressLine2, L + 4, empYStart + 20, { size: 8 })
    txt(co.cityStateZip, L + 4, empYStart + 30, { size: 8 })
  } else {
    txt(co.cityStateZip, L + 4, empYStart + 20, { size: 8 })
  }

  // Box values (right-aligned)
  txtR(fmt(b[1]), C2, ry.r2 + 8)
  txtR(fmt(b[2]), C3, ry.r2 + 8)
  txtR(fmt(b[3]), C4, ry.r2 + 8)
  txtR(fmt(b[4]), C2, ry.r3 + 8)
  txtR(fmt(b[5]), C3, ry.r3 + 8)
  txtR(fmt(b[6]), C4, ry.r3 + 8)
  txtR(fmt(b[7]), C2, ry.r4 + 8)
  txtR(fmt(b[8]), C3, ry.r4 + 8)

  // Control number
  txt(data.controlNumber, L + 4, ry.r5 + 8, { size: 8, font: helveticaBold })
  // Box 10, 11
  txtR(fmt(b[10]), C2, ry.r5 + 8)
  txtR(fmt(b[11]), C3, ry.r5 + 8)
  // Box 12a
  txt(fmt12(b['12a']), C3 + 4, ry.r5 + 10, { size: 6.5 })

  // Employee info
  const eeYStart = ry.r6 + 8
  txt(em.name, L + 4, eeYStart, { size: 8, font: helveticaBold })
  txt(em.addressLine1, L + 4, eeYStart + 10, { size: 8 })
  txt(em.cityStateZip, L + 4, eeYStart + 20, { size: 8 })

  // Box 14
  txt(b[14], C2 + 4, ry.r6 + 10, { size: 6.5 })
  // Box 12b, 12c, 12d
  txt(fmt12(b['12b']), C3 + 4, ry.r6 + 10, { size: 6.5 })
  txt(fmt12(b['12c']), C3 + 4, ry.r7 + 10, { size: 6.5 })
  txt(fmt12(b['12d']), C3 + 4, ry.r8 + 10, { size: 6.5 })

  // State row values
  txt(st.state, stCols[0] + 4, stY + 6, { size: 8, font: helveticaBold })
  txt(st.employerId, stCols[1] + 4, stY + 6, { size: 7, font: courier })
  txtR(fmt(b[16]), stCols[3], stY + 6)
  txtR(fmt(b[17]), stCols[4], stY + 6)
  txtR(fmt(b[18]), stCols[5], stY + 6)
  txtR(fmt(b[19]), stCols[6], stY + 6)
  txt(b[20], stCols[6] + 4, stY + 6, { size: 7 })
}

// ─── Public: Generate PDF for a template ─────────────────────────────────────

/**
 * @param {object} adaptedData - from documentAdapter
 * @param {object} manifest - template manifest
 * @returns {Promise<{pdfBytes, stats, warnings}>}
 */
export async function generateDirectPdf(adaptedData, manifest) {
  const doc = await PDFDocument.create()
  const helvetica = await doc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold)
  const courier = await doc.embedFont(StandardFonts.Courier)
  const fonts = { helvetica, helveticaBold, courier }

  const templateId = manifest?.id || ''
  const copies = getCopiesForTemplate(templateId)
  const pagesOfCopies = groupCopiesIntoPages(templateId, copies)

  for (const pageCopies of pagesOfCopies) {
    const isLandscape = templateId.includes('mcdean')
    const pageW = isLandscape ? 792 : 612
    const pageH = isLandscape ? 612 : 792
    const page = doc.addPage([pageW, pageH])

    const topMargin = 20
    const gap = 6
    const totalGaps = (pageCopies.length - 1) * gap
    const usableH = pageH - topMargin * 2 - totalGaps
    // Each copy gets equal share of usable height (but capped at 185)
    const copyH = Math.min(185, usableH / pageCopies.length)

    for (let i = 0; i < pageCopies.length; i++) {
      const { label, desc } = pageCopies[i]
      const topY = topMargin + i * (copyH + gap)
      const layout = buildCopyLayout(topY, label, desc)
      drawCopy(page, layout, adaptedData, fonts, pageH)
    }
  }

  const pdfBytes = await doc.save()
  return {
    pdfBytes,
    stats: { strategy: 'direct-vector', pages: pagesOfCopies.length },
    warnings: [],
  }
}

// ─── Template copy configurations ────────────────────────────────────────────

function getCopiesForTemplate(templateId) {
  const configs = {
    'w2-2021-three-copies': [
      { label: 'Copy B', desc: ['To Be Filed with Employee\'s', 'FEDERAL Tax Return.', 'This information is being', 'furnished to the Internal Revenue', 'Service.'] },
      { label: 'Copy 2', desc: ['To Be Filed with Employee\'s', 'State, City, or Local Income Tax', 'Return.'] },
      { label: 'Copy C', desc: ['For EMPLOYEE\'S RECORDS.', '(See Notice to Employee.)'] },
    ],
    'w2-2022-four-copies': [
      { label: 'Copy B', desc: ['To Be Filed with Employee\'s', 'FEDERAL Tax Return.'] },
      { label: 'Copy 2', desc: ['To Be Filed with Employee\'s', 'State, City, or Local Income Tax', 'Return.'] },
      { label: 'Copy C', desc: ['For EMPLOYEE\'S RECORDS.'] },
      { label: 'Copy D', desc: ['For Employer.'] },
    ],
    'w2-2024-four-stacked': [
      { label: 'Copy A', desc: ['For Social Security', 'Administration.'] },
      { label: 'Copy B', desc: ['To Be Filed with Employee\'s', 'FEDERAL Tax Return.'] },
      { label: 'Copy C', desc: ['For EMPLOYEE\'S RECORDS.'] },
      { label: 'Copy D', desc: ['For Employer.'] },
    ],
    'w2-2025-three-stacked': [
      { label: 'Copy B', desc: ['To Be Filed with Employee\'s', 'FEDERAL Tax Return.'] },
      { label: 'Copy C', desc: ['For EMPLOYEE\'S RECORDS.'] },
      { label: 'Copy 2', desc: ['To Be Filed with Employee\'s', 'State, City, or Local Income Tax', 'Return.'] },
    ],
    'w2-2023-mmr-reissued': [
      { label: 'Copy A', desc: ['For Social Security', 'Administration.'] },
      { label: 'Copy B', desc: ['To Be Filed with Employee\'s', 'FEDERAL Tax Return.'] },
      { label: 'Copy C', desc: ['For EMPLOYEE\'S RECORDS.'] },
      { label: 'Copy D', desc: ['For Employer.'] },
    ],
    'w2-2022-industrial-four-copies': [
      { label: 'Copy B', desc: ['To Be Filed with Employee\'s', 'FEDERAL Tax Return.'] },
      { label: 'Copy 2', desc: ['To Be Filed with Employee\'s', 'State, City, or Local Income Tax', 'Return.'] },
      { label: 'Copy C', desc: ['For EMPLOYEE\'S RECORDS.'] },
      { label: 'Copy D', desc: ['For Employer.'] },
    ],
    'w2-2021-mcdean-state-pages': [
      { label: 'Copy 1', desc: ['State Copy'] },
      { label: 'Copy 2', desc: ['State Copy'] },
      { label: 'Copy 3', desc: ['State Copy'] },
    ],
  }

  // Earnings templates: page 1 = earnings + Copy C, page 2 = B + 2 + D
  if (templateId.includes('earnings')) {
    return [
      { label: 'Copy C', desc: ['For EMPLOYEE\'S RECORDS.'] },
      { label: 'Copy B', desc: ['To Be Filed with Employee\'s', 'FEDERAL Tax Return.'] },
      { label: 'Copy 2', desc: ['To Be Filed with Employee\'s', 'State, City, or Local Income Tax', 'Return.'] },
      { label: 'Copy D', desc: ['For Employer.'] },
    ]
  }

  return configs[templateId] || configs['w2-2021-three-copies']
}

function groupCopiesIntoPages(templateId, copies) {
  // 2-column templates: 4 copies on one page
  if (['w2-2022-four-copies', 'w2-2023-mmr-reissued', 'w2-2022-industrial-four-copies'].includes(templateId)) {
    return [copies] // all on one page, but need 2-column handling
  }
  // Mcdean: 1 copy per page
  if (templateId.includes('mcdean')) {
    return copies.map(c => [c])
  }
  // Earnings: page 1 = first copy (with earnings header), page 2 = remaining 3
  if (templateId.includes('earnings')) {
    return [[copies[0]], copies.slice(1)]
  }
  // Default: all copies on one page
  return [copies]
}
