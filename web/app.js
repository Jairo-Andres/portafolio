// Idioma ES/EN: ?lang=en en la URL o el botón EN/ES (se recuerda en este navegador).
// El español está escrito en el HTML; aquí solo va el inglés y se guarda el original.

const EN = {
  skip: "Skip to content",
  brandLabel: "Jairo Sierra, home",
  navLabel: "Projects",
  tabHome: "Home",
  tabSala: "Waiting room",
  eyebrow: "Systems Engineering · Pontificia Universidad Javeriana · Bogotá",
  heroTitle: 'Three lines, one system: <span class="hl-b">backend</span>, <span class="hl-d">data</span> and <span class="hl-q">QA</span>.',
  lead: "I'm Jairo Andrés Sierra, a final-semester Systems Engineering student. I'm looking for my first junior role as a Backend developer, QA Automation engineer or Data Analyst.",
  lead2: "These three projects work with Colombian public data and are connected: an API that unifies open data, a dashboard that explains it and a radar that audits government websites.",
  ctaRoutes: "See the three routes",
  mapTitle: "Line map",
  lineB: "Line B, Backend",
  lineD: "Line D, Data",
  lineQ: "Line Q, QA",
  stB1: "datos.gov.co",
  stB2: "pandas ETL",
  stQ1: "30 .gov.co websites",
  stQ4: "Weekly ranking",
  routesTitle: "The three routes",
  stack: "Technologies",
  kickerB: "Line B · Backend",
  titleB: "Medical appointment wait-time API",
  sumB: "Some public hospitals publish on datos.gov.co how many days patients wait for an appointment, each with different columns, periods and formats. A pandas ETL downloads, cleans and unifies them (plus the Clicsalud 2016–2021 archive) and a REST API serves them.",
  noteB: "Free plan: the first request can take up to a minute while the API wakes up.",
  demoB: "Open the API",
  docsB: "Documentation",
  repo: "Code on GitHub",
  kickerD: "Line D · Data",
  titleD: "The waiting room",
  sumD: "A dashboard that consumes the API and shows how many days patients wait for a medical appointment, according to what each hospital publishes: a queue display, clocks, one chair per day of waiting and explorable charts, without drawing conclusions the data can't support.",
  demoD: "Enter the waiting room",
  kickerQ: "Line Q · QA",
  sumQ: "A weekly automated audit of 30 Colombian government websites: accessibility (WCAG 2.1 AA), mobile, performance and best practices, published as a ranking. Normal visitor traffic only: a few pages per site, with pauses and respecting robots.txt.",
  demoQ: "See the radar",
  footer1: "Contact:",
  footer2: 'Shared visual identity "Routes": each project is a line with its own color and letter. Static site on Vercel.',
};

const STORE_KEY = "ja-lang";
const original = new Map();

function readLang() {
  const param = new URLSearchParams(location.search).get("lang");
  if (param === "en" || param === "es") return param;
  try { return localStorage.getItem(STORE_KEY) === "en" ? "en" : "es"; } catch { return "es"; }
}

function remember(el, key, value) {
  if (!original.has(el)) original.set(el, {});
  const saved = original.get(el);
  if (!(key in saved)) saved[key] = value;
  return saved[key];
}

function apply(lang) {
  const en = lang === "en";
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const es = remember(el, "text", el.textContent);
    el.textContent = en ? EN[el.dataset.i18n] ?? es : es;
  });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const es = remember(el, "html", el.innerHTML);
    el.innerHTML = en ? EN[el.dataset.i18nHtml] ?? es : es;
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const es = remember(el, "aria", el.getAttribute("aria-label"));
    el.setAttribute("aria-label", en ? EN[el.dataset.i18nAria] ?? es : es);
  });
  // Los proyectos también aceptan ?lang=en: el enlace conserva el idioma elegido.
  document.querySelectorAll("[data-lang-link]").forEach((el) => {
    const url = new URL(el.getAttribute("href"), location.href);
    if (en) url.searchParams.set("lang", "en"); else url.searchParams.delete("lang");
    el.setAttribute("href", url.origin === location.origin ? url.pathname + url.search : url.href);
  });

  const toggle = document.getElementById("lang-toggle");
  toggle.textContent = en ? "ES" : "EN";
  toggle.lang = en ? "es" : "en";
  toggle.setAttribute("aria-label", en ? "Leer en español" : "Read in English");
}

let lang = readLang();
apply(lang);

document.getElementById("lang-toggle").addEventListener("click", () => {
  lang = lang === "en" ? "es" : "en";
  try { localStorage.setItem(STORE_KEY, lang); } catch { /* sin almacenamiento: solo esta visita */ }
  const url = new URL(location.href);
  if (lang === "en") url.searchParams.set("lang", "en"); else url.searchParams.delete("lang");
  history.replaceState(null, "", url);
  apply(lang);
});
