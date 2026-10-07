# Portafolio · Jairo Sierra

**Español** · [English](#english)

Sitio central del portafolio con pestañas **Inicio**, **API**, **Sala de espera** y **Radar**. Presenta los tres proyectos como líneas de un mismo sistema (identidad visual "Rutas"):

| Línea | Proyecto | Dónde se ve | Repo |
|---|---|---|---|
| **B** Backend | API de oportunidad de citas | enlace a https://datos-abiertos-citas-api.onrender.com (y `/api` redirige allí) | [datos-abiertos-citas-api](https://github.com/Jairo-Andres/datos-abiertos-citas-api) |
| **D** Datos | La sala de espera | `/sala/` (rewrite a https://sala-de-espera-bice.vercel.app) | [sala-de-espera](https://github.com/Jairo-Andres/sala-de-espera) |
| **Q** QA | Radar .gov.co | `/radar/` (rewrite a https://radar-gov-co.vercel.app) | [radar-gov-co](https://github.com/Jairo-Andres/radar-gov-co) |
| **BQ** Transbordo | MiTiendaW (catálogo con pedidos por WhatsApp) | enlace a https://catalogo-whatsapp-sandy.vercel.app (Next.js usa rutas absolutas, por eso no va como rewrite) | [catalogo-whatsapp](https://github.com/Jairo-Andres/catalogo-whatsapp) |

Cada proyecto sigue con su propio repo, workflows, README y despliegue. Este repo solo tiene la portada y las reglas de `vercel.json`.

### Decisiones

- **HTML + CSS + JS estático, sin build.** Es una sola página; Vite o React no aportan nada aquí y un build menos es una cosa menos que se puede caer. Vercel publica la carpeta `web/` tal cual.
- **Rewrites en vez de copiar los proyectos.** `/sala/*` y `/radar/*` se sirven desde sus despliegues actuales, así que cada proyecto se actualiza solo en su repo y aparece aquí sin tocar nada.
- **`/sala` y `/radar` sin barra final redirigen a `/sala/` y `/radar/`.** Ambos proyectos cargan sus recursos con rutas relativas (`./assets/...`, `data/...`); sin la barra el navegador los pediría en la raíz y la página saldría rota.
- **Identidad común sin modificar.** `web/tokens.css`, `web/components.css`, `favicon.*`, iconos y `marca/` son copias exactas de las que usa `radar-gov-co/web`. Los estilos propios van aparte en `web/styles.css`.
- **ES/EN** con `?lang=en` o el botón EN/ES; los enlaces a la Sala y al Radar conservan el idioma. Modo claro/oscuro según el sistema, mobile-first y `prefers-reduced-motion` (el "tren" del mapa de líneas no se mueve).

### Estructura

```
web/                  lo que se publica (index.html, styles.css, app.js, identidad común)
vercel.json           redirects y rewrites
scripts/servidor-local.mjs   imita vercel.json en local (redirects + proxy)
scripts/verificar.mjs        capturas 390/1280 px, axe WCAG 2.1 AA y prueba de los rewrites
docs/capturas/        capturas y resultado.json de la última verificación
```

### Correrlo y verificarlo en local

Requisitos: Node 18 o superior.

```bash
npm install
npm run dev                  # http://localhost:4321, /sala/ y /radar/ van a Vercel
npm run dev -- --local       # /sala/ y /radar/ salen de ../sala-de-espera/dist y ../radar-gov-co
npm run verificar -- --local # capturas + axe + rewrites (necesita `npm run build` en sala-de-espera)
```

Última verificación (2026-10-05, modo `--local`): **axe 0 incumplimientos** WCAG 2.1 A/AA en 8 combinaciones (390 y 1280 px, claro y oscuro, ES y EN), sin desborde horizontal, y `/sala/` y `/radar/` cargan todos sus recursos.

### Despliegue (pasos para Jairo)

1. **Subir primero el commit pendiente de `sala-de-espera`** ("Rutas relativas para servir la sala también bajo /sala/ del portafolio") con GitHub Desktop y esperar a que Vercel lo publique. Sin ese commit, `/sala/` carga el HTML pero no su CSS ni su JS (la versión publicada hoy pide `/assets/...` en la raíz).
2. En GitHub Desktop: *File → Add local repository* → esta carpeta `portafolio` → *Publish repository* (nombre sugerido: `portafolio`, público).
3. En Vercel: *Add New → Project* → importar el repo `portafolio`. Framework: **Other**. No hay que cambiar nada más: `vercel.json` ya define que no hay build y que se publica `web/`.
4. Abrir la URL que asigne Vercel y probar `/`, `/sala`, `/radar` y la pestaña API. Si quieres un nombre corto (por ejemplo `jairo-sierra.vercel.app`), cámbialo en *Settings → Domains*.
5. Opcional: poner esa URL en el perfil de GitHub y en LinkedIn (sección Destacados).

### Qué revisar si algo se cae

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `/sala/` o `/radar/` sale sin estilos o en blanco | El proyecto pide recursos con rutas absolutas (`/assets/...`) | Revisar que la Sala tenga `base: './'` en `vite.config.mjs` y esté publicada; en la consola del navegador se ven los 404 |
| `/sala/` o `/radar/` da 404 o error 502 | Cambió la URL del despliegue de ese proyecto o está caído | Abrir la URL directa (tabla de arriba); si cambió, actualizar el `destination` en `vercel.json` |
| La Sala dice "Cargando datos…" mucho rato | La API de Render (plan gratis) estaba dormida | Esperar hasta un minuto; si no responde, revisar `/health` de la API y su README |
| La pestaña API tarda en abrir | Mismo motivo: Render despierta la API | Normal en el plan gratis |
| El Radar muestra datos viejos | El workflow semanal de `radar-gov-co` falló o GitHub lo desactivó tras 60 días sin commits | Revisar la pestaña *Actions* de ese repo |
| Cambié algo en la Sala o el Radar y no aparece aquí | Los rewrites muestran lo que esté publicado en cada proyecto | Confirmar que el despliegue de ese proyecto terminó; aquí no hay que redesplegar |

---

## English

Central portfolio site with **Home**, **API**, **Waiting room** and **Radar** tabs. It presents the three projects as lines of one system (shared "Routes" visual identity): **B** Backend = open-data API (linked, `/api` redirects to it), **D** Data = The waiting room (`/sala/`, rewrite to https://sala-de-espera-bice.vercel.app), **Q** QA = Radar .gov.co (`/radar/`, rewrite to https://radar-gov-co.vercel.app). Each project keeps its own repo, workflows, README and deployment.

### Decisions

- **Static HTML + CSS + JS, no build step.** One page doesn't need Vite or React, and one less build is one less thing that can break. Vercel publishes `web/` as is.
- **Rewrites instead of copying the projects**, so each project updates only in its own repo.
- **`/sala` and `/radar` redirect to `/sala/` and `/radar/`** because both projects load their assets with relative paths.
- **Shared identity untouched:** `tokens.css`, `components.css`, favicons and `marca/` are exact copies from `radar-gov-co/web`; site styles live in `web/styles.css`.
- **ES/EN** via `?lang=en` or the EN/ES button (links to the projects keep the language), light/dark from the system, mobile-first, and `prefers-reduced-motion` is respected.

### Run and verify locally

```bash
npm install
npm run dev                  # http://localhost:4321, /sala/ and /radar/ proxied to Vercel
npm run dev -- --local       # /sala/ and /radar/ served from the sibling folders
npm run verificar -- --local # screenshots + axe + rewrites check
```

Last check (2026-10-05, `--local`): **0 axe violations** (WCAG 2.1 A/AA) across 390/1280 px, light/dark and ES/EN, no horizontal overflow, and `/sala/` and `/radar/` load all their assets.

### Deployment

1. Push the pending `sala-de-espera` commit (relative asset paths) first and wait for Vercel to publish it; otherwise `/sala/` loads without its CSS and JS.
2. GitHub Desktop: *Add local repository* → `portafolio` → *Publish repository*.
3. Vercel: *Add New → Project* → import `portafolio`, framework **Other**. `vercel.json` already sets no build and `web/` as output.
4. Open the Vercel URL and test `/`, `/sala`, `/radar` and the API tab.

### If something breaks

- **`/sala/` or `/radar/` has no styles:** the project requests absolute paths (`/assets/...`); check Sala's `base: './'` is deployed.
- **404/502 under `/sala/` or `/radar/`:** that project's URL changed or is down; update `destination` in `vercel.json`.
- **Slow API or "Loading data…":** Render's free plan was asleep; wait up to a minute and check the API's `/health`.
- **Stale Radar data:** check the Actions tab of `radar-gov-co` (GitHub disables scheduled workflows after 60 days without commits).

Contact: [linkedin.com/in/jairo-andres31-analyst](https://www.linkedin.com/in/jairo-andres31-analyst)
