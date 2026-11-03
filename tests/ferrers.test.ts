import { describe, expect, it } from "vitest";
import {
  conjugate,
  hooksToOddParts,
  isSelfConjugate,
  oddPartsToSelfConjugate,
  partitionCount,
  partitionGfPrefix,
  partitionsOf,
  PRESET_N8,
  weight,
} from "../src/lib/ferrers";

describe("partitions of n", () => {
  it("matches p(1)..p(7) from the lecture", () => {
    expect([1, 2, 3, 4, 5, 6, 7].map(partitionCount)).toEqual([1, 2, 3, 5, 7, 11, 15]);
  });

  it("lists the seven partitions of 5", () => {
    expect(partitionsOf(5)).toEqual([
      [5],
      [4, 1],
      [3, 2],
      [3, 1, 1],
      [2, 2, 1],
      [2, 1, 1, 1],
      [1, 1, 1, 1, 1],
    ]);
  });

  it("agrees with the truncated Euler product", () => {
    const gf = partitionGfPrefix(12, 12);
    for (let n = 0; n <= 12; n++) expect(gf[n]).toBe(partitionCount(n));
  });
});

describe("conjugation", () => {
  it("swaps number of parts with the largest part", () => {
    const p = [6, 6, 5, 4, 3];
    const c = conjugate(p);
    expect(c).toEqual([5, 5, 5, 4, 3, 2]);
    expect(conjugate(c)).toEqual(p);
  });
});

describe("self-conjugate ↔ distinct odd parts", () => {
  it("runs the n=8 lecture / HW 5.1 examples both ways", () => {
    for (const { sc, odds } of PRESET_N8) {
      expect(weight(sc)).toBe(8);
      expect(isSelfConjugate(sc)).toBe(true);
      expect(hooksToOddParts(sc)).toEqual(odds);
      expect(oddPartsToSelfConjugate(odds)).toEqual(sc);
    }
  });

  it("is a bijection on n ≤ 12", () => {
    for (let n = 1; n <= 12; n++) {
      const sc = partitionsOf(n).filter(isSelfConjugate);
      const odds = partitionsOf(n).filter(
        (p) => p.every((x) => x % 2 === 1) && new Set(p).size === p.length,
      );
      expect(sc.length).toBe(odds.length);
      const fromHooks = sc.map(hooksToOddParts).map((p) => p.join("+")).sort();
      const listed = odds.map((p) => p.join("+")).sort();
      expect(fromHooks).toEqual(listed);
    }
  });
});
