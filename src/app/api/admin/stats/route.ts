import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const [
    totalJobs,
    activeJobs,
    totalUsers,
    totalCompanies,
    totalApplications,
    totalInquiries,
    unreadInquiries,
  ] = await Promise.all([
    prisma.job.count(),
    prisma.job.count({ where: { status: "ACTIVE" } }),
    prisma.user.count(),
    prisma.company.count(),
    prisma.application.count(),
    prisma.contactInquiry.count(),
    prisma.contactInquiry.count({ where: { isRead: false } }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      totalJobs,
      activeJobs,
      totalUsers,
      totalCompanies,
      totalApplications,
      totalInquiries,
      unreadInquiries,
    },
  });
}
