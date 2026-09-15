import { createRequire } from 'node:module'
import { promises as fs } from 'node:fs'
import path from 'node:path'

const manifestPath = path.resolve(process.argv[2] ?? '')
if (!manifestPath) throw new Error('manifest path is required')
const root = path.dirname(manifestPath)
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'))
const capture = manifest.capture
const projectRoot = path.resolve(root, capture.projectRoot ?? '.')
const require = createRequire(path.join(projectRoot, 'package.json'))
let chromium
try {
  ;({ chromium } = require('@playwright/test'))
} catch (error) {
  throw new Error(`Playwright is unavailable from ${projectRoot}: ${error.message}`)
}

const output = (key) => path.resolve(root, manifest.outputs[key])
const browser = await chromium.launch({ headless: true })
try {
  const context = await browser.newContext({
    viewport: capture.viewport,
    deviceScaleFactor: capture.deviceScaleFactor,
    colorScheme: capture.colorScheme ?? 'light',
    reducedMotion: 'reduce',
    locale: capture.locale ?? 'en-US',
    timezoneId: capture.timezoneId ?? 'UTC',
  })
  const page = await context.newPage()
  if (capture.initScript) await page.addInitScript({ content: capture.initScript })
  await page.goto(capture.url, { waitUntil: 'networkidle' })
  await page.addStyleTag({ content: `
    *, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }
    ${capture.freezeCss ?? ''}
  ` })
  await page.waitForFunction(() => document.fonts.status === 'loaded')
  await page.evaluate(() => document.fonts.ready)
  if (capture.readySelector) await page.locator(capture.readySelector).waitFor({ state: 'visible' })
  for (const action of capture.actions ?? []) {
    const locator = page.locator(action.selector)
    if (await locator.count() !== 1) throw new Error(`action selector must match exactly once: ${action.selector}`)
    if (action.type === 'click') await locator.click()
    else if (action.type === 'fill') await locator.fill(action.value ?? '')
    else if (action.type === 'press') await locator.press(action.key)
    else throw new Error(`unsupported capture action: ${action.type}`)
  }
  for (const font of manifest.assets?.fonts ?? []) {
    if (font.required !== false) {
      const loaded = await page.evaluate((family) => {
        const normalized = family.replace(/^['"]|['"]$/g, '').toLowerCase()
        const declared = Array.from(document.fonts).some((face) =>
          face.family.replace(/^['"]|['"]$/g, '').toLowerCase() === normalized && face.status === 'loaded',
        )
        return declared && document.fonts.check(`16px "${family}"`)
      }, font.family)
      if (!loaded) throw new Error(`required font is not loaded: ${font.family}`)
    }
  }

  const stateAssertions = []
  for (const assertion of capture.stateAssertions ?? []) {
    const locator = page.locator(assertion.selector)
    if (await locator.count() !== 1) throw new Error(`state selector must match exactly once: ${assertion.selector}`)
    if (assertion.visible === true && !(await locator.isVisible())) throw new Error(`stable state is not established: ${assertion.selector} is not visible`)
    if (assertion.text !== undefined && (await locator.textContent())?.trim() !== assertion.text) throw new Error(`stable state text mismatch: ${assertion.selector}`)
    if (assertion.value !== undefined && (await locator.inputValue()) !== assertion.value) throw new Error(`stable state value mismatch: ${assertion.selector}`)
    stateAssertions.push({ selector: assertion.selector, pass: true })
  }

  async function measure() {
    const anchors = {}
    for (const anchor of manifest.anchors ?? []) {
      const locator = page.locator(anchor.selector)
      if (await locator.count() !== 1) throw new Error(`anchor selector must match exactly once: ${anchor.name} (${anchor.selector})`)
      const rect = await locator.boundingBox()
      if (!rect) throw new Error(`anchor is not visible: ${anchor.name} (${anchor.selector})`)
      anchors[anchor.name] = rect
    }
    const geometryPoints = {}
    for (const point of manifest.geometryPoints ?? []) {
      const locator = page.locator(point.selector)
      if (await locator.count() !== 1) throw new Error(`geometry selector must match exactly once: ${point.name} (${point.selector})`)
      const rect = await locator.boundingBox()
      if (!rect) throw new Error(`geometry point is not measurable: ${point.name}`)
      geometryPoints[point.name] = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
    }
    return { anchors, geometryPoints }
  }

  const actual = output('actual')
  const ext = path.extname(actual)
  const base = actual.slice(0, -ext.length)
  const captures = [`${base}.stability-1${ext}`, `${base}.stability-2${ext}`, actual]
  const measurements = []
  for (const file of captures) {
    await page.screenshot({ path: file, fullPage: false, animations: 'disabled' })
    measurements.push(await measure())
  }
  process.stdout.write(JSON.stringify({ actual, captures, measurements, stableState: capture.stableState, stateAssertions, browser: { name: 'chromium', version: browser.version(), locale: capture.locale ?? 'default', timezoneId: capture.timezoneId ?? 'default' } }))
} finally {
  await browser.close()
}
