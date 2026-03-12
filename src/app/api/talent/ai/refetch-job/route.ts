import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scrapeJobsFromUrl } from "@/lib/ai/job-scraper";

// POST /api/talent/ai/refetch-job — Re-scrape a specific job from client website
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "RECRUITER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { requisitionId, url } = await req.json();

  if (!requisitionId) {
    return NextResponse.json({ error: "Requisition ID is required" }, { status: 400 });
  }

  const requisition = await prisma.jobRequisition.findUnique({
    where: { id: requisitionId },
  });

  if (!requisition) {
    return NextResponse.json({ error: "Requisition not found" }, { status: 404 });
  }

  const sourceUrl = url || requisition.sourceUrl;
  if (!sourceUrl) {
    return NextResponse.json({ error: "No source URL available for this requisition" }, { status: 400 });
  }

  try {
    const result = await scrapeJobsFromUrl(sourceUrl);

    if (!result.jobs || result.jobs.length === 0) {
      return NextResponse.json({ error: "No jobs found on the page" }, { status: 404 });
    }

    // Try to find the matching job by title similarity
    const titleLower = requisition.title.toLowerCase();
    let bestMatch = result.jobs[0];
    let bestScore = 0;

    for (const job of result.jobs) {
      const jobTitleLower = (job.title || "").toLowerCase();
      // Simple matching: check if titles share significant words
      const reqWords = titleLower.split(/\s+/).filter((w) => w.length > 2);
      const jobWords = jobTitleLower.split(/\s+/).filter((w) => w.length > 2);
      const matches = reqWords.filter((w) => jobWords.some((jw) => jw.includes(w) || w.includes(jw)));
      const score = matches.length / Math.max(reqWords.length, 1);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = job;
      }
    }

    return NextResponse.json({
      data: {
        matchedJob: bestMatch,
        allJobs: result.jobs,
        matchScore: bestScore,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch jobs from the URL" },
      { status: 500 }
    );
  }
}
