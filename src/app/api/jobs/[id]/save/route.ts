import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE - unsave a job
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const jobId = params.id;

  try {
    const existing = await prisma.savedJob.findUnique({
      where: { userId_jobId: { userId, jobId } },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Saved job not found" },
        { status: 404 }
      );
    }

    await prisma.savedJob.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unsave job error:", error);
    return NextResponse.json(
      { error: "Failed to unsave job" },
      { status: 500 }
    );
  }
}
