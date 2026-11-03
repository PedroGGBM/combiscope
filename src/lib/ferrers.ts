/**
 * Integer partitions and Ferrers diagrams (Brualdi 8.3; HW 5.1 Q3).
 * Parts are stored nonincreasing and positive.
 */

export type Partition = number[];

export function isPartition(p: Partition): boolean {
  if (p.length === 0) return true;
  if (p.some((x) => !Number.isInteger(x) || x < 1)) return false;
  for (let i = 1; i < p.length; i++) {
    if (p[i] > p[i - 1]) return false;
  }
  return true;
}

export function weight(p: Partition): number {
  return p.reduce((s, x) => s + x, 0);
}

export function conjugate(p: Partition): Partition {
  if (p.length === 0) return [];
  const m = p[0];
  const c: number[] = [];
  for (let i = 1; i <= m; i++) {
    c.push(p.filter((x) => x >= i).length);
  }
  return c;
}

export function equalPart(a: Partition, b: Partition): boolean {
  if (a.length !== b.length) return false;
  return a.every((x, i) => x === b[i]);
}

export function isSelfConjugate(p: Partition): boolean {
  return equalPart(p, conjugate(p));
}

/** Nested L-hooks of a self-conjugate diagram: hook i has size 1 + 2(λ_i − i). */
export function hooksToOddParts(p: Partition): Partition {
  if (!isSelfConjugate(p)) {
    throw new Error("L-hooks are defined on self-conjugate partitions");
  }
  const odds: number[] = [];
  for (let i = 0; i < p.length; i++) {
    if (p[i] < i + 1) break;
    odds.push(1 + 2 * (p[i] - (i + 1)));
  }
  return odds.filter((x) => x > 0);
}

/**
 * Reverse of the hook map: nest L-hooks of odd sizes 2a+1.
 * The i-th hook (0-based, largest first) has arm a_i, so row i has
 * length a_i + i + 1, matching the nested diagram.
 */
export function oddPartsToSelfConjugate(odds: Partition): Partition {
  const sorted = [...odds].sort((a, b) => b - a);
  if (sorted.some((x) => x < 1 || x % 2 === 0)) {
    throw new Error("parts must be positive odd integers");
  }
  if (new Set(sorted).size !== sorted.length) {
    throw new Error("odd parts must be distinct");
  }
  const k = sorted.length;
  const arms = sorted.map((x) => (x - 1) / 2);
  const rows = k === 0 ? 0 : Math.max(...arms.map((a, i) => i + a + 1));
  const diagram: number[][] = Array.from({ length: rows }, () => [] as number[]);
  for (let i = 0; i < k; i++) {
    const a = arms[i];
    diagram[i][i] = 1;
    for (let r = 1; r <= a; r++) {
      diagram[i][i + r] = 1;
      diagram[i + r][i] = 1;
    }
  }
  const parts: number[] = [];
  for (let i = 0; i < rows; i++) {
    let len = 0;
    for (let j = 0; j < rows; j++) if (diagram[i][j]) len++;
    if (len > 0) parts.push(len);
  }
  return parts;
}

export function partitionsOf(n: number): Partition[] {
  const out: Partition[] = [];
  function rec(remaining: number, max: number, acc: number[]): void {
    if (remaining === 0) {
      out.push([...acc]);
      return;
    }
    for (let k = Math.min(max, remaining); k >= 1; k--) {
      acc.push(k);
      rec(remaining - k, k, acc);
      acc.pop();
    }
  }
  rec(n, n, []);
  return out;
}

export function partitionCount(n: number): number {
  return partitionsOf(n).length;
}

/** Coefficients of prod_{k=1}^m 1/(1-x^k) up to x^N. */
export function partitionGfPrefix(maxPart: number, N: number): number[] {
  const a = Array(N + 1).fill(0);
  a[0] = 1;
  for (let k = 1; k <= maxPart; k++) {
    for (let s = k; s <= N; s++) a[s] += a[s - k];
  }
  return a;
}

export const PRESET_N8: { sc: Partition; odds: Partition }[] = [
  { sc: [4, 2, 1, 1], odds: [7, 1] },
  { sc: [3, 3, 2], odds: [5, 3] },
];
