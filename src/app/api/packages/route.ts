import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/packages - List all packages (SUPERADMIN only)
export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (user?.globalRole !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Forbidden - SUPERADMIN only' }, { status: 403 })
  }

  const packages = await prisma.package.findMany({
    orderBy: { price: 'asc' },
    include: {
      _count: {
        select: { users: true }
      }
    }
  })

  return NextResponse.json({ packages })
}

// POST /api/packages - Create new package (SUPERADMIN only)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (user?.globalRole !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Forbidden - SUPERADMIN only' }, { status: 403 })
  }

  const body = await request.json()

  if (!body.name || !body.slug) {
    return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
  }

  const pkg = await prisma.package.create({
    data: {
      name: body.name,
      slug: body.slug,
      description: body.description || null,
      maxWidgets: body.maxWidgets || 3,
      maxCompanies: body.maxCompanies || 1,
      price: body.price || 0,
      billingCycle: body.billingCycle || 'monthly',
      isActive: body.isActive !== undefined ? body.isActive : true
    }
  })

  return NextResponse.json({ package: pkg }, { status: 201 })
}
