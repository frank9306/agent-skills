#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const argv = process.argv.slice(2);
const json = argv.includes("--json");
const positional = argv.filter((value) => !value.startsWith("--"));
const root = path.resolve(positional[0] || process.cwd());
const verifierFile = path.resolve(fileURLToPath(import.meta.url));
const ignoredDirectories = new Set([
  ".git", ".next", ".nuxt", ".svelte-kit", "build", "coverage", "dist",
  "node_modules", "out", "target", "vendor",
]);
const sourceExtensions = new Set([
  ".astro", ".css", ".html", ".htm", ".js", ".jsx", ".mjs", ".mdx", ".scss",
  ".svelte", ".ts", ".tsx", ".vue",
]);

const findings = [];

function add(severity, rule, file, line, message, classification = "inferred") {
  findings.push({
    severity,
    rule,
    classification,
    file: path.relative(root, file).replaceAll("\\", "/"),
    line,
    message,
  });
}

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isSymbolicLink()) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) files.push(...await walk(fullPath));
    } else if (sourceExtensions.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }
  return files;
}

function scanLine(file, line, lineNumber) {
  if (/transition\s*:\s*all(?:\s|;|$)/i.test(line)) {
    add("warning", "motion.transition-all", file, lineNumber, "Review transition: all; list the intended properties explicitly.");
  }
  if (/background-clip\s*:\s*text|-webkit-background-clip\s*:\s*text/i.test(line)) {
    add("warning", "aesthetic.gradient-text", file, lineNumber, "Confirm that gradient-clipped text is an intentional product decision.");
  }
  if (/outline\s*:\s*(?:0|none)\b/i.test(line) && !/focus/i.test(line)) {
    add("warning", "accessibility.outline-removed", file, lineNumber, "Confirm an equivalent visible focus treatment exists.");
  }
  if (/<img\b(?![^>]*\balt\s*=)[^>]*>/i.test(line)) {
    add("warning", "accessibility.image-alt", file, lineNumber, "Image markup appears to lack an alt attribute; confirm whether it is meaningful or decorative.");
  }
  if (/<(?:div|span)\b[^>]*\bonClick\s*=/i.test(line) && !/\b(?:role|tabIndex)\s*=/i.test(line)) {
    add("warning", "accessibility.nonsemantic-click", file, lineNumber, "Clickable div/span appears to lack keyboard semantics; prefer a native button or link.");
  }
  if (/animate-(?:bounce|pulse|spin)\b/.test(line)) {
    add("notice", "motion.repeated-utility", file, lineNumber, "Confirm repeated utility animation fits task frequency and reduced-motion behavior.");
  }
  if (/bg-gradient-to-|from-(?:indigo|violet|purple)-\d+.*to-(?:cyan|blue|violet|purple)-\d+/i.test(line)) {
    add("notice", "aesthetic.default-gradient", file, lineNumber, "Review whether this gradient comes from the product design system rather than a generic default.");
  }
}

async function inspectDesignContract() {
  const designFile = path.join(root, "DESIGN.md");
  try {
    const content = await fs.readFile(designFile, "utf8");
    if (!content.trim()) add("warning", "design-contract.empty", designFile, 1, "DESIGN.md is empty; inspect project authorities and record the gap.");
  } catch (error) {
    if (error.code === "ENOENT") {
      add("warning", "design-contract.absent", designFile, 1, "DESIGN.md is absent; inspect existing UI evidence and record the missing authority. Read-only audits may continue.");
      return;
    }
    throw error;
  }
}

try {
  const stat = await fs.stat(root);
  if (!stat.isDirectory()) throw new Error(`Not a directory: ${root}`);
  await inspectDesignContract();
  const files = await walk(root);
  const inspectedFiles = [];
  for (const file of files) {
    const content = await fs.readFile(file, "utf8");
    if (path.resolve(file) === verifierFile || content.includes("frontend-design-scan-ignore-file")) continue;
    inspectedFiles.push({ file, content });
    content.split(/\r?\n/).forEach((line, index) => scanLine(file, line, index + 1));
  }

  const result = {
    root,
    filesScanned: inspectedFiles.length,
    counts: {
      error: findings.filter((item) => item.severity === "error").length,
      warning: findings.filter((item) => item.severity === "warning").length,
      notice: findings.filter((item) => item.severity === "notice").length,
    },
    findings,
    note: "Static findings are inferred review leads. Confirm them against project conventions and rendered browser evidence.",
  };

  if (json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    console.log(`Frontend design scan: ${inspectedFiles.length} source files`);
    for (const item of findings) {
      console.log(`${item.severity.toUpperCase()} ${item.rule} ${item.file}:${item.line} ${item.message}`);
    }
    console.log(`${result.counts.error} error(s), ${result.counts.warning} warning(s), ${result.counts.notice} notice(s).`);
    console.log(result.note);
  }
  if (result.counts.error > 0) process.exitCode = 1;
} catch (error) {
  const failure = { error: error.message, root };
  if (json) process.stdout.write(`${JSON.stringify(failure, null, 2)}\n`);
  else console.error(`verify-design: ${error.message}`);
  process.exitCode = 2;
}
