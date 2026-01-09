import { z } from 'zod'

export const widgetContentSchema = z.object({
  headline: z.string().optional(),
  body: z.string().optional(),
  ctaText: z.string().optional(),
  ctaUrl: z.string().url().optional().or(z.literal('')),
  image: z.string().url().optional().or(z.literal('')),
  icon: z.string().optional(),
  closeText: z.string().optional(),
})

export const widgetStyleSchema = z.object({
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  borderColor: z.string().optional(),
  borderRadius: z.string().optional(),
  fontSize: z.string().optional(),
  fontFamily: z.string().optional(),
  buttonColor: z.string().optional(),
  buttonTextColor: z.string().optional(),
  overlayColor: z.string().optional(),
  boxShadow: z.string().optional(),
  maxWidth: z.string().optional(),
  padding: z.string().optional(),
})

export const widgetDisplayRulesSchema = z.object({
  devices: z.object({
    mobile: z.boolean().optional(),
    tablet: z.boolean().optional(),
    desktop: z.boolean().optional(),
  }).optional(),
  frequency: z.enum(['always', 'once', 'daily', 'weekly']).optional(),
  delay: z.number().min(0).optional(),
  scrollPercentage: z.number().min(0).max(100).optional(),
  exitIntent: z.boolean().optional(),
  urlPatterns: z.array(z.string()).optional(),
})

export const createWidgetSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.enum(['ANNOUNCEMENT_BAR', 'POPUP_MODAL', 'SLIDE_IN', 'FLOATING_BUTTON', 'BANNER', 'NOTIFICATION']),
  content: widgetContentSchema,
  style: widgetStyleSchema.optional(),
  position: z.enum(['TOP', 'BOTTOM', 'TOP_LEFT', 'TOP_RIGHT', 'BOTTOM_LEFT', 'BOTTOM_RIGHT', 'CENTER']),
  dismissible: z.boolean().default(true),
  autoHideSeconds: z.number().min(0).optional().nullable(),
  displayRules: widgetDisplayRulesSchema.optional(),
  startAt: z.date().optional().nullable(),
  endAt: z.date().optional().nullable(),
  timezone: z.string().default('UTC'),
})

export const updateWidgetSchema = createWidgetSchema.partial()

export const publishWidgetSchema = z.object({
  status: z.enum(['ACTIVE', 'PAUSED', 'SCHEDULED']),
})