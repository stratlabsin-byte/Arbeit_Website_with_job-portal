import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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

  return NextResponse.json({ data: cvVersion }, { status: 201 });
}
