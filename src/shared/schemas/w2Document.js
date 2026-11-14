import { z } from 'zod'

// Box 12 code descriptions (IRS codes A through HH)
export const BOX_12_CODES = {
  A: 'Uncollected social security or RRTA tax on tips',
  B: 'Uncollected Medicare tax on tips',
  C: 'Taxable cost of group-term life insurance over $50,000',
  D: 'Elective deferrals under a section 401(k) cash or deferred arrangement',
  E: 'Elective deferrals under a section 403(b) salary reduction agreement',
  F: 'Elective deferrals under a section 408(k)(6) salary reduction SEP',
  G: 'Elective deferrals and employer contributions to a section 457(b) deferred compensation plan',
  H: 'Elective deferrals under a section 501(c)(18)(D) tax-exempt organization plan',
  J: 'Nontaxable sick pay',
  K: '20% excise tax on excess golden parachute payments',
  L: 'Substantiated employee business expense reimbursements',
  M: 'Uncollected social security or RRTA tax on taxable cost of group-term life insurance over $50,000 (former employees only)',
  N: 'Uncollected Medicare tax on taxable cost of group-term life insurance over $50,000 (former employees only)',
  P: 'Excludable moving expense reimbursements paid directly to a member of the Armed Forces',
  Q: 'Nontaxable combat pay',
  R: 'Employer contributions to an Archer MSA',
  S: 'Employee salary reduction contributions under a section 408(p) SIMPLE plan',
  T: 'Adoption benefits',
  V: 'Income from exercise of nonstatutory stock option(s)',
  W: 'Employer contributions to a Health Savings Account (HSA)',
  Y: 'Deferrals under a section 409A nonqualified deferred compensation plan',
  Z: 'Income under a section 409A nonqualified deferred compensation plan',
  AA: 'Designated Roth contributions under a section 401(k) plan',
  BB: 'Designated Roth contributions under a section 403(b) plan',
  CC: 'HIRE exempt wages and tips (for HIRE Act)',
  DD: 'Cost of employer-sponsored health coverage',
  EE: 'Designated Roth contributions under a governmental section 457(b) plan',
  FF: 'Permitted benefits under a qualified small employer health reimbursement arrangement',
  GG: 'Income from qualified equity grants under section 83(i)',
  HH: 'Aggregate deferrals under section 83(i) elections as of the close of the calendar year',
}

const box12EntrySchema = z.object({
  code: z.string().min(1, 'Code is required'),
  amount: z.number().min(0, 'Amount must be >= 0').default(0),
})

const box14EntrySchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number().default(0),
})

const stateLocalEntrySchema = z.object({
  state: z.string().max(2).default(''),
  employerStateId: z.string().default(''),
  stateWages: z.number().min(0).default(0),
  stateTax: z.number().min(0).default(0),
  localWages: z.number().min(0).default(0),
  localTax: z.number().min(0).default(0),
  localityName: z.string().default(''),
})

// Snapshot schemas — frozen copies of employer/employee data at document creation
const companySnapshotSchema = z.object({
  id: z.string(),
  name: z.string(),
  ein: z.string(),
  address: z.string(),
  address2: z.string().optional().default(''),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  stateEmployerId: z.string().optional().default(''),
  contactName: z.string().optional().default(''),
})

const employeeSnapshotSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  middleInitial: z.string().optional().default(''),
  lastName: z.string(),
  suffix: z.string().optional().default(''),
  ssn: z.string(),
  address: z.string(),
  address2: z.string().optional().default(''),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
})

export const w2DocumentSchema = z.object({
  id: z.string().min(1),
  taxYear: z.number().int().min(2020).max(2099),
  templateId: z.string().optional().default(''),

  // Relationships — live references
  companyId: z.string().min(1, 'Company is required'),
  employeeId: z.string().min(1, 'Employee is required'),

  // Snapshots — frozen at creation / last update
  companySnapshot: companySnapshotSchema,
  employeeSnapshot: employeeSnapshotSchema,

  // ── Numbered boxes (IRS Form W-2) ──────────────────────────────
  // Box a: Employee SSN — stored in employeeSnapshot.ssn
  // Box b: Employer EIN — stored in companySnapshot.ein
  // Box c: Employer name/address — stored in companySnapshot
  // Box d: Control number (optional employer reference)
  controlNumber: z.string().optional().default(''),
  // Box e/f: Employee name/address — stored in employeeSnapshot

  // Box 1: Wages, tips, other compensation
  box1_wagesTips: z.number().min(0).default(0),
  // Box 2: Federal income tax withheld
  box2_federalTaxWithheld: z.number().min(0).default(0),
  // Box 3: Social security wages
  box3_socialSecurityWages: z.number().min(0).default(0),
  // Box 4: Social security tax withheld
  box4_socialSecurityTax: z.number().min(0).default(0),
  // Box 5: Medicare wages and tips
  box5_medicareWages: z.number().min(0).default(0),
  // Box 6: Medicare tax withheld
  box6_medicareTax: z.number().min(0).default(0),
  // Box 7: Social security tips
  box7_socialSecurityTips: z.number().min(0).default(0),
  // Box 8: Allocated tips
  box8_allocatedTips: z.number().min(0).default(0),
  // Box 9: (reserved / blank on current form)
  // Box 10: Dependent care benefits
  box10_dependentCareBenefits: z.number().min(0).default(0),
  // Box 11: Nonqualified plans
  box11_nonqualifiedPlans: z.number().min(0).default(0),

  // Box 12a–12d: coded entries (up to 4)
  box12: z.array(box12EntrySchema).max(4).default([]),

  // Box 13: Checkboxes
  box13_statutoryEmployee: z.boolean().default(false),
  box13_retirementPlan: z.boolean().default(false),
  box13_thirdPartySickPay: z.boolean().default(false),

  // Box 14: Other (employer-defined, up to 4 entries typically)
  box14: z.array(box14EntrySchema).default([]),

  // Boxes 15–20: State and local tax information (up to 2 entries)
  stateLocal: z.array(stateLocalEntrySchema).max(2).default([]),

  // ── Document metadata ──────────────────────────────────────────
  status: z.enum(['draft', 'pending', 'completed', 'error']).default('draft'),
  notes: z.string().optional().default(''),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const w2DocumentCreateSchema = w2DocumentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

// Helper: field labels for the W-2 editor UI
export const W2_BOX_LABELS = {
  box1_wagesTips: '1 — Wages, tips, other compensation',
  box2_federalTaxWithheld: '2 — Federal income tax withheld',
  box3_socialSecurityWages: '3 — Social security wages',
  box4_socialSecurityTax: '4 — Social security tax withheld',
  box5_medicareWages: '5 — Medicare wages and tips',
  box6_medicareTax: '6 — Medicare tax withheld',
  box7_socialSecurityTips: '7 — Social security tips',
  box8_allocatedTips: '8 — Allocated tips',
  box10_dependentCareBenefits: '10 — Dependent care benefits',
  box11_nonqualifiedPlans: '11 — Nonqualified plans',
}
