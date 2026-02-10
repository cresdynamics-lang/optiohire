import { z } from 'zod'

export const contactSchema = z.object({
  fullName: z.string().min(2, 'Please enter your full name'),
  email: z.string().email('Enter a valid business email'),
  company: z.string().min(2, 'Company name is required'),
  role: z.string().min(2, 'Let us know your role'),
  topic: z
    .string()
    .min(3, 'Select a topic')
    .max(60, 'Topic is too long'),
  message: z.string().min(20, 'Share at least 20 characters so we can help effectively'),
})

export type ContactFormValues = z.infer<typeof contactSchema>
