import fs from "fs";
import path from "path";
import { getAnthropic, extractJson } from "./anthropic";
import { CV_PARSER_SYSTEM } from "./prompts";

export interface ParsedCvData {
  name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  currentRole: string | null;
  currentCompany: string | null;
  experienceYears: number;
  education: { degree: string; institution: string; year: string }[];
  skills: string[];
  experience: { role: string; company: string; duration: string; description: string }[];
  summary: string;
}

/**
 * Extract text from a PDF file using pdf-parse
 */
export async function extractTextFromPdf(filePath: string): Promise<string> {
  // pdf-parse v2 has bundling issues with Next.js webpack.
  // Use child_process to run extraction in a clean Node context.
  const { execSync } = require("child_process");
  const scriptPath = path.join(process.cwd(), "scripts", "extract-pdf.mjs");

  const result = execSync(
    `node "${scriptPath}" "${filePath}"`,
    { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024, timeout: 30000 }
  );
  return result;
}

/**
 * Extract text from a DOCX file using mammoth
 */
export async function extractTextFromDocx(filePath: string): Promise<string> {
  const mammoth = await import("mammoth");
  const buffer = fs.readFileSync(filePath);
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/**
 * Extract text from a CV file (PDF or DOCX)
 */
export async function extractCvText(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".pdf") {
    return extractTextFromPdf(filePath);
  } else if (ext === ".docx") {
    return extractTextFromDocx(filePath);
  }
  throw new Error(`Unsupported file type: ${ext}`);
}

/**
 * Parse CV text using Claude to extract structured data
 */
export async function parseCvText(cvText: string): Promise<ParsedCvData> {
  const anthropic = getAnthropic();

  // Use claude-sonnet for better accuracy on complex CVs, haiku for shorter ones
  const model = cvText.length > 5000 ? "claude-sonnet-4-5-20250929" : "claude-haiku-4-5-20251001";

  const response = await anthropic.messages.create({
    model,
    max_tokens: 8192,
    system: [
      {
        type: "text",
        text: CV_PARSER_SYSTEM,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      { role: "user", content: `Parse this CV:\n\n${cvText.substring(0, 12000)}` },
    ],
    temperature: 0.1,
  });

  const content = extractJson(response.content);
  if (!content) {
    throw new Error("No response from AI");
  }

  return JSON.parse(content) as ParsedCvData;
}

/**
 * Redact PII (phone & email only) from CV text
 */
export function redactPii(text: string): string {
  // Redact email addresses
  let redacted = text.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    "[EMAIL REDACTED]"
  );

  // Redact phone numbers (various formats)
  redacted = redacted.replace(
    /(\+?\d{1,4}[-.\s]?)?(\(?\d{2,5}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{3,5}/g,
    "[PHONE REDACTED]"
  );

  return redacted;
}

/**
 * Full CV processing pipeline:
 * 1. Extract text from file
 * 2. Parse with AI
 * 3. Generate redacted version
 */
export async function processCv(filePath: string): Promise<{
  originalText: string;
  redactedText: string;
  parsedData: ParsedCvData;
}> {
  const originalText = await extractCvText(filePath);
  const parsedData = await parseCvText(originalText);
  const redactedText = redactPii(originalText);

  return { originalText, redactedText, parsedData };
}
