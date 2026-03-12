import { PrismaClient } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';

const prisma = new PrismaClient();
const client = new Anthropic();

// Extract prompts from the actual source file so we test what ships
const promptsFile = readFileSync('./src/lib/ai/prompts.ts', 'utf-8');

function extractPrompt(name) {
  const re = new RegExp(`export const ${name} = \`([\\s\\S]*?)\`;`);
  const m = promptsFile.match(re);
  if (!m) throw new Error(`Could not extract ${name}`);
  return m[1];
}

const FIT_SCORER_SYSTEM = extractPrompt('FIT_SCORER_SYSTEM');
const CV_PARSER_SYSTEM = extractPrompt('CV_PARSER_SYSTEM');

// User's expected scores
const EXPECTED = {
  'amrita': 90, 'nishant': 78, 'arvind': 65, 'vijay': 55,
  'bhawesh': 50, 'deepesh': 40, 'manish': 38, 'ankit': 25,
  'saurabh': 10, 'pooja': 5,
};

function extractJsonText(content) {
  let text = content[0]?.text || '';
  text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
  return text;
}

async function reparseCV(cvText) {
  const model = cvText.length > 5000 ? 'claude-sonnet-4-5-20250929' : 'claude-haiku-4-5-20251001';
  const response = await client.messages.create({
    model, max_tokens: 8192, system: CV_PARSER_SYSTEM,
    messages: [{ role: 'user', content: `Parse this CV:\n\n${cvText.substring(0, 30000)}` }],
    temperature: 0.1,
  });
  return JSON.parse(extractJsonText(response.content));
}

async function scoreCandidate(parsedData, requisition) {
  const reqSkills = requisition.requiredSkills ? JSON.parse(requisition.requiredSkills) : [];
  const prefSkills = requisition.preferredSkills ? JSON.parse(requisition.preferredSkills) : [];

  const candidateSummary = [
    `Current Role: ${parsedData.currentRole || 'Unknown'} at ${parsedData.currentCompany || 'Unknown'}`,
    `Total Experience: ${parsedData.experienceYears} years`,
    `Summary: ${parsedData.summary || 'N/A'}`,
    `Skills: ${(parsedData.skills || []).join(', ')}`,
    '',
    'WORK HISTORY (read carefully to assess actual depth of expertise):',
    ...(parsedData.experience || []).map((exp, i) =>
      `${i + 1}. ${exp.role} at ${exp.company} (${exp.duration})${exp.description ? '\n   ' + exp.description : ''}`
    ),
    '',
    'EDUCATION:',
    ...(parsedData.education || []).map(edu => `- ${edu.degree} from ${edu.institution}`),
  ].join('\n');

  const jdText = requisition.polishedJd || requisition.description || 'N/A';
  const cleanJd = jdText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  const userPrompt = `
=== CANDIDATE PROFILE ===
${candidateSummary}

=== JOB REQUISITION ===
Title: ${requisition.title}
Experience Required: ${requisition.experienceMin}${requisition.experienceMax ? `-${requisition.experienceMax}` : '+'} years
Required Skills: ${reqSkills.join(', ') || 'Not specified'}
Preferred Skills: ${prefSkills.join(', ') || 'Not specified'}
Work Model: ${requisition.workModel}
Location: ${requisition.location || 'Not specified'}

Full Job Description:
${cleanJd.substring(0, 4000)}

IMPORTANT: Score based on DEMONSTRATED expertise from work history, not just keyword presence in skills list. A candidate who USES a tool as an end-user is very different from one who ARCHITECTS/DEVELOPS with it.
`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929', max_tokens: 2048, system: FIT_SCORER_SYSTEM,
    messages: [{ role: 'user', content: userPrompt }],
    temperature: 0.1,
  });
  return JSON.parse(extractJsonText(response.content));
}

async function main() {
  const reqId = 'cmmktfav300083skayowe0l55';
  const requisition = await prisma.jobRequisition.findUnique({ where: { id: reqId } });
  if (!requisition) { console.log('Requisition not found'); return; }

  console.log('Job:', requisition.title);
  console.log('='.repeat(80));

  const crs = await prisma.candidateRequisition.findMany({
    where: { requisitionId: reqId },
    include: { candidate: { include: { cvVersions: { where: { isActive: true }, take: 1 } } } },
  });

  // Deduplicate by candidate name
  const seen = new Set();
  const uniqueCrs = crs.filter(cr => {
    const name = cr.candidate.name.toLowerCase().trim();
    if (seen.has(name)) return false;
    seen.add(name);
    return true;
  });

  console.log(`Found ${uniqueCrs.length} unique candidates\n`);
  const results = [];

  for (const cr of uniqueCrs) {
    const name = cr.candidate.name;
    const cv = cr.candidate.cvVersions[0];
    console.log(`--- ${name} ---`);

    if (!cv || !cv.cvTextOriginal) {
      console.log('  SKIP: No CV text\n');
      continue;
    }

    // Re-parse
    console.log('  Re-parsing...');
    let parsed;
    try {
      parsed = await reparseCV(cv.cvTextOriginal);
      console.log(`  ${parsed.experienceYears} yrs | ${parsed.currentRole} | ${(parsed.skills || []).length} skills`);
    } catch (e) {
      console.log(`  PARSE ERROR: ${e.message}\n`);
      continue;
    }

    // Score
    console.log('  Scoring...');
    let score;
    try {
      score = await scoreCandidate(parsed, requisition);
    } catch (e) {
      console.log(`  SCORE ERROR: ${e.message}\n`);
      continue;
    }

    const nameKey = Object.keys(EXPECTED).find(k => name.toLowerCase().includes(k));
    const expected = nameKey ? EXPECTED[nameKey] : '?';

    results.push({ name, oldScore: cr.fitScore, newScore: score.score, expected,
      diff: typeof expected === 'number' ? score.score - expected : '?' });

    console.log(`  SCORE: ${score.score}% (expected ${expected}%) | skills=${score.breakdown.skillsMatch} role=${score.breakdown.roleRelevance} exp=${score.breakdown.experienceMatch} overall=${score.breakdown.overallProfile}`);
    console.log(`  ${score.summary.substring(0, 120)}...\n`);
  }

  // Summary table
  console.log('='.repeat(80));
  console.log('FINAL COMPARISON (sorted by new score)');
  console.log('='.repeat(80));
  console.log('Name'.padEnd(25) + 'Old'.padEnd(7) + 'New'.padEnd(7) + 'Expected'.padEnd(10) + 'Diff');
  console.log('-'.repeat(59));

  results.sort((a, b) => b.newScore - a.newScore);
  for (const r of results) {
    const diffStr = typeof r.diff === 'number' ? (r.diff >= 0 ? `+${r.diff}` : `${r.diff}`) : '?';
    console.log(
      r.name.substring(0, 24).padEnd(25) +
      `${r.oldScore}%`.padEnd(7) +
      `${r.newScore}%`.padEnd(7) +
      `${r.expected}%`.padEnd(10) +
      diffStr
    );
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error('FATAL:', e.message); });
