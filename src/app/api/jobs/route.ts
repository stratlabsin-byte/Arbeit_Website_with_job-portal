import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { PaginatedResponse } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const keyword = searchParams.get("keyword") || undefined;
    const location = searchParams.get("location") || undefined;
    const industry = searchParams.get("industry") || undefined;
    const jobType = searchParams.get("jobType") || undefined;
    const experienceLevel = searchParams.get("experienceLevel") || undefined;
    const isRemote = searchParams.get("isRemote");
    const salaryMin = searchParams.get("salaryMin");
    const salaryMax = searchParams.get("salaryMax");
    const sortBy = searchParams.get("sortBy") || "postedAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "12", 10))
    );

    // Build where clause — only active jobs
    const where: Prisma.JobWhereInput = {
      status: "ACTIVE",
    };

    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { description: { contains: keyword } },
        { skills: { contains: keyword } },
        { company: { name: { contains: keyword } } },
      ];
    }

    if (location) {
      where.location = location;
    }

    if (industry) {
      where.industry = industry;
    }

    if (jobType) {
      const types = jobType.split(",");
      if (types.length === 1) {
        where.jobType = types[0] as any;
      } else {
        where.jobType = { in: types as any[] };
      }
    }

    if (experienceLevel) {
      const levels = experienceLevel.split(",");
      if (levels.length === 1) {
        where.experienceLevel = levels[0] as any;
      } else {
        where.experienceLevel = { in: levels as any[] };
      }
    }

    if (isRemote === "true") {
      where.isRemote = true;
    }

    if (salaryMin) {
      where.salaryMax = { gte: parseFloat(salaryMin) };
    }

    if (salaryMax) {
      where.salaryMin = { lte: parseFloat(salaryMax) };
    }

    // Sort
    const validSortFields = ["postedAt", "salaryMax", "views"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "postedAt";
    const order = sortOrder === "asc" ? "asc" : "desc";
    const orderBy: Prisma.JobOrderByWithRelationInput = {
      [sortField]: order,
    };

    // Fetch data and count in parallel
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              slug: true,
              industry: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const response: PaginatedResponse<(typeof jobs)[0]> = {
      data: jobs,
      total,
      page,
      limit,
      totalPages,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Jobs API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
