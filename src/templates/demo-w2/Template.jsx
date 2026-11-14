import { Fragment } from 'react'

/**
 * Demo W-2 Template Component
 *
 * Receives mapped data via props.data (from mapping.json) and the raw
 * document via props.doc. This is a demonstration layout — it does not
 * reproduce any official IRS form design.
 *
 * Props:
 *   data        – { fieldId: resolvedValue } from the field mapper
 *   doc         – raw W-2 document object (for fields not in mapping)
 *   page        – current page number (1-based)
 *   totalPages  – total page count
 *   manifest    – template manifest
 */

function Cell({ label, value, className = '' }) {
  return (
    <div className={`demo-w2-cell ${className}`}>
      <div className="demo-w2-cell-label">{label}</div>
      <div className="demo-w2-cell-value">{value || '—'}</div>
    </div>
  )
}

function MoneyCell({ label, value }) {
  return (
    <div className="demo-w2-cell">
      <div className="demo-w2-cell-label">{label}</div>
      <div className="demo-w2-cell-value currency">{value || '—'}</div>
    </div>
  )
}

export default function DemoW2Template({ data, doc: _doc }) {
  const empName = [data.employeeFirst, data.employeeMiddle, data.employeeLast, data.employeeSuffix]
    .filter(Boolean).join(' ')
  const empAddr = [data.employeeAddress, data.employeeAddress2].filter(Boolean).join(', ')
  const empCity = [data.employeeCity, data.employeeState, data.employeeZip].filter(Boolean).join(', ')
  const compAddr = [data.employerAddress, data.employerAddress2].filter(Boolean).join(', ')
  const compCity = [data.employerCity, data.employerState, data.employerZip].filter(Boolean).join(', ')

  const box12 = data.box12 || []
  const box14 = data.box14 || []
  const stateLocal = data.stateLocal || []

  return (
    <>
      {/* Title */}
      <div className="demo-w2-title">
        <h1>Form W-2 — Wage and Tax Statement</h1>
        <p>Tax Year {data.taxYear} &nbsp;|&nbsp; Demo Template — Not an Official Form</p>
      </div>

      {/* Header: employer / employee info */}
      <div className="demo-w2-grid demo-w2-header">
        <Cell label="a — Employee's Social Security Number" value={data.employeeSSN} />
        <Cell label="b — Employer Identification Number (EIN)" value={data.employerEIN} />
        <Cell label="c — Employer's name, address, and ZIP code"
          value={`${data.employerName}\n${compAddr}\n${compCity}`}
          className="demo-w2-cell--multiline" />
        <Cell label="e — Employee's first name and initial / last name / suf."
          value={empName} />
        <Cell label="d — Control number" value={data.controlNumber} />
        <Cell label="f — Employee's address and ZIP code"
          value={`${empAddr}\n${empCity}`}
          className="demo-w2-cell--multiline" />
      </div>

      {/* Numbered boxes 1-11 */}
      <div className="demo-w2-grid demo-w2-boxes" style={{ marginTop: 4 }}>
        <MoneyCell label="1 — Wages, tips, other compensation" value={data.box1} />
        <MoneyCell label="2 — Federal income tax withheld" value={data.box2} />
        <MoneyCell label="3 — Social security wages" value={data.box3} />
        <MoneyCell label="4 — Social security tax withheld" value={data.box4} />
        <MoneyCell label="5 — Medicare wages and tips" value={data.box5} />
        <MoneyCell label="6 — Medicare tax withheld" value={data.box6} />
        <MoneyCell label="7 — Social security tips" value={data.box7} />
        <MoneyCell label="8 — Allocated tips" value={data.box8} />
        <Cell label="9 — (reserved)" value="" />
        <MoneyCell label="10 — Dependent care benefits" value={data.box10} />
        <MoneyCell label="11 — Nonqualified plans" value={data.box11} />

        {/* Box 13 */}
        <div className="demo-w2-cell">
          <div className="demo-w2-cell-label">13 — Checkboxes</div>
          <div className="demo-w2-box13">
            <span className="demo-w2-checkbox">
              <span className={`demo-w2-checkbox-box ${data.box13_statutory ? 'checked' : ''}`}>
                {data.box13_statutory ? '✓' : ''}
              </span>
              Statutory employee
            </span>
            <span className="demo-w2-checkbox">
              <span className={`demo-w2-checkbox-box ${data.box13_retirement ? 'checked' : ''}`}>
                {data.box13_retirement ? '✓' : ''}
              </span>
              Retirement plan
            </span>
            <span className="demo-w2-checkbox">
              <span className={`demo-w2-checkbox-box ${data.box13_sickPay ? 'checked' : ''}`}>
                {data.box13_sickPay ? '✓' : ''}
              </span>
              Third-party sick pay
            </span>
          </div>
        </div>
      </div>

      {/* Box 12 */}
      <div className="demo-w2-grid demo-w2-box12" style={{ marginTop: 4 }}>
        {['a', 'b', 'c', 'd'].map((slot, i) => {
          const entry = box12[i]
          return (
            <div key={slot} className="demo-w2-cell">
              <div className="demo-w2-cell-label">12{slot}</div>
              <div className="demo-w2-cell-value" style={{ fontSize: 9 }}>
                {entry?.code ? (
                  <><strong>{entry.code}</strong> ${(entry.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</>
                ) : '—'}
              </div>
            </div>
          )
        })}
      </div>

      {/* Box 14 */}
      <div className="demo-w2-grid" style={{ marginTop: 4, gridTemplateColumns: '1fr' }}>
        <div className="demo-w2-cell">
          <div className="demo-w2-cell-label">14 — Other</div>
          {box14.length > 0 ? (
            <div className="demo-w2-box14">
              {box14.map((entry, i) => (
                <span key={i} className="demo-w2-box14-entry">
                  {entry.description}: <strong>${(entry.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                </span>
              ))}
            </div>
          ) : (
            <div className="demo-w2-cell-value">—</div>
          )}
        </div>
      </div>

      {/* Boxes 15-20: State/Local */}
      {stateLocal.length > 0 && stateLocal.some((sl) => sl.state || sl.stateWages || sl.stateTax) && (
        <div style={{ marginTop: 4 }}>
          <div className="demo-w2-grid demo-w2-state-grid">
            {['15 — State', '15 — Emp. State ID', '16 — State wages', '17 — State tax', '18 — Local wages', '19 — Local tax', '20 — Locality'].map((h) => (
              <div key={h} className="demo-w2-state-header">{h}</div>
            ))}
            {stateLocal.map((sl, i) => (
              <Fragment key={i}>
                <Cell label="" value={sl.state} />
                <Cell label="" value={sl.employerStateId} />
                <MoneyCell label="" value={sl.stateWages ? `$${sl.stateWages.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : ''} />
                <MoneyCell label="" value={sl.stateTax ? `$${sl.stateTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : ''} />
                <MoneyCell label="" value={sl.localWages ? `$${sl.localWages.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : ''} />
                <MoneyCell label="" value={sl.localTax ? `$${sl.localTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : ''} />
                <Cell label="" value={sl.localityName} />
              </Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="demo-w2-footer">
        Demo Template — For development and testing only. Not for tax filing.
      </div>
    </>
  )
}
