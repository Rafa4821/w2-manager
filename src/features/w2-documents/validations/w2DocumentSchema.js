import { z } from 'zod'

export const w2DocumentSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  companyId: z.string().min(1, 'Company is required'),
  taxYear: z.number().min(2020).max(2030),
  wagesTips: z.number().min(0, 'Wages must be positive'),
  federalTaxWithheld: z.number().min(0),
  socialSecurityWages: z.number().min(0),
  socialSecurityTax: z.number().min(0),
  medicareWages: z.number().min(0),
  medicareTax: z.number().min(0),
})
