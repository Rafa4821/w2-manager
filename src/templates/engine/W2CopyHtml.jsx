/**
 * W2CopyHtml — Faithful HTML/CSS replica of the IRS W-2 form.
 * Matches the exact layout of the original PDF forms.
 *
 * Props:
 *   data      — adapted document data (from documentAdapter)
 *   copyLabel — e.g. "Copy B", "Copy 2"
 *   copyDesc  — description lines (array of strings or single string)
 */

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
    return `${entry.code}    ${fmt(entry.amount)}`
  return String(entry || '')
}

export default function W2CopyHtml({ data = {}, copyLabel = '', copyDesc = '' }) {
  const d = data
  const co = d.company || {}
  const em = d.employee || {}
  const b = d.boxes || {}
  const st = d.stateTax || {}
  const yr = fmtYear(d.year)

  const descLines = typeof copyDesc === 'string'
    ? copyDesc.split('. ').filter(Boolean).map((s, i, a) => i < a.length - 1 ? s + '.' : s)
    : (copyDesc || [])

  return (
    <table className="w2f" cellSpacing="0" cellPadding="0">
      <colgroup>
        <col className="w2f-col-left" />
        <col className="w2f-col-b1" />
        <col className="w2f-col-b2" />
        <col className="w2f-col-b3" />
        <col className="w2f-col-right" />
      </colgroup>
      <tbody>
        {/* ── Row 1: SSN | EIN | OMB ── */}
        <tr>
          <td className="w2f-cell">
            <div className="w2f-lbl"><b>a</b> Employee&apos;s SSN</div>
            <div className="w2f-val w2f-mono">{em.ssn}</div>
          </td>
          <td className="w2f-cell" colSpan="3">
            <div className="w2f-lbl"><b>b</b> Employer identification number (EIN)</div>
            <div className="w2f-val w2f-mono">{co.ein}</div>
          </td>
          <td className="w2f-cell w2f-omb" rowSpan="7">
            <div className="w2f-omb-text">OMB No. 1545-0008</div>
            <div className="w2f-title-block">
              <div className="w2f-form-label">Form</div>
              <div className="w2f-form-w2">W-2</div>
              <div className="w2f-form-sub">Wage and</div>
              <div className="w2f-form-sub">Tax</div>
              <div className="w2f-form-sub">Statement</div>
            </div>
            <div className="w2f-year">{yr}</div>
            {copyLabel && (
              <div className="w2f-copy-block">
                <div className="w2f-copy-label">{copyLabel}</div>
                {descLines.map((line, i) => (
                  <div key={i} className="w2f-copy-desc">{line}</div>
                ))}
              </div>
            )}
          </td>
        </tr>

        {/* ── Row 2: Employer (c) | Box 1 | Box 2 | Box 3 ── */}
        <tr>
          <td className="w2f-cell w2f-employer" rowSpan="3">
            <div className="w2f-lbl"><b>c</b> Employer&apos;s name, address, and ZIP code</div>
            <div className="w2f-val w2f-company-name">{co.name}</div>
            <div className="w2f-val">{co.addressLine1}</div>
            {co.addressLine2 && <div className="w2f-val">{co.addressLine2}</div>}
            <div className="w2f-val">{co.cityStateZip}</div>
          </td>
          <td className="w2f-cell w2f-box">
            <div className="w2f-boxlbl"><b>1</b> Wages, tips, other comp.</div>
            <div className="w2f-boxval">{fmt(b[1])}</div>
          </td>
          <td className="w2f-cell w2f-box">
            <div className="w2f-boxlbl"><b>2</b> Federal income tax withheld</div>
            <div className="w2f-boxval">{fmt(b[2])}</div>
          </td>
          <td className="w2f-cell w2f-box">
            <div className="w2f-boxlbl"><b>3</b> Social security wages</div>
            <div className="w2f-boxval">{fmt(b[3])}</div>
          </td>
        </tr>

        {/* ── Row 3: | Box 4 | Box 5 | Box 6 ── */}
        <tr>
          <td className="w2f-cell w2f-box">
            <div className="w2f-boxlbl"><b>4</b> Social security tax withheld</div>
            <div className="w2f-boxval">{fmt(b[4])}</div>
          </td>
          <td className="w2f-cell w2f-box">
            <div className="w2f-boxlbl"><b>5</b> Medicare wages &amp; tips</div>
            <div className="w2f-boxval">{fmt(b[5])}</div>
          </td>
          <td className="w2f-cell w2f-box">
            <div className="w2f-boxlbl"><b>6</b> Medicare tax withheld</div>
            <div className="w2f-boxval">{fmt(b[6])}</div>
          </td>
        </tr>

        {/* ── Row 4: | Box 7 | Box 8 | Box 9 ── */}
        <tr>
          <td className="w2f-cell w2f-box">
            <div className="w2f-boxlbl"><b>7</b> Social security tips</div>
            <div className="w2f-boxval">{fmt(b[7])}</div>
          </td>
          <td className="w2f-cell w2f-box">
            <div className="w2f-boxlbl"><b>8</b> Allocated tips</div>
            <div className="w2f-boxval">{fmt(b[8])}</div>
          </td>
          <td className="w2f-cell w2f-box">
            <div className="w2f-boxlbl"><b>9</b></div>
            <div className="w2f-boxval"></div>
          </td>
        </tr>

        {/* ── Row 5: Control (d) | Box 10 | Box 11 | 12a ── */}
        <tr>
          <td className="w2f-cell w2f-control">
            <div className="w2f-lbl"><b>d</b> Control number</div>
            <div className="w2f-val">{d.controlNumber}</div>
          </td>
          <td className="w2f-cell w2f-box">
            <div className="w2f-boxlbl"><b>10</b> Dependent care benefits</div>
            <div className="w2f-boxval">{fmt(b[10])}</div>
          </td>
          <td className="w2f-cell w2f-box">
            <div className="w2f-boxlbl"><b>11</b> Nonqualified plans</div>
            <div className="w2f-boxval">{fmt(b[11])}</div>
          </td>
          <td className="w2f-cell w2f-box w2f-box12">
            <div className="w2f-boxlbl"><b>12a</b> See inst. for box 12</div>
            <div className="w2f-boxval w2f-box12val">{fmt12(b['12a'])}</div>
          </td>
        </tr>

        {/* ── Row 6: Employee (e) | Box 13 | Box 14 | 12b ── */}
        <tr>
          <td className="w2f-cell w2f-employee" rowSpan="2">
            <div className="w2f-lbl"><b>e</b> Employee&apos;s name, address, and ZIP code <span className="w2f-suff">Suff.</span></div>
            <div className="w2f-val w2f-emp-name">{em.name}</div>
            <div className="w2f-val">{em.addressLine1}</div>
            <div className="w2f-val">{em.cityStateZip}</div>
          </td>
          <td className="w2f-cell w2f-box w2f-box13top" rowSpan="2">
            <div className="w2f-boxlbl"><b>13</b></div>
            <div className="w2f-chk-row">
              <span className="w2f-chk">{b[13]?.statutoryEmployee ? 'X' : ''}</span>
              <span>Statutory employee</span>
            </div>
            <div className="w2f-chk-row">
              <span className="w2f-chk">{b[13]?.retirementPlan ? 'X' : ''}</span>
              <span>Retirement plan</span>
            </div>
            <div className="w2f-chk-row">
              <span className="w2f-chk">{b[13]?.thirdPartySickPay ? 'X' : ''}</span>
              <span>Third-party sick pay</span>
            </div>
          </td>
          <td className="w2f-cell w2f-box">
            <div className="w2f-boxlbl"><b>14</b> Other</div>
            <div className="w2f-boxval w2f-box14val">{b[14]}</div>
          </td>
          <td className="w2f-cell w2f-box w2f-box12">
            <div className="w2f-boxlbl"><b>12b</b></div>
            <div className="w2f-boxval w2f-box12val">{fmt12(b['12b'])}</div>
          </td>
        </tr>

        {/* ── Row 7: | (13 cont) | (14 cont/blank) | 12c+12d ── */}
        <tr>
          <td className="w2f-cell w2f-box w2f-box-empty"></td>
          <td className="w2f-cell w2f-box12-cd">
            <div className="w2f-box12-c">
              <div className="w2f-boxlbl"><b>12c</b></div>
              <div className="w2f-boxval w2f-box12val">{fmt12(b['12c'])}</div>
            </div>
            <div className="w2f-box12-d">
              <div className="w2f-boxlbl"><b>12d</b></div>
              <div className="w2f-boxval w2f-box12val">{fmt12(b['12d'])}</div>
            </div>
          </td>
        </tr>

        {/* ── Row 8: State/Local ── */}
        <tr>
          <td className="w2f-state-row" colSpan="5">
            <table className="w2f-state-table" cellSpacing="0" cellPadding="0">
              <tbody>
                <tr>
                  <td className="w2f-st-cell w2f-st-15">
                    <div className="w2f-boxlbl"><b>15</b> State</div>
                    <div className="w2f-boxval">{st.state}</div>
                  </td>
                  <td className="w2f-st-cell w2f-st-id">
                    <div className="w2f-boxlbl">Employer&apos;s state ID number</div>
                    <div className="w2f-boxval w2f-mono">{st.employerId}</div>
                  </td>
                  <td className="w2f-st-cell">
                    <div className="w2f-boxlbl"><b>16</b> State wages, tips, etc.</div>
                    <div className="w2f-boxval">{fmt(b[16])}</div>
                  </td>
                  <td className="w2f-st-cell">
                    <div className="w2f-boxlbl"><b>17</b> State income tax</div>
                    <div className="w2f-boxval">{fmt(b[17])}</div>
                  </td>
                  <td className="w2f-st-cell">
                    <div className="w2f-boxlbl"><b>18</b> Local wages, tips, etc.</div>
                    <div className="w2f-boxval">{fmt(b[18])}</div>
                  </td>
                  <td className="w2f-st-cell">
                    <div className="w2f-boxlbl"><b>19</b> Local income tax</div>
                    <div className="w2f-boxval">{fmt(b[19])}</div>
                  </td>
                  <td className="w2f-st-cell w2f-st-last">
                    <div className="w2f-boxlbl"><b>20</b> Locality name</div>
                    <div className="w2f-boxval">{b[20]}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>

        {/* ── Footer ── */}
        <tr>
          <td className="w2f-footer" colSpan="5">
            <span className="w2f-footer-right">Dept. of the Treasury &mdash; IRS</span>
          </td>
        </tr>
      </tbody>
    </table>
  )
}
