import { User, Company, Widget, CompanyMember, WidgetAnalytics } from '@prisma/client'
import { GlobalRole, CompanyRole, WidgetStatus, WidgetType, WidgetPosition } from '@prisma/client'

export type { GlobalRole, CompanyRole, WidgetStatus, WidgetType, WidgetPosition }

export interface WidgetContent {
  headline?: string
  body?: string
  ctaText?: string
  ctaUrl?: string
  image?: string
  icon?: string
  closeText?: string
}

export interface WidgetStyle {
  backgroundColor?: string
  textColor?: string
  borderColor?: string
  borderRadius?: string
  fontSize?: string
  fontFamily?: string
  buttonColor?: string
  buttonTextColor?: string
  overlayColor?: string
  boxShadow?: string
  maxWidth?: string
  padding?: string
}

export interface WidgetDisplayRules {
  devices?: {
    mobile?: boolean
    tablet?: boolean
    desktop?: boolean
  }
  frequency?: 'always' | 'once' | 'daily' | 'weekly'
  delay?: number
  scrollPercentage?: number
  exitIntent?: boolean
  urlPatterns?: string[]
}

export interface WidgetWithRelations extends Widget {
  company: Company
  createdBy: User
  updatedBy?: User | null
  analytics?: WidgetAnalytics[]
}

export interface CompanyWithMembers extends Company {
  members: (CompanyMember & { user: User })[]
  _count?: {
    widgets: number
    members: number
  }
}

export interface UserWithMemberships extends User {
  memberships: (CompanyMember & { company: Company })[]
}

export interface AnalyticsData {
  impressions: number
  clicks: number
  dismissals: number
  ctaClicks: number
  ctr: number
  conversionRate: number
  topCountries: { country: string; count: number }[]
  deviceBreakdown: { device: string; count: number }[]
  hourlyData: { hour: number; count: number }[]
}