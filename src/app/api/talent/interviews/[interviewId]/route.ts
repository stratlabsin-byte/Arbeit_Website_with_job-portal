import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

// GET /api/talent/interviews/[interviewId]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ interviewId: string }> }
) {
  const { interviewId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: {
      candidate: { select: { id: true, name: true, email: true, phone: true, currentRole: true } },
      candidateRequisition: {
        include: {
          requisition: {
            select: { id: true, title: true, client: { select: { id: true, name: true } } },
          },
        },
      },
      createdBy: { select: { name: true, email: true } },
    },
  });

  if (!interview) {
    return NextResponse.json({ error: "Interview not found" }, { status: 404 });
  }

  return NextResponse.json({ data: interview });
}

// PUT /api/talent/interviews/[interviewId] - Update interview (book slot, add feedback, change status)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ interviewId: string }> }
) {
  const { interviewId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
  });

  if (!interview) {
    return NextResponse.json({ error: "Interview not found" }, { status: 404 });
  }

  const updateData: any = {};
  const userId = (session.user as any).id;

  // Book a slot
  if (body.bookSlotId && interview.proposedSlots) {
    const slots = JSON.parse(interview.proposedSlots);
    const slot = slots.find((s: any) => s.slotId === body.bookSlotId);
    if (!slot) {
      return NextResponse.json({ error: "Invalid slot ID" }, { status: 400 });
    }
    updateData.bookedSlotId = body.bookSlotId;
    updateData.bookedAt = new Date();
    updateData.scheduledStart = new Date(slot.startTime);
    updateData.scheduledEnd = new Date(slot.endTime);
    updateData.status = "BOOKED";
  }

  // Update status
  if (body.status) {
    updateData.status = body.status;
  }

  // Send to candidate (recruiter forwards proposed slots)
  if (body.status === "SENT_TO_CANDIDATE") {
    updateData.status = "SENT_TO_CANDIDATE";
  }

  // Record feedback
  if (body.feedback !== undefined) {
    updateData.feedback = body.feedback;
  }
  if (body.rating !== undefined) {
    updateData.rating = body.rating;
  }
  if (body.moreRoundsNeeded !== undefined) {
    updateData.moreRoundsNeeded = body.moreRoundsNeeded;
  }

  // Mark no-show
  if (body.noShowBy) {
    updateData.status = "NO_SHOW";
    updateData.noShowBy = body.noShowBy;
  }

  // Update meeting link / instructions
  if (body.meetingLink !== undefined) updateData.meetingLink = body.meetingLink;
  if (body.instructions !== undefined) updateData.instructions = body.instructions;
  if (body.roundName !== undefined) updateData.roundName = body.roundName;

  const updated = await prisma.interview.update({
    where: { id: interviewId },
    data: updateData,
    include: {
      candidate: { select: { name: true } },
      candidateRequisition: {
        include: { requisition: { select: { title: true } } },
      },
    },
  });

  await logAudit({
    actorId: userId,
    action: body.feedback ? "INTERVIEW_FEEDBACK" : "INTERVIEW_UPDATE",
    entityType: "Interview",
    entityId: interviewId,
    details: body,
  });

  return NextResponse.json({ data: updated });
}
