/**
 * Linear recurrences → G(x)=P/Q → closed form.
 * Cover-up on distinct linear factors. Order <= 3 in the UI.
 * Brualdi ch. 7.
 */

export interface Recurrence {
  name: string;
  /** a_n = c[0] a_{n-1} + c[1] a_{n-2} + ...  (+ inhomog). */
  coeffs: number[];
  init: number[];
  /** Constant inhomogeneity b in a_n = (homogeneous) + b. */
  inhomog: number;
  note: string;
}

export const PRESETS: Recurrence[] = [
  {
    name: "Fibonacci (F_0=0, F_1=1)",
    coeffs: [1, 1],
    init: [0, 1],
    inhomog: 0,
    note: "Lecture: C(x)=x²−x−1. Binet after you solve it.",
  },
  {
    name: "1×n tilings by squares and dominoes",
    coeffs: [1, 1],
    init: [1, 1],
    inhomog: 0,
    note: "HW 8 Q1. a_n = F_{n+1}. Empty board = 1.",
  },
  {
    name: "Three colours, no two adjacent reds",
    coeffs: [2, 2],
    init: [1, 3],
    inhomog: 0,
    note: "HW 8 Q2. Roots 1±√3.",
  },
  {
    name: "a_n = 3 a_{n-1} + 2, a_0 = 1",
    coeffs: [3],
    init: [1],
    inhomog: 2,
    note: "HW 7. G(x)=(1+x)/((1−x)(1−3x)). Closed form 2·3^n − 1.",
  },
  {
    name: "Towers of Hanoi",
    coeffs: [2],
    init: [0],
    inhomog: 1,
    note: "h_n = 2 h_{n-1} + 1, h_0 = 0. Closed form 2^n − 1.",
  },
];

export function sequence(r: Recurrence, nMax: number): number[] {
  const a = r.init.slice();
  const k = r.coeffs.length;
  while (a.length <= nMax) {
    const n = a.length;
    let s = r.inhomog;
    for (let i = 0; i < k; i++) {
      const prev = n - 1 - i;
      s += r.coeffs[i] * (prev >= 0 ? a[prev] : 0);
    }
    a.push(s);
  }
  return a.slice(0, nMax + 1);
}

export interface Complex {
  re: number;
  im: number;
}

function cAdd(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im };
}
function cSub(a: Complex, b: Complex): Complex {
  return { re: a.re - b.re, im: a.im - b.im };
}
function cMul(a: Complex, b: Complex): Complex {
  return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re };
}
function cDiv(a: Complex, b: Complex): Complex {
  const d = b.re * b.re + b.im * b.im;
  return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d };
}
function cAbs(a: Complex): number {
  return Math.hypot(a.re, a.im);
}

/** Roots of t^k - c1 t^{k-1} - ... = 0. Durand-Kerner, good enough for k<=3. */
export function charRoots(coeffs: number[]): Complex[] {
  const k = coeffs.length;
  const p = [1, ...coeffs.map((c) => -c)];
  const roots: Complex[] = [];
  for (let i = 0; i < k; i++) {
    const ang = (2 * Math.PI * i) / k;
    roots.push({ re: Math.cos(ang) * 0.4 + 0.9, im: Math.sin(ang) * 0.4 });
  }
  const evalP = (z: Complex): Complex => {
    let acc: Complex = { re: 0, im: 0 };
    for (const coef of p) {
      acc = cAdd(cMul(acc, z), { re: coef, im: 0 });
    }
    return acc;
  };
  for (let it = 0; it < 80; it++) {
    const next: Complex[] = [];
    for (let i = 0; i < k; i++) {
      let den: Complex = { re: 1, im: 0 };
      for (let j = 0; j < k; j++) if (i !== j) den = cMul(den, cSub(roots[i], roots[j]));
      next.push(cSub(roots[i], cDiv(evalP(roots[i]), den)));
    }
    roots.splice(0, k, ...next);
  }
  return roots.sort((a, b) => b.re - a.re || a.im - b.im);
}

export function fmtRoot(z: Complex, eps = 1e-8): string {
  if (Math.abs(z.im) < eps) return trimNum(z.re);
  const sign = z.im >= 0 ? "+" : "−";
  return `${trimNum(z.re)} ${sign} ${trimNum(Math.abs(z.im))}i`;
}

export function trimNum(x: number, digits = 6): string {
  if (!Number.isFinite(x)) return "∞";
  if (Math.abs(x) < 1e-10) return "0";
  const n = Number(x.toPrecision(digits));
  return Number.isInteger(n) ? String(n) : String(n);
}

export interface PartialTerm {
  root: Complex;
  residue: Complex;
}

/**
 * G(x) = P(x)/Q(x), Q = 1 - c1 x - c2 x^2 - ...
 * P comes from the initial conditions.
 * Constant inhomog → extra (1-x) in the denominator (Hanoi, 3a_{n-1}+2).
 */
export function generatingFunction(r: Recurrence): {
  Q: number[];
  P: number[];
  latex: string;
} {
  const k = r.coeffs.length;
  const Q = [1, ...r.coeffs.map((c) => -c)];
  const a = sequence(r, k + 4);
  const P = Array(k).fill(0);
  for (let n = 0; n < k; n++) {
    let s = a[n];
    for (let j = 1; j <= n; j++) {
      s += Q[j] * a[n - j];
    }
    P[n] = s;
  }
  if (r.inhomog !== 0) {
    const Q2 = conv(Q, [1, -1]);
    const P2 = Array(Q2.length - 1).fill(0);
    const a2 = sequence(r, Q2.length + 3);
    for (let n = 0; n < P2.length; n++) {
      let s = a2[n];
      for (let j = 1; j <= n; j++) s += Q2[j] * a2[n - j];
      P2[n] = s;
    }
    return {
      Q: Q2,
      P: P2,
      latex: fracLatex(P2, Q2),
    };
  }
  return { Q, P, latex: fracLatex(P, Q) };
}

function conv(a: number[], b: number[]): number[] {
  const c = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) c[i + j] += a[i] * b[j];
  }
  return c;
}

function polyLatex(c: number[], variable = "x"): string {
  const parts: string[] = [];
  for (let i = 0; i < c.length; i++) {
    if (Math.abs(c[i]) < 1e-10) continue;
    const coef = trimNum(c[i]);
    let term: string;
    if (i === 0) term = coef;
    else if (i === 1) term = coef === "1" ? variable : coef === "-1" ? `-${variable}` : `${coef}${variable}`;
    else term = coef === "1" ? `${variable}^{${i}}` : coef === "-1" ? `-${variable}^{${i}}` : `${coef}${variable}^{${i}}`;
    if (parts.length === 0) parts.push(term);
    else if (term.startsWith("-")) parts.push("− " + term.slice(1));
    else parts.push("+ " + term);
  }
  return parts.length === 0 ? "0" : parts.join(" ");
}

function fracLatex(P: number[], Q: number[]): string {
  return `\\dfrac{${polyLatex(P)}}{${polyLatex(Q)}}`;
}

export function coverUp(P: number[], Q: number[]): PartialTerm[] {
  const k = Q.length - 1;
  const homCoeffs: number[] = [];
  for (let i = 1; i < Q.length; i++) homCoeffs.push(-Q[i]);
  const roots = charRoots(homCoeffs).slice(0, k);
  const evalPoly = (c: number[], z: Complex): Complex => {
    let acc: Complex = { re: 0, im: 0 };
    for (let i = c.length - 1; i >= 0; i--) {
      acc = cAdd(cMul(acc, z), { re: c[i], im: 0 });
    }
    return acc;
  };
  const terms: PartialTerm[] = [];
  for (let i = 0; i < roots.length; i++) {
    const r = roots[i];
    if (cAbs(r) < 1e-10) continue;
    const x = cDiv({ re: 1, im: 0 }, r);
    const num = evalPoly(P, x);
    let den: Complex = { re: 1, im: 0 };
    for (let j = 0; j < roots.length; j++) {
      if (i === j) continue;
      den = cMul(den, cSub({ re: 1, im: 0 }, cMul(roots[j], x)));
    }
    terms.push({ root: r, residue: cDiv(num, den) });
  }
  return terms;
}

export function closedFormLatex(r: Recurrence): string {
  const { P, Q } = generatingFunction(r);
  const terms = coverUp(P, Q);
  if (terms.length === 0) return "\\text{(could not factor)}";
  const real = terms.every((t) => Math.abs(t.root.im) < 1e-6 && Math.abs(t.residue.im) < 1e-6);
  if (!real) {
    return terms
      .map((t) => `(${trimNum(t.residue.re)})\\,(${fmtRoot(t.root)})^{n}`)
      .join(" + ");
  }
  return terms
    .map((t) => {
      const A = trimNum(t.residue.re);
      const root = trimNum(t.root.re);
      if (root === "1") return A;
      if (A === "1") return `${root}^{n}`;
      if (A === "-1") return `-(${root})^{n}`;
      return `${A}\\cdot ${root}^{n}`;
    })
    .join(" + ")
    .replaceAll("+ -", "− ");
}

export function evalClosed(r: Recurrence, n: number): number {
  // plug n into sum A r^n. complex roots come in pairs, we just take Re.
  const { P, Q } = generatingFunction(r);
  const terms = coverUp(P, Q);
  let s = 0;
  for (const t of terms) {
    const rn = Math.pow(cAbs(t.root), n);
    const ang = Math.atan2(t.root.im, t.root.re) * n;
    s += t.residue.re * rn * Math.cos(ang) - t.residue.im * rn * Math.sin(ang);
  }
  return s;
}
