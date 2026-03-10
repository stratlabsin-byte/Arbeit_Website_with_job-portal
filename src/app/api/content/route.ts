import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public GET — fetch site content for the frontend (no auth required)
export async function GET(req: NextRequest) {
  const section = req.nextUrl.searchParams.get("section");

  if (section) {
    const content = await prisma.siteContent.findUnique({
      where: { section },
    });
    return NextResponse.json({
      success: true,
      data: content ? JSON.parse(content.content) : null,
    });
  }

  const allContent = await prisma.siteContent.findMany();
  const contentMap: Record<string, any> = {};
  allContent.forEach((c) => {
    contentMap[c.section] = JSON.parse(c.content);
  });

  return NextResponse.json({ success: true, data: contentMap });
}
