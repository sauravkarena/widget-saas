import { z } from 'zod'

export const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(100),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  logo: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
})

export const updateCompanySchema = createCompanySchema.partial()

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['OWNER', 'ADMIN', 'EDITOR', 'VIEWER']),
})

export const updateMemberRoleSchema = z.object({
  role: z.enum(['OWNER', 'ADMIN', 'EDITOR', 'VIEWER']),
})

export const addDomainSchema = z.object({
  domain: z.string().min(1, 'Domain is required'),
})