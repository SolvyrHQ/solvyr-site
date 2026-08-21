import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const font = await fs.readFile(path.join(root, "assets/fonts/InterVariable.woff2"));
const fontData = font.toString("base64");

function cardSvg(headlineOne, headlineTwo, copyOne, copyTwo) {
  return Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <style>
    @font-face { font-family: Inter; src: url(data:font/woff2;base64,${fontData}) format("woff2"); font-weight: 100 900; }
    text { font-family: Inter, Arial, sans-serif; }
  </style>
  <rect width="1200" height="630" fill="#F7F9FC"/>
  <rect x="72" y="184" width="1056" height="374" rx="28" fill="#08101F"/>
  <rect x="72" y="184" width="10" height="374" rx="5" fill="#1473FF"/>
  <text x="112" y="285" fill="#FFFFFF" font-size="60" font-weight="720" letter-spacing="-2.4">
    <tspan x="112" dy="0">${headlineOne}</tspan>
    <tspan x="112" dy="72">${headlineTwo}</tspan>
  </text>
  <text x="112" y="447" fill="#B8C4DA" font-size="25" font-weight="430">
    <tspan x="112" dy="0">${copyOne}</tspan>
    <tspan x="112" dy="36">${copyTwo}</tspan>
  </text>
  <g transform="translate(874 489)">
    <circle cx="0" cy="0" r="7" fill="#1473FF"/>
    <circle cx="36" cy="0" r="7" fill="#3B5BFF"/>
    <circle cx="72" cy="0" r="7" fill="#5B3DFF"/>
    <path d="M10 0H26M46 0H62M82 0H116" stroke="#6F86B4" stroke-width="3" stroke-linecap="round"/>
    <circle cx="130" cy="0" r="10" fill="#FFFFFF"/>
  </g>
  <text x="1090" y="92" fill="#52617C" font-size="22" font-weight="600" text-anchor="end">solvyr.com</text>
</svg>`);
}

const logoPath = path.join(root, "assets/brand/solvyr-logo-hybrid.svg");
const cards = [
  {
    file: "solvyr-social-card.png",
    lines: [
      "Turn a document backlog into",
      "an AI-ready corpus.",
      "Accepted JSONL, chunks, embeddings, stable IDs",
      "and run evidence."
    ]
  },
  {
    file: "solvyr-social-card-nl.png",
    lines: [
      "Van documentachterstand naar",
      "een AI-klaar corpus.",
      "Geaccepteerde JSONL, chunks, embeddings, stabiele ID's",
      "en runbewijs."
    ]
  }
];

for (const card of cards) {
  const outputPath = path.join(root, "assets/brand", card.file);
  await sharp(cardSvg(...card.lines))
    .composite([{ input: logoPath, left: 72, top: 54 }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outputPath);
  console.log(`Generated ${path.relative(root, outputPath)} (1200x630)`);
}
