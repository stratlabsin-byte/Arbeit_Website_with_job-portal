import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { processCv } from "@/lib/ai/cv-parser";
import { calculateFitScore } from "@/lib/ai/fit-scorer";

// POST /api/talent/candidates/bulk-upload - Upload a CV, create candidate, parse & upload
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "RECRUITER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const requisitionId = formData.get("requisitionId") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Only PDF and DOCX files are allowed" }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File size must be under 10MB" }, { status: 400 });
  }

  try {
    // 1. Save the CV file first
    const fileType = file.type.includes("pdf") ? "PDF" : "DOCX";
    const ext = fileType === "PDF" ? "pdf" : "docx";
    const timestamp = Date.now();
    const fileName = `cv-${timestamp}.${ext}`;

    // Use a temp candidate ID for the directory, will rename after
    const tmpId = `tmp-${timestamp}`;
    const tmpDir = path.join(process.cwd(), "public", "uploads", "cv", tmpId);
    await mkdir(tmpDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const filePath = path.join(tmpDir, fileName);
    await writeFile(filePath, Buffer.from(bytes));

    // 2. Run full CV parse pipeline (extract text + AI parse + redact)
    let parsedResult: { originalText: string; redactedText: string; parsedData: any } | null = null;
    try {
      parsedResult = await processCv(filePath);
    } catch (e) {
      console.error("CV parse failed during bulk upload:", e);
    }

    const parsedData = parsedResult?.parsedData || {};

    // 3. Create candidate profile
    const candidateName = parsedData.name || file.name.replace(/\.(pdf|docx)$/i, "").replace(/[-_]/g, " ");

    const candidate = await prisma.candidateProfile.create({
      data: {
        name: candidateName,
        email: parsedData.email || null,
        phone: parsedData.phone || null,
        location: parsedData.location || null,
        currentCompany: parsedData.currentCompany || null,
        currentRole: parsedData.currentRole || null,
        experienceYears: parsedData.experienceYears || 0,
        skills: parsedData.skills?.length > 0 ? JSON.stringify(parsedData.skills) : null,
        source: "UPLOAD",
      },
    });

    // 4. Move file to proper candidate directory
    const finalDir = path.join(process.cwd(), "public", "uploads", "cv", candidate.id);
    await mkdir(finalDir, { recursive: true });
    const finalPath = path.join(finalDir, fileName);
    const { rename } = await import("fs/promises");
    await rename(filePath, finalPath);
    // Clean up temp directory
    const { rmdir } = await import("fs/promises");
    try { await rmdir(tmpDir); } catch {}

    const fileUrl = `/uploads/cv/${candidate.id}/${fileName}`;

    // 5. Create CV version record WITH parsedData
    const cvVersion = await prisma.cvVersion.create({
      data: {
        candidateId: candidate.id,
        fileName: file.name,
        fileUrl,
        fileType,
        fileSize: file.size,
        isActive: true,
        version: 1,
        parseStatus: parsedResult ? "PARSED" : "PENDING",
        parsedData: parsedResult ? JSON.stringify(parsedData) : null,
        cvTextOriginal: parsedResult?.originalText || null,
        cvTextRedacted: parsedResult?.redactedText || null,
      },
    });

    // 6. Link to requisition + auto fit-score if provided
    if (requisitionId) {
      const cr = await prisma.candidateRequisition.create({
        data: {
          candidateId: candidate.id,
          requisitionId,
          stage: "PIPELINE",
          cvVersionId: cvVersion.id,
        },
      });

      // Auto-calculate fit score if we have parsed data
      if (parsedResult) {
        (async () => {
          try {
            const requisition = await prisma.jobRequisition.findUnique({
              where: { id: requisitionId },
            });
            if (!requisition) return;

            const result = await calculateFitScore(parsedData, requisition);

            await prisma.candidateRequisition.update({
              where: { id: cr.id },
              data: { fitScore: result.score, cvVersionId: cvVersion.id },
            });

            const existingScores = cvVersion.fitScores ? JSON.parse(cvVersion.fitScores) : {};
            existingScores[requisitionId] = result.score;
            await prisma.cvVersion.update({
              where: { id: cvVersion.id },
              data: { fitScores: JSON.stringify(existingScores) },
            });
          } catch (e) {
            console.error("Auto fit-score failed in bulk upload:", e);
          }
        })();
      }
    }

    return NextResponse.json({
      data: {
        candidate,
        cvVersion,
        parsed: !!parsedResult,
      },
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Failed to process CV: ${error.message}` },
      { status: 500 }
    );
  }
}
