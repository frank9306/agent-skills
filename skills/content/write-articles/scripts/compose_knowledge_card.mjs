#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { extname, resolve } from "node:path";

function fail(message) {
  console.error(`compose_knowledge_card: ${message}`);
  process.exit(1);
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function positiveNumber(value, field) {
  if (!Number.isFinite(value) || value <= 0) fail(`${field} must be positive`);
  return value;
}

function textUnits(text) {
  return [...text].reduce((total, char) => {
    if (/\s/u.test(char)) return total + 0.35;
    if (/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(char)) {
      return total + 1;
    }
    if (/[A-Z0-9]/u.test(char)) return total + 0.72;
    if (/[a-z]/u.test(char)) return total + 0.56;
    return total + 0.62;
  }, 0);
}

function fitFontSize(label, lines, innerWidth, innerHeight) {
  const maxUnits = Math.max(...lines.map(textUnits));
  const lineHeight = label.lineHeight ?? 1.2;
  const widthLimit = maxUnits > 0 ? innerWidth / maxUnits : label.maxFontSize;
  const heightLimit = innerHeight / (lines.length * lineHeight);
  return Math.floor(Math.min(label.maxFontSize, widthLimit, heightLimit));
}

function renderLabel(raw, index, canvasWidth, canvasHeight, defaults) {
  const label = { ...defaults, ...raw };
  const name = `labels[${index}]`;
  const x = Number(label.x);
  const y = Number(label.y);
  const width = positiveNumber(Number(label.width), `${name}.width`);
  const height = positiveNumber(Number(label.height), `${name}.height`);
  if (![x, y].every(Number.isFinite)) fail(`${name}.x and y must be numbers`);
  if (x < 0 || y < 0 || x + width > canvasWidth || y + height > canvasHeight) {
    fail(`${name} box lies outside the canvas`);
  }

  const lines = Array.isArray(label.lines)
    ? label.lines.map(String)
    : String(label.text ?? "").split("\n");
  if (!lines.length || lines.some((line) => !line.trim())) {
    fail(`${name} must contain non-empty text or lines`);
  }

  const paddingX = Number(label.paddingX ?? 20);
  const paddingY = Number(label.paddingY ?? 12);
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;
  if (innerWidth <= 0 || innerHeight <= 0) fail(`${name} padding leaves no content area`);

  label.maxFontSize = positiveNumber(Number(label.maxFontSize ?? 32), `${name}.maxFontSize`);
  label.minFontSize = positiveNumber(Number(label.minFontSize ?? 16), `${name}.minFontSize`);
  const fontSize = fitFontSize(label, lines, innerWidth, innerHeight);
  if (fontSize < label.minFontSize) {
    fail(
      `${name} text does not fit: computed ${fontSize}px, minimum ${label.minFontSize}px`,
    );
  }

  const lineHeight = label.lineHeight ?? 1.2;
  const centerX = x + width / 2;
  const totalTextHeight = fontSize * lineHeight * lines.length;
  const firstBaseline =
    y + height / 2 - totalTextHeight / 2 + fontSize * lineHeight / 2;
  const textLines = lines
    .map(
      (line, lineIndex) =>
        `<tspan x="${centerX}" y="${firstBaseline + lineIndex * fontSize * lineHeight}">${escapeXml(line)}</tspan>`,
    )
    .join("");

  return [
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${label.radius}" fill="${escapeXml(label.background)}" fill-opacity="${label.backgroundOpacity}" stroke="${escapeXml(label.borderColor)}" stroke-width="${label.borderWidth}"/>`,
    `<text text-anchor="middle" dominant-baseline="middle" font-family="${escapeXml(label.fontFamily)}" font-size="${fontSize}" font-weight="${escapeXml(label.fontWeight)}" fill="${escapeXml(label.textColor)}">${textLines}</text>`,
  ].join("\n");
}

function mimeType(path) {
  const extension = extname(path).toLowerCase();
  if (extension === ".png") return "image/png";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  fail(`unsupported artwork extension: ${extension}`);
}

const configIndex = process.argv.indexOf("--config");
if (configIndex === -1 || !process.argv[configIndex + 1]) {
  fail("usage: node compose_knowledge_card.mjs --config <composition.json>");
}

const configPath = resolve(process.argv[configIndex + 1]);
const config = JSON.parse(await readFile(configPath, "utf8"));
const width = positiveNumber(Number(config.width), "width");
const height = positiveNumber(Number(config.height), "height");
if (!config.artwork || !config.output) fail("artwork and output are required");
if (!Array.isArray(config.labels) || !config.labels.length) {
  fail("labels must be a non-empty array");
}

const artworkPath = resolve(config.artwork);
const artworkData = (await readFile(artworkPath)).toString("base64");
const defaults = {
  radius: 18,
  background: "#fffdf7",
  backgroundOpacity: 0.94,
  borderColor: "#5278a3",
  borderWidth: 3,
  textColor: "#273444",
  fontFamily: "Microsoft YaHei, Noto Sans CJK SC, sans-serif",
  fontWeight: 700,
  maxFontSize: 32,
  minFontSize: 16,
  paddingX: 20,
  paddingY: 12,
  lineHeight: 1.2,
  ...(config.defaults ?? {}),
};
const labels = config.labels
  .map((label, index) => renderLabel(label, index, width, height, defaults))
  .join("\n");
const title = escapeXml(config.title ?? "Knowledge card");
const description = escapeXml(config.description ?? "");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
<title id="title">${title}</title>
<desc id="desc">${description}</desc>
<image href="data:${mimeType(artworkPath)};base64,${artworkData}" width="${width}" height="${height}"/>
${labels}
</svg>
`;

await writeFile(resolve(config.output), svg, "utf8");
console.log(`Wrote ${resolve(config.output)} with ${config.labels.length} fitted labels.`);
