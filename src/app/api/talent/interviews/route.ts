import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/talent/interviews - List interviews
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const candidateId = searchParams.get("candidateId");
  const requisitionId = searchParams.get("requisitionId");

  const where: any = {};
  if (status) where.status = status;
  if (candidateId) where.candidateId = candidateId;
  if (requisitionId) {
    where.candidateRequisition = { requisitionId };
  }

  const interviews = await prisma.interview.findMany({
    where,
    include: {
      candidate: { select: { id: true, name: true, email: true, phone: true } },
      candidateRequisition: {
        include: {
          requisition: {
            select: { id: true, title: true, client: { select: { name: true } } },
          },
        },
      },
      createdBy: { select: { name: true } },
    },
    orderBy: [{ scheduledStart: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ data: interviews, total: interviews.length });
}

// POST /api/talent/interviews - Create an interview (propose slots)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    candidateRequisitionId,
    candidateId,
    round,
    roundName,
    mode,
    duration,
    proposedSlots,
    interviewerName,
    interviewerEmail,
    instructions,
    meetingLink,
    location,
  } = body;

  if (!candidateRequisitionId || !candidateId) {
    return NextResponse.json(
      { error: "candidateRequisitionId and candidateId are required" },
      { status: 400 }
    );
  }

  // Validate proposed slots
  if (!proposedSlots || !Array.isArray(proposedSlots) || proposedSlots.length === 0) {
    return NextResponse.json(
      { error: "At least one proposed slot is required" },
      { status: 400 }
    );
  }

  if (proposedSlots.length > 5) {
    return NextResponse.json(
      { error: "Maximum 5 proposed slots allowed" },
      { status: 400 }
    );
  }

  // Auto-determine round number if not provided
  let roundNumber = round;
  if (!roundNumber) {
    const latestInterview = await prisma.interview.findFirst({
      where: { candidateRequisitionId },
      orderBy: { round: "desc" },
    });
    roundNumber = (latestInterview?.round || 0) + 1;
  }

  const interview = await prisma.interview.create({
    data: {
      candidateRequisitionId,
      candidateId,
      round: roundNumber,
      roundName: roundName || `Round ${roundNumber}`,
      mode: mode || "VIDEO",
      duration: duration || 60,
      status: "SLOTS_PROPOSED",
      proposedSlots: JSON.stringify(proposedSlots),
      interviewerName,
      interviewerEmail,
      instructions,
      meetingLink,
      location,
      createdById: (session.user as any).id,
    },
    include: {
      candidate: { select: { name: true, email: true } },
      candidateRequisition: {
        include: {
          requisition: { select: { title: true } },
        },
      },
    },
  });

  return NextResponse.json({ data: interview }, { status: 201 });
}
