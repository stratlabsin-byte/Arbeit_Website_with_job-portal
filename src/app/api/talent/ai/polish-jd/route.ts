import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { polishJobDescription } from "@/lib/ai/jd-polisher";

// POST /api/talent/ai/polish-jd - Polish a raw JD into professional format
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "RECRUITER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { requisitionId, rawJd, title } = await req.json();

  if (!rawJd || !title) {
    return NextResponse.json({ error: "rawJd and title are required" }, { status: 400 });
  }

  try {
    let context: { company?: string; location?: string; workModel?: string } = {};

    // If requisitionId provided, fetch context from requisition
    if (requisitionId) {
      const req2 = await prisma.jobRequisition.findUnique({
        where: { id: requisitionId },
        include: { client: { select: { name: true } } },
      });
      if (req2) {
        context = {
          company: req2.client.name,
          location: req2.location || undefined,
          workModel: req2.workModel,
        };
      }
    }

    const polishedJd = await polishJobDescription(rawJd, title, context);

    // If requisitionId provided, update the requisition
    if (requisitionId) {
      await prisma.jobRequisition.update({
        where: { id: requisitionId },
        data: { polishedJd },
      });
    }

    return NextResponse.json({ data: { polishedJd } });
  } catch (error: any) {
    return NextResponse.json(
      { error: `JD polishing failed: ${error.message}` },
      { status: 500 }
    );
  }
}
