import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

async function getClientId(userId: string) {
  const profile = await prisma.clientUserProfile.findUnique({
    where: { userId },
    select: { clientId: true },
  });
  return profile?.clientId;
}

// GET /api/talent/client/requisitions - List requisitions for client user's client
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const clientId = await getClientId(userId);
  if (!clientId && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No client linked" }, { status: 403 });
  }

  const where: any = clientId ? { clientId } : {};
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  if (status) where.status = status;

  const requisitions = await prisma.jobRequisition.findMany({
    where,
    include: {
      client: { select: { name: true } },
      _count: { select: { candidates: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: requisitions, total: requisitions.length });
}

// POST /api/talent/client/requisitions - Client submits a new JD / requirement
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const clientId = await getClientId(userId);
  if (!clientId) {
    return NextResponse.json({ error: "No client linked" }, { status: 403 });
  }

  const body = await req.json();
  const { title, rawJd, department, location, city, workModel, experienceMin, experienceMax, requiredSkills, vacancies, priority } = body;

  if (!title) {
    return NextResponse.json({ error: "Job title is required" }, { status: 400 });
  }

  const requisition = await prisma.jobRequisition.create({
    data: {
      clientId,
      title,
      rawJd: rawJd || null,
      department: department || null,
      location: location || null,
      city: city || null,
      workModel: workModel || "ONSITE",
      experienceMin: experienceMin || 0,
      experienceMax: experienceMax || null,
      requiredSkills: requiredSkills ? JSON.stringify(requiredSkills) : null,
      vacancies: vacancies || 1,
      priority: priority || "MEDIUM",
      status: "PENDING_APPROVAL", // Client submissions always go to approval queue
    },
  });

  await logAudit({
    actorId: userId,
    action: "JD_SUBMIT",
    entityType: "JobRequisition",
    entityId: requisition.id,
    details: { title, clientId },
  });

  return NextResponse.json({ data: requisition }, { status: 201 });
}
