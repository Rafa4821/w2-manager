/**
 * Document Adapter — converts our W-2 document schema into the flat
 * data structure that coordinate-based SVG templates expect.
 *
 * Our schema uses:   box1_wagesTips, companySnapshot.name, employeeSnapshot.ssn, etc.
 * Their templates use: boxes.1, company.name, employee.ssnMasked, etc.
 *
 * This adapter bridges the two so existing template implementations
 * can work without modification.
 */

/**
 * Convert a W-2 document into the template data format.
 */
export function adaptDocumentForTemplate(doc) {
  if (!doc) return {}

  const comp = doc.companySnapshot || {}
  const emp = doc.employeeSnapshot || {}
  const sl = (doc.stateLocal || [])[0] || {}

  const empName = [emp.firstName, emp.middleInitial, emp.lastName, emp.suffix]
    .filter(Boolean).join(' ').toUpperCase()
  const empAddr = [emp.address, emp.address2].filter(Boolean).join(', ').toUpperCase()
  const empCity = [emp.city, emp.state, emp.zipCode].filter(Boolean).join(' ').toUpperCase()
  const compAddr = [comp.address, comp.address2].filter(Boolean).join(', ').toUpperCase()
  const compCity = [comp.city, comp.state, comp.zipCode].filter(Boolean).join(' ').toUpperCase()

  // Build box12 entries as 12a, 12b, 12c, 12d strings
  const box12 = doc.box12 || []
  const box12Entries = {}
  box12.forEach((entry, i) => {
    const slot = String.fromCharCode(97 + i) // a, b, c, d
    if (entry.code) {
      box12Entries[`12${slot}`] = `${entry.code}  ${entry.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    }
  })

  // Build box14 as single text
  const box14 = (doc.box14 || [])
    .map((e) => `${e.description}: ${e.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`)
    .join('; ')

  return {
    year: doc.taxYear,
    company: {
      name: comp.name?.toUpperCase() || '',
      addressLine1: compAddr,
      cityStateZip: compCity,
      ein: comp.ein || '',
    },
    employee: {
      name: empName,
      addressLine1: empAddr,
      cityStateZip: empCity,
      ssnMasked: emp.ssn || '',
    },
    control: {
      line1: doc.controlNumber || '',
      line2: '',
    },
    boxes: {
      1: doc.box1_wagesTips || 0,
      2: doc.box2_federalTaxWithheld || 0,
      3: doc.box3_socialSecurityWages || 0,
      4: doc.box4_socialSecurityTax || 0,
      5: doc.box5_medicareWages || 0,
      6: doc.box6_medicareTax || 0,
      7: doc.box7_socialSecurityTips || 0,
      8: doc.box8_allocatedTips || 0,
      10: doc.box10_dependentCareBenefits || 0,
      11: doc.box11_nonqualifiedPlans || 0,
      ...box12Entries,
      14: box14,
      16: sl.stateWages || 0,
      17: sl.stateTax || 0,
      18: sl.localWages || 0,
      19: sl.localTax || 0,
      20: sl.localityName || '',
    },
    stateTax: {
      state: sl.state || '',
      employerId: sl.employerStateId || '',
    },
    flags: {
      void: false,
      statutoryEmployee: doc.box13_statutoryEmployee || false,
      retirementPlan: doc.box13_retirementPlan || false,
      thirdPartySickPay: doc.box13_thirdPartySickPay || false,
    },
  }
}
