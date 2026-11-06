import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const excludedDirectories = new Set([".git", ".site-dist", "docs", "measure", "scripts", "v2"]);
const publicTextExtensions = new Set([".html", ".json", ".md", ".txt", ".yaml"]);
const founderPortraitFiles = ["jan-wouter-van-dalen.png", "maksym-wezdecki.png"];
const forbiddenExternalNames = [
  { name: "Promentum", pattern: /\bpromentum\b/i },
  { name: "Uniconta", pattern: /\buniconta\b/i },
];

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (excludedDirectories.has(entry.name)) return [];
      return walk(path);
    }
    return entry.isFile() && publicTextExtensions.has(extname(entry.name)) ? [path] : [];
  });
}

const failures = [];
const requiredAssets = [
  "assets/brand/solvyr-icon-hybrid-256.png",
  "assets/fonts/InterVariable.woff2",
  "assets/fonts/Inter-OFL.txt",
  "favicon.ico",
];

for (const asset of requiredAssets) {
  if (!existsSync(join(repoRoot, asset))) failures.push(`missing settled production asset: ${asset}`);
}

const homepageExpectations = {
  "index.html": {
    promise: "AI document processing.",
    descriptor: "AI document processing",
    testCta: "Discuss a document test",
  },
  "nl.html": {
    promise: "AI-documentverwerking.",
    descriptor: "AI-documentverwerking",
    testCta: "Bespreek een documenttest",
  },
};

for (const [homepage, expected] of Object.entries(homepageExpectations)) {
  const source = readFileSync(join(repoRoot, homepage), "utf8");
  const main = source.match(/<main\b[\s\S]*?<\/main>/i)?.[0] || "";
  const sectionCount = [...main.matchAll(/<section\b/gi)].length;
  if (sectionCount !== 5) {
    failures.push(`${homepage}: corporate homepage must keep the five-section document-test path; found ${sectionCount}`);
  }
  if (!source.includes(expected.promise)) {
    failures.push(`${homepage}: adopted corporate promise is missing or has drifted`);
  }
  if (!source.includes(`<div class="tag">${expected.descriptor}</div>`)) {
    failures.push(`${homepage}: adopted corporate header descriptor is missing or has drifted`);
  }
  if (!source.includes(expected.testCta)) {
    failures.push(`${homepage}: the document-test invitation is missing`);
  }
  if (/class="computeMap"/.test(main)) {
    failures.push(`${homepage}: capacity-source diagram must stay out of the document-first homepage`);
  }
  if (/intent=organizational-gpu-pool/.test(source)) {
    failures.push(`${homepage}: capacity acquisition must not be the homepage CTA`);
  }
}

const agentPacket = JSON.parse(readFileSync(join(repoRoot, "ai/fast-corpus.json"), "utf8"));
if (agentPacket.header_tagline !== "AI document processing" || agentPacket.header_tagline_nl !== "AI-documentverwerking") {
  failures.push("ai/fast-corpus.json: header descriptors must match the fixed English and Dutch site-wide wording");
}
if (agentPacket.company_positioning?.category !== "AI execution layer for bounded asynchronous work") {
  failures.push("ai/fast-corpus.json: company context must describe the company-level AI execution layer");
}
if (agentPacket.company_positioning?.promise !== "AI document processing. Clarity on quality and cost.") {
  failures.push("ai/fast-corpus.json: adopted company promise is missing or has drifted");
}
if (!agentPacket.company_positioning?.capacity_principle?.startsWith("Workload demand comes before capacity expansion")) {
  failures.push("ai/fast-corpus.json: demand-led capacity principle is missing or has drifted");
}
if (agentPacket.category !== "Managed B2B document-to-corpus processing service") {
  failures.push("ai/fast-corpus.json: route category must classify Fast Corpus as the managed corpus service");
}
if (!agentPacket.direct_answers?.what_is_solvyr?.includes("supported AI result layer")) {
  failures.push("ai/fast-corpus.json: what_is_solvyr must describe the company-level supported result layer");
}

const agentBrief = readFileSync(join(repoRoot, "ai/fast-corpus.md"), "utf8");
if (!agentBrief.includes("Solvyr is an AI execution layer and supported result layer")) {
  failures.push("ai/fast-corpus.md: company classification is missing or has drifted");
}
if (!agentBrief.includes("Solvyr Fast Corpus is the managed B2B")) {
  failures.push("ai/fast-corpus.md: Fast Corpus product classification is missing or has drifted");
}

const capabilities = readFileSync(join(repoRoot, "capabilities.yaml"), "utf8");
if (!capabilities.includes("category: AI execution layer for bounded asynchronous work")) {
  failures.push("capabilities.yaml: company category is missing or has drifted");
}
if (!capabilities.includes("header_tagline: AI document processing")) {
  failures.push("capabilities.yaml: adopted corporate descriptor is missing or has drifted");
}
if (!capabilities.includes("header_tagline_nl: AI-documentverwerking")) {
  failures.push("capabilities.yaml: fixed Dutch header descriptor is missing or has drifted");
}
if (!capabilities.includes("what_is_fast_corpus: The managed document-to-corpus route")) {
  failures.push("capabilities.yaml: Fast Corpus route classification is missing or has drifted");
}

const styles = readFileSync(join(repoRoot, "styles.css"), "utf8");
if (!styles.includes('url("/assets/fonts/InterVariable.woff2")')) {
  failures.push("styles.css: Inter must use the self-hosted variable font");
}

for (const file of walk(repoRoot)) {
  const relPath = relative(repoRoot, file);
  const source = readFileSync(file, "utf8");

  for (const forbidden of forbiddenExternalNames) {
    if (forbidden.pattern.test(source)) {
      failures.push(`${relPath}: contains internal route name ${forbidden.name}; keep the partner and ERP platform anonymous`);
    }
  }

  if (/sales@solvyr\.com/i.test(source)) {
    failures.push(`${relPath}: contains retired public contact sales@solvyr.com`);
  }
  if (/privacy@solvyr\.com/i.test(source)) {
    failures.push(`${relPath}: contains retired public contact privacy@solvyr.com`);
  }

  for (const portrait of founderPortraitFiles) {
    if (source.includes(portrait)) {
      failures.push(`${relPath}: references production-excluded founder portrait ${portrait}`);
    }
  }

  if (!file.endsWith(".html")) continue;

  if (source.includes("assets/brand/icon.png")) {
    failures.push(`${relPath}: references the retired generic brand icon`);
  }

  // Standalone download-bundle viewers must also work after unzipping, where
  // root-relative site assets are unavailable.
  if (!relPath.startsWith("downloads/")) {
    const header = source.match(/<header\b[\s\S]*?<\/header>/i)?.[0] || "";
    const descriptor = /<html\b[^>]*\blang="nl(?:-[^"]*)?"/i.test(source)
      ? "AI-documentverwerking"
      : "AI document processing";
    const tags = [...header.matchAll(/<div\b[^>]*\bclass="[^"]*\btag\b[^"]*"[^>]*>([\s\S]*?)<\/div>/gi)];
    if (tags.length !== 1 || tags[0][1].trim() !== descriptor) {
      failures.push(`${relPath}: header must use the fixed descriptor "${descriptor}" exactly once; page-specific taglines are not allowed`);
    }
    if (!source.includes('href="/favicon.ico')) {
      failures.push(`${relPath}: page head does not use the approved favicon`);
    }
    if (!source.includes('href="/assets/brand/solvyr-icon-hybrid-256.png')) {
      failures.push(`${relPath}: page head does not use the approved compact touch icon`);
    }
  }

  const withoutProtectedEmails = source.replace(
    /<!--email_off-->[\s\S]*?<!--\/email_off-->/gi,
    ""
  );
  if (/href="mailto:hello@solvyr\.com/i.test(withoutProtectedEmails)) {
    failures.push(`${relPath}: public contact link is exposed to Cloudflare email-link rewriting`);
  }

  for (const match of source.matchAll(/<a\b([^>]*\bhref="https:\/\/[^\"]*linkedin\.com\/[^\"]+"[^>]*)>/gi)) {
    const attributes = match[1];
    const rel = attributes.match(/\brel="([^"]*)"/i)?.[1].toLowerCase().split(/\s+/) || [];
    if (!/\btarget="_blank"/i.test(attributes)) {
      failures.push(`${relPath}: LinkedIn link must open in a new tab`);
    }
    if (!rel.includes("noopener") || !rel.includes("noreferrer")) {
      failures.push(`${relPath}: LinkedIn link must use rel="noopener noreferrer"`);
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Settled production preferences are consistent.");
