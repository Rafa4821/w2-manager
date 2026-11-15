import W2CopyHtml from '../engine/W2CopyHtml'
import '../engine/w2copy.css'

function fmt(val) {
  if (val == null || val === '' || val === 0) return ''
  if (typeof val === 'number')
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return String(val)
}

function fmtYear(val) {
  if (!val) return ''
  return String(Math.round(Number(val)))
}

function EarningsSummary({ data }) {
  const co = data.company || {}
  const em = data.employee || {}
  const b = data.boxes || {}
  const yr = fmtYear(data.year)

  return (
    <div className="w2adp-earnings">
      <div className="w2adp-earnings-header">
        <div className="w2adp-earnings-title">
          <span className="w2adp-form-label">Form</span>
          <span className="w2adp-form-w2">W-2</span>
          <span className="w2adp-form-sub">Wage and Tax Statement</span>
          <span className="w2adp-form-year">{yr}</span>
        </div>
        <div className="w2adp-earnings-company">
          <div className="w2adp-lbl">Employer</div>
          <div className="w2adp-val">{co.name}</div>
          <div className="w2adp-val">{co.addressLine1}</div>
          {co.addressLine2 && <div className="w2adp-val">{co.addressLine2}</div>}
          <div className="w2adp-val">{co.cityStateZip}</div>
        </div>
        <div className="w2adp-earnings-employee">
          <div className="w2adp-lbl">Employee</div>
          <div className="w2adp-val">{em.name}</div>
          <div className="w2adp-val">{em.addressLine1}</div>
          <div className="w2adp-val">{em.cityStateZip}</div>
        </div>
      </div>
      <div className="w2adp-earnings-table">
        <div className="w2adp-earnings-row w2adp-earnings-hdr">
          <div className="w2adp-earnings-cell">Description</div>
          <div className="w2adp-earnings-cell">Box 1 Wages</div>
          <div className="w2adp-earnings-cell">Box 3 SS Wages</div>
          <div className="w2adp-earnings-cell">Box 5 Medicare</div>
          <div className="w2adp-earnings-cell">Box 16 State</div>
        </div>
        <div className="w2adp-earnings-row">
          <div className="w2adp-earnings-cell">Total</div>
          <div className="w2adp-earnings-cell">{fmt(b[1])}</div>
          <div className="w2adp-earnings-cell">{fmt(b[3])}</div>
          <div className="w2adp-earnings-cell">{fmt(b[5])}</div>
          <div className="w2adp-earnings-cell">{fmt(b[16])}</div>
        </div>
      </div>
    </div>
  )
}

export default function Template({ data = {} }) {
  return (
    <div>
      {/* Page 1: Earnings summary + Copy C */}
      <div className="w2page w2page-adp">
        <EarningsSummary data={data} />
        <W2CopyHtml data={data} copyLabel="Copy C" copyDesc="For Employee's Records." />
      </div>
      {/* Page 2: 3 more copies */}
      <div className="w2page w2page-adp-copies">
        <W2CopyHtml data={data} copyLabel="Copy B" copyDesc="To Be Filed with Employee's FEDERAL Tax Return." />
        <W2CopyHtml data={data} copyLabel="Copy 2" copyDesc="To Be Filed with Employee's State, City, or Local Income Tax Return." />
        <W2CopyHtml data={data} copyLabel="Copy D" copyDesc="For Employer." />
      </div>
    </div>
  )
}
