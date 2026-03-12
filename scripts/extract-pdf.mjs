// Standalone script to extract text from PDF using pdf-parse v2
// Run outside of Next.js webpack bundler to avoid CJS compatibility issues
import { readFileSync } from "fs";
import { PDFParse } from "pdf-parse";

const filePath = process.argv[2];
if (!filePath) {
  process.stderr.write("Usage: node extract-pdf.mjs <file-path>\n");
  process.exit(1);
}

const buffer = readFileSync(filePath);
const parser = new PDFParse({ data: buffer });
const result = await parser.getText();
process.stdout.write(result.text || "");
