import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";

// PUT /api/talent/requisitions/[requisitionId]/candidates/[crId] - Update stage
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ requisitionId: string; crId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { crId } = await params;
  const body = await req.json();

  const cr = await prisma.candidateRequisition.findUnique({
    where: { id: crId },
    include: {
      candidate: { select: { name: true } },
      requisition: { select: { title: true, clientId: true } },
    },
  });

  if (!cr) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const previousStage = cr.stage;
  const newStage = body.stage || cr.stage;

  const updated = await prisma.candidateRequisition.update({
    where: { id: crId },
    data: {
      stage: newStage,
      fitScore: body.fitScore !== undefined ? body.fitScore : cr.fitScore,
      pushedAt: newStage === "PUSHED_TO_CLIENT" && !cr.pushedAt ? new Date() : cr.pushedAt,
    },
  });

  // Auto-create a review comment for stage changes
  if (newStage !== previousStage) {
    await prisma.reviewComment.create({
      data: {
        candidateRequisitionId: crId,
        authorId: session.user.id,
        action: newStage,
        comment: body.comment || null,
        stageAtTime: newStage,
      },
    });

    await logAudit({
      actorId: session.user.id,
      action: "STAGE_CHANGE",
      entityType: "CandidateRequisition",
      entityId: crId,
      details: { previousStage, newStage, candidateName: cr.candidate.name },
    });

    // Notify client users when pushed to client
    if (newStage === "PUSHED_TO_CLIENT") {
      const clientUsers = await prisma.clientUserProfile.findMany({
        where: { clientId: cr.requisition.clientId },
        select: { userId: true },
      });
      for (const cu of clientUsers) {
        await createNotification({
          userId: cu.userId,
          title: "New Candidate for Review",
          message: `${cr.candidate.name} has been shortlisted for "${cr.requisition.title}"`,
          type: "STAGE_CHANGE",
          linkUrl: `/talent/client/requisitions/${cr.requisitionId}`,
        });
      }
    }
  }

  return NextResponse.json({ data: updated });
}
