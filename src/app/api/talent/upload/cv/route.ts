import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { processCv } from "@/lib/ai/cv-parser";

// POST /api/talent/upload/cv - Upload a CV file
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "RECRUITER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const candidateId = formData.get("candidateId") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!candidateId) {
    return NextResponse.json({ error: "candidateId is required" }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Only PDF and DOCX files are allowed" }, { status: 400 });
  }

  // Validate file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File size must be under 10MB" }, { status: 400 });
  }

  const fileType = file.type.includes("pdf") ? "PDF" : "DOCX";
  const ext = fileType === "PDF" ? "pdf" : "docx";
  const timestamp = Date.now();
  const fileName = `cv-${timestamp}.${ext}`;

  // Ensure directory exists
  const uploadDir = path.join(process.cwd(), "public", "uploads", "cv", candidateId);
  await mkdir(uploadDir, { recursive: true });

  // Write file
  const bytes = await file.arrayBuffer();
  const filePath = path.join(uploadDir, fileName);
  await writeFile(filePath, Buffer.from(bytes));

  const fileUrl = `/uploads/cv/${candidateId}/${fileName}`;

  // Get current max version
  const latestCv = await prisma.cvVersion.findFirst({
    where: { candidateId },
    orderBy: { version: "desc" },
  });
  const nextVersion = (latestCv?.version || 0) + 1;

  // Deactivate previous active version
  await prisma.cvVersion.updateMany({
    where: { candidateId, isActive: true },
    data: { isActive: false },
  });

  // Create CV version record
  const cvVersion = await prisma.cvVersion.create({
    data: {
      candidateId,
      fileName: file.name,
      fileUrl,
      fileType,
      fileSize: file.size,
      isActive: true,
      version: nextVersion,
      parseStatus: "PENDING",
    },
  });

  // Auto-parse CV in background
  (async () => {
    try {
      await prisma.cvVersion.update({
        where: { id: cvVersion.id },
        data: { parseStatus: "PARSING" },
      });

      const { originalText, redactedText, parsedData } = await processCv(filePath);

      await prisma.cvVersion.update({
        where: { id: cvVersion.id },
        data: {
          parsedData: JSON.stringify(parsedData),
          cvTextOriginal: originalText,
          cvTextRedacted: redactedText,
          parseStatus: "PARSED",
        },
      });

      // Update candidate profile with parsed info (only empty fields)
      const candidate = await prisma.candidateProfile.findUnique({
        where: { id: candidateId },
      });
      if (candidate) {
        const updates: Record<string, any> = {};
        if (!candidate.email && parsedData.email) updates.email = parsedData.email;
        if (!candidate.phone && parsedData.phone) updates.phone = parsedData.phone;
        if (!candidate.location && parsedData.location) updates.location = parsedData.location;
        if (!candidate.currentRole && parsedData.currentRole) updates.currentRole = parsedData.currentRole;
        if (!candidate.currentCompany && parsedData.currentCompany) updates.currentCompany = parsedData.currentCompany;
        if (candidate.experienceYears === 0 && parsedData.experienceYears > 0) {
          updates.experienceYears = parsedData.experienceYears;
        }
        if (parsedData.skills.length > 0 && !candidate.skills) {
          updates.skills = JSON.stringify(parsedData.skills);
        }
        if (Object.keys(updates).length > 0) {
          await prisma.candidateProfile.update({ where: { id: candidateId }, data: updates });
        }
      }
    } catch (e) {
      console.error("Auto CV parse failed:", e);
      await prisma.cvVersion.update({
        where: { id: cvVersion.id },
        data: { parseStatus: "FAILED" },
      }).catch(() => {});
    }
  })();

  return NextResponse.json({ data: cvVersion }, { status: 201 });
}
