import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - get current user's job seeker profile
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const profile = await prisma.jobSeekerProfile.findUnique({
      where: { userId },
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
      },
    });

    return NextResponse.json({ data: profile });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PUT - create or update job seeker profile
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const body = await req.json();

    const profileData = {
      headline: body.headline || null,
      summary: body.summary || null,
      location: body.location || null,
      workStatus: body.workStatus || "FRESHER",
      experienceYears: body.experienceYears || 0,
      currentSalary: body.currentSalary || null,
      expectedSalary: body.expectedSalary || null,
      skills: body.skills || null,
      education: body.education || null,
      experience: body.experience || null,
      linkedinUrl: body.linkedinUrl || null,
      portfolioUrl: body.portfolioUrl || null,
      noticePeriod: body.noticePeriod || null,
    };

    const profile = await prisma.jobSeekerProfile.upsert({
      where: { userId },
      update: profileData,
      create: {
        userId,
        ...profileData,
      },
    });

    // Update phone on user record if provided
    if (body.phone !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: { phone: body.phone || null },
      });
    }

    return NextResponse.json({ data: profile });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
