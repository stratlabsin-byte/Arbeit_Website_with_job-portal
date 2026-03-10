import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/talent/candidates/[candidateId]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { candidateId } = await params;

  const candidate = await prisma.candidateProfile.findUnique({
    where: { id: candidateId },
    include: {
      cvVersions: { orderBy: { version: "desc" } },
      requisitions: {
        include: {
          requisition: {
            select: { id: true, title: true, client: { select: { id: true, name: true } } },
          },
          reviewComments: {
            include: { author: { select: { id: true, name: true, role: true } } },
            orderBy: { createdAt: "desc" },
          },
        },
      },
      interviews: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  return NextResponse.json({ data: candidate });
}

// PUT /api/talent/candidates/[candidateId]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "RECRUITER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { candidateId } = await params;
  const body = await req.json();

  const updated = await prisma.candidateProfile.update({
    where: { id: candidateId },
    data: {
      name: body.name,
      email: body.email,
      phone: body.phone,
      location: body.location,
      currentCompany: body.currentCompany,
      currentRole: body.currentRole,
      experienceYears: body.experienceYears,
      currentCtc: body.currentCtc,
      expectedCtc: body.expectedCtc,
      noticePeriod: body.noticePeriod,
      skills: body.skills ? JSON.stringify(body.skills) : undefined,
      linkedinUrl: body.linkedinUrl,
    },
  });

  return NextResponse.json({ data: updated });
}
