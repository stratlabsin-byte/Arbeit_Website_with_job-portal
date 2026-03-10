import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

// GET /api/talent/requisitions - List requisitions
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "RECRUITER" && role !== "ADMIN" && role !== "CLIENT_USER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const clientId = searchParams.get("clientId") || "";
  const priority = searchParams.get("priority") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: any = {};

  // Client users can only see their own client's requisitions
  if (role === "CLIENT_USER") {
    const clientUser = await prisma.clientUserProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!clientUser) {
      return NextResponse.json({ error: "Client profile not found" }, { status: 404 });
    }
    where.clientId = clientUser.clientId;
  } else if (clientId) {
    where.clientId = clientId;
  }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }
  if (status) where.status = status;
  if (priority) where.priority = priority;

  const [requisitions, total] = await Promise.all([
    prisma.jobRequisition.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, slug: true } },
        _count: { select: { candidates: true, assignments: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.jobRequisition.count({ where }),
  ]);

  return NextResponse.json({
    data: requisitions,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

// POST /api/talent/requisitions - Create a requisition
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "RECRUITER" && role !== "ADMIN" && role !== "CLIENT_USER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  let clientId = body.clientId;

  // Client users auto-assign their own client
  if (role === "CLIENT_USER") {
    const clientUser = await prisma.clientUserProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!clientUser) {
      return NextResponse.json({ error: "Client profile not found" }, { status: 404 });
    }
    clientId = clientUser.clientId;
  }

  if (!clientId) {
    return NextResponse.json({ error: "Client is required" }, { status: 400 });
  }
  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  // If submitted by client user, status is PENDING_APPROVAL
  // If submitted by recruiter/admin, can set status directly
  const status = role === "CLIENT_USER" ? "PENDING_APPROVAL" : (body.status || "PENDING_APPROVAL");

  const requisition = await prisma.jobRequisition.create({
    data: {
      clientId,
      title: body.title.trim(),
      rawJd: body.rawJd || null,
      polishedJd: body.polishedJd || null,
      description: body.description || null,
      department: body.department || null,
      location: body.location || null,
      city: body.city || null,
      workModel: body.workModel || "ONSITE",
      jobType: body.jobType || "FULL_TIME",
      experienceMin: body.experienceMin || 0,
      experienceMax: body.experienceMax || null,
      ctcMin: body.ctcMin || null,
      ctcMax: body.ctcMax || null,
      ctcCurrency: body.ctcCurrency || "INR",
      noticePeriod: body.noticePeriod || null,
      requiredSkills: body.requiredSkills ? JSON.stringify(body.requiredSkills) : null,
      preferredSkills: body.preferredSkills ? JSON.stringify(body.preferredSkills) : null,
      vacancies: body.vacancies || 1,
      priority: body.priority || "MEDIUM",
      status,
      deadline: body.deadline ? new Date(body.deadline) : null,
    },
    include: {
      client: { select: { id: true, name: true } },
    },
  });

  await logAudit({
    actorId: session.user.id,
    action: "REQUISITION_CREATE",
    entityType: "JobRequisition",
    entityId: requisition.id,
    details: { title: requisition.title, clientId, submittedBy: role },
  });

  return NextResponse.json({ data: requisition }, { status: 201 });
}
