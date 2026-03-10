import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/talent/candidate/interviews/[interviewId]/book - Book an interview slot
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ interviewId: string }> }
) {
  const { interviewId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { slotId } = await req.json();

  if (!slotId) {
    return NextResponse.json({ error: "slotId is required" }, { status: 400 });
  }

  // Verify the interview belongs to this candidate
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
  });

  if (!interview || !profile || interview.candidateId !== profile.id) {
    return NextResponse.json({ error: "Interview not found" }, { status: 404 });
  }

  if (interview.status !== "SENT_TO_CANDIDATE") {
    return NextResponse.json({ error: "This interview is not available for booking" }, { status: 400 });
  }

  // Find the slot
  const slots = interview.proposedSlots ? JSON.parse(interview.proposedSlots) : [];
  const slot = slots.find((s: any) => s.slotId === slotId);

  if (!slot) {
    return NextResponse.json({ error: "Invalid slot" }, { status: 400 });
  }

  const updated = await prisma.interview.update({
    where: { id: interviewId },
    data: {
      bookedSlotId: slotId,
      bookedAt: new Date(),
      scheduledStart: new Date(slot.startTime),
      scheduledEnd: new Date(slot.endTime),
      status: "BOOKED",
    },
  });

  return NextResponse.json({ data: updated });
}
