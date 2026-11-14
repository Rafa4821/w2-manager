/**
 * Document Adapter — converts our W-2 document schema into the flat
 * data structure that coordinate-based SVG templates expect.
 *
 * Our schema uses:   box1_wagesTips, companySnapshot.name, employeeSnapshot.ssn, etc.
 * Templates use:     boxes.1, company.name, employee.ssn, etc.
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
  const empCityStateZip = [emp.city, emp.state, emp.zipCode].filter(Boolean).join(' ').toUpperCase()
  const compAddr1 = (comp.address || '').toUpperCase()
  const compAddr2 = (comp.address2 || '').toUpperCase()
  const compCityStateZip = [comp.city, comp.state, comp.zipCode].filter(Boolean).join(' ').toUpperCase()

  // Box 12 entries as 12a, 12b, 12c, 12d
  const box12 = doc.box12 || []
  const box12Entries = {}
  box12.forEach((entry, i) => {
    const slot = String.fromCharCode(97 + i)
    if (entry.code) {
      box12Entries[`12${slot}`] = `${entry.code}  ${entry.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    }
  })

  // Box 14 as single text
  const box14 = (doc.box14 || [])
    .map((e) => `${e.description}: ${e.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`)
    .join('; ')

  // Combined state + employer ID for templates that use a single field
  const combinedStateId = [sl.state, sl.employerStateId].filter(Boolean).join('      ')

  return {
    year: doc.taxYear,
    company: {
      name: comp.name?.toUpperCase() || '',
      ein: comp.ein || '',
      addressLine1: compAddr1,
      addressLine2: compAddr2,
      city: (comp.city || '').toUpperCase(),
      stateZip: [comp.state, comp.zipCode].filter(Boolean).join(' ').toUpperCase(),
      cityStateZip: compCityStateZip,
    },
    employee: {
      name: empName,
      ssn: emp.ssn || '',
      ssnMasked: emp.ssn || '',
      suffix: emp.suffix || '',
      addressLine1: empAddr,
      city: (emp.city || '').toUpperCase(),
      stateZip: [emp.state, emp.zipCode].filter(Boolean).join(' ').toUpperCase(),
      cityStateZip: empCityStateZip,
    },
    controlNumber: doc.controlNumber || '',
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
      9: 0,
      10: doc.box10_dependentCareBenefits || 0,
      11: doc.box11_nonqualifiedPlans || 0,
      ...box12Entries,
      13: {
        statutoryEmployee: doc.box13_statutoryEmployee || false,
        retirementPlan: doc.box13_retirementPlan || false,
        thirdPartySickPay: doc.box13_thirdPartySickPay || false,
      },
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
      combinedStateAndEmployerId: combinedStateId,
    },
    flags: {
      void: false,
      statutoryEmployee: doc.box13_statutoryEmployee || false,
      retirementPlan: doc.box13_retirementPlan || false,
      thirdPartySickPay: doc.box13_thirdPartySickPay || false,
    },
  }
}
