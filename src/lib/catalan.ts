/**
 * Catalan numbers and the lecture bijections (Brualdi 8.1; week 6-2).
 *
 * Indexing: C_0 = 1, C_n = sum_{k=0}^{n-1} C_k C_{n-1-k}.
 * A Dyck word of semilength n is n letters X and n letters Y such that
 * every prefix has at least as many X as Y. X is an up/east-open/push step.
 */

export type Dyck = string;

export function binomial(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  let r = 1;
  for (let i = 1; i <= k; i++) {
    r = (r * (n - k + i)) / i;
  }
  return Math.round(r);
}

export function catalan(n: number): number {
  if (n < 0) return 0;
  return Math.round(binomial(2 * n, n) / (n + 1));
}

export function catalanRecurrence(n: number): number[] {
  const c = [1];
  for (let m = 1; m <= n; m++) {
    let s = 0;
    for (let k = 0; k < m; k++) s += c[k] * c[m - 1 - k];
    c.push(s);
  }
  return c;
}

/** All Dyck words of semilength n, lexicographic with X < Y. */
export function allDyck(n: number): Dyck[] {
  const out: Dyck[] = [];
  const buf: string[] = [];
  function rec(open: number, close: number): void {
    if (open === n && close === n) {
      out.push(buf.join(""));
      return;
    }
    if (open < n) {
      buf.push("X");
      rec(open + 1, close);
      buf.pop();
    }
    if (close < open) {
      buf.push("Y");
      rec(open, close + 1);
      buf.pop();
    }
  }
  rec(0, 0);
  return out;
}

export function dyckToParens(w: Dyck): string {
  return w.replaceAll("X", "(").replaceAll("Y", ")");
}

/**
 * Stack pop sequence: push 1..n in order. X = push next, Y = pop.
 * Lecture n=3: 123, 132, 213, 231, 321. Missing 312.
 */
export function dyckToStack(w: Dyck): number[] {
  const n = w.length / 2;
  const stack: number[] = [];
  const out: number[] = [];
  let next = 1;
  for (const ch of w) {
    if (ch === "X") stack.push(next++);
    else {
      const v = stack.pop();
      if (v === undefined) throw new Error("empty pop");
      out.push(v);
    }
  }
  if (out.length !== n) throw new Error("incomplete stack word");
  return out;
}

export interface BinTree {
  left: BinTree | null;
  right: BinTree | null;
}

/** First-return decomposition: w = X A Y B with A, B Dyck. */
export function dyckToTree(w: Dyck): BinTree | null {
  if (w.length === 0) return null;
  let depth = 0;
  let split = -1;
  for (let i = 0; i < w.length; i++) {
    depth += w[i] === "X" ? 1 : -1;
    if (depth === 0) {
      split = i;
      break;
    }
  }
  const A = w.slice(1, split);
  const B = w.slice(split + 1);
  return { left: dyckToTree(A), right: dyckToTree(B) };
}

export function treeSize(t: BinTree | null): number {
  if (!t) return 0;
  return 1 + treeSize(t.left) + treeSize(t.right);
}

export type Triangle = [number, number, number];

/**
 * Triangulation of a convex (n+2)-gon with vertices 0..n+1 in order.
 * The root triangle uses the base 0 — (n+1) and vertex (leftSize + 1).
 */
export function dyckToTriangulation(w: Dyck): Triangle[] {
  const n = w.length / 2;
  const triangles: Triangle[] = [];
  function walk(word: Dyck, lo: number, hi: number): void {
    if (word.length === 0) return;
    const t = dyckToTree(word);
    if (!t) return;
    const k = treeSize(t.left);
    const mid = lo + k + 1;
    triangles.push([lo, mid, hi]);
    const split = 1 + 2 * k;
    walk(word.slice(1, split), lo, mid);
    walk(word.slice(split + 1), mid, hi);
  }
  walk(w, 0, n + 1);
  return triangles;
}

/** Noncrossing pairing of 2n labeled seats 0..2n-1 around a circle. */
export function dyckToHandshakes(w: Dyck): [number, number][] {
  const pairs: [number, number][] = [];
  function walk(word: Dyck, offset: number): void {
    if (word.length === 0) return;
    let depth = 0;
    let split = -1;
    for (let i = 0; i < word.length; i++) {
      depth += word[i] === "X" ? 1 : -1;
      if (depth === 0) {
        split = i;
        break;
      }
    }
    const inner = (split - 1) / 2;
    const a = offset;
    const b = offset + 1 + 2 * inner;
    pairs.push([a, b]);
    walk(word.slice(1, split), offset + 1);
    walk(word.slice(split + 1), b + 1);
  }
  walk(w, 0);
  return pairs;
}

export interface LatticePoint {
  x: number;
  y: number;
}

/** East (1,0) and North (0,1). X = North, Y = East, so good paths keep x <= y. */
export function dyckToPath(w: Dyck): LatticePoint[] {
  const pts: LatticePoint[] = [{ x: 0, y: 0 }];
  for (const ch of w) {
    const last = pts[pts.length - 1];
    if (ch === "X") pts.push({ x: last.x, y: last.y + 1 });
    else pts.push({ x: last.x + 1, y: last.y });
  }
  return pts;
}

export interface MonoPath {
  steps: ("E" | "N")[];
  points: LatticePoint[];
  badIndex: number;
}

function pointsOf(steps: ("E" | "N")[]): LatticePoint[] {
  const pts: LatticePoint[] = [{ x: 0, y: 0 }];
  for (const s of steps) {
    const last = pts[pts.length - 1];
    pts.push(s === "E" ? { x: last.x + 1, y: last.y } : { x: last.x, y: last.y + 1 });
  }
  return pts;
}

/** First index i > 0 where x - y = 1, or -1 if the path is a Dyck path. */
export function firstBad(points: LatticePoint[]): number {
  for (let i = 1; i < points.length; i++) {
    if (points[i].x - points[i].y === 1) return i;
  }
  return -1;
}

/** All monotone paths (0,0) → (n,n). */
export function allMonoPaths(n: number): MonoPath[] {
  const out: MonoPath[] = [];
  const steps: ("E" | "N")[] = [];
  function rec(e: number, nn: number): void {
    if (e === n && nn === n) {
      const points = pointsOf(steps);
      out.push({ steps: [...steps], points, badIndex: firstBad(points) });
      return;
    }
    if (e < n) {
      steps.push("E");
      rec(e + 1, nn);
      steps.pop();
    }
    if (nn < n) {
      steps.push("N");
      rec(e, nn + 1);
      steps.pop();
    }
  }
  rec(0, 0);
  return out;
}

/** Reflect (a,b) across the line x - y = 1. Sends (0,0) to (1,-1). */
export function reflectAcrossBarrier(p: LatticePoint): LatticePoint {
  return { x: p.y + 1, y: p.x - 1 };
}

/**
 * André reflection: reflect the prefix up to the first touch of x-y=1.
 * The image starts at (1,-1) and still ends at (n,n).
 */
export function reflectBadPrefix(path: MonoPath): LatticePoint[] {
  if (path.badIndex < 0) return path.points;
  const image: LatticePoint[] = [];
  for (let i = 0; i <= path.badIndex; i++) {
    image.push(reflectAcrossBarrier(path.points[i]));
  }
  for (let i = path.badIndex + 1; i < path.points.length; i++) {
    image.push({ ...path.points[i] });
  }
  return image;
}

export const LECTURE_STACK_N3 = ["123", "132", "213", "231", "321"];
export const MISSING_STACK_N3 = "312";
