import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateFitScore } from "@/lib/ai/fit-scorer";

// GET /api/talent/requisitions/[requisitionId]/candidates
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ requisitionId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { requisitionId } = await params;

  const candidates = await prisma.candidateRequisition.findMany({
    where: { requisitionId },
    include: {
      candidate: {
        include: {
          cvVersions: { where: { isActive: true }, take: 1 },
        },
      },
      reviewComments: {
        include: { author: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
    orderBy: [{ fitScore: "desc" }, { submittedAt: "desc" }],
  });

  return NextResponse.json({ data: candidates });
}

// POST /api/talent/requisitions/[requisitionId]/candidates - Add candidate to requisition
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ requisitionId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "RECRUITER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { requisitionId } = await params;
  const body = await req.json();

  if (!body.candidateId) {
    return NextResponse.json({ error: "candidateId is required" }, { status: 400 });
  }

  // Check if already added
  const existing = await prisma.candidateRequisition.findUnique({
    where: { candidateId_requisitionId: { candidateId: body.candidateId, requisitionId } },
  });
  if (existing) {
    return NextResponse.json({ error: "Candidate already added to this requisition" }, { status: 400 });
  }

  const cr = await prisma.candidateRequisition.create({
    data: {
      candidateId: body.candidateId,
      requisitionId,
      stage: "PIPELINE",
      fitScore: body.fitScore || null,
      cvVersionId: body.cvVersionId || null,
    },
  });

  // Auto-calculate fit score in background if candidate has a parsed CV
  (async () => {
    try {
      const activeCv = await prisma.cvVersion.findFirst({
        where: { candidateId: body.candidateId, isActive: true, parseStatus: "PARSED" },
      });
      if (!activeCv?.parsedData) return;

      const requisition = await prisma.jobRequisition.findUnique({
        where: { id: requisitionId },
      });
      if (!requisition) return;

      const parsedData = JSON.parse(activeCv.parsedData);
      const result = await calculateFitScore(parsedData, requisition);

      await prisma.candidateRequisition.update({
        where: { id: cr.id },
        data: { fitScore: result.score, cvVersionId: activeCv.id },
      });

      // Store in CV version fitScores
      const existingScores = activeCv.fitScores ? JSON.parse(activeCv.fitScores) : {};
      existingScores[requisitionId] = result.score;
      await prisma.cvVersion.update({
        where: { id: activeCv.id },
        data: { fitScores: JSON.stringify(existingScores) },
      });
    } catch (e) {
      console.error("Auto fit-score failed:", e);
    }
  })();

  return NextResponse.json({ data: cr }, { status: 201 });
}
