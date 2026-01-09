import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/users - list users with company count and basic status
export async function GET() {
  console.log('=== API USERS GET called ===')
  
  const session = await getServerSession(authOptions)
  console.log('Session:', session?.user ? { email: session.user.email, globalRole: (session.user as any).globalRole } : 'No session')

  if (!session?.user?.email) {
    console.log('No session email - returning 401')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  console.log('Current user from DB:', currentUser ? { email: currentUser.email, globalRole: currentUser.globalRole } : 'Not found')

  if (!currentUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Only SUPERADMIN can view all users
  if (currentUser.globalRole !== 'SUPERADMIN') {
    console.log('User is not SUPERADMIN - returning 403')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  console.log('User is SUPERADMIN - fetching users')

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { memberships: true },
      },
    },
  })

  const enriched = users.map((u: any) => {
    const companyCount = (u as any)._count?.memberships ?? 0

    return {
      id: u.id,
      email: u.email,
      name: u.name,
      globalRole: u.globalRole,
      companyCount,
      status: u.status,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
    }
  })

  console.log('Returning', enriched.length, 'users')
  return NextResponse.json({ users: enriched }, { status: 200 })
}
