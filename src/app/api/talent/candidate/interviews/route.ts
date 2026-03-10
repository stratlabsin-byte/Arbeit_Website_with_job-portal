import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/talent/candidate/interviews - Get candidate's interviews
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) {
    return NextResponse.json({ data: [], total: 0 });
  }

  const interviews = await prisma.interview.findMany({
    where: { candidateId: profile.id },
    include: {
      candidateRequisition: {
        include: {
          requisition: {
            select: { id: true, title: true, client: { select: { name: true } } },
          },
        },
      },
    },
    orderBy: [{ scheduledStart: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ data: interviews, total: interviews.length });
}
