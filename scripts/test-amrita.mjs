import { PrismaClient } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';

const prisma = new PrismaClient();
const client = new Anthropic();

const CV_PARSER_SYSTEM = `You are an expert CV/resume parser. Extract structured information from the given CV text.

Return a JSON object with exactly these fields:
{
  "name": "Full name",
  "email": "Email address or null",
  "phone": "Phone number or null",
  "location": "City/Location or null",
  "currentRole": "Current or most recent job title or null",
  "currentCompany": "Current or most recent company or null",
  "experienceYears": number (estimated total years of experience),
  "education": [{"degree": "...", "institution": "...", "year": "..."}],
  "skills": ["skill1", "skill2", ...],
  "experience": [{"role": "...", "company": "...", "duration": "e.g. Jan 2020 - Present (4 years)", "description": "Detailed description of what the candidate did in this role — technologies used, responsibilities, achievements. Include ALL bullet points from the CV, do not summarize or truncate."}],
  "summary": "Brief 2-3 sentence professional summary"
}

IMPORTANT:
- For experienceYears: Calculate from work history start dates, not from what the candidate claims.
- Order experience entries from most recent to oldest.
Return ONLY valid JSON, no other text.`;

const FIT_SCORER_SYSTEM = `You are a senior technical recruiter with deep domain expertise. Your job is to evaluate how well a candidate fits a specific job requisition. You must be STRICT, PRECISE, and HONEST.

CRITICAL SCORING PRINCIPLES:
1. **Depth over keywords**: A candidate listing "Salesforce" as a skill but working as a Project Manager is NOT the same as a hands-on Salesforce Developer/Architect.
2. **Role-level alignment**: If the JD asks for a "Solution Architect", a developer or PM with some exposure to the technology does NOT score 80%+.
3. **Primary identity matters**: Judge the candidate by what they PRIMARILY do, not peripheral mentions.
4. **Hands-on vs management**: If the JD requires hands-on technical work, a program manager should score LOW on role relevance.
5. **Certifications without depth**: Certifications help but do NOT override lack of hands-on experience.

SCORING RUBRIC:
- 90-100: Near-perfect match.
- 75-89: Strong match. Most key requirements met with demonstrated depth.
- 60-74: Moderate match. Relevant experience but noticeable gaps.
- 40-59: Partial match. Significant gaps in core requirements.
- 20-39: Weak match. Peripheral exposure.
- 0-19: Poor match. Different domain entirely.

Return a JSON object:
{
  "score": number (0-100),
  "breakdown": { "skillsMatch": number, "experienceMatch": number, "roleRelevance": number, "overallProfile": number },
  "matchedSkills": [], "missingSkills": [], "summary": "..."
}
Return ONLY valid JSON, no other text.`;

function extractJsonText(content) {
  let text = content[0]?.text || '';
  text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
  return text;
}

async function main() {
  const cr = await prisma.candidateRequisition.findFirst({
    where: { candidate: { name: { contains: 'Amrita' } } },
    include: {
      candidate: { include: { cvVersions: { where: { isActive: true }, take: 1 } } },
      requisition: true,
    },
  });

  if (!cr) { console.log('Not found'); return; }

  const cv = cr.candidate.cvVersions[0];
  console.log('Candidate:', cr.candidate.name);
  console.log('CV text length:', cv.cvTextOriginal?.length || 0);

  // Re-parse with higher max_tokens
  console.log('\nRe-parsing with max_tokens=8192...');
  const parseRes = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 8192,
    system: CV_PARSER_SYSTEM,
    messages: [{ role: 'user', content: `Parse this CV:\n\n${cv.cvTextOriginal.substring(0, 30000)}` }],
    temperature: 0.1,
  });

  console.log('Parse stop_reason:', parseRes.stop_reason);
  console.log('Parse output tokens:', parseRes.usage?.output_tokens);

  const parsed = JSON.parse(extractJsonText(parseRes.content));
  console.log('Experience years:', parsed.experienceYears);
  console.log('Current role:', parsed.currentRole);
  console.log('Skills:', parsed.skills?.length, 'items');
  console.log('Experience entries:', parsed.experience?.length);

  // Score
  const reqSkills = cr.requisition.requiredSkills ? JSON.parse(cr.requisition.requiredSkills) : [];
  const candidateSummary = [
    `Current Role: ${parsed.currentRole || 'Unknown'} at ${parsed.currentCompany || 'Unknown'}`,
    `Total Experience: ${parsed.experienceYears} years`,
    `Summary: ${parsed.summary || 'N/A'}`,
    `Skills: ${(parsed.skills || []).join(', ')}`,
    '',
    'WORK HISTORY:',
    ...(parsed.experience || []).map((exp, i) =>
      `${i + 1}. ${exp.role} at ${exp.company} (${exp.duration})${exp.description ? '\n   ' + exp.description : ''}`
    ),
    '',
    'EDUCATION:',
    ...(parsed.education || []).map(edu => `- ${edu.degree} from ${edu.institution}`),
  ].join('\n');

  const jdText = cr.requisition.polishedJd || cr.requisition.description || '';
  const cleanJd = jdText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  console.log('\nScoring...');
  const scoreRes = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2048,
    system: FIT_SCORER_SYSTEM,
    messages: [{
      role: 'user',
      content: `=== CANDIDATE ===\n${candidateSummary}\n\n=== JOB ===\nTitle: ${cr.requisition.title}\nRequired: ${reqSkills.join(', ')}\nExperience: ${cr.requisition.experienceMin}+ years\n\nFull JD:\n${cleanJd.substring(0, 4000)}\n\nScore based on DEMONSTRATED expertise.`,
    }],
    temperature: 0.1,
  });

  const score = JSON.parse(extractJsonText(scoreRes.content));
  console.log('\nSCORE:', score.score, '(expected ~90)');
  console.log('Breakdown:', JSON.stringify(score.breakdown));
  console.log('Summary:', score.summary);

  await prisma.$disconnect();
}

main().catch(e => console.error('ERROR:', e.message, e.stack));
