// W2 form preview component

function Field({ label, value, className = '' }) {
  return (
    <div className={`tw:border tw:border-gray-300 tw:p-2 ${className}`}>
      <p className="tw:text-[9px] tw:text-gray-500 tw:uppercase tw:font-medium tw:leading-tight">{label}</p>
      <p className="tw:text-sm tw:text-gray-900 tw:font-medium tw:mt-0.5 tw:min-h-5">{value || '—'}</p>
    </div>
  )
}

function MoneyField({ label, value, className = '' }) {
  const formatted = typeof value === 'number' && value > 0
    ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '—'
  return <Field label={label} value={formatted} className={className} />
}

export function W2Preview({ doc }) {
  if (!doc) return null
  const emp = doc.employeeSnapshot || {}
  const comp = doc.companySnapshot || {}
  const empName = [emp.firstName, emp.middleInitial, emp.lastName, emp.suffix].filter(Boolean).join(' ')
  const empAddr = [emp.address, emp.address2].filter(Boolean).join(', ')
  const empCityLine = [emp.city, emp.state, emp.zipCode].filter(Boolean).join(', ')
  const compAddr = [comp.address, comp.address2].filter(Boolean).join(', ')
  const compCityLine = [comp.city, comp.state, comp.zipCode].filter(Boolean).join(', ')

  return (
    <div className="tw:bg-white tw:border-2 tw:border-gray-400 tw:rounded-lg tw:overflow-hidden tw:max-w-3xl tw:mx-auto tw:text-xs">
      {/* Title bar */}
      <div className="tw:bg-gray-800 tw:text-white tw:text-center tw:py-2">
        <p className="tw:text-[10px] tw:tracking-widest tw:uppercase tw:font-bold">Form W-2 &mdash; Wage and Tax Statement</p>
        <p className="tw:text-[9px] tw:text-gray-300">Tax Year {doc.taxYear} &nbsp;|&nbsp; Copy — For Employee&rsquo;s Records</p>
      </div>

      {/* Top section: employer / employee info */}
      <div className="tw:grid tw:grid-cols-2">
        <div>
          <Field label="a — Employee's SSN" value={emp.ssn} />
          <Field label="c — Employer's name, address, and ZIP" value={`${comp.name}\n${compAddr}\n${compCityLine}`} className="tw:whitespace-pre-line" />
          <Field label="d — Control number" value={doc.controlNumber} />
        </div>
        <div>
          <Field label="b — Employer's EIN" value={comp.ein} />
          <Field label="e — Employee's name" value={empName} />
          <Field label="f — Employee's address" value={`${empAddr}\n${empCityLine}`} className="tw:whitespace-pre-line" />
        </div>
      </div>

      {/* Numbered boxes */}
      <div className="tw:grid tw:grid-cols-2">
        <MoneyField label="1 — Wages, tips, other compensation" value={doc.box1_wagesTips} />
        <MoneyField label="2 — Federal income tax withheld" value={doc.box2_federalTaxWithheld} />
        <MoneyField label="3 — Social security wages" value={doc.box3_socialSecurityWages} />
        <MoneyField label="4 — Social security tax withheld" value={doc.box4_socialSecurityTax} />
        <MoneyField label="5 — Medicare wages and tips" value={doc.box5_medicareWages} />
        <MoneyField label="6 — Medicare tax withheld" value={doc.box6_medicareTax} />
        <MoneyField label="7 — Social security tips" value={doc.box7_socialSecurityTips} />
        <MoneyField label="8 — Allocated tips" value={doc.box8_allocatedTips} />
        <Field label="9 — (reserved)" value="" />
        <MoneyField label="10 — Dependent care benefits" value={doc.box10_dependentCareBenefits} />
        <MoneyField label="11 — Nonqualified plans" value={doc.box11_nonqualifiedPlans} />
        <div className="tw:border tw:border-gray-300 tw:p-2">
          <p className="tw:text-[9px] tw:text-gray-500 tw:uppercase tw:font-medium">13 — Checkboxes</p>
          <div className="tw:flex tw:gap-4 tw:mt-1">
            <span className={doc.box13_statutoryEmployee ? 'tw:font-bold tw:text-gray-900' : 'tw:text-gray-300'}>
              {doc.box13_statutoryEmployee ? '☑' : '☐'} Statutory
            </span>
            <span className={doc.box13_retirementPlan ? 'tw:font-bold tw:text-gray-900' : 'tw:text-gray-300'}>
              {doc.box13_retirementPlan ? '☑' : '☐'} Retirement
            </span>
            <span className={doc.box13_thirdPartySickPay ? 'tw:font-bold tw:text-gray-900' : 'tw:text-gray-300'}>
              {doc.box13_thirdPartySickPay ? '☑' : '☐'} 3rd-party sick
            </span>
          </div>
        </div>
      </div>

      {/* Box 12 */}
      <div className="tw:grid tw:grid-cols-4">
        {['a', 'b', 'c', 'd'].map((slot, i) => {
          const entry = doc.box12?.[i]
          return (
            <div key={slot} className="tw:border tw:border-gray-300 tw:p-2">
              <p className="tw:text-[9px] tw:text-gray-500 tw:uppercase tw:font-medium">12{slot}</p>
              {entry?.code ? (
                <div>
                  <span className="tw:font-bold tw:text-gray-900">{entry.code}</span>
                  <span className="tw:ml-2 tw:text-gray-700">${(entry.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              ) : (
                <p className="tw:text-gray-300 tw:mt-0.5">—</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Box 14 */}
      {doc.box14?.length > 0 && (
        <div className="tw:border tw:border-gray-300 tw:p-2">
          <p className="tw:text-[9px] tw:text-gray-500 tw:uppercase tw:font-medium">14 — Other</p>
          <div className="tw:flex tw:flex-wrap tw:gap-x-6 tw:gap-y-1 tw:mt-1">
            {doc.box14.map((entry, i) => (
              <span key={i} className="tw:text-sm tw:text-gray-900">
                {entry.description}: <strong>${(entry.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Boxes 15–20: State/Local */}
      {doc.stateLocal?.length > 0 && doc.stateLocal.some((sl) => sl.state || sl.stateWages || sl.stateTax) && (
        <div>
          <div className="tw:grid tw:grid-cols-7 tw:bg-gray-50 tw:border-t tw:border-gray-300">
            {['15 — State', '15 — Emp. State ID', '16 — State wages', '17 — State tax', '18 — Local wages', '19 — Local tax', '20 — Locality'].map((h) => (
              <div key={h} className="tw:border tw:border-gray-300 tw:p-1">
                <p className="tw:text-[8px] tw:text-gray-500 tw:uppercase tw:font-medium">{h}</p>
              </div>
            ))}
          </div>
          {doc.stateLocal.map((sl, i) => (
            <div key={i} className="tw:grid tw:grid-cols-7">
              <Field label="" value={sl.state} />
              <Field label="" value={sl.employerStateId} />
              <MoneyField label="" value={sl.stateWages} />
              <MoneyField label="" value={sl.stateTax} />
              <MoneyField label="" value={sl.localWages} />
              <MoneyField label="" value={sl.localTax} />
              <Field label="" value={sl.localityName} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
