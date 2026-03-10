import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/talent/candidate/applications - Get candidate's applications/requisitions
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) {
    return NextResponse.json({ data: [], total: 0 });
  }

  const applications = await prisma.candidateRequisition.findMany({
    where: { candidateId: profile.id },
    include: {
      requisition: {
        select: {
          id: true,
          title: true,
          location: true,
          workModel: true,
          status: true,
          client: { select: { name: true } },
        },
      },
    },
    orderBy: { submittedAt: "desc" },
  });

  return NextResponse.json({ data: applications, total: applications.length });
}
