import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { extractCvText, parseCvText } from "@/lib/ai/cv-parser";

/**
 * POST /api/talent/ai/parse-cv-quick
 * Upload a CV file, parse it with AI, and return extracted data.
 * Used for auto-filling the candidate creation form.
 * The file is stored temporarily and deleted after parsing.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "RECRUITER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

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

  // Write to a temp file for parsing
  const ext = file.type.includes("pdf") ? "pdf" : "docx";
  const tmpDir = path.join(process.cwd(), "public", "uploads", "tmp");
  await mkdir(tmpDir, { recursive: true });
  const tmpPath = path.join(tmpDir, `parse-${Date.now()}.${ext}`);

  try {
    const bytes = await file.arrayBuffer();
    await writeFile(tmpPath, Buffer.from(bytes));

    // Extract text and parse with AI
    const cvText = await extractCvText(tmpPath);
    const parsedData = await parseCvText(cvText);

    return NextResponse.json({ data: parsedData });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to parse CV" },
      { status: 500 }
    );
  } finally {
    // Clean up temp file
    try {
      await unlink(tmpPath);
    } catch {}
  }
}
