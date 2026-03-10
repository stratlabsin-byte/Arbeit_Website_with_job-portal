import { getOpenAI } from "./openai";
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
    experience: { role: string; company: string; duration: string }[];
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
  const openai = getOpenAI();

  const reqSkills = requisition.requiredSkills
    ? JSON.parse(requisition.requiredSkills)
    : [];
  const prefSkills = requisition.preferredSkills
    ? JSON.parse(requisition.preferredSkills)
    : [];

  const userPrompt = `
Candidate Profile:
${JSON.stringify(parsedCvData, null, 2)}

Job Requisition:
- Title: ${requisition.title}
- Description: ${requisition.polishedJd || requisition.description || "N/A"}
- Required Skills: ${reqSkills.join(", ") || "Not specified"}
- Preferred Skills: ${prefSkills.join(", ") || "Not specified"}
- Experience Required: ${requisition.experienceMin}${requisition.experienceMax ? `-${requisition.experienceMax}` : "+"} years
- Work Model: ${requisition.workModel}
- Location: ${requisition.location || "Not specified"}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: FIT_SCORER_SYSTEM },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI");
  }

  return JSON.parse(content) as FitScoreResult;
}
