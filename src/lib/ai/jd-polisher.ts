import { getOpenAI } from "./openai";
import { JD_POLISHER_SYSTEM } from "./prompts";

/**
 * Polish a raw job description from a client into a professional, well-structured JD
 */
export async function polishJobDescription(
  rawJd: string,
  title: string,
  context?: { company?: string; location?: string; workModel?: string }
): Promise<string> {
  const openai = getOpenAI();

  let userPrompt = `Job Title: ${title}\n`;
  if (context?.company) userPrompt += `Company: ${context.company}\n`;
  if (context?.location) userPrompt += `Location: ${context.location}\n`;
  if (context?.workModel) userPrompt += `Work Model: ${context.workModel}\n`;
  userPrompt += `\nRaw Job Description:\n${rawJd}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: JD_POLISHER_SYSTEM },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI");
  }

  return content;
}
