import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { publicKey: string } }
) {
  const widget = await prisma.widget.findFirst({
    where: {
      publicKey: params.publicKey,
      status: "ACTIVE", // IMPORTANT
    },
    select: {
      type: true,
      position: true,
      content: true,
      style: true,
      displayRules: true,
      dismissible: true,
      autoHideSeconds: true,
    },
  });

  if (!widget) {
    return new NextResponse(
      JSON.stringify({ error: "Widget not found or inactive" }),
      {
        status: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }

  return new NextResponse(JSON.stringify(widget), {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
    },
  });
}
