import { prisma } from '@/lib/prisma'

export interface PackageInfo {
  id: string
  name: string
  slug: string
  maxWidgets: number
  maxCompanies: number
  price: number
}

export interface UserUsage {
  widgets: number
  companies: number
  package: PackageInfo
}

export interface LimitCheckResult {
  allowed: boolean
  reason?: string
  current?: number
  limit?: number
}

/**
 * Get user's current package with limits
 */
export async function getUserPackage(userId: string): Promise<PackageInfo | null> {
  const userPackage = await prisma.userPackage.findUnique({
    where: { userId },
    include: { package: true }
  })

  if (!userPackage || !userPackage.package) {
    return null
  }

  return {
    id: userPackage.package.id,
    name: userPackage.package.name,
    slug: userPackage.package.slug,
    maxWidgets: userPackage.package.maxWidgets,
    maxCompanies: userPackage.package.maxCompanies,
    price: Number(userPackage.package.price)
  }
}

/**
 * Get user's usage statistics
 */
export async function getUserUsage(userId: string): Promise<UserUsage | null> {
  const pkg = await getUserPackage(userId)
  
  if (!pkg) {
    return null
  }

  // Count widgets across all companies where user is OWNER or ADMIN
  const widgetCount = await prisma.widget.count({
    where: {
      company: {
        members: {
          some: {
            userId: userId,
            role: { in: ['OWNER', 'ADMIN'] }
          }
        }
      }
    }
  })

  // Count companies where user is OWNER
  const companyCount = await prisma.company.count({
    where: {
      members: {
        some: {
          userId: userId,
          role: 'OWNER'
        }
      }
    }
  })

  return {
    widgets: widgetCount,
    companies: companyCount,
    package: pkg
  }
}

/**
 * Check if user can create a widget
 */
export async function canCreateWidget(userId: string): Promise<LimitCheckResult> {
  // Check if user is SUPERADMIN
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { globalRole: true }
  })

  if (user?.globalRole === 'SUPERADMIN') {
    return { allowed: true }
  }

  const usage = await getUserUsage(userId)

  if (!usage) {
    return {
      allowed: false,
      reason: 'No package assigned. Please contact support.'
    }
  }

  if (usage.widgets >= usage.package.maxWidgets) {
    return {
      allowed: false,
      reason: `Widget limit reached. You have ${usage.widgets}/${usage.package.maxWidgets} widgets.`,
      current: usage.widgets,
      limit: usage.package.maxWidgets
    }
  }

  return { allowed: true }
}

/**
 * Check if user can create a company
 */
export async function canCreateCompany(userId: string): Promise<LimitCheckResult> {
  // Check if user is SUPERADMIN
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { globalRole: true }
  })

  if (user?.globalRole === 'SUPERADMIN') {
    return { allowed: true }
  }

  const usage = await getUserUsage(userId)

  if (!usage) {
    return {
      allowed: false,
      reason: 'No package assigned. Please contact support.'
    }
  }

  if (usage.companies >= usage.package.maxCompanies) {
    return {
      allowed: false,
      reason: `Company limit reached. You have ${usage.companies}/${usage.package.maxCompanies} companies.`,
      current: usage.companies,
      limit: usage.package.maxCompanies
    }
  }

  return { allowed: true }
}
