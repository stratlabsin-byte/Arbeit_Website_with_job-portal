import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/talent/requisitions/[requisitionId]/candidates/[crId]/comments
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ crId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { crId } = await params;

  const comments = await prisma.reviewComment.findMany({
    where: { candidateRequisitionId: crId },
    include: { author: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: comments });
}

// POST /api/talent/requisitions/[requisitionId]/candidates/[crId]/comments
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ crId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { crId } = await params;
  const body = await req.json();

  if (!body.comment?.trim()) {
    return NextResponse.json({ error: "Comment is required" }, { status: 400 });
  }

  // Get current stage
  const cr = await prisma.candidateRequisition.findUnique({ where: { id: crId } });
  if (!cr) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const comment = await prisma.reviewComment.create({
    data: {
      candidateRequisitionId: crId,
      authorId: session.user.id,
      action: body.action || "COMMENT",
      comment: body.comment.trim(),
      stageAtTime: cr.stage,
    },
    include: { author: { select: { id: true, name: true, role: true } } },
  });

  return NextResponse.json({ data: comment }, { status: 201 });
}
