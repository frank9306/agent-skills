#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const json = argv.includes("--json");
const positional = argv.filter((value) => !value.startsWith("--"));
const root = path.resolve(positional[0] || process.cwd());
const ignoredDirectories = new Set([
  ".git", ".next", ".nuxt", ".svelte-kit", "build", "coverage", "dist",
  "node_modules", "out", "target", "vendor",
]);
const sourceExtensions = new Set([
  ".astro", ".css", ".html", ".htm", ".jsx", ".mdx", ".scss", ".svelte",
  ".tsx", ".vue",
]);

const findings = [];

function add(severity, rule, file, line, message) {
  findings.push({ severity, rule, file: path.relative(root, file).replaceAll("\\", "/"), line, message });
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
    const sections = ["Overview", "Colors", "Typography", "Layout", "Components", "Do's and Don'ts"];
    for (const section of sections) {
      const escaped = section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (!new RegExp(`^##\\s+${escaped}\\s*$`, "im").test(content)) {
        add("warning", "design-contract.missing-section", designFile, 1, `DESIGN.md is missing the recommended '${section}' section.`);
      }
    }
  } catch (error) {
    if (error.code === "ENOENT") {
      add("notice", "design-contract.absent", designFile, 1, "No root DESIGN.md found. This is acceptable for a small or established project with another canonical design source.");
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
  for (const file of files) {
    const content = await fs.readFile(file, "utf8");
    content.split(/\r?\n/).forEach((line, index) => scanLine(file, line, index + 1));
  }

  const result = {
    root,
    filesScanned: files.length,
    counts: {
      warning: findings.filter((item) => item.severity === "warning").length,
      notice: findings.filter((item) => item.severity === "notice").length,
    },
    findings,
    note: "Static findings require contextual and rendered review.",
  };

  if (json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    console.log(`Frontend design scan: ${files.length} source files`);
    for (const item of findings) {
      console.log(`${item.severity.toUpperCase()} ${item.rule} ${item.file}:${item.line} ${item.message}`);
    }
    console.log(`${result.counts.warning} warning(s), ${result.counts.notice} notice(s).`);
    console.log(result.note);
  }
} catch (error) {
  const failure = { error: error.message, root };
  if (json) process.stdout.write(`${JSON.stringify(failure, null, 2)}\n`);
  else console.error(`verify-design: ${error.message}`);
  process.exitCode = 2;
}
