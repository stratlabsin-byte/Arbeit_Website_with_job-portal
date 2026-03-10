import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/talent/candidates - List all candidates
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "RECRUITER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { currentRole: { contains: search } },
      { currentCompany: { contains: search } },
    ];
  }

  const [candidates, total] = await Promise.all([
    prisma.candidateProfile.findMany({
      where,
      include: {
        cvVersions: { where: { isActive: true }, take: 1 },
        _count: { select: { requisitions: true, interviews: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.candidateProfile.count({ where }),
  ]);

  return NextResponse.json({
    data: candidates,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

// POST /api/talent/candidates - Create a candidate
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "RECRUITER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const candidate = await prisma.candidateProfile.create({
    data: {
      name: body.name.trim(),
      email: body.email || null,
      phone: body.phone || null,
      location: body.location || null,
      currentCompany: body.currentCompany || null,
      currentRole: body.currentRole || null,
      experienceYears: body.experienceYears || 0,
      currentCtc: body.currentCtc || null,
      expectedCtc: body.expectedCtc || null,
      noticePeriod: body.noticePeriod || null,
      skills: body.skills ? JSON.stringify(body.skills) : null,
      linkedinUrl: body.linkedinUrl || null,
      source: body.source || "UPLOAD",
    },
  });

  // If a requisitionId is provided, add to that requisition's pipeline
  if (body.requisitionId) {
    await prisma.candidateRequisition.create({
      data: {
        candidateId: candidate.id,
        requisitionId: body.requisitionId,
        stage: "PIPELINE",
      },
    });
  }

  return NextResponse.json({ data: candidate }, { status: 201 });
}
