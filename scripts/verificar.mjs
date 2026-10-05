// Verificación local: capturas a 390 y 1280 px, axe (WCAG 2.1 A/AA) en la portada
// y comprobación de que /sala/ y /radar/ cargan todos sus recursos a través de los rewrites.
//
//   npm run verificar               -> proxy a los sitios publicados en Vercel
//   npm run verificar -- --local    -> sala y radar desde las carpetas hermanas (ver servidor-local.mjs)

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const PORT = 4399;
const BASE = `http://localhost:${PORT}`;
const LOCAL = process.argv.includes("--local");
const OUT = new URL("../docs/capturas/", import.meta.url);
await mkdir(OUT, { recursive: true });

const server = spawn(process.execPath, ["scripts/servidor-local.mjs", ...(LOCAL ? ["--local"] : [])], {
  env: { ...process.env, PORT: String(PORT) }, stdio: ["ignore", "pipe", "inherit"],
});
await new Promise((ok) => server.stdout.once("data", ok));

const browser = await chromium.launch();
const report = { fecha: new Date().toISOString(), modo: LOCAL ? "local" : "vercel", axe: [], rutas: [] };
let fallos = 0;

try {
  // 1) Portada: capturas y axe en ES/EN, claro/oscuro
  for (const scheme of ["light", "dark"]) {
    for (const width of [390, 1280]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: scheme, reducedMotion: "reduce" });
      const page = await context.newPage();
      await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
      await page.screenshot({ path: fileURLToPath(new URL(`inicio-${width}-${scheme}.png`, OUT)), fullPage: true });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      if (overflow > 0) { fallos++; console.log(`✗ Desborde horizontal de ${overflow}px a ${width}px (${scheme})`); }
      for (const lang of ["es", "en"]) {
        if (lang === "en") await page.goto(`${BASE}/?lang=en`, { waitUntil: "networkidle" });
        const res = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
        report.axe.push({ width, scheme, lang, violaciones: res.violations.length, reglas: res.violations.map((v) => `${v.id} (${v.nodes.length})`) });
        if (res.violations.length) { fallos++; console.log(`✗ axe ${width}px ${scheme} ${lang}:`, res.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)); }
      }
      await context.close();
    }
  }

  // 2) Rewrites: sin barra redirige, y todos los recursos del mismo origen responden 2xx/3xx
  for (const ruta of ["/sala", "/radar"]) {
    for (const width of [390, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
      const rotos = [];
      page.on("response", (r) => { if (r.url().startsWith(BASE) && r.status() >= 400) rotos.push(`${r.status()} ${r.url().replace(BASE, "")}`); });
      page.on("requestfailed", (r) => { if (r.url().startsWith(BASE)) rotos.push(`falló ${r.url().replace(BASE, "")}`); });
      await page.goto(`${BASE}${ruta}`, { waitUntil: "networkidle", timeout: 90_000 }).catch(() => {});
      await page.waitForTimeout(1500);
      const final = new URL(page.url()).pathname;
      const estilos = await page.evaluate(() => [...document.styleSheets].length);
      const titulo = await page.title();
      await page.screenshot({ path: fileURLToPath(new URL(`${ruta.slice(1)}-${width}.png`, OUT)) });
      const ok = final === `${ruta}/` && rotos.length === 0 && estilos > 0;
      if (!ok) fallos++;
      report.rutas.push({ ruta, width, final, titulo, estilos, rotos });
      console.log(`${ok ? "✓" : "✗"} ${ruta} (${width}px) -> ${final} · "${titulo}" · ${estilos} hojas de estilo${rotos.length ? ` · rotos: ${rotos.join(", ")}` : ""}`);
      await page.close();
    }
  }
} finally {
  await browser.close();
  server.kill();
}

await writeFile(new URL("resultado.json", OUT), JSON.stringify(report, null, 2));
const totalAxe = report.axe.reduce((n, r) => n + r.violaciones, 0);
console.log(`\naxe: ${totalAxe} incumplimientos en ${report.axe.length} combinaciones (390/1280 px · claro/oscuro · ES/EN)`);
console.log(fallos ? `✗ ${fallos} comprobaciones fallaron` : "✓ Todo en orden");
process.exit(fallos ? 1 : 0);
