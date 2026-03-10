import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — List companies with pagination, search, and job count
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const verified = searchParams.get("verified"); // "true" | "false" | null (all)

  const where: any = {};

  if (search) {
    where.name = { contains: search };
  }

  if (verified === "true") {
    where.isVerified = true;
  } else if (verified === "false") {
    where.isVerified = false;
  }

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      include: {
        user: { select: { email: true } },
        _count: { select: { jobs: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.company.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: companies,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// PATCH — Update a company's fields
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, ...fields } = body;

  if (!id) {
    return NextResponse.json(
      { error: "Company id is required" },
      { status: 400 }
    );
  }

  // Only allow updating these fields
  const allowedFields = [
    "name",
    "industry",
    "location",
    "website",
    "description",
    "isVerified",
    "size",
    "address",
    "phone",
    "email",
    "linkedin",
    "founded",
  ];

  const updateData: Record<string, any> = {};
  for (const key of allowedFields) {
    if (key in fields) {
      updateData[key] = fields[key];
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  try {
    const company = await prisma.company.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { email: true } },
        _count: { select: { jobs: true } },
      },
    });

    return NextResponse.json({ success: true, data: company });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Company not found or update failed" },
      { status: 404 }
    );
  }
}

// DELETE — Delete a company by id
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Company id is required" },
      { status: 400 }
    );
  }

  try {
    await prisma.company.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Company not found or delete failed" },
      { status: 404 }
    );
  }
}
