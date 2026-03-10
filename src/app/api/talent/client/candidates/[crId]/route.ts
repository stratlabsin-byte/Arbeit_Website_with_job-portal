import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

// PUT /api/talent/client/candidates/[crId] - Client approves or rejects a candidate
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ crId: string }> }
) {
  const { crId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const body = await req.json();
  const { action, comment } = body; // action: "APPROVE" | "REJECT"

  if (!action || !["APPROVE", "REJECT"].includes(action)) {
    return NextResponse.json({ error: "action must be APPROVE or REJECT" }, { status: 400 });
  }

  const cr = await prisma.candidateRequisition.findUnique({
    where: { id: crId },
    include: { requisition: { select: { clientId: true } } },
  });

  if (!cr) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Verify client user belongs to this client
  const profile = await prisma.clientUserProfile.findUnique({
    where: { userId },
    select: { clientId: true },
  });

  if (profile?.clientId !== cr.requisition.clientId && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const newStage = action === "APPROVE" ? "CLIENT_APPROVED" : "CLIENT_REJECTED";

  const updated = await prisma.candidateRequisition.update({
    where: { id: crId },
    data: { stage: newStage },
  });

  // Add review comment
  await prisma.reviewComment.create({
    data: {
      candidateRequisitionId: crId,
      authorId: userId,
      action: action === "APPROVE" ? "CLIENT_APPROVE" : "CLIENT_REJECT",
      comment: comment || null,
      stageAtTime: newStage,
    },
  });

  await logAudit({
    actorId: userId,
    action: action === "APPROVE" ? "CLIENT_APPROVE_CANDIDATE" : "CLIENT_REJECT_CANDIDATE",
    entityType: "CandidateRequisition",
    entityId: crId,
  });

  return NextResponse.json({ data: updated });
}
