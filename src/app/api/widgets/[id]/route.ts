import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

/* -------------------------------------------------- */
/*                   CONSTANTS                        */
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
/*                   GET                              */
/* -------------------------------------------------- */
// GET /api/widgets/[id] – fetch widget for edit

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const widget = await prisma.widget.findUnique({ where: { id } });

  if (!widget) {
    return NextResponse.json({ error: "Widget not found" }, { status: 404 });
  }

  const content = (widget.content || {}) as any;
  const style = (widget.style || {}) as any;
  const items = Array.isArray(content.items) ? content.items : [];

  // Legacy fallback
  if (items.length === 0 && (content.headline || content.body)) {
    items.push({
      id: "legacy",
      headline: content.headline || "",
      body: content.body || "",
      ctaText: content.ctaText || content.closeText || "",
      ctaUrl: content.ctaUrl || "",
    });
  }

  return NextResponse.json({
    widget: {
      id: widget.id,
      companyId: widget.companyId,
      name: widget.name,
      type: widget.type,
      status: widget.status,
      position: widget.position,
      durationSeconds: widget.autoHideSeconds ?? 0,
      items,
      backgroundColor: style.backgroundColor ?? "#3B82F6",
      textColor: style.textColor ?? "#FFFFFF",
    },
  });
}

/* -------------------------------------------------- */
/*                   PATCH                            */
/* -------------------------------------------------- */
// PATCH /api/widgets/[id] – update widget

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const widget = await prisma.widget.findUnique({ where: { id } });
  if (!widget) {
    return NextResponse.json({ error: "Widget not found" }, { status: 404 });
  }

  const data: any = {};

  /* ---------------- STATUS ---------------- */

  if (typeof body.status === "string") {
    if (!["DRAFT", "ACTIVE", "PAUSED"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    data.status = body.status;
  }

  /* ---------------- TYPE ---------------- */

  let finalType = widget.type;

  if (typeof body.type === "string") {
    if (!WIDGET_TYPES.includes(body.type)) {
      return NextResponse.json(
        { error: "Invalid widget type" },
        { status: 400 }
      );
    }
    finalType = body.type;
    data.type = body.type;
  }

  /* ---------------- POSITION ---------------- */

  if (typeof body.position === "string") {
    const allowedPositions = POSITION_BY_TYPE[finalType];
    if (!allowedPositions.includes(body.position)) {
      return NextResponse.json(
        {
          error: `Invalid position "${body.position}" for widget type "${finalType}"`,
        },
        { status: 400 }
      );
    }
    data.position = body.position;
  }

  /* ---------------- NAME ---------------- */

  if (typeof body.name === "string") {
    data.name = body.name;
  }

  /* ---------------- CONTENT ---------------- */

  if (Array.isArray(body.items)) {
    data.content = {
      items: body.items,
    };
  }

  /* ---------------- STYLE ---------------- */

  if (body.backgroundColor || body.textColor) {
    data.style = {
      backgroundColor:
        body.backgroundColor ?? widget.style?.backgroundColor ?? "#3B82F6",
      textColor: body.textColor ?? widget.style?.textColor ?? "#FFFFFF",
    };
  }

  /* ---------------- DURATION ---------------- */

  if (body.durationSeconds !== undefined) {
    const seconds = Number.isFinite(body.durationSeconds)
      ? Number(body.durationSeconds)
      : null;

    data.autoHideSeconds = finalType === "FLOATING_BUTTON" ? null : seconds;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const updated = await prisma.widget.update({
    where: { id },
    data,
  });

  return NextResponse.json(
    {
      id: updated.id,
      type: updated.type,
      status: updated.status,
    },
    { status: 200 }
  );
}

/* -------------------------------------------------- */
/*                   DELETE                           */
/* -------------------------------------------------- */
// DELETE /api/widgets/[id]

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.widget.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
