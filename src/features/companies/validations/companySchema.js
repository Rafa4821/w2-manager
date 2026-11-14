import { z } from 'zod'

export const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  ein: z.string().min(9, 'EIN must be at least 9 characters'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'ZIP code is required'),
})
