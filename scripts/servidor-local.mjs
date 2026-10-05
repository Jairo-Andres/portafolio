// Servidor de prueba que imita lo que hace Vercel con vercel.json:
// sirve web/, aplica los redirects y, para los rewrites, hace de proxy.
//
//   npm run dev               -> /sala/ y /radar/ van a los sitios publicados (como en Vercel)
//   npm run dev -- --local    -> /sala/ y /radar/ salen de las carpetas hermanas
//                                (sala-de-espera/dist y radar-gov-co/web + data), para probar
//                                cambios que aún no están publicados.
//
// Puerto: PORT (por defecto 4321). Sin dependencias: solo Node 18+.

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const WEB = join(ROOT, "web");
const config = JSON.parse(await readFile(join(ROOT, "vercel.json"), "utf8"));
const LOCAL = process.argv.includes("--local");
const PORT = Number(process.env.PORT || 4321);

// Carpetas locales que reemplazan a cada sitio publicado con --local (en orden de búsqueda).
const LOCAL_DIRS = {
  "https://sala-de-espera-bice.vercel.app": [join(ROOT, "../sala-de-espera/dist")],
  "https://radar-gov-co.vercel.app": [join(ROOT, "../radar-gov-co/web"), join(ROOT, "../radar-gov-co")],
};

const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml",
  ".png": "image/png", ".ico": "image/x-icon", ".webmanifest": "application/manifest+json", ".jpg": "image/jpeg",
  ".webp": "image/webp", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8",
};

// "/sala/:path*" -> RegExp con grupo para :path*
function matcher(source) {
  const pattern = source.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/:(\w+)\*/g, "(?<$1>.*)").replace(/:(\w+)/g, "(?<$1>[^/]+)");
  return new RegExp(`^${pattern}$`);
}
const fill = (destination, groups = {}) => destination.replace(/:(\w+)\*?/g, (_, name) => groups[name] ?? "");

async function sendFile(res, dirs, relPath) {
  for (const dir of dirs) {
    let file = normalize(join(dir, decodeURIComponent(relPath)));
    if (!file.startsWith(normalize(dir))) break;
    try {
      if ((await stat(file)).isDirectory()) file = join(file, "index.html");
      const body = await readFile(file);
      res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
      return res.end(body);
    } catch { /* siguiente carpeta */ }
  }
  res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
  res.end("404");
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  for (const r of config.redirects ?? []) {
    const m = url.pathname.match(matcher(r.source));
    if (m) {
      res.writeHead(r.permanent ? 308 : 307, { location: fill(r.destination, m.groups) + url.search });
      return res.end();
    }
  }

  for (const r of config.rewrites ?? []) {
    const m = url.pathname.match(matcher(r.source));
    if (!m) continue;
    const target = new URL(fill(r.destination, m.groups) + url.search);
    if (LOCAL && LOCAL_DIRS[target.origin]) return sendFile(res, LOCAL_DIRS[target.origin], target.pathname);
    try {
      const upstream = await fetch(target, { headers: { "user-agent": "portafolio-servidor-local" } });
      const headers = {};
      for (const k of ["content-type", "cache-control"]) if (upstream.headers.get(k)) headers[k] = upstream.headers.get(k);
      res.writeHead(upstream.status, headers);
      return res.end(Buffer.from(await upstream.arrayBuffer()));
    } catch (err) {
      res.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
      return res.end(`No se pudo contactar ${target.origin}: ${err.message}`);
    }
  }

  return sendFile(res, [WEB], url.pathname);
}).listen(PORT, () => {
  console.log(`Portafolio en http://localhost:${PORT} (${LOCAL ? "sala y radar desde carpetas locales" : "sala y radar desde Vercel"})`);
});
