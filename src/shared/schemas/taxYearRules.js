/**
 * Tax-year-specific constants used for validation warnings.
 *
 * These limits come from published IRS figures and are used ONLY to flag
 * values that look unusual — the application never computes withholding
 * or tax amounts on its own because that requires verified payroll data
 * and rules that go beyond the scope of this tool.
 */

export const SS_WAGE_BASE = {
  2020: 137700,
  2021: 142800,
  2022: 147000,
  2023: 160200,
  2024: 168600,
  2025: 176100,
}

export const MEDICARE_RATE = 0.0145
export const SS_RATE = 0.062

/**
 * Return the Social Security wage base for a given tax year.
 * Falls back to the most recent known year if the year is not mapped.
 */
export function getSSWageBase(year) {
  if (SS_WAGE_BASE[year]) return SS_WAGE_BASE[year]
  const knownYears = Object.keys(SS_WAGE_BASE).map(Number).sort((a, b) => b - a)
  return SS_WAGE_BASE[knownYears[0]]
}

/**
 * Produce an array of plain-language warnings for a W-2 form.
 * These are advisory — the user may dismiss them and save anyway.
 */
export function getFormWarnings(form) {
  const warnings = []
  const ssBase = getSSWageBase(form.taxYear)

  // Box 3 exceeds SS wage base
  if (form.box3_socialSecurityWages > ssBase) {
    warnings.push(
      `Box 3 (Social Security wages) is $${form.box3_socialSecurityWages.toLocaleString()} ` +
      `which exceeds the ${form.taxYear} wage base of $${ssBase.toLocaleString()}.`
    )
  }

  // Box 4 present but Box 3 is zero
  if (form.box4_socialSecurityTax > 0 && form.box3_socialSecurityWages === 0) {
    warnings.push('Box 4 (SS tax) has a value but Box 3 (SS wages) is zero.')
  }

  // Box 6 present but Box 5 is zero
  if (form.box6_medicareTax > 0 && form.box5_medicareWages === 0) {
    warnings.push('Box 6 (Medicare tax) has a value but Box 5 (Medicare wages) is zero.')
  }

  // Box 2 larger than Box 1
  if (form.box2_federalTaxWithheld > form.box1_wagesTips && form.box1_wagesTips > 0) {
    warnings.push('Box 2 (federal tax withheld) exceeds Box 1 (wages). Please verify.')
  }

  // State wages exceed Box 1
  for (const sl of (form.stateLocal || [])) {
    if (sl.stateWages > form.box1_wagesTips && form.box1_wagesTips > 0 && sl.state) {
      warnings.push(`State wages for ${sl.state} exceed Box 1 wages.`)
    }
  }

  return warnings
}
