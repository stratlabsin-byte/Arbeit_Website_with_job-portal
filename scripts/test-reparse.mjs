import { PrismaClient } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';

const prisma = new PrismaClient();
const client = new Anthropic();

async function test() {
  // Get Amrita's CV version
  const cr = await prisma.candidateRequisition.findFirst({
    where: { candidate: { name: { contains: 'Amrita' } } },
    include: {
      candidate: { include: { cvVersions: { where: { isActive: true }, take: 1 } } },
    },
  });

  if (!cr) { console.log('Not found'); return; }

  const cv = cr.candidate.cvVersions[0];
  if (!cv) { console.log('No CV version'); return; }

  console.log('CV Version ID:', cv.id);
  console.log('File URL:', cv.fileUrl);
  console.log('Has original text:', cv.cvTextOriginal ? 'YES (' + cv.cvTextOriginal.length + ' chars)' : 'NO');

  // Check if the CV text exists
  if (!cv.cvTextOriginal) {
    console.log('No CV text stored - would need to re-extract from file');
    return;
  }

  const cvText = cv.cvTextOriginal;
  console.log('\nCV text length:', cvText.length);
  console.log('First 200 chars:', cvText.substring(0, 200));

  // Re-parse with Claude
  console.log('\nRe-parsing with Claude Sonnet...');

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
  "experience": [{"role": "...", "company": "...", "duration": "e.g. Jan 2020 - Present (4 years)", "description": "Detailed description"}],
  "summary": "Brief 2-3 sentence professional summary"
}

IMPORTANT:
- For experienceYears: Calculate from work history start dates, not from what the candidate claims.
- Order experience entries from most recent to oldest.
Return ONLY valid JSON, no other text.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    system: CV_PARSER_SYSTEM,
    messages: [
      { role: 'user', content: `Parse this CV:\n\n${cvText.substring(0, 30000)}` },
    ],
    temperature: 0.1,
  });

  let text = response.content[0].text;
  text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();

  const parsed = JSON.parse(text);
  console.log('\n=== RE-PARSED RESULT ===');
  console.log('Name:', parsed.name);
  console.log('Experience years:', parsed.experienceYears);
  console.log('Current role:', parsed.currentRole);
  console.log('Skills count:', parsed.skills?.length);
  console.log('Experience entries:', parsed.experience?.length);
  console.log('Summary:', parsed.summary);

  await prisma.$disconnect();
}

test().catch(e => {
  console.error('ERROR:', e.message);
});
