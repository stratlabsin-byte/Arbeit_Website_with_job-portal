import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scrapeJobsFromUrl } from "@/lib/ai/job-scraper";
import { logAudit } from "@/lib/audit";

// POST /api/talent/ai/import-jobs — Scrape jobs from a URL
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "RECRUITER" && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { url, clientId, action } = body;

  if (!url?.trim()) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  // Step 1: Scrape — just return extracted jobs for preview
  if (action !== "import") {
    try {
      const result = await scrapeJobsFromUrl(url.trim());
      return NextResponse.json({ data: result });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || "Failed to scrape jobs from the URL" },
        { status: 500 }
      );
    }
  }

  // Step 2: Import selected jobs as requisitions
  if (!clientId) {
    return NextResponse.json({ error: "Client is required for import" }, { status: 400 });
  }

  const jobs = body.jobs;
  if (!Array.isArray(jobs) || jobs.length === 0) {
    return NextResponse.json({ error: "No jobs selected for import" }, { status: 400 });
  }

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const created = [];
  for (const job of jobs) {
    const requisition = await prisma.jobRequisition.create({
      data: {
        clientId,
        title: job.title || "Untitled Position",
        rawJd: job.description || null,
        description: job.description || null,
        department: job.department || null,
        location: job.location || null,
        workModel: mapWorkModel(job.workModel),
        jobType: mapJobType(job.jobType),
        experienceMin: job.experienceMin || 0,
        experienceMax: job.experienceMax || null,
        requiredSkills: job.skills?.length ? JSON.stringify(job.skills) : null,
        status: "OPEN",
        sourceUrl: job.url || url,
      },
    });
    created.push(requisition);
  }

  await logAudit({
    actorId: session.user.id,
    action: "JOBS_IMPORTED",
    entityType: "JobRequisition",
    entityId: created[0]?.id || "",
    details: {
      sourceUrl: url,
      clientId,
      count: created.length,
      titles: created.map((r) => r.title),
    },
  });

  return NextResponse.json({
    data: created,
    message: `${created.length} job(s) imported successfully`,
  });
}

function mapWorkModel(value: string | null): string {
  if (!value) return "ONSITE";
  const v = value.toUpperCase();
  if (v.includes("REMOTE")) return "REMOTE";
  if (v.includes("HYBRID")) return "HYBRID";
  return "ONSITE";
}

function mapJobType(value: string | null): string {
  if (!value) return "FULL_TIME";
  const v = value.toUpperCase();
  if (v.includes("PART")) return "PART_TIME";
  if (v.includes("CONTRACT")) return "CONTRACT";
  if (v.includes("INTERN")) return "INTERNSHIP";
  return "FULL_TIME";
}
