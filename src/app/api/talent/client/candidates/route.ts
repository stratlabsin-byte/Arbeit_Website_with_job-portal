import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getClientId(userId: string) {
  const profile = await prisma.clientUserProfile.findUnique({
    where: { userId },
    select: { clientId: true },
  });
  return profile?.clientId;
}

// GET /api/talent/client/candidates - Candidates pushed to this client for review
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const clientId = await getClientId(userId);
  if (!clientId && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No client linked" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const stage = searchParams.get("stage");

  // Get candidate-requisitions where requisition belongs to this client
  // and stage is PUSHED_TO_CLIENT or later client-visible stages
  const clientStages = stage
    ? [stage]
    : ["PUSHED_TO_CLIENT", "CLIENT_APPROVED", "CLIENT_REJECTED", "SELECTED"];

  const candidateRequisitions = await prisma.candidateRequisition.findMany({
    where: {
      requisition: { clientId: clientId || undefined },
      stage: { in: clientStages },
    },
    include: {
      candidate: {
        select: {
          id: true, name: true, location: true, currentRole: true,
          currentCompany: true, experienceYears: true,
          cvVersions: {
            where: { isActive: true, parseStatus: "PARSED" },
            select: { id: true, cvTextRedacted: true, parsedData: true, fileUrl: true },
            take: 1,
          },
        },
      },
      requisition: { select: { id: true, title: true } },
    },
    orderBy: { pushedAt: "desc" },
  });

  return NextResponse.json({
    data: candidateRequisitions,
    total: candidateRequisitions.length,
  });
}
