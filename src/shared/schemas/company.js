import { z } from 'zod'

export const companySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Company name is required'),
  ein: z.string().regex(/^\d{2}-\d{7}$/, 'EIN must be in format XX-XXXXXXX'),
  address: z.string().min(1, 'Address is required'),
  address2: z.string().optional().default(''),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required').max(2),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'ZIP must be XXXXX or XXXXX-XXXX'),
  phone: z.string().optional().default(''),
  email: z.string().email('Invalid email').optional().or(z.literal('')).default(''),
  contactName: z.string().optional().default(''),
  stateEmployerId: z.string().optional().default(''),
  status: z.enum(['active', 'inactive']).default('active'),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const companyCreateSchema = companySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
