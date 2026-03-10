import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getClientId(userId: string) {
  const profile = await prisma.clientUserProfile.findUnique({
    where: { userId },
    select: { clientId: true },
  });
  return profile?.clientId;
}

// GET /api/talent/client/interviews - Interviews for this client's requisitions
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const clientId = await getClientId(userId);
  if (!clientId && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No client linked" }, { status: 403 });
  }

  const interviews = await prisma.interview.findMany({
    where: {
      candidateRequisition: {
        requisition: { clientId: clientId || undefined },
      },
    },
    include: {
      candidate: { select: { id: true, name: true } },
      candidateRequisition: {
        include: {
          requisition: { select: { id: true, title: true } },
        },
      },
    },
    orderBy: [{ scheduledStart: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ data: interviews, total: interviews.length });
}
