import { PrismaClient, GlobalRole, CompanyRole, WidgetType, WidgetStatus, WidgetPosition } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const adminPassword = await bcrypt.hash("Admin@123", 10);

async function main() {
  /**
   * SUPER ADMIN - Platform level, NOT a member of any company
   */
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@widget.com" },
    update: {},
    create: {
      email: "superadmin@widget.com",
      name: "Super Admin",
      globalRole: GlobalRole.SUPERADMIN,
      passwordHash: adminPassword,
    },
  });

  /**
   * COMPANY ADMIN - Owner of BriskBrainTech
   */
  const companyAdmin = await prisma.user.upsert({
    where: { email: "briskbraintechnologies@gmail.com" },
    update: {},
    create: {
      email: "briskbraintechnologies@gmail.com",
      name: "BriskBrainTech",
      globalRole: GlobalRole.USER,
      passwordHash: adminPassword,
    },
  });

  /**
   * COMPANY - BriskBrainTech
   */
  const company = await prisma.company.upsert({
    where: { slug: "briskbraintech" },
    update: {},
    create: {
      name: "BriskBrainTech",
      slug: "briskbraintech",
      website: "https://briskbraintech.com",
    },
  });

  /**
   * COMPANY MEMBER - Only company admin is a member, NOT superadmin
   */
  await prisma.companyMember.upsert({
    where: {
      userId_companyId: {
        userId: companyAdmin.id,
        companyId: company.id,
      },
    },
    update: {},
    create: {
      userId: companyAdmin.id,
      companyId: company.id,
      role: CompanyRole.OWNER,
    },
  });

  /**
   * ALLOWED DOMAIN
   */
  await prisma.allowedDomain.upsert({
    where: {
      companyId_domain: {
        companyId: company.id,
        domain: "briskbraintech.com",
      },
    },
    update: {},
    create: {
      companyId: company.id,
      domain: "briskbraintech.com",
    },
  });

  /**
   * DEMO WIDGET
   */
  await prisma.widget.upsert({
    where: { publicKey: "demo-widget-key" },
    update: {},
    create: {
      publicKey: "demo-widget-key",
      companyId: company.id,
      name: "Welcome Announcement",
      type: WidgetType.ANNOUNCEMENT_BAR,
      status: WidgetStatus.ACTIVE,
      position: WidgetPosition.TOP,

      content: {
        headline: "Welcome to BriskBrainTech 🎉",
        body: "Innovative solutions for your business",
        ctaText: "Learn More",
        ctaUrl: "https://briskbraintech.com",
      },

      style: {
        backgroundColor: "#3B82F6",
        textColor: "#FFFFFF",
      },

      displayRules: {
        devices: { mobile: true, desktop: true },
        frequency: "always",
      },

      createdById: companyAdmin.id,
      publishedAt: new Date(),
    },
  });

  console.log("✅ Database seeded successfully");
  console.log("📧 SUPERADMIN: superadmin@widget.com (Password: Admin@123)");
  console.log("📧 Company Admin: briskbraintechnologies@gmail.com (Password: Admin@123)");
  console.log("🏢 Company: BriskBrainTech");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
