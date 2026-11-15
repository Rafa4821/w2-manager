/**
 * pdfDirectGenerator — Draws the complete W-2 form using pdf-lib vector primitives.
 * Matched pixel-by-pixel against the original W-2 PDFs.
 * No html2canvas, no rasterization — all text is vector (crisp at any zoom).
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

// ─── Draw One Copy ───────────────────────────────────────────────────────────
// All measurements from the original "W2 MARIA FERNANDA URDANETA 2021.pdf"
// Page size: 612 x 792 pt. Each copy ~240pt tall including footer.

function drawCopy(page, topY, copyLabel, copyDescLines, data, fonts, pageH) {
  const { helvetica, helveticaBold, courier } = fonts
  const co = data.company || {}
  const em = data.employee || {}
  const b = data.boxes || {}
  const st = data.stateTax || {}
  const yr = fmtYear(data.year)
  const black = rgb(0, 0, 0)
  const thin = 0.5
  const thick = 1.0

  // ── Page geometry ──
  const L = 28       // left margin
  const R = 584      // right edge
  const TW = R - L   // total width = 556

  // Column X positions (from original)
  const C1 = 250     // left section end / boxes start
  const C2 = 340     // box col 1 end
  const C3 = 430     // box col 2 end
  const C4 = 500     // box col 3 end / right panel start

  // Row Y offsets from topY (going down)
  const ROW = {
    // Row 1: SSN / EIN / OMB
    r1Top: 0,
    r1Bot: 18,
    // Row 2: box 1-2-3 (+ employer label)
    r2Top: 18,
    r2Bot: 40,
    // Row 3: box 4-5-6
    r3Top: 40,
    r3Bot: 62,
    // Row 4: box 7-8-9
    r4Top: 62,
    r4Bot: 82,
    // Row 5: control / box 10-11 / 12a
    r5Top: 82,
    r5Bot: 104,
    // Row 6: employee label / box 13 / 14 / 12b
    r6Top: 104,
    r6Bot: 136,
    // Row 7: employee cont / 13 cont / 12c
    r7Top: 136,
    r7Bot: 158,
    // Row 8: employee cont / 13 cont / 12d  (shares with r7 for left section)
    r8Top: 158,
    r8Bot: 178,
    // State row
    stTop: 178,
    stBot: 198,
    // Footer
    ftTop: 198,
    ftBot: 210,
  }

  // Helpers
  const pY = (fromTop) => pageH - topY - fromTop

  const hLine = (x1, x2, fromTop, w) => {
    page.drawLine({ start: { x: x1, y: pY(fromTop) }, end: { x: x2, y: pY(fromTop) }, thickness: w || thin, color: black })
  }
  const vLine = (x, ft1, ft2, w) => {
    page.drawLine({ start: { x, y: pY(ft1) }, end: { x, y: pY(ft2) }, thickness: w || thin, color: black })
  }
  // Draw text at position (fromTop = distance from top of copy)
  const txt = (str, x, fromTop, size, font) => {
    if (!str && str !== 0) return
    const s = String(str)
    if (!s) return
    page.drawText(s, { x, y: pY(fromTop) - (size || 6), size: size || 6, font: font || helvetica, color: black })
  }
  // Right-aligned text
  const txtR = (str, xRight, fromTop, size, font) => {
    if (!str && str !== 0) return
    const s = String(str)
    if (!s) return
    const f = font || courier
    const sz = size || 9
    const w = f.widthOfTextAtSize(s, sz)
    page.drawText(s, { x: xRight - w - 3, y: pY(fromTop) - sz, size: sz, font: f, color: black })
  }
  // Centered text
  const txtC = (str, xLeft, xRight, fromTop, size, font) => {
    if (!str) return
    const s = String(str)
    const f = font || helvetica
    const sz = size || 6
    const w = f.widthOfTextAtSize(s, sz)
    const cx = (xLeft + xRight) / 2
    page.drawText(s, { x: cx - w / 2, y: pY(fromTop) - sz, size: sz, font: f, color: black })
  }

  // ════════════════════════════════════════════════════════════════════════════
  // BORDERS
  // ════════════════════════════════════════════════════════════════════════════

  // Outer border
  hLine(L, R, ROW.r1Top, thick)
  hLine(L, R, ROW.stBot, thick)
  vLine(L, ROW.r1Top, ROW.stBot, thick)
  vLine(R, ROW.r1Top, ROW.stBot, thick)

  // Row 1 bottom (full width)
  hLine(L, R, ROW.r1Bot)

  // Row 1 verticals: SSN | EIN | OMB
  vLine(C1, ROW.r1Top, ROW.r1Bot)
  vLine(C4, ROW.r1Top, ROW.r1Bot)

  // Box column verticals (from row 2 to row 8)
  vLine(C1, ROW.r2Top, ROW.r8Bot)
  vLine(C2, ROW.r2Top, ROW.r8Bot)
  vLine(C3, ROW.r2Top, ROW.r8Bot)
  vLine(C4, ROW.r1Top, ROW.r8Bot)  // right panel left edge

  // Horizontal lines between box rows (only in box area C1-C4)
  hLine(C1, C4, ROW.r2Bot)  // between 1-2-3 and 4-5-6
  hLine(C1, C4, ROW.r3Bot)  // between 4-5-6 and 7-8-9

  // Bottom of employer / top of control (L to C4, not crossing right panel)
  hLine(L, C4, ROW.r4Bot)

  // Bottom of control / top of employee (L to C4)
  hLine(L, C4, ROW.r5Bot)

  // Horizontal for 14/12b boundary
  hLine(C2, C4, ROW.r6Bot)
  // Horizontal for 12c boundary
  hLine(C3, C4, ROW.r7Bot)

  // Bottom of employee section (L to R for state row)
  hLine(L, R, ROW.r8Bot)

  // State row verticals
  const stW = TW / 7
  const stCols = []
  for (let i = 0; i <= 7; i++) stCols.push(L + i * stW)
  for (let i = 1; i < 7; i++) vLine(stCols[i], ROW.stTop, ROW.stBot)

  // ════════════════════════════════════════════════════════════════════════════
  // LABELS (matching original — box numbers have black filled backgrounds)
  // ════════════════════════════════════════════════════════════════════════════

  // ── Row 1: SSN / EIN / OMB ──
  txt('a', L + 2, ROW.r1Top + 2, 5, helveticaBold)
  txt("Employee's SSN", L + 8, ROW.r1Top + 2, 5)
  txt('b', C1 + 2, ROW.r1Top + 2, 5, helveticaBold)
  txt('Employer identification number (EIN)', C1 + 8, ROW.r1Top + 2, 5)
  txt('OMB No. 1545-0008', C4 + 4, ROW.r1Top + 2, 5)

  // ── Row 2: Employer label + Box 1, 2, 3 ──
  txt('c', L + 2, ROW.r2Top + 2, 5, helveticaBold)
  txt("Employer's name, address, and ZIP code", L + 8, ROW.r2Top + 2, 5)

  txt('1', C1 + 2, ROW.r2Top + 2, 5, helveticaBold)
  txt('Wgs, tips, other compn', C1 + 9, ROW.r2Top + 2, 4.5)
  txt('2', C2 + 2, ROW.r2Top + 2, 5, helveticaBold)
  txt('Fed inc tax withheld', C2 + 9, ROW.r2Top + 2, 4.5)
  txt('3', C3 + 2, ROW.r2Top + 2, 5, helveticaBold)
  txt('Social security wages', C3 + 9, ROW.r2Top + 2, 4.5)

  // ── Row 3: Box 4, 5, 6 ──
  txt('4', C1 + 2, ROW.r3Top + 2, 5, helveticaBold)
  txt('SS tax withheld', C1 + 9, ROW.r3Top + 2, 4.5)
  txt('5', C2 + 2, ROW.r3Top + 2, 5, helveticaBold)
  txt('Medicare wages & tips', C2 + 9, ROW.r3Top + 2, 4.5)
  txt('6', C3 + 2, ROW.r3Top + 2, 5, helveticaBold)
  txt('Medicare tax withheld', C3 + 9, ROW.r3Top + 2, 4.5)

  // ── Row 4: Box 7, 8, 9 ──
  txt('7', C1 + 2, ROW.r4Top + 2, 5, helveticaBold)
  txt('Social security tips', C1 + 9, ROW.r4Top + 2, 4.5)
  txt('8', C2 + 2, ROW.r4Top + 2, 5, helveticaBold)
  txt('Allocated tips', C2 + 9, ROW.r4Top + 2, 4.5)
  txt('9', C3 + 2, ROW.r4Top + 2, 5, helveticaBold)

  // ── Copy B only: thick black borders on boxes 1, 2, 9 ──
  if (copyLabel === 'Copy B') {
    const thk = 1.5
    // Box 1 thick border
    hLine(C1, C2, ROW.r2Top, thk)
    hLine(C1, C2, ROW.r2Bot, thk)
    vLine(C1, ROW.r2Top, ROW.r2Bot, thk)
    vLine(C2, ROW.r2Top, ROW.r2Bot, thk)
    // Box 2 thick border
    hLine(C2, C3, ROW.r2Top, thk)
    hLine(C2, C3, ROW.r2Bot, thk)
    vLine(C2, ROW.r2Top, ROW.r2Bot, thk)
    vLine(C3, ROW.r2Top, ROW.r2Bot, thk)
    // Box 9 thick border
    hLine(C3, C4, ROW.r4Top, thk)
    hLine(C3, C4, ROW.r4Bot, thk)
    vLine(C3, ROW.r4Top, ROW.r4Bot, thk)
    vLine(C4, ROW.r4Top, ROW.r4Bot, thk)
  }

  // ── Row 5: Control / Box 10, 11, 12a ──
  txt('d', L + 2, ROW.r5Top + 2, 5, helveticaBold)
  txt('Control number', L + 8, ROW.r5Top + 2, 5)
  txt('10', C1 + 2, ROW.r5Top + 2, 5, helveticaBold)
  txt('Depdnt care benefits', C1 + 14, ROW.r5Top + 2, 4.5)
  txt('11', C2 + 2, ROW.r5Top + 2, 5, helveticaBold)
  txt('Nonqualified plans', C2 + 14, ROW.r5Top + 2, 4.5)
  txt('12a', C3 + 2, ROW.r5Top + 2, 5, helveticaBold)

  // ── Row 6: Employee label / Box 13, 14, 12b ──
  txt('e', L + 2, ROW.r6Top + 2, 5, helveticaBold)
  txt("Employee's name, address, and ZIP code", L + 8, ROW.r6Top + 2, 5)
  txt('Suff.', C1 - 20, ROW.r6Top + 2, 4.5)

  txt('13', C1 + 2, ROW.r6Top + 2, 5, helveticaBold)
  txt('14', C2 + 2, ROW.r6Top + 2, 5, helveticaBold)
  txt('Other', C2 + 14, ROW.r6Top + 2, 4.5)
  txt('12b', C3 + 2, ROW.r6Top + 2, 5, helveticaBold)

  // Box 13 checkboxes with labels
  const chkX = C1 + 8
  const chkLblX = C1 + 18
  const chkY1 = ROW.r6Top + 14
  const chkY2 = ROW.r6Top + 24
  const chkY3 = ROW.r7Top + 12

  // Draw checkbox rectangles
  const drawChk = (x, fromTop, checked) => {
    page.drawRectangle({
      x, y: pY(fromTop) - 7, width: 7, height: 7,
      borderColor: black, borderWidth: 0.5, color: rgb(1, 1, 1),
    })
    if (checked) {
      txt('X', x + 1.5, fromTop, 6, helveticaBold)
    }
  }
  drawChk(chkX, chkY1, b[13]?.statutoryEmployee)
  txt('Statutory employee', chkLblX, chkY1, 5)
  drawChk(chkX, chkY2, b[13]?.retirementPlan)
  txt('Retirement plan', chkLblX, chkY2, 5)
  drawChk(chkX, chkY3, b[13]?.thirdPartySickPay)
  txt('Third-party sick pay', chkLblX, chkY3, 5)

  // 12c, 12d
  txt('12c', C3 + 2, ROW.r7Top + 2, 5, helveticaBold)
  txt('12d', C3 + 2, ROW.r8Top + 2, 5, helveticaBold)

  // ── Right panel: Form W-2 / Year / Copy ──
  // "Form" small at top of right panel
  txtC('Form', C4, R, ROW.r2Top + 2, 7)

  // "W-2" large bold — sized to not overlap with "Wage and"
  txtC('W-2', C4, R, ROW.r2Top + 10, 18, helveticaBold)

  // "Wage and Tax Statement" — starts after W-2 ends (10+18=28, so start at 30)
  txtC('Wage and', C4, R, ROW.r2Top + 30, 8)
  txtC('Tax', C4, R, ROW.r3Top + 18, 8)
  txtC('Statement', C4, R, ROW.r4Top + 8, 8)

  // Year (large bold)
  if (yr) txtC(yr, C4, R, ROW.r5Top + 2, 16, helveticaBold)

  // Copy label + description
  if (copyLabel) {
    txtC(copyLabel, C4, R, ROW.r6Top + 4, 7, helveticaBold)
    if (copyDescLines) {
      const lines = Array.isArray(copyDescLines) ? copyDescLines : [copyDescLines]
      let dy = ROW.r6Top + 14
      for (const line of lines) {
        txtC(line, C4, R, dy, 5)
        dy += 7
      }
    }
  }

  // ── State row labels ──
  const stLabels = ['15 State', "Employer's state ID No.", '16 State wages, tips, etc', '17 State income tax', '18 Local wages, tips, etc', '19 Local income tax', '20 Locality name']
  for (let i = 0; i < stLabels.length; i++) {
    txt(stLabels[i], stCols[i] + 2, ROW.stTop + 2, 4.5, i === 0 ? helveticaBold : helvetica)
  }

  // ── Footer ──
  txt('REV 01/14/21 QBDT', L + 2, ROW.ftTop + 2, 5)
  txtR('Department of the Treasury \u2014 IRS', R, ROW.ftTop + 2, 5, helvetica)

  // ════════════════════════════════════════════════════════════════════════════
  // DATA VALUES
  // ════════════════════════════════════════════════════════════════════════════

  // SSN — same line as label, to the right
  const ssnLabelW = helvetica.widthOfTextAtSize("Employee's SSN", 5)
  txt(em.ssn, L + 10 + ssnLabelW + 6, ROW.r1Top + 2, 9, courier)

  // EIN — same line as label, to the right
  const einLabelW = helvetica.widthOfTextAtSize('Employer identification number (EIN)', 5)
  txt(co.ein, C1 + 10 + einLabelW + 6, ROW.r1Top + 2, 9, courier)

  // Employer name and address (below "c" label) — Courier like original
  txt(co.name, L + 6, ROW.r2Top + 12, 9, courier)
  txt(co.addressLine1, L + 6, ROW.r2Top + 24, 8, courier)
  if (co.addressLine2) {
    txt(co.addressLine2, L + 6, ROW.r3Top + 12, 8, courier)
    txt(co.cityStateZip, L + 6, ROW.r4Top + 2, 8, courier)
  } else {
    txt(co.cityStateZip, L + 6, ROW.r3Top + 12, 8, courier)
  }

  // Box values (right-aligned within each box, positioned below label)
  txtR(fmt(b[1]), C2 - 2, ROW.r2Top + 12, 9, courier)
  txtR(fmt(b[2]), C3 - 2, ROW.r2Top + 12, 9, courier)
  txtR(fmt(b[3]), C4 - 2, ROW.r2Top + 12, 9, courier)
  txtR(fmt(b[4]), C2 - 2, ROW.r3Top + 12, 9, courier)
  txtR(fmt(b[5]), C3 - 2, ROW.r3Top + 12, 9, courier)
  txtR(fmt(b[6]), C4 - 2, ROW.r3Top + 12, 9, courier)
  txtR(fmt(b[7]), C2 - 2, ROW.r4Top + 12, 9, courier)
  txtR(fmt(b[8]), C3 - 2, ROW.r4Top + 12, 9, courier)

  // Control number — Courier like original
  txt(data.controlNumber, L + 6, ROW.r5Top + 12, 9, courier)
  // Box 10, 11
  txtR(fmt(b[10]), C2 - 2, ROW.r5Top + 12, 9, courier)
  txtR(fmt(b[11]), C3 - 2, ROW.r5Top + 12, 9, courier)
  // Box 12a
  txt(fmt12(b['12a']), C3 + 16, ROW.r5Top + 12, 7, courier)

  // Employee name and address — Courier like original
  txt(em.name, L + 8, ROW.r6Top + 14, 9, courier)
  txt(em.addressLine1, L + 8, ROW.r6Top + 26, 8, courier)
  txt(em.cityStateZip, L + 8, ROW.r7Top + 14, 8, courier)

  // Box 14 value
  txt(b[14], C2 + 6, ROW.r6Top + 14, 7, courier)
  // Box 12b, 12c, 12d
  txt(fmt12(b['12b']), C3 + 16, ROW.r6Top + 14, 7, courier)
  txt(fmt12(b['12c']), C3 + 16, ROW.r7Top + 12, 7, courier)
  txt(fmt12(b['12d']), C3 + 16, ROW.r8Top + 12, 7, courier)

  // State row values
  txt(st.state, stCols[0] + 4, ROW.stTop + 10, 8, courier)
  txt(st.employerId, stCols[1] + 4, ROW.stTop + 10, 7, courier)
  txtR(fmt(b[16] || st.stateWages), stCols[3] - 2, ROW.stTop + 10, 8, courier)
  txtR(fmt(b[17] || st.stateTax), stCols[4] - 2, ROW.stTop + 10, 8, courier)
  txtR(fmt(b[18]), stCols[5] - 2, ROW.stTop + 10, 8, courier)
  txtR(fmt(b[19]), stCols[6] - 2, ROW.stTop + 10, 8, courier)
  txt(b[20], stCols[6] + 4, ROW.stTop + 10, 7, courier)
}

// ─── Draw One Copy — 2x2 Grid Layout (Plantilla 2) ──────────────────────────
// Measurements from "2021 w2 Lionexy.pdf". Each copy ~281pt wide x ~350pt tall.
// 4 copies in a 2x2 grid. Copy title at top, Form W-2 at bottom.

function drawCopy2x2(page, ox, oy, copyTitle, copyFooterNote, isRedCopy, data, fonts, pageH) {
  const { helvetica, helveticaBold, courier } = fonts
  const co = data.company || {}
  const em = data.employee || {}
  const b = data.boxes || {}
  const st = data.stateTax || {}
  const yr = fmtYear(data.year)
  const black = rgb(0, 0, 0)
  const red = rgb(0.8, 0, 0)
  const gray = rgb(0.9, 0.9, 0.9)
  const thin = 0.5
  const titleColor = isRedCopy ? red : black

  // Copy dimensions (from original: each copy ~281pt wide)
  const CW = 281

  // Column boundaries (relative to ox)
  const LC = ox + 97   // left section end / boxes start
  const MC = ox + 190  // box col 1 end
  const RC = ox + CW   // right edge

  // Helpers
  const pY = (fromTop) => pageH - fromTop

  const hLine = (x1, x2, y, w, c) => {
    page.drawLine({ start: { x: x1, y: pY(y) }, end: { x: x2, y: pY(y) }, thickness: w || thin, color: c || black })
  }
  const vLine = (x, y1, y2, w, c) => {
    page.drawLine({ start: { x, y: pY(y1) }, end: { x, y: pY(y2) }, thickness: w || thin, color: c || black })
  }
  const txt = (str, x, y, size, font, color) => {
    if (!str && str !== 0) return
    const s = String(str)
    if (!s) return
    page.drawText(s, { x, y: pY(y) - (size || 6.5), size: size || 6.5, font: font || helvetica, color: color || black })
  }
  const txtR = (str, xRight, y, size, font) => {
    if (!str && str !== 0) return
    const s = String(str)
    if (!s) return
    const f = font || courier
    const sz = size || 10
    const w = f.widthOfTextAtSize(s, sz)
    page.drawText(s, { x: xRight - w - 2, y: pY(y) - sz, size: sz, font: f, color: black })
  }

  // ── Copy title header (red for Copy B, black for others) ──
  txt(copyTitle, ox + 2, oy, 8, helveticaBold, titleColor)
  // OMB number top right
  txt('OMB No. 1545-0008', ox + CW - 70, oy, 6.5)

  // Form area starts after title
  const fy = oy + 18

  // Row positions (from original coordinates)
  const R = {
    r1: fy,           // a SSN / 1 Wages / 2 Fed tax
    r2: fy + 18,      // 3 SS wages / 4 SS tax
    r3: fy + 36,      // b EIN / 5 Medicare / 6 Medicare tax
    r4: fy + 54,      // c Employer
    r5: fy + 108,     // d Control
    r6: fy + 126,     // e Employee
    r7: fy + 180,     // 7 / 8 / 9
    r8: fy + 198,     // 10 / 11 / 12a
    r9: fy + 216,     // 13 / 14 / 12b
    r10: fy + 234,    // Retirement / 12c
    r11: fy + 252,    // Third-party / 12d
    r12: fy + 270,    // State values
    r13: fy + 288,    // State labels
    bot: fy + 300,    // bottom of form
  }

  // ── BORDERS ──
  page.drawRectangle({ x: ox, y: pY(R.bot), width: CW, height: R.bot - R.r1, borderColor: black, borderWidth: 0.8, color: rgb(1, 1, 1) })

  // Horizontal lines
  for (const ry of [R.r2, R.r3, R.r4, R.r5, R.r6, R.r7, R.r8, R.r9]) hLine(ox, RC, ry)
  hLine(LC, RC, R.r10)
  hLine(LC, RC, R.r11)
  hLine(ox, RC, R.r12)
  hLine(ox, RC, R.r13)

  // Vertical lines
  vLine(LC, R.r1, R.r12)
  vLine(MC, R.r1, R.r4)
  vLine(MC, R.r8, R.r9)
  vLine(ox + 90, R.r7, R.r8)
  vLine(ox + 90, R.r9, R.r12)

  // State row verticals
  const stW = CW / 3
  vLine(ox + stW, R.r12, R.bot)
  vLine(ox + stW * 2, R.r12, R.bot)

  // Gray fill for box 9 and 12a
  page.drawRectangle({ x: MC, y: pY(R.r8), width: RC - MC, height: R.r8 - R.r7, color: gray })
  hLine(ox, RC, R.r7); hLine(ox, RC, R.r8) // redraw lines over gray
  vLine(MC, R.r7, R.r8)

  // ── LABELS ──
  txt('a', ox + 2, R.r1 + 2, 6.5, helveticaBold)
  txt("Employee's soc. sec. no.", ox + 8, R.r1 + 2, 6.5)
  txt('1', LC + 2, R.r1 + 2, 6.5, helveticaBold)
  txt('Wages, tips, other comp.', LC + 8, R.r1 + 2, 6.5)
  txt('2', MC + 2, R.r1 + 2, 6.5, helveticaBold)
  txt('Federal income tax withheld', MC + 8, R.r1 + 2, 6.5)

  txt('3', LC + 2, R.r2 + 2, 6.5, helveticaBold)
  txt('Social security wages', LC + 8, R.r2 + 2, 6.5)
  txt('4', MC + 2, R.r2 + 2, 6.5, helveticaBold)
  txt('Social security tax withheld', MC + 8, R.r2 + 2, 6.5)

  txt('b', ox + 2, R.r3 + 2, 6.5, helveticaBold)
  txt('Employer ID number (EIN)', ox + 8, R.r3 + 2, 6.5)
  txt('5', LC + 2, R.r3 + 2, 6.5, helveticaBold)
  txt('Medicare wages and tips', LC + 8, R.r3 + 2, 6.5)
  txt('6', MC + 2, R.r3 + 2, 6.5, helveticaBold)
  txt('Medicare tax withheld', MC + 8, R.r3 + 2, 6.5)

  txt('c', ox + 2, R.r4 + 2, 6.5, helveticaBold)
  txt("Employer's name, address, and ZIP code", ox + 8, R.r4 + 2, 6.5)

  txt('d', ox + 2, R.r5 + 2, 6.5, helveticaBold)
  txt('Control number', ox + 8, R.r5 + 2, 6.5)

  txt('e', ox + 2, R.r6 + 2, 6.5, helveticaBold)
  txt("Employee's name, address, and ZIP code", ox + 8, R.r6 + 2, 6.5)

  txt('7', ox + 2, R.r7 + 2, 6.5, helveticaBold)
  txt('Social security tips', ox + 8, R.r7 + 2, 6.5)
  txt('8', ox + 90 + 2, R.r7 + 2, 6.5, helveticaBold)
  txt('Allocated tips', ox + 90 + 8, R.r7 + 2, 6.5)
  txt('9', MC + 2, R.r7 + 2, 6.5, helveticaBold)

  txt('10', ox + 2, R.r8 + 2, 6.5, helveticaBold)
  txt('Dependent care benefits', ox + 12, R.r8 + 2, 6.5)
  txt('11', ox + 90 + 2, R.r8 + 2, 6.5, helveticaBold)
  txt('Nonqualified plans', ox + 90 + 12, R.r8 + 2, 6.5)
  txt('12a', MC + 2, R.r8 + 2, 6.5, helveticaBold)
  txt('Code', MC + 16, R.r8 + 2, 6.5)
  txt('See inst. for box 12', MC + 32, R.r8 + 2, 6.5)

  txt('13', ox + 2, R.r9 + 2, 6.5, helveticaBold)
  txt('Statutory employee', ox + 12, R.r9 + 2, 6.5)
  txt('14', ox + 72, R.r9 + 2, 6.5, helveticaBold)
  txt('Other', ox + 82, R.r9 + 2, 6.5)
  txt('12b', MC + 2, R.r9 + 2, 6.5, helveticaBold)
  txt('Code', MC + 16, R.r9 + 2, 6.5)

  txt('Retirement plan', ox + 8, R.r10 + 2, 6.5)
  txt('12c', MC + 2, R.r10 + 2, 6.5, helveticaBold)
  txt('Code', MC + 16, R.r10 + 2, 6.5)

  txt('Third-party sick pay', ox + 4, R.r11 + 2, 6.5)
  txt('12d', MC + 2, R.r11 + 2, 6.5, helveticaBold)
  txt('Code', MC + 16, R.r11 + 2, 6.5)

  // State labels
  txt('15', ox + 2, R.r13 + 2, 6.5, helveticaBold)
  txt('State', ox + 12, R.r13 + 2, 5)
  txt("Employer's state ID number", ox + 26, R.r13 + 2, 6.5)
  txt('16', ox + stW + 2, R.r13 + 2, 6.5, helveticaBold)
  txt('State wages, tips, etc.', ox + stW + 12, R.r13 + 2, 6.5)
  txt('17', ox + stW * 2 + 2, R.r13 + 2, 6.5, helveticaBold)
  txt('State income tax', ox + stW * 2 + 12, R.r13 + 2, 6.5)
  txt('18', ox + 2, R.r13 + 11, 6.5, helveticaBold)
  txt('Local wages, tips, etc.', ox + 12, R.r13 + 11, 6.5)
  txt('19', ox + stW + 2, R.r13 + 11, 6.5, helveticaBold)
  txt('Local income tax', ox + stW + 12, R.r13 + 11, 6.5)
  txt('20', ox + stW * 2 + 2, R.r13 + 11, 6.5, helveticaBold)
  txt('Locality name', ox + stW * 2 + 12, R.r13 + 11, 6.5)

  // ── Footer ──
  const ftY = R.bot + 4
  txt('Form W-2', ox + 2, ftY, 6.5)
  txt('Wage and Tax Statement', ox + 40, ftY, 6.5)
  txt('Dept. of the Treasury - IRS', ox + CW - 90, ftY, 6.5)
  if (yr) {
    const yrW = helveticaBold.widthOfTextAtSize(yr, 11)
    page.drawText(yr, { x: ox + CW / 2 - yrW / 2, y: pY(ftY) - 12, size: 11, font: helveticaBold, color: black })
  }
  if (copyFooterNote) txt(copyFooterNote, ox + 2, ftY + 16, 6)

  // ── DATA VALUES (all in Courier to match original) ──
  txt(em.ssn, ox + 6, R.r1 + 10, 10, courier)
  txt(co.ein, ox + 6, R.r3 + 10, 10, courier)

  txtR(fmt(b[1]), MC - 2, R.r1 + 8, 10, courier)
  txtR(fmt(b[2]), RC - 2, R.r1 + 8, 10, courier)
  txtR(fmt(b[3]), MC - 2, R.r2 + 8, 10, courier)
  txtR(fmt(b[4]), RC - 2, R.r2 + 8, 10, courier)
  txtR(fmt(b[5]), MC - 2, R.r3 + 8, 10, courier)
  txtR(fmt(b[6]), RC - 2, R.r3 + 8, 10, courier)

  // Employer (Courier like original)
  txt(co.name, ox + 6, R.r4 + 12, 10, courier)
  txt(co.addressLine1, ox + 6, R.r4 + 24, 10, courier)
  if (co.addressLine2) {
    txt(co.addressLine2, ox + 6, R.r4 + 36, 10, courier)
    txt(co.cityStateZip, ox + 6, R.r4 + 48, 10, courier)
  } else {
    txt(co.cityStateZip, ox + 6, R.r4 + 36, 10, courier)
  }

  txt(data.controlNumber, ox + 8, R.r5 + 12, 10, courier)

  // Employee (Courier)
  txt(em.name, ox + 6, R.r6 + 14, 10, courier)
  txt(em.addressLine1, ox + 6, R.r6 + 30, 10, courier)
  txt(em.cityStateZip, ox + 6, R.r6 + 46, 10, courier)

  // Checkboxes
  const drawChk = (x, y, checked) => {
    page.drawRectangle({ x, y: pY(y) - 7, width: 7, height: 7, borderColor: black, borderWidth: 0.5, color: rgb(1, 1, 1) })
    if (checked) txt('X', x + 1.5, y, 6, helveticaBold)
  }
  drawChk(ox + 4, R.r10 - 4, b[13]?.retirementPlan)
  drawChk(ox + 4, R.r11 - 4, b[13]?.thirdPartySickPay)

  // Box 12a-d, 14
  txt(fmt12(b['12a']), MC + 16, R.r8 + 10, 7, courier)
  txt(fmt12(b['12b']), MC + 16, R.r9 + 10, 7, courier)
  txt(fmt12(b['12c']), MC + 16, R.r10 + 10, 7, courier)
  txt(fmt12(b['12d']), MC + 16, R.r11 + 10, 7, courier)
  txt(b[14], ox + 82, R.r9 + 12, 7, courier)

  // State values (Courier)
  txt(st.state, ox + 4, R.r12 + 10, 10, courier)
  txt(st.employerId, ox + 26, R.r12 + 10, 10, courier)
  txtR(fmt(b[16] || st.stateWages), ox + stW * 2 - 2, R.r12 + 10, 10, courier)
  txtR(fmt(b[17] || st.stateTax), RC - 2, R.r12 + 10, 10, courier)
}

// ─── Draw dashed separator line between copies ───────────────────────────────

function drawDashedLine(page, x1, x2, y, _pageH) {
  const dashLen = 6
  const gapLen = 4
  let x = x1
  while (x < x2) {
    const end = Math.min(x + dashLen, x2)
    page.drawLine({
      start: { x, y },
      end: { x: end, y },
      thickness: 0.5,
      color: rgb(0, 0, 0),
    })
    x = end + gapLen
  }
}

// ─── Public: Generate PDF for a template ─────────────────────────────────────

export async function generateDirectPdf(adaptedData, manifest) {
  const doc = await PDFDocument.create()
  const helvetica = await doc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold)
  const courier = await doc.embedFont(StandardFonts.Courier)
  const fonts = { helvetica, helveticaBold, courier }

  const templateId = manifest?.id || ''

  // ── Plantilla 2: 2x2 grid layout ──
  if (templateId === 'w2-2021-four-copies-2x2') {
    const pageW = 612
    const pageH = 792
    const page = doc.addPage([pageW, pageH])

    const copies2x2 = [
      { ox: 14, oy: 22, title: "Copy B\u2014To Be Filed With Employee's FEDERAL Tax Return.", footer: 'This information is being furnished to the Internal Revenue Service.', red: true },
      { ox: 310, oy: 22, title: "Copy 2\u2014To Be Filed With Employee's State, City, or Local Income Tax Return", footer: '', red: false },
      { ox: 14, oy: 400, title: "Copy C\u2014For EMPLOYEE'S RECORDS (See Notice to Employee on the back of Copy B.)", footer: '', red: false },
      { ox: 310, oy: 400, title: "Copy 2\u2014To Be Filed With Employee's State, City, or Local Income Tax Return", footer: '', red: false },
    ]

    for (const c of copies2x2) {
      drawCopy2x2(page, c.ox, c.oy, c.title, c.footer, c.red, adaptedData, fonts, pageH)
    }

    const pdfBytes = await doc.save()
    return { pdfBytes, stats: { strategy: 'direct-vector-2x2', pages: 1 }, warnings: [] }
  }

  // ── Plantilla 1: stacked layout ──
  const copies = getCopiesForTemplate(templateId)
  const pagesOfCopies = groupCopiesIntoPages(templateId, copies)

  for (const pageCopies of pagesOfCopies) {
    const pageW = 612
    const pageH = 792
    const page = doc.addPage([pageW, pageH])

    const topMargin = 16
    const copyH = 215
    const gap = 18

    for (let i = 0; i < pageCopies.length; i++) {
      const { label, desc } = pageCopies[i]
      const topY = topMargin + i * (copyH + gap)
      drawCopy(page, topY, label, desc, adaptedData, fonts, pageH)

      if (i < pageCopies.length - 1) {
        const dashY = pageH - topY - copyH - gap / 2
        drawDashedLine(page, 28, pageW - 28, dashY, pageH)
      }
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
  if (['w2-2022-four-copies', 'w2-2023-mmr-reissued', 'w2-2022-industrial-four-copies'].includes(templateId)) {
    return [copies]
  }
  if (templateId.includes('mcdean')) {
    return copies.map(c => [c])
  }
  if (templateId.includes('earnings')) {
    return [[copies[0]], copies.slice(1)]
  }
  return [copies]
}
