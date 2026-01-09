import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH /api/packages/[id] - Update package (SUPERADMIN only)
export async function PATCH(
  request: Request,
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

  if (user?.globalRole !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Forbidden - SUPERADMIN only' }, { status: 403 })
  }

  const body = await request.json()

  const pkg = await prisma.package.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      maxWidgets: body.maxWidgets,
      maxCompanies: body.maxCompanies,
      price: body.price,
      billingCycle: body.billingCycle,
      isActive: body.isActive
    }
  })

  return NextResponse.json({ package: pkg })
}

// DELETE /api/packages/[id] - Deactivate package (SUPERADMIN only)
export async function DELETE(
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

  if (user?.globalRole !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Forbidden - SUPERADMIN only' }, { status: 403 })
  }

  // Don't actually delete, just deactivate
  const pkg = await prisma.package.update({
    where: { id },
    data: { isActive: false }
  })

  return NextResponse.json({ package: pkg })
}
