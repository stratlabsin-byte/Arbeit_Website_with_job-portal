import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET employer's company profile
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  if (role !== "EMPLOYER" && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { userId },
      include: {
        _count: {
          select: { jobs: true },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "No company profile found" }, { status: 404 });
    }

    return NextResponse.json({ data: company });
  } catch (error) {
    console.error("Company GET error:", error);
    return NextResponse.json({ error: "Failed to fetch company" }, { status: 500 });
  }
}

// PATCH update company profile
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  if (role !== "EMPLOYER" && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { userId },
    });

    if (!company) {
      return NextResponse.json({ error: "No company profile found" }, { status: 404 });
    }

    const body = await req.json();

    // Only allow updating these fields
    const allowedFields = [
      "name", "logo", "website", "description", "industry",
      "size", "founded", "location", "address", "phone", "email", "linkedin",
    ];

    const updateData: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const updated = await prisma.company.update({
      where: { id: company.id },
      data: updateData,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Company PATCH error:", error);
    return NextResponse.json({ error: "Failed to update company" }, { status: 500 });
  }
}
