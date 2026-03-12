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
          candidate: {
            select: {
              id: true, name: true, email: true, currentRole: true, currentCompany: true,
              cvVersions: { where: { isActive: true }, select: { id: true, parseStatus: true }, take: 1 },
            },
          },
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

/**
 * Map experience years to experience level
 */
function getExperienceLevel(min: number): string {
  if (min <= 1) return "ENTRY";
  if (min <= 3) return "JUNIOR";
  if (min <= 5) return "MID";
  if (min <= 10) return "SENIOR";
  if (min <= 15) return "LEAD";
  return "EXECUTIVE";
}

/**
 * Generate a unique slug from title
 */
function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base}-${Date.now().toString(36)}`;
}

/**
 * Auto-create a Job on the job board when a requisition is published
 */
async function publishToJobBoard(requisitionId: string) {
  const requisition = await prisma.jobRequisition.findUnique({
    where: { id: requisitionId },
    include: {
      client: { select: { companyId: true, industry: true, name: true } },
      job: true,
    },
  });

  if (!requisition) return;

  // Already published
  if (requisition.job) return;

  // Need a linked company to publish on the job board
  const companyId = requisition.client.companyId;
  if (!companyId) {
    // If no company linked, skip auto-publish
    return;
  }

  const description = requisition.polishedJd || requisition.rawJd || requisition.description || requisition.title;
  const location = requisition.location || requisition.city || "India";
  const industry = requisition.client.industry || "General";

  await prisma.job.create({
    data: {
      companyId,
      requisitionId: requisition.id,
      title: requisition.title,
      slug: generateSlug(requisition.title),
      description,
      skills: requisition.requiredSkills,
      jobType: requisition.jobType,
      experienceLevel: getExperienceLevel(requisition.experienceMin),
      experienceMin: requisition.experienceMin,
      experienceMax: requisition.experienceMax,
      salaryMin: requisition.ctcMin,
      salaryMax: requisition.ctcMax,
      salaryCurrency: requisition.ctcCurrency,
      location,
      isRemote: requisition.workModel === "REMOTE",
      industry,
      department: requisition.department,
      vacancies: requisition.vacancies,
      deadline: requisition.deadline,
      status: "ACTIVE",
      postedAt: new Date(),
    },
  });
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
  const newStatus = body.status ?? existing.status;

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
      sourceUrl: body.sourceUrl !== undefined ? body.sourceUrl : existing.sourceUrl,
      status: newStatus,
      deadline: body.deadline ? new Date(body.deadline) : existing.deadline,
      publishedAt: newStatus === "PUBLISHED" && !existing.publishedAt ? new Date() : existing.publishedAt,
    },
    include: {
      client: { select: { id: true, name: true } },
    },
  });

  // Auto-publish to job board when status changes to PUBLISHED
  if (newStatus === "PUBLISHED" && previousStatus !== "PUBLISHED") {
    try {
      await publishToJobBoard(requisitionId);
    } catch (error) {
      console.error("Failed to auto-publish to job board:", error);
    }
  }

  // Sync updates to the linked Job on the job board (if one exists)
  try {
    const linkedJob = await prisma.job.findFirst({ where: { requisitionId } });
    if (linkedJob) {
      const description = updated.polishedJd || updated.rawJd || updated.description || updated.title;
      const location = updated.location || updated.city || linkedJob.location;
      await prisma.job.update({
        where: { id: linkedJob.id },
        data: {
          title: updated.title,
          description,
          skills: updated.requiredSkills,
          jobType: updated.jobType,
          experienceLevel: getExperienceLevel(updated.experienceMin),
          experienceMin: updated.experienceMin,
          experienceMax: updated.experienceMax,
          salaryMin: updated.ctcMin,
          salaryMax: updated.ctcMax,
          salaryCurrency: updated.ctcCurrency,
          location,
          isRemote: updated.workModel === "REMOTE",
          department: updated.department,
          vacancies: updated.vacancies,
          deadline: updated.deadline,
        },
      });
    }
  } catch (error) {
    console.error("Failed to sync requisition to job board:", error);
  }

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
