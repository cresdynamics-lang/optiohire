import { z } from 'zod'

export const institutionApplicationSchema = z.object({
  organizationName: z.string().min(2, 'Please enter your organization name'),
  organizationType: z.enum(['enterprise', 'institution', 'university', 'other'], {
    errorMap: () => ({ message: 'Select an organization type' }),
  }),
  contactName: z.string().min(2, 'Please enter your full name'),
  contactEmail: z.string().email('Enter a valid work email'),
  contactPhone: z
    .string()
    .max(40, 'Phone number is too long')
    .optional()
    .or(z.literal('')),
  country: z.string().max(60, 'Country name is too long').optional().or(z.literal('')),
  teamSize: z.string().max(40).optional().or(z.literal('')),
  message: z
    .string()
    .max(1000, 'Message is too long')
    .optional()
    .or(z.literal('')),
})

export type InstitutionApplicationValues = z.infer<typeof institutionApplicationSchema>
