import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET applications - role-based
// Job seekers: their own applications
// Employers: applications for their jobs (optionally filtered by jobId)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const role = (session.user as any).role;
  const jobId = req.nextUrl.searchParams.get("jobId");

  try {
    if (role === "EMPLOYER" || role === "ADMIN") {
      // Employer: get applications for their jobs
      const company = await prisma.company.findUnique({
        where: { userId },
      });

      if (!company) {
        return NextResponse.json({ data: [] });
      }

      const where: any = {
        job: { companyId: company.id },
      };

      if (jobId) {
        where.jobId = jobId;
      }

      const applications = await prisma.application.findMany({
        where,
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
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        orderBy: { appliedAt: "desc" },
      });

      return NextResponse.json({ data: applications });
    } else {
      // Job seeker: get their own applications
      const applications = await prisma.application.findMany({
        where: { userId },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              slug: true,
              location: true,
              company: {
                select: {
                  name: true,
                  logo: true,
                },
              },
            },
          },
        },
        orderBy: { appliedAt: "desc" },
      });

      return NextResponse.json({ data: applications });
    }
  } catch (error) {
    console.error("Applications GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

// POST - apply for a job
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const body = await req.json();
    const { jobId, coverLetter, resumeUrl } = body;

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    // Check if job exists and is active
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Job not found or not accepting applications" },
        { status: 404 }
      );
    }

    // Check for duplicate application
    const existing = await prisma.application.findUnique({
      where: { jobId_userId: { jobId, userId } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "You have already applied for this job" },
        { status: 409 }
      );
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        userId,
        coverLetter: coverLetter || null,
        resumeUrl: resumeUrl || null,
      },
    });

    // Increment application count
    await prisma.job.update({
      where: { id: jobId },
      data: { applicationCount: { increment: 1 } },
    });

    return NextResponse.json({ data: application }, { status: 201 });
  } catch (error) {
    console.error("Applications POST error:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
