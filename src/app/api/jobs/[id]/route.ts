import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Try to find by slug first, then by id
    let job = await prisma.job.findUnique({
      where: { slug: id },
      include: {
        company: true,
      },
    });

    if (!job) {
      job = await prisma.job.findUnique({
        where: { id },
        include: {
          company: true,
        },
      });
    }

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Increment views counter
    await prisma.job.update({
      where: { id: job.id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({ data: job });
  } catch (error) {
    console.error("Job detail API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}

// PATCH - update job status or details (employer only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  try {
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: { company: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.company.userId !== userId && role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const updateData: any = {};

    if (body.status) {
      updateData.status = body.status;
      if (body.status === "ACTIVE" && !job.postedAt) {
        updateData.postedAt = new Date();
      }
    }
    if (body.title) updateData.title = body.title;
    if (body.description) updateData.description = body.description;
    if (body.requirements !== undefined) updateData.requirements = body.requirements;
    if (body.responsibilities !== undefined) updateData.responsibilities = body.responsibilities;
    if (body.skills !== undefined) updateData.skills = body.skills;
    if (body.location) updateData.location = body.location;
    if (body.industry) updateData.industry = body.industry;

    const updated = await prisma.job.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Job PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    );
  }
}

// DELETE - delete a job listing (employer only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  try {
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: { company: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.company.userId !== userId && role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.job.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Job DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    );
  }
}
