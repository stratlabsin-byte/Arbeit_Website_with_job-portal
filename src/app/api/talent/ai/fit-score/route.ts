import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateFitScore } from "@/lib/ai/fit-scorer";

// POST /api/talent/ai/fit-score - Calculate fit score for candidate vs requisition
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "RECRUITER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { candidateId, requisitionId, cvVersionId } = await req.json();

  if (!candidateId || !requisitionId) {
    return NextResponse.json(
      { error: "candidateId and requisitionId are required" },
      { status: 400 }
    );
  }

  try {
    // Get CV parsed data
    let cvVersion;
    if (cvVersionId) {
      cvVersion = await prisma.cvVersion.findUnique({ where: { id: cvVersionId } });
    } else {
      // Use the active CV version
      cvVersion = await prisma.cvVersion.findFirst({
        where: { candidateId, isActive: true, parseStatus: "PARSED" },
      });
    }

    if (!cvVersion?.parsedData) {
      return NextResponse.json(
        { error: "No parsed CV data available. Parse the CV first." },
        { status: 400 }
      );
    }

    const parsedData = JSON.parse(cvVersion.parsedData);

    // Get requisition
    const requisition = await prisma.jobRequisition.findUnique({
      where: { id: requisitionId },
    });

    if (!requisition) {
      return NextResponse.json({ error: "Requisition not found" }, { status: 404 });
    }

    const result = await calculateFitScore(parsedData, requisition);

    // Update CandidateRequisition with fit score
    const cr = await prisma.candidateRequisition.findUnique({
      where: { candidateId_requisitionId: { candidateId, requisitionId } },
    });

    if (cr) {
      await prisma.candidateRequisition.update({
        where: { id: cr.id },
        data: {
          fitScore: result.score,
          cvVersionId: cvVersion.id,
        },
      });
    }

    // Also store in CV version's fitScores JSON
    const existingScores = cvVersion.fitScores
      ? JSON.parse(cvVersion.fitScores)
      : {};
    existingScores[requisitionId] = result.score;

    await prisma.cvVersion.update({
      where: { id: cvVersion.id },
      data: { fitScores: JSON.stringify(existingScores) },
    });

    return NextResponse.json({ data: result });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Fit scoring failed: ${error.message}` },
      { status: 500 }
    );
  }
}
