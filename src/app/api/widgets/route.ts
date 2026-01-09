import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canCreateWidget } from "@/lib/subscription";

/* -------------------------------------------------- */
/*               CONSTANTS                            */
/* -------------------------------------------------- */

const WIDGET_TYPES = [
  "ANNOUNCEMENT_BAR",
  "NOTIFICATION",
  "POPUP_MODAL",
  "SLIDE_IN",
  "FLOATING_BUTTON",
  "BANNER",
] as const;

const POSITION_BY_TYPE: Record<string, string[]> = {
  ANNOUNCEMENT_BAR: ["TOP", "BOTTOM"],
  BANNER: ["TOP", "BOTTOM", "CENTER"],
  NOTIFICATION: ["TOP_LEFT", "TOP_RIGHT", "BOTTOM_LEFT", "BOTTOM_RIGHT"],
  POPUP_MODAL: ["CENTER"],
  SLIDE_IN: ["LEFT_CENTER", "RIGHT_CENTER"],
  FLOATING_BUTTON: ["TOP_LEFT", "TOP_RIGHT", "BOTTOM_LEFT", "BOTTOM_RIGHT"],
};

/* -------------------------------------------------- */
/*                    GET                             */
/* -------------------------------------------------- */

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ widgets: [] });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { memberships: true },
  });

  if (!user) {
    return NextResponse.json({ widgets: [] });
  }

  const where =
    user.globalRole === "SUPERADMIN"
      ? {}
      : {
          companyId: {
            in: user.memberships.map((m) => m.companyId),
          },
        };

  const widgets = await prisma.widget.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      company: {
        select: { id: true, name: true },
      },
    },
  });

  return NextResponse.json({ widgets });
}

/* -------------------------------------------------- */
/*                    POST                            */
/* -------------------------------------------------- */

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (!body?.name || !body?.companyId || !body?.type) {
    return NextResponse.json(
      { error: "Missing required fields (name, companyId, type)" },
      { status: 400 }
    );
  }

  /* ---------------- TYPE VALIDATION ---------------- */

  if (!WIDGET_TYPES.includes(body.type)) {
    return NextResponse.json({ error: "Invalid widget type" }, { status: 400 });
  }

  /* -------------- POSITION VALIDATION -------------- */

  const allowedPositions = POSITION_BY_TYPE[body.type];
  if (!allowedPositions.includes(body.position)) {
    return NextResponse.json(
      {
        error: `Invalid position "${body.position}" for widget type "${body.type}"`,
      },
      { status: 400 }
    );
  }

  /* ---------------- CONTENT VALIDATION ------------- */

  const hasItems = Array.isArray(body.items) && body.items.length > 0;
  const hasLegacyText = body.text1 && body.text2;

  if (!hasItems && !hasLegacyText) {
    return NextResponse.json(
      { error: "Widget content is required" },
      { status: 400 }
    );
  }

  /* ---------------- USER + COMPANY ----------------- */

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { memberships: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.globalRole !== "SUPERADMIN") {
    const isMember = user.memberships.some(
      (m) => m.companyId === body.companyId
    );
    if (!isMember) {
      return NextResponse.json(
        { error: "Not a member of selected company" },
        { status: 403 }
      );
    }
  }

  const company = await prisma.company.findUnique({
    where: { id: body.companyId },
  });

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  /* ---------------- SUBSCRIPTION ------------------- */

  const limitCheck = await canCreateWidget(user.id);
  if (!limitCheck.allowed) {
    return NextResponse.json(
      {
        error: limitCheck.reason,
        upgrade: true,
        current: limitCheck.current,
        limit: limitCheck.limit,
      },
      { status: 403 }
    );
  }

  /* ---------------- CONTENT BUILD ------------------ */

  let content: any = {};

  if (hasItems) {
    content = {
      items: body.items,
    };
  } else {
    content = {
      items: [
        {
          id: crypto.randomUUID(),
          headline: body.text1,
          body: body.text2,
          ctaText: body.text3 || "",
          ctaUrl: "",
        },
      ],
    };
  }

  /* ---------------- STYLE BUILD -------------------- */

  const style = {
    backgroundColor: body.backgroundColor || "#3B82F6",
    textColor: body.textColor || "#FFFFFF",
  };

  /* ---------------- TIMING LOGIC ------------------- */

  const autoHideSeconds =
    body.type === "FLOATING_BUTTON"
      ? null
      : Number.isFinite(body.durationSeconds)
      ? Number(body.durationSeconds)
      : null;

  /* ---------------- CREATE WIDGET ------------------ */

  const widget = await prisma.widget.create({
    data: {
      name: body.name,
      type: body.type, // ✅ FIXED
      status: "DRAFT",

      companyId: body.companyId,
      createdById: user.id,

      content,
      style,

      position: body.position,
      dismissible: body.type !== "FLOATING_BUTTON",
      autoHideSeconds,

      displayRules: {
        frequency: "always",
        delay: 0,
      },

      timezone: "UTC",
    },
  });

  return NextResponse.json({ widget }, { status: 201 });
}
