import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

// GET /api/talent/requisitions/[requisitionId]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ requisitionId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { requisitionId } = await params;

  const requisition = await prisma.jobRequisition.findUnique({
    where: { id: requisitionId },
    include: {
      client: { select: { id: true, name: true, slug: true, industry: true } },
      assignments: {
        include: {
          recruiter: { include: { user: { select: { id: true, name: true, email: true } } } },
        },
      },
      candidates: {
        include: {
          candidate: { select: { id: true, name: true, email: true, currentRole: true, currentCompany: true } },
        },
        orderBy: { submittedAt: "desc" },
      },
      job: { select: { id: true, slug: true, status: true } },
      _count: { select: { candidates: true } },
    },
  });

  if (!requisition) {
    return NextResponse.json({ error: "Requisition not found" }, { status: 404 });
  }

  // Client users can only view their own client's requisitions
  if (session.user.role === "CLIENT_USER") {
    const clientUser = await prisma.clientUserProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (clientUser?.clientId !== requisition.clientId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.json({ data: requisition });
}

// PUT /api/talent/requisitions/[requisitionId]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ requisitionId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "RECRUITER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { requisitionId } = await params;
  const body = await req.json();

  const existing = await prisma.jobRequisition.findUnique({ where: { id: requisitionId } });
  if (!existing) {
    return NextResponse.json({ error: "Requisition not found" }, { status: 404 });
  }

  const previousStatus = existing.status;

  const updated = await prisma.jobRequisition.update({
    where: { id: requisitionId },
    data: {
      title: body.title ?? existing.title,
      rawJd: body.rawJd ?? existing.rawJd,
      polishedJd: body.polishedJd ?? existing.polishedJd,
      description: body.description ?? existing.description,
      department: body.department ?? existing.department,
      location: body.location ?? existing.location,
      city: body.city ?? existing.city,
      workModel: body.workModel ?? existing.workModel,
      jobType: body.jobType ?? existing.jobType,
      experienceMin: body.experienceMin ?? existing.experienceMin,
      experienceMax: body.experienceMax !== undefined ? body.experienceMax : existing.experienceMax,
      ctcMin: body.ctcMin !== undefined ? body.ctcMin : existing.ctcMin,
      ctcMax: body.ctcMax !== undefined ? body.ctcMax : existing.ctcMax,
      ctcCurrency: body.ctcCurrency ?? existing.ctcCurrency,
      noticePeriod: body.noticePeriod ?? existing.noticePeriod,
      requiredSkills: body.requiredSkills ? JSON.stringify(body.requiredSkills) : existing.requiredSkills,
      preferredSkills: body.preferredSkills ? JSON.stringify(body.preferredSkills) : existing.preferredSkills,
      vacancies: body.vacancies ?? existing.vacancies,
      priority: body.priority ?? existing.priority,
      status: body.status ?? existing.status,
      deadline: body.deadline ? new Date(body.deadline) : existing.deadline,
      publishedAt: body.status === "PUBLISHED" && !existing.publishedAt ? new Date() : existing.publishedAt,
    },
    include: {
      client: { select: { id: true, name: true } },
    },
  });

  await logAudit({
    actorId: session.user.id,
    action: body.status && body.status !== previousStatus ? "REQUISITION_STATUS_CHANGE" : "REQUISITION_UPDATE",
    entityType: "JobRequisition",
    entityId: requisitionId,
    details: {
      previousStatus,
      newStatus: updated.status,
      ...(body.title && { title: body.title }),
    },
  });

  return NextResponse.json({ data: updated });
}
