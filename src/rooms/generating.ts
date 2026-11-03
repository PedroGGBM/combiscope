import {
  closedFormLatex,
  evalClosed,
  generatingFunction,
  PRESETS,
  sequence,
  type Recurrence,
} from "../lib/recurrence";
import { clear, svgEl, svgRoot } from "../lib/svg";

export function mountGenerating(root: HTMLElement): void {
  root.innerHTML = `
    <p class="lede">Type of thing from HW 7–8: a<sub>n</sub> from a linear recurrence, then G(x)=P/Q, then the closed form. Right-hand plot is a<sub>n+1</sub>/a<sub>n</sub>, which should crawl toward the biggest root.</p>
    <div class="formula" id="box"></div>
    <div class="toolbar">
      <label>preset
        <select id="preset"></select>
      </label>
      <label>n up to
        <input id="nmax" type="number" min="6" max="40" value="16">
      </label>
      <div class="custom-row" id="custom" hidden>
        <label>coeffs c1,c2,…
          <input id="coeffs" value="1,1" size="10">
        </label>
        <label>init a0,a1,…
          <input id="init" value="0,1" size="10">
        </label>
        <label>inhomog b
          <input id="inhomog" type="number" value="0">
        </label>
      </div>
    </div>
    <p class="err" id="gerr"></p>
    <div class="grid two">
      <div class="card"><h3>a<sub>n</sub></h3><p class="cap">Dots = recurrence. Dashed line = closed form (hopefully on top of the dots).</p><div class="stage plot" id="seq"></div></div>
      <div class="card"><h3>ratio a<sub>n+1</sub>/a<sub>n</sub></h3><p class="cap">→ largest |root| of C(t)=0, if the solver didn't mess up.</p><div class="stage plot" id="ratio"></div></div>
    </div>
    <div class="card" style="margin-top:14px"><table class="nums" id="tab"></table></div>
  `;

  const sel = root.querySelector("#preset") as HTMLSelectElement;
  for (let i = 0; i < PRESETS.length; i++) {
    const o = document.createElement("option");
    o.value = String(i);
    o.textContent = PRESETS[i].name;
    sel.append(o);
  }
  const customOpt = document.createElement("option");
  customOpt.value = "custom";
  customOpt.textContent = "custom (type one)";
  sel.append(customOpt);
  const nmax = root.querySelector("#nmax") as HTMLInputElement;
  const customRow = root.querySelector("#custom") as HTMLElement;
  const err = root.querySelector("#gerr") as HTMLElement;

  function current(): Recurrence | null {
    if (sel.value !== "custom") return PRESETS[Number(sel.value)];
    const coeffs = parseList((root.querySelector("#coeffs") as HTMLInputElement).value);
    const init = parseList((root.querySelector("#init") as HTMLInputElement).value);
    const inhomog = Number((root.querySelector("#inhomog") as HTMLInputElement).value);
    if (!coeffs.length || coeffs.length > 3 || !init.length || !Number.isFinite(inhomog)) {
      return null;
    }
    return {
      name: "custom",
      coeffs,
      init,
      inhomog,
      note: "typed in. order ≤ 3.",
    };
  }

  function render(): void {
    customRow.hidden = sel.value !== "custom";
    err.textContent = "";
    const r = current();
    if (!r) {
      err.textContent = "Need 1–3 coeffs and at least a0. Example: coeffs 1,1 and init 0,1.";
      return;
    }
    const N = Number(nmax.value);
    const a = sequence(r, N);
    const { latex } = generatingFunction(r);
    const closed = closedFormLatex(r);
    (root.querySelector("#box") as HTMLElement).innerHTML =
      `<div>${r.note}</div><div style="margin-top:6px"><strong>G(x)</strong> = ${toHtml(latex)}</div><div><strong>a<sub>n</sub></strong> ≈ ${toHtml(closed)}</div>`;
    plotSeq(root.querySelector("#seq") as HTMLElement, a, a.map((_, n) => evalClosed(r, n)));
    const ratios = [];
    for (let n = 1; n < a.length; n++) {
      ratios.push(a[n - 1] === 0 ? NaN : a[n] / a[n - 1]);
    }
    plotSeq(root.querySelector("#ratio") as HTMLElement, ratios, [], true);
    const tab = root.querySelector("#tab") as HTMLTableElement;
    tab.innerHTML = `<tr><th>n</th>${a.map((_, i) => `<th>${i}</th>`).join("")}</tr>` +
      `<tr><th>a<sub>n</sub></th>${a.map((v) => `<td>${formatInt(v)}</td>`).join("")}</tr>`;
  }

  sel.addEventListener("change", render);
  nmax.addEventListener("change", render);
  for (const id of ["coeffs", "init", "inhomog"]) {
    root.querySelector("#" + id)!.addEventListener("change", render);
  }
  render();
}

function parseList(s: string): number[] {
  return s
    .split(/[,\s]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => Number.isFinite(n));
}

function toHtml(tex: string): string {
  // not a real TeX parser. enough for the P/Q we actually print.
  return tex
    .replace(/\\dfrac\{([^{}]+)\}\{([^{}]+)\}/g, "($1) / ($2)")
    .replaceAll("\\cdot ", " · ")
    .replaceAll("^{", "<sup>")
    .replaceAll("}", "</sup>")
    .replaceAll("{", "")
    .replaceAll("\\,", " ")
    .replaceAll("\\text{(could not factor)}", "(could not factor)");
}

function formatInt(v: number): string {
  if (!Number.isFinite(v)) return "—";
  if (Math.abs(v - Math.round(v)) < 1e-6) return String(Math.round(v));
  return v.toFixed(3);
}

function plotSeq(host: HTMLElement, a: number[], overlay: number[] = [], skipNaN = false): void {
  // dots from the recurrence. dashed line = closed form, if we got one.
  clear(host);
  const W = 420, H = 220, pad = 28;
  const svg = svgRoot(W, H);
  const vals = a.filter((x) => Number.isFinite(x));
  const ymin = Math.min(0, ...vals);
  const ymax = Math.max(1, ...vals);
  const x = (i: number) => pad + (i * (W - 2 * pad)) / Math.max(a.length - 1, 1);
  const y = (v: number) => H - pad - ((v - ymin) / (ymax - ymin || 1)) * (H - 2 * pad);
  svg.append(svgEl("line", { x1: pad, y1: y(0), x2: W - pad, y2: y(0), stroke: "var(--grid)" }));
  const pts = a
    .map((v, i) => (skipNaN && !Number.isFinite(v) ? null : `${x(i)},${y(v)}`))
    .filter((s): s is string => s !== null)
    .join(" ");
  svg.append(svgEl("polyline", { points: pts, fill: "none", stroke: "var(--path)", "stroke-width": 2 }));
  a.forEach((v, i) => {
    if (skipNaN && !Number.isFinite(v)) return;
    svg.append(svgEl("circle", { cx: x(i), cy: y(v), r: 3, fill: "var(--ink)" }));
  });
  if (overlay.length) {
    const op = overlay.map((v, i) => `${x(i)},${y(v)}`).join(" ");
    svg.append(svgEl("polyline", { points: op, fill: "none", stroke: "var(--path-alt)", "stroke-width": 1.4, "stroke-dasharray": "4 3" }));
  }
  host.append(svg);
}
