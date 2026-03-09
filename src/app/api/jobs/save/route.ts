import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Toggle save/unsave a job
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { jobId } = await req.json();
  if (!jobId) {
    return NextResponse.json(
      { success: false, error: "Job ID is required" },
      { status: 400 }
    );
  }

  const userId = (session.user as any).id;

  // Check if already saved
  const existing = await prisma.savedJob.findUnique({
    where: { userId_jobId: { userId, jobId } },
  });

  if (existing) {
    await prisma.savedJob.delete({
      where: { id: existing.id },
    });
    return NextResponse.json({
      success: true,
      saved: false,
      message: "Job removed from saved list",
    });
  }

  await prisma.savedJob.create({
    data: { userId, jobId },
  });

  return NextResponse.json({
    success: true,
    saved: true,
    message: "Job saved successfully",
  });
}

// Get user's saved jobs
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const userId = (session.user as any).id;

  const savedJobs = await prisma.savedJob.findMany({
    where: { userId },
    include: {
      job: {
        include: { company: true },
      },
    },
    orderBy: { savedAt: "desc" },
  });

  return NextResponse.json({
    success: true,
    data: savedJobs,
  });
}
