import {
  allDyck,
  allMonoPaths,
  catalan,
  dyckToHandshakes,
  dyckToParens,
  dyckToPath,
  dyckToStack,
  dyckToTree,
  dyckToTriangulation,
  type BinTree,
  type Dyck,
  type LatticePoint,
  type MonoPath,
  reflectBadPrefix,
} from "../lib/catalan";
import { clear, svgEl, svgRoot } from "../lib/svg";

export function mountCatalan(root: HTMLElement): void {
  root.innerHTML = `
    <p class="lede">Same Dyck word, drawn a few different ways. Move n and the object index. The pictures should all match. Reflection is underneath.</p>
    <div class="formula">C<sub>n</sub> = 1/(n+1) · (2n choose n) = Σ<sub>k</sub> C<sub>k</sub> C<sub>n−1−k</sub>, with C<sub>0</sub> = 1. For n = 3 the five stack words are 123, 132, 213, 231, 321; 312 is missing because 2 sits under 1 after 3 is popped.</div>
    <div class="toolbar">
      <label>n (semilength)
        <input id="cn" type="range" min="1" max="6" value="3">
      </label>
      <label>object index
        <input id="ci" type="range" min="0" max="4" value="0">
      </label>
      <div id="cstats"></div>
    </div>
    <div class="grid five" id="cards"></div>
    <h2>reflection principle。</h2>
    <p class="caption">East and North from (0,0) to (n,n). Bad = touches x − y = 1. Reflect that prefix and you start at (1,−1). There are (2n choose n−1) of those, leftover is C<sub>n</sub>.</p>
    <div class="toolbar">
      <label>bad path
        <input id="bp" type="range" min="0" max="0" value="0">
      </label>
      <button class="plain" id="step" type="button">Next bad path</button>
    </div>
    <div class="grid two">
      <div class="card"><h3>original path</h3><div class="stage" id="orig"></div></div>
      <div class="card"><h3>reflected prefix</h3><div class="stage" id="refl"></div></div>
    </div>
  `;

  const nEl = root.querySelector("#cn") as HTMLInputElement;
  const iEl = root.querySelector("#ci") as HTMLInputElement;
  const stats = root.querySelector("#cstats") as HTMLElement;
  const cards = root.querySelector("#cards") as HTMLElement;
  const bpEl = root.querySelector("#bp") as HTMLInputElement;
  const orig = root.querySelector("#orig") as HTMLElement;
  const refl = root.querySelector("#refl") as HTMLElement;

  let words: Dyck[] = [];
  let bad: MonoPath[] = [];

  function renderCards(): void {
    const n = Number(nEl.value);
    words = allDyck(n);
    iEl.max = String(words.length - 1);
    if (Number(iEl.value) >= words.length) iEl.value = "0";
    const i = Number(iEl.value);
    const w = words[i];
    stats.innerHTML = `<strong>C<sub>${n}</sub> = ${catalan(n)}</strong> &nbsp; object ${i + 1} of ${words.length}: <code>${w}</code> = ${dyckToParens(w)}`;
    cards.innerHTML = "";
    const views: [string, string, (host: HTMLElement) => void][] = [
      ["dyck path", "X = North, Y = East. Stays on or above the diagonal.", (h) => drawPath(h, dyckToPath(w), n)],
      ["parentheses", "X = '(', Y = ')'. Every prefix is balanced.", (h) => drawText(h, dyckToParens(w))],
      ["stack pops", "Push 1..n in order. X = push, Y = pop.", (h) => drawText(h, dyckToStack(w).join(" "))],
      ["plane binary tree", "First-return split: w = X A Y B.", (h) => drawTree(h, dyckToTree(w))],
      ["polygon triangulation", `convex (${n + 2})-gon. base edge 0 – ${n + 1}.`, (h) => drawPoly(h, n + 2, dyckToTriangulation(w))],
    ];
    for (const [title, cap, draw] of views) {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `<h3>${title}</h3><p class="cap">${cap}</p><div class="stage"></div>`;
      draw(card.querySelector(".stage") as HTMLElement);
      cards.append(card);
    }
    const extra = document.createElement("div");
    extra.className = "card";
    extra.innerHTML = `<h3>noncrossing handshakes</h3><p class="cap">2n seats around a circle, n chords, no crossings.</p><div class="stage"></div>`;
    drawHands(extra.querySelector(".stage") as HTMLElement, 2 * n, dyckToHandshakes(w));
    cards.append(extra);

    bad = allMonoPaths(n).filter((p) => p.badIndex >= 0);
    bpEl.max = String(Math.max(0, bad.length - 1));
    if (Number(bpEl.value) >= bad.length) bpEl.value = "0";
    drawReflection();
  }

  function drawReflection(): void {
    const n = Number(nEl.value);
    const path = bad[Number(bpEl.value)];
    if (!path) {
      orig.textContent = "No bad paths at this n.";
      refl.textContent = "";
      return;
    }
    drawPath(orig, path.points, n, path.badIndex);
    drawPath(refl, reflectBadPrefix(path), n, path.badIndex, true);
  }

  nEl.addEventListener("input", renderCards);
  iEl.addEventListener("input", renderCards);
  bpEl.addEventListener("input", drawReflection);
  root.querySelector("#step")!.addEventListener("click", () => {
    if (!bad.length) return;
    bpEl.value = String((Number(bpEl.value) + 1) % bad.length);
    drawReflection();
  });
  renderCards();
}

function drawText(host: HTMLElement, s: string): void {
  clear(host);
  const svg = svgRoot(200, 80);
  svg.append(svgEl("text", { x: 100, y: 48, "text-anchor": "middle", "font-size": 22, fill: "var(--ink)", "font-family": "Lexend, system-ui, sans-serif" }, s));
  host.append(svg);
}

function drawPath(host: HTMLElement, pts: LatticePoint[], n: number, mark = -1, reflected = false): void {
  clear(host);
  const pad = 28;
  const W = 240, H = 240;
  const s = (W - 2 * pad) / Math.max(n + 1, 2);
  const x = (p: LatticePoint) => pad + p.x * s;
  const y = (p: LatticePoint) => H - pad - p.y * s;
  const svg = svgRoot(W, H);
  for (let i = 0; i <= n; i++) {
    svg.append(svgEl("line", { x1: x({ x: 0, y: i }), y1: y({ x: 0, y: i }), x2: x({ x: n, y: i }), y2: y({ x: n, y: i }), stroke: "var(--grid)" }));
    svg.append(svgEl("line", { x1: x({ x: i, y: 0 }), y1: y({ x: i, y: 0 }), x2: x({ x: i, y: n }), y2: y({ x: i, y: n }), stroke: "var(--grid)" }));
  }
  svg.append(svgEl("line", { x1: x({ x: 0, y: 0 }), y1: y({ x: 0, y: 0 }), x2: x({ x: n, y: n }), y2: y({ x: n, y: n }), stroke: "var(--path-alt)", "stroke-dasharray": "4 3", opacity: 0.45 }));
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${x(p)} ${y(p)}`).join(" ");
  svg.append(svgEl("path", { d, fill: "none", stroke: reflected ? "var(--path-alt)" : "var(--path)", "stroke-width": 2.4, "stroke-linejoin": "round", "stroke-dasharray": reflected ? "6 4" : "none" }));
  if (mark >= 0 && pts[mark]) {
    svg.append(svgEl("circle", { cx: x(pts[mark]), cy: y(pts[mark]), r: 5, fill: "var(--mark)" }));
  }
  host.append(svg);
}

type Point = { x: number; y: number };

function layoutTree(t: ReturnType<typeof dyckToTree>, x: number, y: number, span: number, acc: { x: number; y: number; left?: Point; right?: Point }[] = [], idx = { n: 0 }): number {
  // naive layout. trees get cramped at n=6, still readable-ish.
  if (!t) return -1;
  const id = idx.n++;
  const node = { x, y, left: undefined as Point | undefined, right: undefined as Point | undefined };
  acc[id] = node;
  const li = layoutTree(t.left, x - span, y + 46, span / 1.8, acc, idx);
  const ri = layoutTree(t.right, x + span, y + 46, span / 1.8, acc, idx);
  if (li >= 0) node.left = { x: acc[li].x, y: acc[li].y };
  if (ri >= 0) node.right = { x: acc[ri].x, y: acc[ri].y };
  return id;
}

function drawTree(host: HTMLElement, t: BinTree | null): void {
  clear(host);
  const svg = svgRoot(220, 180);
  if (!t) {
    svg.append(svgEl("text", { x: 110, y: 90, "text-anchor": "middle", fill: "var(--path-alt)", "font-family": "Lexend, system-ui, sans-serif" }, "empty"));
    host.append(svg);
    return;
  }
  const nodes: { x: number; y: number; left?: { x: number; y: number }; right?: { x: number; y: number } }[] = [];
  layoutTree(t, 110, 24, 48, nodes);
  for (const nd of nodes) {
    if (nd.left) svg.append(svgEl("line", { x1: nd.x, y1: nd.y, x2: nd.left.x, y2: nd.left.y, stroke: "var(--ink)" }));
    if (nd.right) svg.append(svgEl("line", { x1: nd.x, y1: nd.y, x2: nd.right.x, y2: nd.right.y, stroke: "var(--ink)" }));
  }
  for (const nd of nodes) {
    svg.append(svgEl("circle", { cx: nd.x, cy: nd.y, r: 8, fill: "var(--ink)" }));
  }
  host.append(svg);
}

function drawPoly(host: HTMLElement, m: number, triangles: [number, number, number][]): void {
  clear(host);
  const svg = svgRoot(220, 200);
  const cx = 110, cy = 100, r = 78;
  const pt = (i: number) => {
    const a = (2 * Math.PI * i) / m - Math.PI / 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };
  const verts = Array.from({ length: m }, (_, i) => pt(i));
  for (const [a, b, c] of triangles) {
    svg.append(svgEl("polygon", {
      points: [verts[a], verts[b], verts[c]].map((p) => `${p.x},${p.y}`).join(" "),
      fill: "var(--fill-soft)",
      stroke: "var(--path)",
    }));
  }
  const ring = verts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
  svg.append(svgEl("path", { d: ring, fill: "none", stroke: "var(--ink)", "stroke-width": 1.6 }));
  host.append(svg);
}

function drawHands(host: HTMLElement, seats: number, pairs: [number, number][]): void {
  clear(host);
  const svg = svgRoot(220, 200);
  const cx = 110, cy = 100, r = 72;
  const pt = (i: number) => {
    const a = (2 * Math.PI * i) / seats - Math.PI / 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };
  for (const [a, b] of pairs) {
    const p = pt(a), q = pt(b);
    svg.append(svgEl("line", { x1: p.x, y1: p.y, x2: q.x, y2: q.y, stroke: "var(--path-alt)", "stroke-width": 2 }));
  }
  for (let i = 0; i < seats; i++) {
    const p = pt(i);
    svg.append(svgEl("circle", { cx: p.x, cy: p.y, r: 5, fill: "var(--ink)" }));
  }
  host.append(svg);
}
