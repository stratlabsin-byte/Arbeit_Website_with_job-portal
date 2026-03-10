import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/talent/dashboard - Recruiter dashboard stats
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "RECRUITER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const [
    clientCount,
    totalRequisitions,
    pendingApproval,
    publishedRequisitions,
    totalCandidates,
    totalInterviews,
    placements,
    recentCandidates,
    upcomingInterviews,
  ] = await Promise.all([
    prisma.client.count({ where: { status: "ACTIVE" } }),
    prisma.jobRequisition.count(),
    prisma.jobRequisition.count({ where: { status: "PENDING_APPROVAL" } }),
    prisma.jobRequisition.count({ where: { status: "PUBLISHED" } }),
    prisma.candidateProfile.count(),
    prisma.interview.count(),
    prisma.candidateRequisition.count({ where: { stage: "SELECTED" } }),
    prisma.candidateProfile.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, currentRole: true, createdAt: true },
    }),
    prisma.interview.findMany({
      where: {
        status: "BOOKED",
        scheduledStart: { gte: new Date() },
      },
      take: 5,
      orderBy: { scheduledStart: "asc" },
      include: {
        candidate: { select: { name: true } },
        candidateRequisition: {
          include: { requisition: { select: { title: true } } },
        },
      },
    }),
  ]);

  // Pipeline breakdown
  const pipelineStats = await prisma.candidateRequisition.groupBy({
    by: ["stage"],
    _count: true,
  });

  const pipeline: Record<string, number> = {};
  pipelineStats.forEach((p) => {
    pipeline[p.stage] = p._count;
  });

  return NextResponse.json({
    data: {
      clients: clientCount,
      totalRequisitions,
      pendingApproval,
      publishedRequisitions,
      totalCandidates,
      totalInterviews,
      placements,
      pipeline,
      recentCandidates,
      upcomingInterviews,
    },
  });
}
