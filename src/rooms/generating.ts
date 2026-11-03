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
    <p class="lede">A linear recurrence with constant coefficients has generating function G(x) = P(x)/Q(x). The lab writes that fraction, splits it by cover-up, and plots a<sub>n</sub> against the closed form. The ratio a<sub>n+1</sub>/a<sub>n</sub> tends to the dominant characteristic root.</p>
    <div class="formula" id="box"></div>
    <div class="toolbar">
      <label>preset
        <select id="preset"></select>
      </label>
      <label>n up to
        <input id="nmax" type="number" min="6" max="40" value="16">
      </label>
    </div>
    <div class="grid two">
      <div class="card"><h3>a<sub>n</sub></h3><p class="cap">Dots from the recurrence; line from the closed form.</p><div class="stage plot" id="seq"></div></div>
      <div class="card"><h3>ratio a<sub>n+1</sub>/a<sub>n</sub></h3><p class="cap">Should approach the largest |root| of C(t)=0.</p><div class="stage plot" id="ratio"></div></div>
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
  const nmax = root.querySelector("#nmax") as HTMLInputElement;

  function render(): void {
    const r: Recurrence = PRESETS[Number(sel.value)];
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
  render();
}

function toHtml(tex: string): string {
  return tex
    .replaceAll("\\dfrac{", "<span>")
    .replaceAll("\\cdot ", " · ")
    .replaceAll("^{", "<sup>")
    .replaceAll("}", "</span>")
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
  clear(host);
  const W = 420, H = 220, pad = 28;
  const svg = svgRoot(W, H);
  const vals = a.filter((x) => Number.isFinite(x));
  const ymin = Math.min(0, ...vals);
  const ymax = Math.max(1, ...vals);
  const x = (i: number) => pad + (i * (W - 2 * pad)) / Math.max(a.length - 1, 1);
  const y = (v: number) => H - pad - ((v - ymin) / (ymax - ymin || 1)) * (H - 2 * pad);
  svg.append(svgEl("line", { x1: pad, y1: y(0), x2: W - pad, y2: y(0), stroke: "#d8d0c2" }));
  const pts = a
    .map((v, i) => (skipNaN && !Number.isFinite(v) ? null : `${x(i)},${y(v)}`))
    .filter((s): s is string => s !== null)
    .join(" ");
  svg.append(svgEl("polyline", { points: pts, fill: "none", stroke: "#0f766e", "stroke-width": 2 }));
  a.forEach((v, i) => {
    if (skipNaN && !Number.isFinite(v)) return;
    svg.append(svgEl("circle", { cx: x(i), cy: y(v), r: 3, fill: "#1e3a5f" }));
  });
  if (overlay.length) {
    const op = overlay.map((v, i) => `${x(i)},${y(v)}`).join(" ");
    svg.append(svgEl("polyline", { points: op, fill: "none", stroke: "#9a3412", "stroke-width": 1.4, "stroke-dasharray": "4 3" }));
  }
  host.append(svg);
}
