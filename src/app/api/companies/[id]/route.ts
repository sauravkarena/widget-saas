import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/companies/[id] - Get company with members and widgets
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
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

  // Fetch company with members and widgets
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              status: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      },
      widgets: {
        select: {
          id: true,
          name: true,
          type: true,
          status: true,
          createdAt: true,
          publicKey: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  })

  if (!company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  }

  // SUPERADMIN has access to all companies without being a member
  // Regular users must be members of the company
  if (user.globalRole !== 'SUPERADMIN') {
    const isMember = company.members.some(m => m.userId === user.id)
    if (!isMember) {
      return NextResponse.json({ error: 'Access denied - You are not a member of this company' }, { status: 403 })
    }
  }

  // Calculate stats
  const stats = {
    totalMembers: company.members.length,
    totalWidgets: company.widgets.length,
    activeWidgets: company.widgets.filter(w => w.status === 'ACTIVE').length
  }

  return NextResponse.json({
    company: {
      id: company.id,
      name: company.name,
      slug: company.slug,
      website: company.website,
      logo: company.logo,
      status: company.status,
      createdAt: company.createdAt,
      members: company.members.map(m => ({
        id: m.id,
        role: m.role,
        joinedAt: m.createdAt,
        user: m.user
      })),
      widgets: company.widgets,
      stats
    }
  })
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!currentUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const isSuperAdmin = currentUser.globalRole === 'SUPERADMIN'

  const body = await request.json().catch(() => null)

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const data: any = {}

  // Status changes are SUPERADMIN-only
  if (typeof body.status === 'string') {
    if (!['ACTIVE', 'SUSPENDED'].includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    data.status = body.status
  }

  if (typeof body.name === 'string') {
    data.name = body.name
  }

  if (typeof body.slug === 'string') {
    data.slug = body.slug
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  // Non-superadmin users must be OWNER of this company to edit name/slug
  if (!isSuperAdmin) {
    const membership = await prisma.companyMember.findFirst({
      where: {
        userId: currentUser.id,
        companyId: id,
        role: 'OWNER',
      },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const updated = await prisma.company.update({
    where: { id },
    data,
  })

  return NextResponse.json(
    {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      status: updated.status,
    },
    { status: 200 },
  )
}
