#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFile, mkdir, mkdtemp, readFile, readdir, rm, stat, utimes } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const runDir = path.resolve(
  process.env.SOLVYR_GITIGNORE_SAMPLE_RUN
    ?? path.join(root, "..", "..", "Solvyr Testing", "fast_corpus_gitignore_public_sample_2026-08-24"),
);
const bundleName = "solvyr-fast-corpus-gitignore-sample-2026-08-24";
const output = path.join(root, "downloads", "fast-corpus-gitignore-sample");
const archive = path.join(root, "downloads", `${bundleName}.zip`);
const temporaryParent = await mkdtemp(path.join(os.tmpdir(), "solvyr-gitignore-public-sample-"));
const bundleTimestamp = new Date("2026-08-24T00:00:00Z");

const sha256 = (data) => createHash("sha256").update(data).digest("hex");

async function copyTree(source, destination) {
  const sourceStat = await stat(source);
  if (sourceStat.isDirectory()) {
    await mkdir(destination, { recursive: true });
    for (const entry of (await readdir(source)).sort()) {
      await copyTree(path.join(source, entry), path.join(destination, entry));
    }
    return;
  }
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(source, destination);
}

async function normalizeTreeTimes(target) {
  const targetStat = await stat(target);
  if (targetStat.isDirectory()) {
    for (const entry of (await readdir(target)).sort()) {
      await normalizeTreeTimes(path.join(target, entry));
    }
  }
  await utimes(target, bundleTimestamp, bundleTimestamp);
}

try {
  execFileSync(process.execPath, [
    path.join(root, "scripts", "build-gitignore-public-sample.mjs"),
    runDir,
    temporaryParent,
  ], { stdio: "inherit" });

  const builtBundle = path.join(temporaryParent, bundleName);
  const checksumText = await readFile(path.join(builtBundle, "evidence", "SHA256SUMS"), "utf8");
  for (const line of checksumText.trim().split("\n")) {
    const match = line.match(/^([a-f0-9]{64})\s+(.+)$/);
    if (!match) throw new Error(`Invalid checksum line: ${line}`);
    const [, expected, relative] = match;
    const actual = sha256(await readFile(path.join(builtBundle, relative)));
    if (actual !== expected) throw new Error(`Checksum mismatch before publication: ${relative}`);
  }

  await normalizeTreeTimes(builtBundle);
  await rm(output, { recursive: true, force: true });
  await rm(archive, { force: true });
  await copyTree(builtBundle, output);
  execFileSync("zip", ["-X", "-q", "-r", archive, bundleName], { cwd: temporaryParent });
  execFileSync("unzip", ["-tq", archive], { stdio: "inherit" });

  console.log(`Built verified public sample in ${path.relative(root, output)}/`);
  console.log(`Built ${path.relative(root, archive)} (${sha256(await readFile(archive))})`);
} finally {
  await rm(temporaryParent, { recursive: true, force: true });
}
