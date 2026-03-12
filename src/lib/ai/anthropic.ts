import Anthropic from "@anthropic-ai/sdk";

let anthropicInstance: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!anthropicInstance) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }
    anthropicInstance = new Anthropic({ apiKey });
  }
  return anthropicInstance;
}

/**
 * Helper to extract text from Claude's response content blocks
 */
export function extractText(content: Anthropic.ContentBlock[]): string {
  for (const block of content) {
    if (block.type === "text") {
      return block.text;
    }
  }
  return "";
}

/**
 * Extract JSON from Claude's response, stripping markdown code fences if present
 */
export function extractJson(content: Anthropic.ContentBlock[]): string {
  let text = extractText(content);
  // Strip ```json ... ``` or ``` ... ``` wrappers
  text = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
  return text;
}
