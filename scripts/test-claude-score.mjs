import { PrismaClient } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';

const prisma = new PrismaClient();
const client = new Anthropic();

async function test() {
  // Get Amrita Singh's data
  const cr = await prisma.candidateRequisition.findFirst({
    where: { candidate: { name: { contains: 'Amrita' } } },
    include: {
      candidate: { include: { cvVersions: { where: { isActive: true }, take: 1 } } },
      requisition: true,
    },
  });

  if (!cr) {
    console.log('Amrita not found');
    return;
  }

  const cv = cr.candidate.cvVersions[0];
  console.log('Candidate:', cr.candidate.name);
  console.log('Has parsedData:', cv && cv.parsedData ? 'YES' : 'NO');
  console.log('Current DB score:', cr.fitScore);
  console.log('Requisition:', cr.requisition.title);

  if (!cv || !cv.parsedData) {
    console.log('No parsed CV data - cannot score');
    return;
  }

  const parsed = JSON.parse(cv.parsedData);
  console.log('\nParsed CV data:');
  console.log('  Skills:', (parsed.skills || []).slice(0, 8).join(', '));
  console.log('  Experience years:', parsed.experienceYears);
  console.log('  Current role:', parsed.currentRole);
  console.log('  Experience entries:', (parsed.experience || []).length);

  // Build candidate summary (same as fit-scorer.ts)
  const candidateSummary = [
    `Current Role: ${parsed.currentRole || 'Unknown'} at ${parsed.currentCompany || 'Unknown'}`,
    `Total Experience: ${parsed.experienceYears} years`,
    `Summary: ${parsed.summary || 'N/A'}`,
    `Skills: ${(parsed.skills || []).join(', ')}`,
    '',
    'WORK HISTORY:',
    ...(parsed.experience || []).map((exp, i) =>
      `${i + 1}. ${exp.role} at ${exp.company} (${exp.duration})${exp.description ? '\n   ' + exp.description.substring(0, 200) : ''}`
    ),
  ].join('\n');

  const reqSkills = cr.requisition.requiredSkills ? JSON.parse(cr.requisition.requiredSkills) : [];

  const jdText = cr.requisition.polishedJd || cr.requisition.description || 'N/A';
  const cleanJd = jdText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  const userPrompt = `
=== CANDIDATE PROFILE ===
${candidateSummary}

=== JOB REQUISITION ===
Title: ${cr.requisition.title}
Experience Required: ${cr.requisition.experienceMin}+ years
Required Skills: ${reqSkills.join(', ') || 'Not specified'}

Full JD:
${cleanJd.substring(0, 2000)}

Score based on DEMONSTRATED expertise from work history, not just keywords.
`;

  console.log('\nCalling Claude Sonnet for fit score...');

  const SYSTEM = `You are a senior technical recruiter. Score this candidate 0-100 for the job.
Return ONLY valid JSON: {"score": number, "breakdown": {"skillsMatch": number, "experienceMatch": number, "roleRelevance": number, "overallProfile": number}, "matchedSkills": [], "missingSkills": [], "summary": "..."}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2048,
    system: SYSTEM,
    messages: [{ role: 'user', content: userPrompt }],
    temperature: 0.1,
  });

  let text = response.content[0].text;
  // Strip code fences
  text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();

  console.log('\nRaw response (first 100 chars):', text.substring(0, 100));

  const result = JSON.parse(text);
  console.log('\n=== RESULT ===');
  console.log('NEW SCORE:', result.score);
  console.log('Breakdown:', JSON.stringify(result.breakdown));
  console.log('Matched:', result.matchedSkills?.join(', '));
  console.log('Missing:', result.missingSkills?.join(', '));
  console.log('Summary:', result.summary);

  await prisma.$disconnect();
}

test().catch(e => {
  console.error('ERROR:', e.message);
  console.error(e.stack);
});
