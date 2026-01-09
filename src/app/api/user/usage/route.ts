import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserUsage } from '@/lib/subscription'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const usage = await getUserUsage(user.id)

  if (!usage) {
    return NextResponse.json({
      widgets: 0,
      companies: 0,
      limit: 3
    })
  }

  return NextResponse.json({
    widgets: usage.widgets,
    companies: usage.companies,
    limit: usage.package.maxWidgets,
    companyLimit: usage.package.maxCompanies,
    package: usage.package
  })
}
