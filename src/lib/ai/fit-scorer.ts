import { getAnthropic, extractJson } from "./anthropic";
import { FIT_SCORER_SYSTEM } from "./prompts";

export interface FitScoreResult {
  score: number;
  breakdown: {
    skillsMatch: number;
    experienceMatch: number;
    roleRelevance: number;
    overallProfile: number;
  };
  matchedSkills: string[];
  missingSkills: string[];
  summary: string;
}

/**
 * Calculate fit score between a candidate's CV data and a job requisition
 */
export async function calculateFitScore(
  parsedCvData: {
    skills: string[];
    experienceYears: number;
    currentRole: string | null;
    currentCompany: string | null;
    experience: { role: string; company: string; duration: string; description?: string }[];
    education: { degree: string; institution: string }[];
    summary: string;
  },
  requisition: {
    title: string;
    description?: string | null;
    polishedJd?: string | null;
    requiredSkills?: string | null;
    preferredSkills?: string | null;
    experienceMin: number;
    experienceMax?: number | null;
    workModel: string;
    location?: string | null;
  }
): Promise<FitScoreResult> {
  const anthropic = getAnthropic();

  const reqSkills = requisition.requiredSkills
    ? JSON.parse(requisition.requiredSkills)
    : [];
  const prefSkills = requisition.preferredSkills
    ? JSON.parse(requisition.preferredSkills)
    : [];

  // Build a rich candidate summary for better AI evaluation
  const candidateSummary = [
    `Name: ${parsedCvData.currentRole || "Unknown"} at ${parsedCvData.currentCompany || "Unknown"}`,
    `Total Experience: ${parsedCvData.experienceYears} years`,
    `Summary: ${parsedCvData.summary || "N/A"}`,
    `Skills: ${parsedCvData.skills?.join(", ") || "None listed"}`,
    "",
    "WORK HISTORY (read carefully to assess actual depth of expertise):",
    ...(parsedCvData.experience || []).map((exp, i) =>
      `${i + 1}. ${exp.role} at ${exp.company} (${exp.duration})${exp.description ? `\n   ${exp.description}` : ""}`
    ),
    "",
    "EDUCATION:",
    ...(parsedCvData.education || []).map((edu) =>
      `- ${edu.degree} from ${edu.institution}`
    ),
  ].join("\n");

  const jdText = requisition.polishedJd || requisition.description || "N/A";
  // Strip HTML tags from JD for cleaner AI input
  const cleanJd = jdText.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  const userPrompt = `
=== CANDIDATE PROFILE ===
${candidateSummary}

=== JOB REQUISITION ===
Title: ${requisition.title}
Experience Required: ${requisition.experienceMin}${requisition.experienceMax ? `-${requisition.experienceMax}` : "+"} years
Required Skills: ${reqSkills.join(", ") || "Not specified"}
Preferred Skills: ${prefSkills.join(", ") || "Not specified"}
Work Model: ${requisition.workModel}
Location: ${requisition.location || "Not specified"}

Full Job Description:
${cleanJd.substring(0, 4000)}

IMPORTANT: Score based on DEMONSTRATED expertise from work history, not just keyword presence in skills list. A candidate who USES a tool as an end-user is very different from one who ARCHITECTS/DEVELOPS with it.
`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 2048,
    system: [
      {
        type: "text",
        text: FIT_SCORER_SYSTEM,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      { role: "user", content: userPrompt },
    ],
    temperature: 0.1,
  });

  const content = extractJson(response.content);
  if (!content) {
    throw new Error("No response from AI");
  }

  return JSON.parse(content) as FitScoreResult;
}
