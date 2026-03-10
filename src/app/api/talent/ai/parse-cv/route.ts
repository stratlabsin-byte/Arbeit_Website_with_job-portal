import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { processCv } from "@/lib/ai/cv-parser";
import path from "path";

// POST /api/talent/ai/parse-cv - Parse a CV file and extract structured data
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "RECRUITER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { cvVersionId } = await req.json();
  if (!cvVersionId) {
    return NextResponse.json({ error: "cvVersionId is required" }, { status: 400 });
  }

  const cvVersion = await prisma.cvVersion.findUnique({
    where: { id: cvVersionId },
  });

  if (!cvVersion) {
    return NextResponse.json({ error: "CV version not found" }, { status: 404 });
  }

  // Mark as parsing
  await prisma.cvVersion.update({
    where: { id: cvVersionId },
    data: { parseStatus: "PARSING" },
  });

  try {
    const filePath = path.join(process.cwd(), "public", cvVersion.fileUrl);
    const { originalText, redactedText, parsedData } = await processCv(filePath);

    // Update CV version with parsed data
    const updated = await prisma.cvVersion.update({
      where: { id: cvVersionId },
      data: {
        parsedData: JSON.stringify(parsedData),
        cvTextOriginal: originalText,
        cvTextRedacted: redactedText,
        parseStatus: "PARSED",
      },
    });

    // Update candidate profile with parsed info (only if fields are empty)
    const candidate = await prisma.candidateProfile.findUnique({
      where: { id: cvVersion.candidateId },
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
        await prisma.candidateProfile.update({
          where: { id: cvVersion.candidateId },
          data: updates,
        });
      }
    }

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    await prisma.cvVersion.update({
      where: { id: cvVersionId },
      data: { parseStatus: "FAILED" },
    });
    return NextResponse.json(
      { error: `CV parsing failed: ${error.message}` },
      { status: 500 }
    );
  }
}
