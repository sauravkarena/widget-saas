import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/public/widgets/[publicKey]
export async function GET(
  _request: Request,
  context: { params: Promise<{ publicKey: string }> }
) {
  const { publicKey } = await context.params;

  try {
    const widget = await prisma.widget.findUnique({
      where: { publicKey },
    });

    if (!widget) {
      return new NextResponse(JSON.stringify({ error: "Widget not found" }), {
        status: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
    }

    const response = {
      type: widget.type,
      content: widget.content,
      style: widget.style,
      autoHideSeconds: widget.autoHideSeconds,
      position: widget.position,
      dismissible: widget.dismissible,
    };

    return new NextResponse(JSON.stringify(response), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching widget public:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
