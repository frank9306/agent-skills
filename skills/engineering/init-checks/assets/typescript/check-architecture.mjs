#!/usr/bin/env node
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, posix, relative, isAbsolute } from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const extensions = /\.(?:[cm]?[jt]s|[jt]sx)$/i;
const ignoredDirectories = new Set(['.git', 'node_modules', '.venv', 'venv', '__pycache__', '.cache', '.next', 'coverage', 'dist', 'build']);
const baselineRules = new Set(['private-import', 'forbidden-dependency', 'module-cycle', 'external-owner', 'unresolved-import']);
const within = (file, directory) => directory === '.' || file === directory || file.startsWith(`${directory}/`);
const object = value => value && typeof value === 'object' && !Array.isArray(value);
function keys(value, allowed, label) {
  if (!object(value)) throw new Error(`${label} must be an object`);
  for (const key of Object.keys(value)) if (!allowed.includes(key)) throw new Error(`Unknown ${label} key: ${key}`);
}
function strings(value, label) {
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string' || !item) || new Set(value).size !== value.length) throw new Error(`${label} must contain unique nonempty strings`);
  return value;
}
function path(value, label, allowRoot = false) {
  if (typeof value !== 'string' || !value || value.endsWith('/') || isAbsolute(value) || /^[A-Za-z]:/.test(value) || value.includes('\\') || /[*?\[\]{}]/.test(value) || value.split('/').includes('..') || posix.normalize(value) !== value || (value === '.' && !allowRoot)) throw new Error(`${label} must be an exact project-relative path`);
  return value;
}
async function validate(config, root) {
  keys(config, ['schemaVersion', 'profile', 'sourceRoots', 'modules', 'externalOwners', 'dynamicLoaders', 'baseline', 'excludedPaths'], 'contract');
  if (config.schemaVersion !== 1 || (config.profile !== undefined && config.profile !== 'typescript')) throw new Error('Expected schemaVersion 1 and typescript profile');
  strings(config.sourceRoots, 'sourceRoots').forEach(value => path(value, 'sourceRoots', true));
  if (!config.sourceRoots.length || !Array.isArray(config.modules) || !config.modules.length) throw new Error('Declare sourceRoots and modules');
  if (config.externalOwners === undefined) config.externalOwners = {};
  if (config.dynamicLoaders === undefined) config.dynamicLoaders = [];
  if (config.baseline === undefined) config.baseline = [];
  if (config.excludedPaths === undefined) config.excludedPaths = [];
  for (const field of ['dynamicLoaders', 'excludedPaths']) strings(config[field], field).forEach(value => path(value, field));
  const names = new Set();
  for (const module of config.modules) {
    keys(module, ['name', 'path', 'public', 'exports', 'allow', 'testPaths'], 'module');
    if (typeof module.name !== 'string' || !/^[A-Za-z][\w-]*$/.test(module.name) || names.has(module.name)) throw new Error('Module names must be unique identifiers');
    names.add(module.name);
    path(module.path, 'module.path');
    strings(module.public, 'module.public').forEach(value => path(value, 'module.public'));
    if (!module.public.length) throw new Error(`Module ${module.name} needs a public entry`);
    if (module.allow === undefined) module.allow = [];
    if (module.testPaths === undefined) module.testPaths = [];
    strings(module.allow, 'module.allow');
    strings(module.testPaths, 'module.testPaths').forEach(value => path(value, 'module.testPaths'));
    if (!object(module.exports)) throw new Error('module.exports must map every public entry to exact export names');
    if (Object.keys(module.exports).sort().join('\0') !== [...module.public].sort().join('\0')) throw new Error('module.exports keys must exactly match module.public');
    for (const entry of module.public) {
      if (!within(entry, module.path)) throw new Error(`Public entry ${entry} must belong to ${module.name}`);
      strings(module.exports[entry], 'module.exports');
      if (module.exports[entry].some(value => /[*?]/.test(value))) throw new Error('Export names must be explicit');
      if (!(await stat(resolve(root, entry))).isFile()) throw new Error(`Public entry is not a file: ${entry}`);
    }
  }
  for (const [index, module] of config.modules.entries()) {
    for (const other of config.modules.slice(index + 1)) if (within(module.path, other.path) || within(other.path, module.path)) throw new Error('Module paths cannot overlap');
    if (module.allow.some(name => !names.has(name) || name === module.name)) throw new Error(`Invalid allowed dependency in ${module.name}`);
    for (const testPath of module.testPaths) if (config.modules.some(owner => within(testPath, owner.path))) throw new Error('testPaths are external contract tests; internal tests belong to module.path');
  }
  const testPaths = config.modules.flatMap(module => module.testPaths);
  for (const [index, testPath] of testPaths.entries()) if (testPaths.slice(index + 1).some(other => within(testPath, other) || within(other, testPath))) throw new Error('External test paths cannot overlap');
  for (const source of config.sourceRoots) if (!(await stat(resolve(root, source))).isDirectory()) throw new Error(`Missing source root: ${source}`);
  for (const excluded of config.excludedPaths) {
    if (config.modules.some(module => within(module.path, excluded) || module.public.some(entry => within(entry, excluded)) || module.testPaths.some(testPath => within(testPath, excluded)))) throw new Error(`Cannot exclude a module, public entry, or contract tests: ${excluded}`);
    const generated = /(?:^|\/)(?:generated|vendor)(?:\/|$)/.test(excluded);
    const managed = ['scripts/check-architecture.mjs', 'scripts/codex-checks.mjs'].includes(excluded);
    if (config.sourceRoots.some(source => within(excluded, source)) && !generated && !managed) throw new Error('Only generated/vendor paths and managed scripts may be excluded inside sourceRoots');
    if (!generated && !managed) throw new Error('Exclusions must name generated/vendor paths or the exact managed checker/hook scripts');
  }
  for (const loader of config.dynamicLoaders) if (!ownerOf(loader, config) || !(await stat(resolve(root, loader))).isFile()) throw new Error(`dynamicLoaders must name owned source files: ${loader}`);
  keys(config.externalOwners, Object.keys(config.externalOwners), 'externalOwners');
  for (const [specifier, owners] of Object.entries(config.externalOwners)) {
    if (!specifier || /[*?]/.test(specifier)) throw new Error('externalOwners keys must be literal package specifiers');
    strings(owners, 'externalOwners');
    if (owners.some(name => !names.has(name))) throw new Error(`Unknown external owner for ${specifier}`);
  }
  if (!Array.isArray(config.baseline)) throw new Error('baseline must be an array');
  const baselineKeys = new Set();
  for (const entry of config.baseline) {
    keys(entry, ['rule', 'from', 'to', 'reason'], 'baseline');
    if (!baselineRules.has(entry.rule) || typeof entry.reason !== 'string' || !entry.reason.trim()) throw new Error('A baseline needs a supported exact dependency-edge rule and reason; export, loader, and coverage rules cannot be baselined');
    path(entry.from, 'baseline.from');
    if (typeof entry.to !== 'string' || !entry.to || /[*?\[\]{}]/.test(entry.to)) throw new Error('baseline.to must be an exact dependency or target');
    const key = `${entry.rule}\0${entry.from}\0${entry.to}`;
    if (baselineKeys.has(key)) throw new Error('Duplicate baseline entry');
    baselineKeys.add(key);
  }
  return config;
}
async function discover(root, config) {
  const result = [];
  async function walk(directory) {
    for (const entry of await readdir(resolve(root, directory), { withFileTypes: true })) {
      const file = directory === '.' ? entry.name : `${directory}/${entry.name}`;
      if (ignoredDirectories.has(entry.name) || config.excludedPaths.some(excluded => within(file, excluded))) continue;
      if (entry.isSymbolicLink()) throw new Error(`Unscanned symlink requires an explicit exclusion: ${file}`);
      if (entry.isDirectory()) await walk(file);
      else if (extensions.test(entry.name)) result.push(file);
    }
  }
  await walk('.');
  return result.sort();
}
function ownerOf(file, config) {
  return config.modules.find(module => within(file, module.path) || module.testPaths.some(directory => within(file, directory)));
}
async function check(config, root) {
  const violations = [];
  const add = (rule, from, to, message) => violations.push({ rule, from, to, message });
  const files = await discover(root, config);
  for (const file of files) {
    if (!config.sourceRoots.some(directory => within(file, directory))) add('unscanned-source', file, file, 'Declare this source root; source files outside sourceRoots cannot be ignored.');
    else if (!ownerOf(file, config)) add('unclassified-source', file, file, 'Declare a module owner or external contract-test owner.');
  }
  if (violations.length) return violations;
  const require = createRequire(resolve(root, 'package.json'));
  let cruiser;
  for (const directory of require.resolve.paths('dependency-cruiser')) {
    try {
      const metadata = JSON.parse(await readFile(resolve(directory, 'dependency-cruiser/package.json'), 'utf8'));
      const entry = metadata.exports?.['.']?.import ?? metadata.main;
      cruiser = await import(pathToFileURL(resolve(directory, 'dependency-cruiser', entry)).href);
      break;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  if (!cruiser) throw new Error('Install dependency-cruiser in this project');
  const ts = require('typescript');
  if (typeof ts.createProgram !== 'function' || !ts.sys) throw new Error(`TypeScript ${ts.version} does not expose the supported compiler API; use a supported TypeScript 5.x compiler for this checker`);
  const configFile = ts.findConfigFile(root, ts.sys.fileExists, 'tsconfig.json');
  let tsConfig;
  if (configFile) {
    const raw = ts.readConfigFile(configFile, ts.sys.readFile);
    if (raw.error) throw new Error(ts.flattenDiagnosticMessageText(raw.error.messageText, '\n'));
    tsConfig = ts.parseJsonConfigFileContent(raw.config, ts.sys, root, {}, configFile);
    // A zero-input tsconfig is legitimate when the explicit architecture roots are the inputs.
    const errors = tsConfig.errors.filter(error => error.code !== 18003);
    if (errors.length) throw new Error(errors.map(error => ts.flattenDiagnosticMessageText(error.messageText, '\n')).join('\n'));
  }
  process.chdir(root);
  const result = await cruiser.cruise(files, { outputType: 'json', tsPreCompilationDeps: true, doNotFollow: { path: '(^|/)node_modules/' }, ...(configFile ? { tsConfig: { fileName: configFile } } : {}) }, {}, tsConfig ? { tsConfig } : {});
  const graph = typeof result.output === 'string' ? JSON.parse(result.output) : result.output;
  if (!Array.isArray(graph?.modules)) throw new Error('dependency-cruiser returned no module graph');
  const casing = new Map(files.map(file => [file.toLowerCase(), file]));
  const normalize = file => {
    const relativePath = (isAbsolute(file) ? relative(root, file) : file).replaceAll('\\', '/');
    return process.platform === 'win32' ? casing.get(relativePath.toLowerCase()) ?? relativePath : relativePath;
  };
  const analyzed = new Set(graph.modules.map(module => normalize(module.source)));
  for (const file of files) if (!analyzed.has(file)) add('unscanned-source', file, file, 'The native dependency engine did not analyze this source.');
  const moduleEdges = [];
  for (const source of graph.modules) {
    const from = normalize(source.source);
    const fromOwner = ownerOf(from, config);
    if (!fromOwner) continue;
    const externalTest = fromOwner.testPaths.some(directory => within(from, directory));
    for (const dependency of source.dependencies ?? []) {
      const to = normalize(dependency.resolved || dependency.module);
      const toOwner = ownerOf(to, config);
      if (dependency.couldNotResolve && !dependency.coreModule) add('unresolved-import', from, dependency.module, 'Resolve or remove this dependency; unresolved dependencies cannot prove a boundary.');
      for (const [specifier, owners] of Object.entries(config.externalOwners)) {
        const canonical = dependency.coreModule ? specifier.replace(/^node:/, '') : specifier;
        if ((dependency.module === canonical || dependency.module.startsWith(`${canonical}/`)) && !owners.includes(fromOwner.name)) add('external-owner', from, specifier, `Only ${owners.join(', ') || 'no modules'} may access ${specifier}.`);
      }
      if (!toOwner) {
        if (!dependency.coreModule && !dependency.couldNotResolve && !dependency.dependencyTypes.some(type => type.startsWith('npm')) && !config.excludedPaths.some(excluded => within(to, excluded))) add('unclassified-source', from, to, 'Resolved local dependencies must have a declared owner inside this project.');
        continue;
      }
      if ((toOwner !== fromOwner || externalTest) && !toOwner.public.includes(to)) add('private-import', from, to, `Use a public entry of ${toOwner.name}.`);
      if (toOwner !== fromOwner && !fromOwner.allow.includes(toOwner.name)) add('forbidden-dependency', from, to, `${fromOwner.name} may not depend on ${toOwner.name}.`);
      if (toOwner !== fromOwner) moduleEdges.push({ from, to, fromOwner: fromOwner.name, toOwner: toOwner.name });
    }
  }
  // Collapse the native tool's resolved graph to domain owners. File-only cycle detection
  // misses a domain cycle whose forward and reverse edges use different internal files.
  function reaches(start, target, visited = new Set()) {
    if (start === target) return true;
    if (visited.has(start)) return false;
    visited.add(start);
    return moduleEdges.some(edge => edge.fromOwner === start && reaches(edge.toOwner, target, visited));
  }
  for (const edge of moduleEdges) if (reaches(edge.toOwner, edge.fromOwner)) add('module-cycle', edge.from, edge.to, `The domain dependency ${edge.fromOwner} -> ${edge.toOwner} participates in a cycle.`);
  const program = ts.createProgram(files.map(file => resolve(root, file)), { ...(tsConfig?.options ?? {}), allowJs: true, noEmit: true });
  const checker = program.getTypeChecker();
  for (const file of files) {
    const source = program.getSourceFile(resolve(root, file));
    if (!source) throw new Error(`TypeScript did not parse ${file}`);
    if (source.parseDiagnostics.length) throw new Error(`${file}: ${source.parseDiagnostics.map(error => ts.flattenDiagnosticMessageText(error.messageText, '\n')).join('; ')}`);
    function visit(node) {
      const isLoader = ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === 'require'));
      if (isLoader && (node.arguments.length !== 1 || !ts.isStringLiteralLike(node.arguments[0])) && !config.dynamicLoaders.includes(file)) add('computed-import', file, 'dynamic', 'Computed loading belongs in an explicitly registered dynamicLoaders adapter.');
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
  for (const module of config.modules) for (const entry of module.public) {
    const source = program.getSourceFile(resolve(root, entry));
    if (source.statements.some(node => ts.isExportDeclaration(node) && !node.exportClause)) add('wildcard-export', entry, entry, 'Public entries require explicit named exports.');
    const symbol = checker.getSymbolAtLocation(source);
    const actual = symbol ? checker.getExportsOfModule(symbol).map(value => value.name).sort() : [];
    const declared = [...module.exports[entry]].sort();
    if (actual.join('\0') !== declared.join('\0')) add('undeclared-export', entry, entry, `Expected exports [${declared.join(', ')}]; actual exports [${actual.join(', ')}].`);
  }
  const used = new Set();
  const remaining = violations.filter(violation => {
    const index = config.baseline.findIndex(entry => entry.rule === violation.rule && entry.from === violation.from && entry.to === violation.to);
    if (index < 0) return true;
    used.add(index);
    return false;
  });
  for (const [index, entry] of config.baseline.entries()) if (!used.has(index)) remaining.push({ rule: 'unused-baseline', from: entry.from, to: entry.to, message: `Remove the unused ${entry.rule} baseline; fixed violations must not leave stale exemptions.` });
  return remaining.filter((value, index, values) => values.findIndex(other => other.rule === value.rule && other.from === value.from && other.to === value.to) === index).sort((left, right) => `${left.rule}\0${left.from}\0${left.to}`.localeCompare(`${right.rule}\0${right.from}\0${right.to}`));
}

const args = process.argv.slice(2);
const root = resolve(args.find(value => !value.startsWith('--')) || '.');
const json = args.includes('--json');
try {
  const config = await validate(JSON.parse(await readFile(resolve(root, '.architecture.json'), 'utf8')), root);
  const violations = await check(config, root);
  const report = { ok: !violations.length, violations, errors: [] };
  console.log(json ? JSON.stringify(report) : violations.length ? violations.map(value => `${value.rule}: ${value.from} -> ${value.to}: ${value.message}`).join('\n') : 'Architecture checks passed.');
  process.exitCode = violations.length ? 1 : 0;
} catch (error) {
  const report = { ok: false, violations: [], errors: [`Architecture check unavailable: ${error.message}`] };
  console.log(json ? JSON.stringify(report) : report.errors.join('\n'));
  process.exitCode = 2;
}
