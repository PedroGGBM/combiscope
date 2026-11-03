import { mountCatalan } from "./rooms/catalan";
import { mountGenerating } from "./rooms/generating";
import { mountPartitions } from "./rooms/partitions";
import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("#app missing");

const initialTheme = readTheme();
document.documentElement.classList.remove("light", "dark");
document.documentElement.classList.add(initialTheme);

app.innerHTML = `
  <div class="abstract-stage" aria-hidden="true">
    <div class="abstract-field" id="field"></div>
    <div class="abstract-field abstract-field-shift" id="shift"></div>
    <div class="readability-scrim"></div>
  </div>
  <div class="film-grain" aria-hidden="true"></div>
  <div class="wrap">
    <div class="bar">
      <a class="home" href="https://pedroggbm.com">pedroggbm.com</a>
      <button type="button" class="icon-btn" id="theme" aria-label="Switch theme">${themeIcon(initialTheme)}</button>
    </div>
    <header class="top">
      <div class="kicker">70240384 · combinatorics and algorithms design</div>
      <h1>combiscope</h1>
      <p class="lede">Catalan bijections, Ferrers diagrams, G(x) for a linear recurrence. Pick a room.</p>
      <nav class="rooms" aria-label="Rooms">
        <button type="button" data-room="catalan" aria-current="page">catalan</button>
        <button type="button" data-room="parts">partitions</button>
        <button type="button" data-room="gf">generating functions</button>
      </nav>
    </header>
    <section class="panel active" id="catalan"></section>
    <section class="panel" id="parts"></section>
    <section class="panel" id="gf"></section>
    <footer class="site">
      pedro gronda garrigues · 2026280058 · tsinghua 70240384 ·
      <a href="https://github.com/PedroGGBM/combiscope">source</a>
    </footer>
  </div>
`;

mountCatalan(app.querySelector("#catalan") as HTMLElement);
mountPartitions(app.querySelector("#parts") as HTMLElement);
mountGenerating(app.querySelector("#gf") as HTMLElement);

const panels = app.querySelectorAll(".panel");
const buttons = app.querySelectorAll<HTMLButtonElement>("nav.rooms button");
for (const b of buttons) {
  b.addEventListener("click", () => {
    const id = b.dataset.room;
    buttons.forEach((x) => x.removeAttribute("aria-current"));
    b.setAttribute("aria-current", "page");
    panels.forEach((p) => p.classList.toggle("active", p.id === id));
  });
}

const themeBtn = app.querySelector("#theme") as HTMLButtonElement;
themeBtn.addEventListener("click", () => {
  const next = document.documentElement.classList.contains("dark") ? "light" : "dark";
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(next);
  localStorage.setItem("theme", next);
  themeBtn.innerHTML = themeIcon(next);
  themeBtn.setAttribute("aria-label", next === "dark" ? "Switch to light" : "Switch to dark");
});

orbitBackground(
  app.querySelector("#field") as HTMLElement,
  app.querySelector("#shift") as HTMLElement,
);

function readTheme(): "dark" | "light" {
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* private mode etc */
  }
  return "dark";
}

function themeIcon(theme: "dark" | "light"): string {
  // same sun/moon idea as the homepage toggle
  if (theme === "dark") {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="4"/><path d="M12 3v1.5M12 19.5V21M4.9 4.9l1.1 1.1M18 18l1.1 1.1M3 12h1.5M19.5 12H21M4.9 19.1l1.1-1.1M18 6l1.1-1.1"/></svg>`;
  }
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z"/></svg>`;
}

function orbitBackground(field: HTMLElement, shift: HTMLElement): void {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    field.style.transform = "scale(1.08)";
    shift.style.transform = "scale(1.08)";
    return;
  }

  const orbit = (phase: number, radius: number, scale: number, breathe: number, spin: number) => {
    const angle = phase * Math.PI * 2;
    const turn = scale + Math.sin(angle) * breathe;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * 0.72;
    return `scale(${turn}) translate3d(${x}%, ${y}%, 0) rotate(${phase * spin}deg)`;
  };

  let last = performance.now();
  let phase = 0;
  let phaseAlt = 0.37;
  let mode: "auto" | "scroll" = "auto";
  let lastScroll = window.scrollY;
  let resumeTimer = 0;

  const paint = () => {
    field.style.transform = orbit(phase, 11, 1.32, 0.1, 18);
    shift.style.transform = orbit(phaseAlt + 0.47, 13, 1.26, 0.12, -14);
  };

  const tick = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (mode === "auto") {
      phase += dt / 14;
      phaseAlt += dt / 21;
      paint();
    }
    requestAnimationFrame(tick);
  };

  window.addEventListener(
    "scroll",
    () => {
      const next = window.scrollY;
      const delta = next - lastScroll;
      lastScroll = next;
      if (delta === 0) return;
      mode = "scroll";
      phase += delta * 0.00022;
      phaseAlt += delta * 0.00017;
      paint();
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(() => {
        mode = "auto";
        last = performance.now();
      }, 1000);
    },
    { passive: true },
  );

  paint();
  requestAnimationFrame(tick);
}
