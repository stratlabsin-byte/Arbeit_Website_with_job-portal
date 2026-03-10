import { getOpenAI } from "./openai";
import { JOB_SCRAPER_SYSTEM } from "./prompts";

export interface ScrapedJob {
  title: string;
  description: string | null;
  location: string | null;
  department: string | null;
  workModel: string | null;
  jobType: string | null;
  experienceMin: number | null;
  experienceMax: number | null;
  skills: string[];
  url: string | null;
}

export interface ScrapeResult {
  jobs: ScrapedJob[];
  totalFound: number;
  companyName: string | null;
}

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
};

/**
 * Fetch content from a URL
 */
async function fetchUrl(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: BROWSER_HEADERS,
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

/**
 * Strip heavy HTML (scripts, styles, SVGs) to reduce token usage
 * but FIRST extract any JSON data source URLs from script tags
 */
function extractJsonUrls(html: string): string[] {
  const urls: string[] = [];

  // Match fetch("...json") or fetch('...json') patterns
  const fetchPattern = /fetch\s*\(\s*["']([^"']+\.json[^"']*)["']/gi;
  let match;
  while ((match = fetchPattern.exec(html)) !== null) {
    urls.push(match[1]);
  }

  // Match src="...json" or href="...json"
  const srcPattern = /(?:src|href|data-src|data-url)\s*=\s*["']([^"']+\.json[^"']*)["']/gi;
  while ((match = srcPattern.exec(html)) !== null) {
    urls.push(match[1]);
  }

  // Match variable assignments like: url = "...jobs..." or apiUrl: "..."
  const varPattern = /(?:url|api|endpoint|source|dataUrl|jsonUrl)\s*[:=]\s*["']([^"']*(?:job|career|position|opening|vacanc)[^"']*)["']/gi;
  while ((match = varPattern.exec(html)) !== null) {
    urls.push(match[1]);
  }

  return Array.from(new Set(urls));
}

/**
 * Strip heavy HTML to reduce token usage
 */
function cleanHtml(html: string): string {
  let cleaned = html;
  cleaned = cleaned.replace(/<script[\s\S]*?<\/script>/gi, "");
  cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, "");
  cleaned = cleaned.replace(/<svg[\s\S]*?<\/svg>/gi, "");
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, "");
  cleaned = cleaned.replace(/<noscript[\s\S]*?<\/noscript>/gi, "");
  cleaned = cleaned.replace(/\s+/g, " ");
  if (cleaned.length > 30000) {
    cleaned = cleaned.substring(0, 30000);
  }
  return cleaned.trim();
}

/**
 * Try to fetch and parse a JSON data source for jobs
 */
async function tryFetchJsonJobs(
  jsonUrl: string,
  baseUrl: string
): Promise<ScrapedJob[] | null> {
  try {
    // Resolve relative URL
    const fullUrl = jsonUrl.startsWith("http")
      ? jsonUrl
      : new URL(jsonUrl, baseUrl).toString();

    const text = await fetchUrl(fullUrl);
    const data = JSON.parse(text);

    // Could be an array of jobs directly, or an object with a jobs array
    const jobsArray = Array.isArray(data)
      ? data
      : data.jobs || data.positions || data.openings || data.results || data.data;

    if (!Array.isArray(jobsArray) || jobsArray.length === 0) return null;

    // Use AI to normalize the JSON into our ScrapedJob format
    const openai = getOpenAI();
    const jsonStr = JSON.stringify(jobsArray).substring(0, 30000);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: JOB_SCRAPER_SYSTEM },
        {
          role: "user",
          content: `Source URL: ${baseUrl}\n\nThis is raw JSON job data fetched from ${fullUrl}. Extract all job listings (only include jobs with status "active" or no status field — skip closed/inactive jobs):\n\n${jsonStr}`,
        },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;

    const result = JSON.parse(content) as ScrapeResult;
    return result.jobs || null;
  } catch {
    return null;
  }
}

/**
 * Use AI to extract job listings from page HTML
 */
export async function extractJobsFromHtml(
  html: string,
  sourceUrl: string
): Promise<ScrapeResult> {
  const openai = getOpenAI();
  const baseUrl = new URL(sourceUrl).origin;

  // Step 1: Check for JSON data sources in the HTML (for JS-rendered pages)
  const jsonUrls = extractJsonUrls(html);
  let jsonJobs: ScrapedJob[] | null = null;

  if (jsonUrls.length > 0) {
    // Try each JSON URL until we find jobs
    for (const jsonUrl of jsonUrls) {
      jsonJobs = await tryFetchJsonJobs(jsonUrl, baseUrl);
      if (jsonJobs && jsonJobs.length > 0) break;
    }
  }

  // If we found jobs from JSON, return them
  if (jsonJobs && jsonJobs.length > 0) {
    // Resolve relative URLs
    const resolvedJobs = jsonJobs.map((job) => {
      if (job.url && !job.url.startsWith("http")) {
        try {
          job.url = new URL(job.url, baseUrl).toString();
        } catch {}
      }
      return job;
    });

    return {
      jobs: resolvedJobs,
      totalFound: resolvedJobs.length,
      companyName: null,
    };
  }

  // Step 2: Fall back to extracting from HTML content
  const cleanedHtml = cleanHtml(html);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: JOB_SCRAPER_SYSTEM },
      {
        role: "user",
        content: `Source URL: ${sourceUrl}\n\nExtract all job listings from this page HTML:\n\n${cleanedHtml}`,
      },
    ],
    temperature: 0.1,
    response_format: { type: "json_object" },
    max_tokens: 4000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI");
  }

  const result = JSON.parse(content) as ScrapeResult;

  // Resolve relative URLs
  if (result.jobs) {
    result.jobs = result.jobs.map((job) => {
      if (job.url && !job.url.startsWith("http")) {
        try {
          job.url = new URL(job.url, baseUrl).toString();
        } catch {}
      }
      return job;
    });
  }

  return result;
}

/**
 * Fetch HTML content from a URL (exported for API use)
 */
export async function fetchPageHtml(url: string): Promise<string> {
  return fetchUrl(url);
}

/**
 * Full pipeline: fetch page → detect JSON sources → extract jobs with AI
 */
export async function scrapeJobsFromUrl(url: string): Promise<ScrapeResult> {
  const html = await fetchPageHtml(url);
  return extractJobsFromHtml(html, url);
}
