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

  try {
    // Calculate date 30 days ago and 6 months ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [
      totalJobs,
      totalUsers,
      totalApplications,
      totalCompanies,
      jobsByStatus,
      jobsByType,
      applicationsByStatus,
      usersByRole,
      newUsersLast30Days,
      allJobs,
    ] = await Promise.all([
      prisma.job.count(),
      prisma.user.count(),
      prisma.application.count(),
      prisma.company.count(),
      prisma.job.groupBy({ by: ["status"], _count: { id: true } }),
      prisma.job.groupBy({ by: ["jobType"], _count: { id: true } }),
      prisma.application.groupBy({ by: ["status"], _count: { id: true } }),
      prisma.user.groupBy({ by: ["role"], _count: { id: true } }),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      // Get jobs with industry for top 10 aggregation
      prisma.job.findMany({
        select: { industry: true, createdAt: true },
      }),
    ]);

    // Aggregate jobs by industry (top 10)
    const industryMap: Record<string, number> = {};
    allJobs.forEach((job) => {
      const ind = job.industry || "Other";
      industryMap[ind] = (industryMap[ind] || 0) + 1;
    });
    const jobsByIndustry = Object.entries(industryMap)
      .map(([industry, count]) => ({ industry, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Aggregate monthly job posting trend (last 6 months)
    const monthlyTrend: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date();
      start.setMonth(start.getMonth() - i);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);

      const label = start.toLocaleString("en-US", {
        month: "short",
        year: "numeric",
      });

      const count = allJobs.filter(
        (job) => job.createdAt >= start && job.createdAt < end
      ).length;

      monthlyTrend.push({ month: label, count });
    }

    // Format grouped results into { key: count } maps
    const formatGroupBy = (data: { _count: { id: number } }[], key: string) =>
      data.reduce(
        (acc, item) => {
          acc[(item as any)[key]] = item._count.id;
          return acc;
        },
        {} as Record<string, number>
      );

    return NextResponse.json({
      success: true,
      data: {
        totalJobs,
        totalUsers,
        totalApplications,
        totalCompanies,
        jobsByStatus: formatGroupBy(jobsByStatus, "status"),
        jobsByType: formatGroupBy(jobsByType, "jobType"),
        jobsByIndustry,
        applicationsByStatus: formatGroupBy(applicationsByStatus, "status"),
        usersByRole: formatGroupBy(usersByRole, "role"),
        newUsersLast30Days,
        monthlyTrend,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
