import { z } from 'zod'

export const employeeSchema = z.object({
  id: z.string().min(1),
  firstName: z.string().min(1, 'First name is required'),
  middleInitial: z.string().max(1).optional().default(''),
  lastName: z.string().min(1, 'Last name is required'),
  suffix: z.string().optional().default(''),
  ssn: z.string().min(1, 'SSN is required'),
  address: z.string().min(1, 'Address is required'),
  address2: z.string().optional().default(''),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required').max(2),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'ZIP must be XXXXX or XXXXX-XXXX'),
  email: z.string().email('Invalid email').optional().or(z.literal('')).default(''),
  phone: z.string().optional().default(''),
  companyId: z.string().min(1, 'Company is required'),
  position: z.string().optional().default(''),
  department: z.string().optional().default(''),
  hireDate: z.string().optional().default(''),
  status: z.enum(['active', 'inactive']).default('active'),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const employeeCreateSchema = employeeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
