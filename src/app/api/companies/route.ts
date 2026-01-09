import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcrypt'

import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/companies - companies for current user
export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ companies: [] }, { status: 200 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { memberships: { include: { company: true } } },
  })

  if (!user) {
    return NextResponse.json({ companies: [] }, { status: 200 })
  }

  // SUPERADMIN can see all companies
  if (user.globalRole === 'SUPERADMIN') {
    const companies = await prisma.company.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ companies }, { status: 200 })
  }

  const companies = user.memberships.map((m: { company: any }) => m.company)

  return NextResponse.json({ companies }, { status: 200 })
}

// POST /api/companies - create a company and assign current user as OWNER
export async function POST(request: Request) {
  console.log('=== API COMPANIES POST called ===')
  
  const session = await getServerSession(authOptions)
  console.log('Session:', session?.user ? { email: session.user.email, globalRole: (session.user as any).globalRole } : 'No session')

  if (!session?.user?.email) {
    console.log('No session email - returning 401')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)

  if (!body?.name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  console.log('Current user from DB:', user ? { email: user.email, globalRole: user.globalRole } : 'Not found')

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const isSuperAdmin = user.globalRole === 'SUPERADMIN'
  console.log('Is SuperAdmin:', isSuperAdmin)

  let ownerUserId = user.id

  if (isSuperAdmin && body.userId && body.userId !== user.id) {
    const targetUser = await prisma.user.findUnique({
      where: { id: body.userId },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Selected user not found' }, { status: 400 })
    }

    ownerUserId = targetUser.id
  }

  if (isSuperAdmin && body.newUser) {
    const { name: newName, email: newEmail, password: newPassword } = body.newUser || {}

    if (!newName || !newEmail || !newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: 'Invalid new user data' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email: newEmail } })
    if (existing) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)
    const createdOwner = await prisma.user.create({
      data: {
        name: newName,
        email: newEmail,
        passwordHash,
      },
    })

    ownerUserId = createdOwner.id
  }

  const slugBase = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const slug = slugBase || `company-${Date.now()}`

  const company = await prisma.$transaction(async (tx) => {
    const createdCompany = await tx.company.create({
      data: {
        name: body.name,
        slug,
      },
    })

    await tx.companyMember.create({
      data: {
        companyId: createdCompany.id,
        userId: ownerUserId,
        role: 'OWNER',
      },
    })

    return createdCompany
  })

  return NextResponse.json({ company }, { status: 201 })
}
