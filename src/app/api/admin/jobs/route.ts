import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: List jobs with pagination, search, status filter
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";

  const where: any = {};

  if (status && status !== "ALL") {
    where.status = status;
  }

  if (search) {
    where.title = { contains: search };
  }

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: {
        company: {
          select: { id: true, name: true, slug: true, logo: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.job.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: jobs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// PATCH: Update job fields
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Job ID is required" },
        { status: 400 }
      );
    }

    // Only allow specific fields to be updated
    const allowedFields = [
      "title",
      "description",
      "requirements",
      "responsibilities",
      "skills",
      "jobType",
      "experienceLevel",
      "experienceMin",
      "experienceMax",
      "salaryMin",
      "salaryMax",
      "salaryCurrency",
      "showSalary",
      "location",
      "isRemote",
      "industry",
      "department",
      "vacancies",
      "status",
      "featured",
      "deadline",
    ];

    const data: any = {};
    for (const key of allowedFields) {
      if (key in updates) {
        data[key] = updates[key];
      }
    }

    // When status changes to ACTIVE and postedAt is null, set postedAt
    if (data.status === "ACTIVE") {
      const existing = await prisma.job.findUnique({
        where: { id },
        select: { postedAt: true },
      });
      if (existing && !existing.postedAt) {
        data.postedAt = new Date();
      }
    }

    const job = await prisma.job.update({
      where: { id },
      data,
      include: {
        company: {
          select: { id: true, name: true, slug: true, logo: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: job });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update job" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a job by id
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { success: false, error: "Job ID is required" },
      { status: 400 }
    );
  }

  try {
    await prisma.job.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete job" },
      { status: 500 }
    );
  }
}
