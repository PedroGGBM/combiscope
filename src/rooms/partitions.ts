import {
  conjugate,
  hooksToOddParts,
  isPartition,
  isSelfConjugate,
  oddPartsToSelfConjugate,
  partitionGfPrefix,
  PRESET_N8,
  type Partition,
  weight,
} from "../lib/ferrers";
import { clear, svgEl, svgRoot } from "../lib/svg";

function parseParts(s: string): Partition {
  return s
    .split(/[,\s+]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => Number.isFinite(n));
}

export function mountPartitions(root: HTMLElement): void {
  root.innerHTML = `
    <p class="lede">A Ferrers diagram is the picture of a partition: left-justified rows, weakly decreasing. Conjugation swaps rows and columns. The L-hook bijection of Brualdi Theorem 8.3.2 identifies self-conjugate diagrams with partitions into distinct odd parts.</p>
    <div class="formula">Σ p(n) x<sup>n</sup> = Π<sub>k≥1</sub> 1/(1 − x<sup>k</sup>). Self-conjugate diagrams of n are equinumerous with partitions of n into distinct odd parts.</div>
    <div class="toolbar">
      <label>partition λ (comma or +)
        <input id="parts" value="4,2,1,1" size="16">
      </label>
      <button class="plain" id="go" type="button">Draw</button>
      <button class="plain ghost" id="conj" type="button">Conjugate</button>
      <button class="plain ghost" id="p1" type="button">n=8 · 4+2+1+1</button>
      <button class="plain ghost" id="p2" type="button">n=8 · 3+3+2</button>
    </div>
    <p class="err" id="err"></p>
    <div class="grid three">
      <div class="card"><h3>Ferrers diagram</h3><p class="cap" id="cap-a"></p><div class="stage" id="fa"></div></div>
      <div class="card"><h3>Conjugate λ′</h3><p class="cap" id="cap-b"></p><div class="stage" id="fb"></div></div>
      <div class="card"><h3>L-hooks / odd parts</h3><p class="cap" id="cap-c"></p><div class="stage" id="fc"></div></div>
    </div>
    <h2 style="margin:22px 0 8px">Euler product, truncated</h2>
    <p class="caption">Coefficients of Π<sub>k=1</sub><sup>20</sup> 1/(1−x<sup>k</sup>) agree with p(n) for n ≤ 20. There is no closed formula for p(n) in this course; the product is the answer.</p>
    <div class="card"><table class="nums" id="pn"></table></div>
  `;

  const input = root.querySelector("#parts") as HTMLInputElement;
  const err = root.querySelector("#err") as HTMLElement;

  function setParts(p: Partition): void {
    input.value = p.join(",");
    draw();
  }

  function draw(): void {
    err.textContent = "";
    const p = parseParts(input.value).sort((a, b) => b - a);
    if (!isPartition(p) || p.length === 0) {
      err.textContent = "Enter a nonincreasing list of positive integers, e.g. 4,2,1,1.";
      return;
    }
    const c = conjugate(p);
    (root.querySelector("#cap-a") as HTMLElement).textContent = `λ = ${p.join("+")}, n = ${weight(p)}${isSelfConjugate(p) ? " · self-conjugate" : ""}`;
    (root.querySelector("#cap-b") as HTMLElement).textContent = `λ′ = ${c.join("+")}. Number of parts of λ′ equals the largest part of λ.`;
    drawFerrers(root.querySelector("#fa") as HTMLElement, p, isSelfConjugate(p));
    drawFerrers(root.querySelector("#fb") as HTMLElement, c, false);

    const capC = root.querySelector("#cap-c") as HTMLElement;
    const fc = root.querySelector("#fc") as HTMLElement;
    if (isSelfConjugate(p)) {
      const odds = hooksToOddParts(p);
      capC.textContent = `hooks → ${odds.join("+")}. Reverse rebuilds λ.`;
      drawFerrers(fc, p, true, true);
    } else {
      capC.textContent = "The hook map needs a self-conjugate diagram. Try 4+2+1+1 or 3+3+2.";
      clear(fc);
    }
  }

  root.querySelector("#go")!.addEventListener("click", draw);
  input.addEventListener("change", draw);
  root.querySelector("#conj")!.addEventListener("click", () => {
    const p = parseParts(input.value).sort((a, b) => b - a);
    if (isPartition(p) && p.length) setParts(conjugate(p));
  });
  root.querySelector("#p1")!.addEventListener("click", () => setParts(PRESET_N8[0].sc));
  root.querySelector("#p2")!.addEventListener("click", () => setParts(PRESET_N8[1].sc));

  const pn = root.querySelector("#pn") as HTMLTableElement;
  const gf = partitionGfPrefix(20, 20);
  pn.innerHTML = `<tr><th>n</th>${[...Array(11).keys()].map((n) => `<th>${n}</th>`).join("")}</tr>` +
    `<tr><th>p(n)</th>${gf.slice(0, 11).map((v) => `<td>${v}</td>`).join("")}</tr>` +
    `<tr><th>n</th>${[...Array(10).keys()].map((n) => `<th>${n + 11}</th>`).join("")}</tr>` +
    `<tr><th>p(n)</th>${gf.slice(11, 21).map((v) => `<td>${v}</td>`).join("")}</tr>`;

  draw();
}

function drawFerrers(host: HTMLElement, p: Partition, highlightDurfee = false, hooks = false): void {
  clear(host);
  const cell = 18;
  const rows = p.length;
  const cols = p[0] ?? 0;
  const svg = svgRoot(cols * cell + 8, rows * cell + 8);
  let durfee = 0;
  while (durfee < rows && p[durfee] >= durfee + 1) durfee++;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < p[i]; j++) {
      let fill = "#1e3a5f";
      if (highlightDurfee && i < durfee && j < durfee) fill = "#0f766e";
      if (hooks) {
        for (let h = 0; h < durfee; h++) {
          const arm = p[h] - (h + 1);
          if ((i === h && j >= h && j <= h + arm) || (j === h && i >= h && i <= h + arm)) {
            fill = hookColor(h);
          }
        }
      }
      svg.append(svgEl("rect", {
        x: 4 + j * cell,
        y: 4 + i * cell,
        width: cell - 2,
        height: cell - 2,
        rx: 3,
        fill,
      }));
    }
  }
  host.append(svg);
}

function hookColor(i: number): string {
  const pal = ["#9a3412", "#0f766e", "#1e3a5f", "#b45309", "#44403c"];
  return pal[i % pal.length];
}
