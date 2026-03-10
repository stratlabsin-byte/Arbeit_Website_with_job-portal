import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET all site content or a specific section
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const section = req.nextUrl.searchParams.get("section");

  if (section) {
    const content = await prisma.siteContent.findUnique({
      where: { section },
    });
    return NextResponse.json({
      success: true,
      data: content ? { ...content, content: JSON.parse(content.content) } : null,
    });
  }

  const allContent = await prisma.siteContent.findMany({
    orderBy: { section: "asc" },
  });

  return NextResponse.json({
    success: true,
    data: allContent.map((c) => ({
      ...c,
      content: JSON.parse(c.content),
    })),
  });
}

// POST/PUT — upsert a section's content
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { section, content } = body;

  if (!section || content === undefined) {
    return NextResponse.json(
      { error: "section and content are required" },
      { status: 400 }
    );
  }

  const result = await prisma.siteContent.upsert({
    where: { section },
    update: { content: JSON.stringify(content) },
    create: { section, content: JSON.stringify(content) },
  });

  return NextResponse.json({
    success: true,
    data: { ...result, content: JSON.parse(result.content) },
  });
}
