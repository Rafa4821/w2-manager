/**
 * Document Adapter — converts our W-2 document schema into the flat
 * data structure that ALL template mappings expect.
 *
 * Different templates use different path conventions:
 * - boxes.1 vs box1 (flat)
 * - company.* vs employer.*
 * - employee.name vs employee.firstName/lastName
 * - stateTax.* vs state.*
 * - boxes.12a vs box12a.code/amount
 *
 * This adapter outputs ALL variations so every template works.
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
  const compStreet = [compAddr1, compAddr2].filter(Boolean).join(', ')

  // Box 12 entries
  const box12 = doc.box12 || []
  const box12Combined = {}
  const box12Split = {}
  box12.forEach((entry, i) => {
    const slot = String.fromCharCode(97 + i)
    if (entry.code) {
      const amt = entry.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })
      box12Combined[`12${slot}`] = `${entry.code}  ${amt}`
      box12Split[`12${slot}`] = { code: entry.code, amount: entry.amount }
    }
  })

  const box14 = (doc.box14 || [])
    .map((e) => `${e.description}: ${e.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`)
    .join('; ')

  const combinedStateId = [sl.state, sl.employerStateId].filter(Boolean).join('      ')

  // Shared company/employer object
  const companyData = {
    name: comp.name?.toUpperCase() || '',
    ein: comp.ein || '',
    addressLine1: compAddr1,
    addressLine2: compAddr2,
    street: compStreet,
    city: (comp.city || '').toUpperCase(),
    state: (comp.state || '').toUpperCase(),
    zip: (comp.zipCode || '').toUpperCase(),
    stateZip: [comp.state, comp.zipCode].filter(Boolean).join(' ').toUpperCase(),
    cityStateZip: compCityStateZip,
  }

  // Shared employee object
  const employeeData = {
    name: empName,
    firstName: (emp.firstName || '').toUpperCase(),
    lastName: (emp.lastName || '').toUpperCase(),
    middleInitial: (emp.middleInitial || '').toUpperCase(),
    ssn: emp.ssn || '',
    ssnMasked: emp.ssn || '',
    suffix: emp.suffix || '',
    addressLine1: empAddr,
    street: empAddr,
    city: (emp.city || '').toUpperCase(),
    stateZip: [emp.state, emp.zipCode].filter(Boolean).join(' ').toUpperCase(),
    cityStateZip: empCityStateZip,
  }

  const b1 = doc.box1_wagesTips || 0
  const b2 = doc.box2_federalTaxWithheld || 0
  const b3 = doc.box3_socialSecurityWages || 0
  const b4 = doc.box4_socialSecurityTax || 0
  const b5 = doc.box5_medicareWages || 0
  const b6 = doc.box6_medicareTax || 0

  return {
    year: doc.taxYear,

    // Company paths (company.* and employer.*)
    company: companyData,
    employer: companyData,

    // Employee paths
    employee: employeeData,

    // Control number (multiple path formats)
    controlNumber: doc.controlNumber || '',
    control: { line1: doc.controlNumber || '', line2: '', number: doc.controlNumber || '' },

    // Boxes in nested format (boxes.1, boxes.2, etc.)
    boxes: {
      1: b1, 2: b2, 3: b3, 4: b4, 5: b5, 6: b6,
      7: doc.box7_socialSecurityTips || 0,
      8: doc.box8_allocatedTips || 0,
      9: 0,
      10: doc.box10_dependentCareBenefits || 0,
      11: doc.box11_nonqualifiedPlans || 0,
      ...box12Combined,
      ...box12Split,
      13: {
        statutoryEmployee: doc.box13_statutoryEmployee || false,
        retirementPlan: doc.box13_retirementPlan || false,
        retirementPlanMark: doc.box13_retirementPlan ? 'X' : '',
        thirdPartySickPay: doc.box13_thirdPartySickPay || false,
      },
      14: box14,
      16: sl.stateWages || 0, 17: sl.stateTax || 0,
      18: sl.localWages || 0, 19: sl.localTax || 0,
      20: sl.localityName || '',
    },

    // Flat box paths (box1, box2, etc. — used by MMR template)
    box1: b1, box2: b2, box3: b3, box4: b4, box5: b5, box6: b6,
    box12a: box12Split['12a'] || { code: '', amount: 0 },
    box12b: box12Split['12b'] || { code: '', amount: 0 },
    box13: { retirementPlanMark: doc.box13_retirementPlan ? 'X' : '' },

    // State/local (multiple path formats)
    stateTax: {
      state: sl.state || '',
      employerId: sl.employerStateId || '',
      combinedStateAndEmployerId: combinedStateId,
    },
    state: {
      code: sl.state || '',
      employerId: sl.employerStateId || '',
      wages: sl.stateWages || 0,
      incomeTax: sl.stateTax || 0,
    },

    // Flags
    flags: {
      void: false,
      statutoryEmployee: doc.box13_statutoryEmployee || false,
      retirementPlan: doc.box13_retirementPlan || false,
      thirdPartySickPay: doc.box13_thirdPartySickPay || false,
    },

    // Earnings summary (used by ADP template)
    earnings: {
      gross: { box1: b1, box3: b3, box5: b5, box16: sl.stateWages || 0 },
    },
  }
}
