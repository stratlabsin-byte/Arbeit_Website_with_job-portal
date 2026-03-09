import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

// GET employer's job listings
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  if (role !== "EMPLOYER" && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { userId },
    });

    if (!company) {
      return NextResponse.json({ data: [] });
    }

    const jobs = await prisma.job.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: jobs });
  } catch (error) {
    console.error("Employer jobs GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

// POST create a new job listing
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  if (role !== "EMPLOYER" && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { userId },
    });

    if (!company) {
      return NextResponse.json(
        { error: "No company profile found. Please create a company first." },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Generate unique slug
    let slug = slugify(body.title);
    const existingSlug = await prisma.job.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const job = await prisma.job.create({
      data: {
        companyId: company.id,
        title: body.title,
        slug,
        description: body.description,
        requirements: body.requirements || null,
        responsibilities: body.responsibilities || null,
        skills: body.skills || null,
        jobType: body.jobType || "FULL_TIME",
        experienceLevel: body.experienceLevel || "ENTRY",
        experienceMin: body.experienceMin || 0,
        experienceMax: body.experienceMax || null,
        salaryMin: body.salaryMin || null,
        salaryMax: body.salaryMax || null,
        salaryCurrency: body.salaryCurrency || "INR",
        showSalary: body.showSalary ?? true,
        location: body.location,
        isRemote: body.isRemote || false,
        industry: body.industry,
        department: body.department || null,
        vacancies: body.vacancies || 1,
        deadline: body.deadline ? new Date(body.deadline) : null,
        status: "ACTIVE",
        postedAt: new Date(),
      },
    });

    return NextResponse.json({ data: job }, { status: 201 });
  } catch (error) {
    console.error("Employer jobs POST error:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}
