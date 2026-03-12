import { getAnthropic, extractText } from "./anthropic";
import { JD_POLISHER_SYSTEM } from "./prompts";

/**
 * Polish a raw job description from a client into a professional, well-structured JD
 */
export async function polishJobDescription(
  rawJd: string,
  title: string,
  context?: { company?: string; location?: string; workModel?: string }
): Promise<string> {
  const anthropic = getAnthropic();

  let userPrompt = `Job Title: ${title}\n`;
  if (context?.company) userPrompt += `Company: ${context.company}\n`;
  if (context?.location) userPrompt += `Location: ${context.location}\n`;
  if (context?.workModel) userPrompt += `Work Model: ${context.workModel}\n`;
  userPrompt += `\nRaw Job Description:\n${rawJd}`;

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    system: JD_POLISHER_SYSTEM,
    messages: [
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
  });

  let content = extractText(response.content);
  if (!content) {
    throw new Error("No response from AI");
  }

  // Strip markdown code fences (```html ... ```) that the AI sometimes adds
  content = content.replace(/^```(?:html)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

  return content;
}
