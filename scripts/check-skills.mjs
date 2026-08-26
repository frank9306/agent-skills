#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillsRoot = path.join(repositoryRoot, "skills");
const skillCategories = ["engineering", "content", "security", "environment"];
const failures = [];

function fail(skill, message) {
  failures.push({ skill, message });
}

async function validateSkill(category, entry) {
  const skillRoot = path.join(skillsRoot, category, entry.name);
  const skillFile = path.join(skillRoot, "SKILL.md");
  let content;
  try {
    content = await fs.readFile(skillFile, "utf8");
  } catch {
    fail(entry.name, "missing readable SKILL.md");
    return;
  }

  if (content.charCodeAt(0) === 0xfeff) fail(entry.name, "SKILL.md must be UTF-8 without BOM");
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) {
    fail(entry.name, "missing YAML frontmatter");
    return;
  }
  const name = match[1].match(/^name:\s*([^\r\n]+)$/m)?.[1]?.trim();
  const description = match[1].match(/^description:\s*([^\r\n]+)$/m)?.[1]?.trim();
  if (name !== entry.name) fail(entry.name, `frontmatter name must equal directory name '${entry.name}'`);
  if (!description) fail(entry.name, "frontmatter description is required");
  if (!/^[a-z0-9-]{1,63}$/.test(entry.name)) fail(entry.name, "directory name must use lowercase letters, digits, and hyphens");
  if (/\bTODO\b|\[TODO/i.test(content)) fail(entry.name, "SKILL.md contains an unresolved TODO");

  const metadataFile = path.join(skillRoot, "agents", "openai.yaml");
  try {
    const metadata = await fs.readFile(metadataFile, "utf8");
    if (!metadata.includes(`$${entry.name}`)) fail(entry.name, "agents/openai.yaml default prompt must mention the skill explicitly");
  } catch {
    fail(entry.name, "missing readable agents/openai.yaml");
  }
}

try {
  const rootEntries = (await fs.readdir(skillsRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
  const unknownCategories = rootEntries.filter((name) => !skillCategories.includes(name));
  for (const category of unknownCategories) fail("repository", `unknown skill category '${category}'`);

  let skillCount = 0;
  for (const category of skillCategories) {
    const categoryRoot = path.join(skillsRoot, category);
    let entries;
    try {
      entries = (await fs.readdir(categoryRoot, { withFileTypes: true }))
        .filter((entry) => entry.isDirectory())
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch {
      fail("repository", `missing skill category '${category}'`);
      continue;
    }
    skillCount += entries.length;
    for (const entry of entries) await validateSkill(category, entry);
  }
  if (skillCount === 0) fail("repository", "no skill directories found");

  if (failures.length) {
    failures.forEach(({ skill, message }) => console.error(`FAIL ${skill}: ${message}`));
    process.exitCode = 1;
  } else {
    console.log(`PASS ${skillCount} skill(s) validated across ${skillCategories.length} categories.`);
  }
} catch (error) {
  console.error(`FAIL repository: ${error.message}`);
  process.exitCode = 2;
}
