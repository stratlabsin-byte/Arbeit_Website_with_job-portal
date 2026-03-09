import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET user's saved jobs - alias for /api/jobs/save GET
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const savedJobs = await prisma.savedJob.findMany({
      where: { userId },
      include: {
        job: {
          include: {
            company: {
              select: {
                name: true,
                logo: true,
              },
            },
          },
        },
      },
      orderBy: { savedAt: "desc" },
    });

    return NextResponse.json({ data: savedJobs });
  } catch (error) {
    console.error("Saved jobs GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved jobs" },
      { status: 500 }
    );
  }
}
