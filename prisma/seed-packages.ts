import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding packages...')

  // Create default packages
  const packages = [
    {
      name: 'Free',
      slug: 'free',
      description: 'Perfect for getting started',
      maxWidgets: 3,
      maxCompanies: 1,
      price: 0,
      billingCycle: 'monthly',
      isActive: true
    },
    {
      name: 'Basic',
      slug: 'basic',
      description: 'For small businesses',
      maxWidgets: 10,
      maxCompanies: 3,
      price: 29,
      billingCycle: 'monthly',
      isActive: true
    },
    {
      name: 'Platinum',
      slug: 'platinum',
      description: 'For growing teams',
      maxWidgets: 50,
      maxCompanies: 10,
      price: 99,
      billingCycle: 'monthly',
      isActive: true
    },
    {
      name: 'Pro',
      slug: 'pro',
      description: 'Unlimited everything',
      maxWidgets: 999999,
      maxCompanies: 999999,
      price: 299,
      billingCycle: 'monthly',
      isActive: true
    }
  ]

  for (const pkg of packages) {
    const existing = await prisma.package.findUnique({
      where: { slug: pkg.slug }
    })

    if (existing) {
      console.log(`✓ Package "${pkg.name}" already exists`)
    } else {
      await prisma.package.create({ data: pkg })
      console.log(`✓ Created package: ${pkg.name}`)
    }
  }

  // Assign all existing users to Free package
  const freePackage = await prisma.package.findUnique({
    where: { slug: 'free' }
  })

  if (!freePackage) {
    throw new Error('Free package not found!')
  }

  const users = await prisma.user.findMany({
    where: {
      package: null
    }
  })

  for (const user of users) {
    await prisma.userPackage.create({
      data: {
        userId: user.id,
        packageId: freePackage.id,
        isActive: true
      }
    })
    console.log(`✓ Assigned Free package to user: ${user.email}`)
  }

  console.log('✅ Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
