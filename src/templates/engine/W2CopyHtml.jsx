/**
 * W2CopyHtml — Pure HTML/CSS W-2 form copy component.
 * Renders one complete W-2 copy with all standard fields.
 * No background images — every line, box, and label is CSS.
 *
 * Props:
 *   data     — adapted document data (from documentAdapter)
 *   copyLabel — e.g. "Copy B", "Copy C", "Copy 2"
 *   copyDesc  — description text (e.g. "To Be Filed with Employee's FEDERAL Tax Return")
 *   scale     — optional scale factor (default 1)
 */

function fmt(val) {
  if (val == null || val === '' || val === 0) return ''
  if (typeof val === 'number') {
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  if (typeof val === 'boolean') return val ? 'X' : ''
  return String(val)
}

function fmtYear(val) {
  if (!val) return ''
  return String(Math.round(Number(val)))
}

export default function W2CopyHtml({ data = {}, copyLabel = '', copyDesc = '', scale = 1 }) {
  const d = data
  const co = d.company || {}
  const em = d.employee || {}
  const b = d.boxes || {}
  const st = d.stateTax || {}
  const yr = fmtYear(d.year)

  // Box 12 entries
  const b12a = b['12a'] || ''
  const b12b = b['12b'] || ''
  const b12c = b['12c'] || ''
  const b12d = b['12d'] || ''

  // Box 12 split (code + amount)
  const b12aObj = typeof b12a === 'object' ? b12a : null
  const b12bObj = typeof b12b === 'object' ? b12b : null
  const b12cObj = typeof b12c === 'object' ? b12c : null
  const b12dObj = typeof b12d === 'object' ? b12d : null

  const fmt12 = (obj, str) => {
    if (obj) return obj.code ? `${obj.code}    ${fmt(obj.amount)}` : ''
    return str || ''
  }

  return (
    <div className="w2copy" style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
      {/* Row 1: SSN + EIN + OMB */}
      <div className="w2copy-row1">
        <div className="w2copy-cell w2copy-ssn">
          <span className="w2copy-lbl"><b>a</b> Employee&apos;s SSN</span>
          <span className="w2copy-val w2copy-mono">{em.ssn}</span>
        </div>
        <div className="w2copy-cell w2copy-ein">
          <span className="w2copy-lbl"><b>b</b> Employer identification number (EIN)</span>
          <span className="w2copy-val w2copy-mono">{co.ein}</span>
        </div>
        <div className="w2copy-cell w2copy-omb">
          <span className="w2copy-lbl-sm">OMB No. 1545-0008</span>
        </div>
      </div>

      {/* Row 2-5: Employer/Employee info + Boxes 1-14 + Form title */}
      <div className="w2copy-main">
        {/* LEFT: employer + employee info */}
        <div className="w2copy-left">
          <div className="w2copy-cell w2copy-employer">
            <span className="w2copy-lbl"><b>c</b> Employer&apos;s name, address, and ZIP code</span>
            <div className="w2copy-val">
              {co.name}<br />
              {co.addressLine1}{co.addressLine2 ? <><br />{co.addressLine2}</> : null}<br />
              {co.cityStateZip}
            </div>
          </div>
          <div className="w2copy-cell w2copy-control">
            <span className="w2copy-lbl"><b>d</b> Control number</span>
            <span className="w2copy-val">{d.controlNumber}</span>
          </div>
          <div className="w2copy-cell w2copy-employee">
            <span className="w2copy-lbl"><b>e</b> Employee&apos;s name, address, and ZIP code</span>
            <div className="w2copy-val">
              {em.name}<br />
              {em.addressLine1}<br />
              {em.cityStateZip}
            </div>
          </div>
        </div>

        {/* MIDDLE: Boxes grid */}
        <div className="w2copy-boxes">
          {/* Boxes 1-6 */}
          <div className="w2copy-boxrow">
            <div className="w2copy-box"><span className="w2copy-boxlbl"><b>1</b> Wages, tips, other comp.</span><span className="w2copy-boxval">{fmt(b[1])}</span></div>
            <div className="w2copy-box"><span className="w2copy-boxlbl"><b>2</b> Federal income tax withheld</span><span className="w2copy-boxval">{fmt(b[2])}</span></div>
          </div>
          <div className="w2copy-boxrow">
            <div className="w2copy-box"><span className="w2copy-boxlbl"><b>3</b> Social security wages</span><span className="w2copy-boxval">{fmt(b[3])}</span></div>
            <div className="w2copy-box"><span className="w2copy-boxlbl"><b>4</b> Social security tax withheld</span><span className="w2copy-boxval">{fmt(b[4])}</span></div>
          </div>
          <div className="w2copy-boxrow">
            <div className="w2copy-box"><span className="w2copy-boxlbl"><b>5</b> Medicare wages and tips</span><span className="w2copy-boxval">{fmt(b[5])}</span></div>
            <div className="w2copy-box"><span className="w2copy-boxlbl"><b>6</b> Medicare tax withheld</span><span className="w2copy-boxval">{fmt(b[6])}</span></div>
          </div>
          {/* Boxes 7-9 */}
          <div className="w2copy-boxrow">
            <div className="w2copy-box"><span className="w2copy-boxlbl"><b>7</b> Social Security Tips</span><span className="w2copy-boxval">{fmt(b[7])}</span></div>
            <div className="w2copy-box"><span className="w2copy-boxlbl"><b>8</b> Allocated Tips</span><span className="w2copy-boxval">{fmt(b[8])}</span></div>
          </div>
          {/* Box 9 + 10-11 */}
          <div className="w2copy-boxrow">
            <div className="w2copy-box"><span className="w2copy-boxlbl"><b>9</b></span><span className="w2copy-boxval"></span></div>
            <div className="w2copy-box"><span className="w2copy-boxlbl"><b>10</b> Dependent care benefits</span><span className="w2copy-boxval">{fmt(b[10])}</span></div>
          </div>
          <div className="w2copy-boxrow">
            <div className="w2copy-box"><span className="w2copy-boxlbl"><b>11</b> Nonqualified plans</span><span className="w2copy-boxval">{fmt(b[11])}</span></div>
            <div className="w2copy-box w2copy-box12"><span className="w2copy-boxlbl"><b>12a</b> See instructions for box 12</span><span className="w2copy-boxval">{fmt12(b12aObj, b12a)}</span></div>
          </div>
          {/* Box 13-14 + 12b-d */}
          <div className="w2copy-boxrow">
            <div className="w2copy-box w2copy-box13">
              <span className="w2copy-boxlbl"><b>13</b></span>
              <div className="w2copy-chk-row">
                <span className="w2copy-chk">{b[13]?.statutoryEmployee ? 'X' : ''}</span> Statutory employee
              </div>
              <div className="w2copy-chk-row">
                <span className="w2copy-chk">{b[13]?.retirementPlan ? 'X' : ''}</span> Retirement plan
              </div>
              <div className="w2copy-chk-row">
                <span className="w2copy-chk">{b[13]?.thirdPartySickPay ? 'X' : ''}</span> Third-party sick pay
              </div>
            </div>
            <div className="w2copy-box"><span className="w2copy-boxlbl"><b>14</b> Other</span><span className="w2copy-boxval">{b[14]}</span></div>
            <div className="w2copy-box12-stack">
              <div className="w2copy-box w2copy-box12"><span className="w2copy-boxlbl"><b>12b</b></span><span className="w2copy-boxval">{fmt12(b12bObj, b12b)}</span></div>
              <div className="w2copy-box w2copy-box12"><span className="w2copy-boxlbl"><b>12c</b></span><span className="w2copy-boxval">{fmt12(b12cObj, b12c)}</span></div>
              <div className="w2copy-box w2copy-box12"><span className="w2copy-boxlbl"><b>12d</b></span><span className="w2copy-boxval">{fmt12(b12dObj, b12d)}</span></div>
            </div>
          </div>
        </div>

        {/* RIGHT: Form title + copy info */}
        <div className="w2copy-right">
          <div className="w2copy-title">
            <span className="w2copy-form-label">Form</span>
            <span className="w2copy-form-w2">W-2</span>
            <span className="w2copy-form-sub">Wage and<br />Tax<br />Statement</span>
            <span className="w2copy-form-year">{yr}</span>
          </div>
          {copyLabel && (
            <div className="w2copy-copy-info">
              <b>{copyLabel}</b>
              {copyDesc && <><br /><span className="w2copy-copy-desc">{copyDesc}</span></>}
            </div>
          )}
        </div>
      </div>

      {/* Bottom: State/Local row */}
      <div className="w2copy-state-row">
        <div className="w2copy-state-cell w2copy-state-st">
          <span className="w2copy-boxlbl"><b>15</b> State</span>
          <span className="w2copy-boxval">{st.state}</span>
        </div>
        <div className="w2copy-state-cell w2copy-state-id">
          <span className="w2copy-boxlbl">Employer&apos;s state ID number</span>
          <span className="w2copy-boxval w2copy-mono">{st.employerId}</span>
        </div>
        <div className="w2copy-state-cell">
          <span className="w2copy-boxlbl"><b>16</b> State wages, tips, etc.</span>
          <span className="w2copy-boxval">{fmt(b[16])}</span>
        </div>
        <div className="w2copy-state-cell">
          <span className="w2copy-boxlbl"><b>17</b> State income tax</span>
          <span className="w2copy-boxval">{fmt(b[17])}</span>
        </div>
        <div className="w2copy-state-cell">
          <span className="w2copy-boxlbl"><b>18</b> Local wages, tips, etc.</span>
          <span className="w2copy-boxval">{fmt(b[18])}</span>
        </div>
        <div className="w2copy-state-cell">
          <span className="w2copy-boxlbl"><b>19</b> Local income tax</span>
          <span className="w2copy-boxval">{fmt(b[19])}</span>
        </div>
        <div className="w2copy-state-cell">
          <span className="w2copy-boxlbl"><b>20</b> Locality name</span>
          <span className="w2copy-boxval">{b[20]}</span>
        </div>
      </div>
      <div className="w2copy-footer">
        <span>Dept. of the Treasury &mdash; IRS</span>
      </div>
    </div>
  )
}
