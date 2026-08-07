// frontend-design-scan-ignore-file -- this test intentionally embeds unsafe fixture source.
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

const execFileAsync = promisify(execFile);
const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const verifier = path.join(skillRoot, "scripts", "verify-design.mjs");
const minimalDesignContract = "# Product Design System\n\n## Overview\n";

test("reports representative engineering and security review leads", async (context) => {
  const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), "frontend-design-test-"));
  context.after(() => fs.rm(fixtureRoot, { recursive: true, force: true }));
  await fs.writeFile(path.join(fixtureRoot, "DESIGN.md"), minimalDesignContract, "utf8");
  await fs.mkdir(path.join(fixtureRoot, "components"), { recursive: true });
  await fs.writeFile(path.join(fixtureRoot, "components", "Account.tsx"), `
import axios from "axios";
import { useEffect } from "react";
export function Account(props: any) {
  useEffect(() => {}, []);
  useEffect(() => {}, []);
  useEffect(() => {}, []);
  useEffect(() => {}, []);
  const value = props.value as unknown as Account;
  localStorage.setItem("access_token", value);
  axios.get("/account");
  return <div onClick={() => {}} dangerouslySetInnerHTML={{ __html: value }} />;
}
`, "utf8");

  const { stdout } = await execFileAsync(process.execPath, [verifier, fixtureRoot, "--json"]);
  const result = JSON.parse(stdout);
  const rules = new Set(result.findings.map((finding) => finding.rule));

  for (const rule of [
    "accessibility.nonsemantic-click",
    "security.html-sink",
    "security.browser-token-storage",
    "state.effect-density",
    "type.explicit-any",
    "type.double-assertion",
    "api.transport-in-component",
  ]) {
    assert.ok(rules.has(rule), `expected ${rule}`);
  }
  assert.ok(result.findings.every((finding) => finding.classification === "inferred"));
});

test("reports competing mechanisms and exact duplicated blocks as review leads", async (context) => {
  const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), "frontend-design-test-"));
  context.after(() => fs.rm(fixtureRoot, { recursive: true, force: true }));
  await fs.writeFile(path.join(fixtureRoot, "DESIGN.md"), minimalDesignContract, "utf8");
  await fs.mkdir(path.join(fixtureRoot, "features", "one"), { recursive: true });
  await fs.mkdir(path.join(fixtureRoot, "features", "two"), { recursive: true });
  const repeated = `
export function normalizeAccount(account) {
  const identifier = account.identifier.trim();
  const displayName = account.displayName.trim();
  const emailAddress = account.emailAddress.toLowerCase();
  const isActive = account.status === "active";
  const canEdit = account.permissions.includes("edit");
  const canDelete = account.permissions.includes("delete");
  return { identifier, displayName, emailAddress, isActive, canEdit, canDelete };
}
`;
  await fs.writeFile(path.join(fixtureRoot, "features", "one", "state.ts"), `import { atom } from "jotai";\n${repeated}`, "utf8");
  await fs.writeFile(path.join(fixtureRoot, "features", "two", "state.ts"), `import { create } from "zustand";\n${repeated}`, "utf8");
  await fs.writeFile(path.join(fixtureRoot, "features", "one", "api.ts"), "import axios from \"axios\";\n", "utf8");
  await fs.writeFile(path.join(fixtureRoot, "features", "two", "api.ts"), "import ky from \"ky\";\n", "utf8");

  const { stdout } = await execFileAsync(process.execPath, [verifier, fixtureRoot, "--json"]);
  const result = JSON.parse(stdout);
  const rules = new Set(result.findings.map((finding) => finding.rule));

  assert.ok(rules.has("architecture.multiple-state-libraries"));
  assert.ok(rules.has("api.multiple-request-libraries"));
  assert.ok(rules.has("architecture.exact-duplicate-block"));
});

test("fails when the required root DESIGN.md is absent", async (context) => {
  const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), "frontend-design-test-"));
  context.after(() => fs.rm(fixtureRoot, { recursive: true, force: true }));

  await assert.rejects(
    execFileAsync(process.execPath, [verifier, fixtureRoot, "--json"]),
    (error) => {
      assert.equal(error.code, 1);
      const result = JSON.parse(error.stdout);
      assert.equal(result.counts.error, 1);
      assert.ok(result.findings.some((finding) => finding.rule === "design-contract.absent"));
      return true;
    },
  );
});
