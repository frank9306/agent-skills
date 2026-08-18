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
  if (/dangerouslySetInnerHTML|\binnerHTML\s*=/i.test(line)) {
    add("warning", "security.html-sink", file, lineNumber, "Trace this HTML injection sink to its source and verify an explicit sanitization policy.");
  }
  if (/(?:localStorage|sessionStorage)\.(?:setItem|getItem)\s*\(\s*["'`](?:token|access[_-]?token|refresh[_-]?token|auth)/i.test(line)) {
    add("warning", "security.browser-token-storage", file, lineNumber, "Review browser token storage against the application's threat model and XSS controls.");
  }
  if (/animate-(?:bounce|pulse|spin)\b/.test(line)) {
    add("notice", "motion.repeated-utility", file, lineNumber, "Confirm repeated utility animation fits task frequency and reduced-motion behavior.");
  }
  if (/bg-gradient-to-|from-(?:indigo|violet|purple)-\d+.*to-(?:cyan|blue|violet|purple)-\d+/i.test(line)) {
    add("notice", "aesthetic.default-gradient", file, lineNumber, "Review whether this gradient comes from the product design system rather than a generic default.");
  }
}

function countMatches(content, pattern) {
  return [...content.matchAll(pattern)].length;
}

function inspectFile(file, content) {
  const lines = content.split(/\r?\n/);
  const extension = path.extname(file).toLowerCase();
  const isCode = [".astro", ".js", ".jsx", ".mjs", ".svelte", ".ts", ".tsx", ".vue"].includes(extension);
  if (!isCode) return;

  if (lines.length > 800) {
    add("warning", "architecture.very-large-file", file, 1, `${lines.length} lines require a responsibility-boundary review; line count alone does not prove a defect.`);
  } else if (lines.length > 450) {
    add("notice", "architecture.large-file", file, 1, `${lines.length} lines are a lead for checking mixed responsibilities and unstable component boundaries.`);
  }

  const effectCount = countMatches(content, /\buseEffect\s*\(/g);
  if (effectCount >= 4) {
    add("notice", "state.effect-density", file, 1, `${effectCount} useEffect calls warrant review for derived state, interaction logic, cleanup, and implicit synchronization.`);
  }

  const explicitAnyCount = countMatches(content, /(?:\:\s*any\b|\bas\s+any\b|<any>)/g);
  if (explicitAnyCount > 0) {
    add("notice", "type.explicit-any", file, 1, `${explicitAnyCount} explicit any usage(s) require contract review; confirm they do not conceal untrusted or drifting data.`);
  }

  const broadAssertionCount = countMatches(content, /\bas\s+unknown\s+as\s+[A-Za-z_$]/g);
  if (broadAssertionCount > 0) {
    add("warning", "type.double-assertion", file, 1, `${broadAssertionCount} double assertion(s) bypass structural checking; validate or model the boundary instead.`);
  }

  const componentLike = /(?:^|[\\/])(?:pages?|views?|components?|routes?)(?:[\\/]|$)/i.test(file)
    || /(?:function|const|class)\s+[A-Z][A-Za-z0-9_$]*/.test(content);
  if (componentLike && /\bfetch\s*\(|\baxios\.(?:get|post|put|patch|delete)\s*\(/.test(content)) {
    add("notice", "api.transport-in-component", file, 1, "A component-like file performs transport work directly; check cancellation, error mapping, DTO conversion, and the project API client.");
  }

  if (/(?:\.querySelector\(|\.firstChild\b|\.children\[|\.className\b)/.test(content) && /(?:describe|it|test)\s*\(/.test(content)) {
    add("notice", "testing.implementation-selector", file, 1, "Tests appear to select implementation structure; prefer accessible roles, names, and observable outcomes where possible.");
  }
}

function inspectCompetingMechanisms(files) {
  const stateLibraries = new Map([
    ["redux", /(?:from\s+["'](?:@reduxjs\/toolkit|react-redux|redux)["']|require\(["'](?:@reduxjs\/toolkit|react-redux|redux)["']\))/],
    ["zustand", /from\s+["']zustand(?:\/[^"']*)?["']/],
    ["jotai", /from\s+["']jotai(?:\/[^"']*)?["']/],
    ["mobx", /from\s+["'](?:mobx|mobx-react-lite)["']/],
    ["recoil", /from\s+["']recoil["']/],
    ["xstate", /from\s+["'](?:xstate|@xstate\/react)["']/],
  ]);
  const requestLibraries = new Map([
    ["axios", /from\s+["']axios["']/],
    ["ky", /from\s+["']ky["']/],
    ["swr", /from\s+["']swr(?:\/[^"']*)?["']/],
    ["tanstack-query", /from\s+["']@tanstack\/react-query["']/],
    ["apollo", /from\s+["']@apollo\/client["']/],
    ["urql", /from\s+["']urql["']/],
  ]);

  for (const [rule, libraries, message] of [
    ["architecture.multiple-state-libraries", stateLibraries, "state-management"],
    ["api.multiple-request-libraries", requestLibraries, "data-request"],
  ]) {
    const used = [...libraries].filter(([, pattern]) => files.some(({ content }) => pattern.test(content))).map(([name]) => name);
    if (used.length > 1) {
      add("notice", rule, root, 1, `Multiple ${message} libraries detected (${used.join(", ")}); verify their scopes are intentional and non-overlapping.`);
    }
  }
}

function inspectExactDuplication(files) {
  const blocks = new Map();
  const reported = new Set();
  let reportCount = 0;
  for (const { file, content } of files) {
    const lines = content.split(/\r?\n/);
    for (let index = 0; index <= lines.length - 8; index += 1) {
      const block = lines.slice(index, index + 8)
        .map((line) => line.trim().replace(/\s+/g, " "))
        .filter((line) => line && !/^(?:import|export\s+\{|[{}()[\],;]+$|\/\/)/.test(line));
      if (block.length < 6) continue;
      const key = block.join("\n");
      if (key.length < 180) continue;
      const previous = blocks.get(key);
      if (previous && previous.file !== file && reportCount < 10) {
        const pair = [previous.file, file].sort().join("|");
        if (!reported.has(pair)) {
          add("notice", "architecture.exact-duplicate-block", file, index + 1, `Exact multi-line duplication also appears at ${path.relative(root, previous.file).replaceAll("\\", "/")}:${previous.line}; compare semantics before extracting.`);
          reported.add(pair);
          reportCount += 1;
        }
      } else if (!previous) {
        blocks.set(key, { file, line: index + 1 });
      }
    }
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
      add("error", "design-contract.absent", designFile, 1, "Required root DESIGN.md is missing. Create it from the frontend-design DESIGN template before continuing.");
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
    inspectFile(file, content);
  }
  inspectCompetingMechanisms(inspectedFiles);
  inspectExactDuplication(inspectedFiles);

  const result = {
    root,
      filesScanned: inspectedFiles.length,
    counts: {
      error: findings.filter((item) => item.severity === "error").length,
      warning: findings.filter((item) => item.severity === "warning").length,
      notice: findings.filter((item) => item.severity === "notice").length,
    },
    findings,
    note: "Static findings are inferred review leads. Confirm them with repository, contract, runtime, business, and rendered evidence.",
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
