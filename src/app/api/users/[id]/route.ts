import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/users/[id] - Get single user with package info
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!currentUser || currentUser.globalRole !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      memberships: {
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      },
      createdWidgets: {
        select: {
          id: true,
          name: true,
          type: true,
          status: true,
          createdAt: true,
          company: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Fetch user's package separately
  const userPackage = await prisma.userPackage.findUnique({
    where: { userId: id },
    include: { package: true }
  })

  // Calculate stats
  const stats = {
    totalCompanies: user.memberships.length,
    totalWidgets: user.createdWidgets.length,
    activeWidgets: user.createdWidgets.filter(w => w.status === 'ACTIVE').length
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
      globalRole: user.globalRole,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      package: userPackage ? {
        packageId: userPackage.packageId,
        packageName: userPackage.package.name,
        packageSlug: userPackage.package.slug
      } : null,
      companies: user.memberships.map(m => ({
        id: m.id,
        role: m.role,
        joinedAt: m.createdAt,
        company: m.company
      })),
      widgets: user.createdWidgets,
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
  
  if (currentUser.globalRole !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const data: any = {}

  if (typeof body.status === 'string') {
    if (!['ACTIVE', 'INACTIVE'].includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    data.status = body.status
  }

  if (typeof body.name === 'string') {
    data.name = body.name
  }

  if (typeof body.email === 'string') {
    data.email = body.email
  }

  // Handle package assignment (SUPERADMIN only)
  if (body.packageId !== undefined) {
    // packageId can be null (to remove) or a string (to assign)
    if (body.packageId === null || body.packageId === '') {
      // Remove package assignment
      await prisma.userPackage.deleteMany({
        where: { userId: id }
      })
    } else if (typeof body.packageId === 'string') {
      // Check if package exists
      const packageExists = await prisma.package.findUnique({
        where: { id: body.packageId }
      })

      if (!packageExists) {
        return NextResponse.json({ error: 'Package not found' }, { status: 404 })
      }

      // Upsert user package
      await prisma.userPackage.upsert({
        where: { userId: id },
        create: {
          userId: id,
          packageId: body.packageId,
          isActive: true
        },
        update: {
          packageId: body.packageId,
          isActive: true
        }
      })
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
  })

  return NextResponse.json(
    {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      status: updated.status,
    },
    { status: 200 },
  )
}
