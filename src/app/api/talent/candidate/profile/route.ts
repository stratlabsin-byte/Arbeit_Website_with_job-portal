import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/talent/candidate/profile - Get current candidate's profile
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId },
    include: {
      cvVersions: { orderBy: { version: "desc" } },
      requisitions: {
        include: {
          requisition: {
            select: { id: true, title: true, status: true, client: { select: { name: true } } },
          },
          reviewComments: {
            orderBy: { createdAt: "desc" },
            take: 5,
            include: { author: { select: { name: true } } },
          },
        },
        orderBy: { submittedAt: "desc" },
      },
      interviews: {
        include: {
          candidateRequisition: {
            include: { requisition: { select: { title: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!profile) {
    return NextResponse.json({ error: "No candidate profile found" }, { status: 404 });
  }

  return NextResponse.json({ data: profile });
}
