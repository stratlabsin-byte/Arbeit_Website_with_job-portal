import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH - update application status or notes (employer only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  try {
    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: {
        job: {
          include: { company: true },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Only the employer who owns the job or admin can update
    const isOwner = application.job.company.userId === userId;
    const isAdmin = role === "ADMIN";
    // Job seekers can only withdraw their own application
    const isApplicant = application.userId === userId;

    const body = await req.json();

    if (isApplicant && body.status === "WITHDRAWN") {
      const updated = await prisma.application.update({
        where: { id: params.id },
        data: { status: "WITHDRAWN" },
      });
      return NextResponse.json({ data: updated });
    }

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: any = {};
    if (body.status) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const updated = await prisma.application.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Application PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}

// GET - get single application details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
        job: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: application });
  } catch (error) {
    console.error("Application GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  }
}
