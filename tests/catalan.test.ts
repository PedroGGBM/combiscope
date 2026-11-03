import { describe, expect, it } from "vitest";
import {
  allDyck,
  allMonoPaths,
  catalan,
  catalanRecurrence,
  dyckToHandshakes,
  dyckToParens,
  dyckToPath,
  dyckToStack,
  dyckToTree,
  dyckToTriangulation,
  firstBad,
  LECTURE_STACK_N3,
  MISSING_STACK_N3,
  reflectAcrossBarrier,
  reflectBadPrefix,
  treeSize,
} from "../src/lib/catalan";

describe("Catalan numbers", () => {
  it("matches C_0 through C_6 from the lecture table", () => {
    expect(catalanRecurrence(6)).toEqual([1, 1, 2, 5, 14, 42, 132]);
    expect([0, 1, 2, 3, 4, 5, 6].map(catalan)).toEqual([1, 1, 2, 5, 14, 42, 132]);
  });

  it("lists C_n Dyck words", () => {
    expect(allDyck(3)).toHaveLength(5);
    expect(allDyck(4)).toHaveLength(14);
  });
});

describe("lecture bijections at n=3", () => {
  it("gives the five stack words and excludes 312", () => {
    // listing order is Dyck-lex, lecture listed them in a different order. set equality.
    const stacks = allDyck(3).map((w) => dyckToStack(w).join(""));
    expect([...stacks].sort()).toEqual([...LECTURE_STACK_N3].sort());
    expect(stacks).not.toContain(MISSING_STACK_N3);
  });

  it("sends Dyck words to parentheses of length 6", () => {
    const parens = allDyck(3).map(dyckToParens);
    expect(parens).toHaveLength(5);
    for (const p of parens) {
      expect(p).toHaveLength(6);
      let d = 0;
      for (const ch of p) {
        d += ch === "(" ? 1 : -1;
        expect(d).toBeGreaterThanOrEqual(0);
      }
      expect(d).toBe(0);
    }
  });

  it("builds plane binary trees with 3 nodes", () => {
    for (const w of allDyck(3)) {
      const t = dyckToTree(w);
      expect(treeSize(t)).toBe(3);
    }
  });

  it("triangulates a pentagon with 3 triangles", () => {
    for (const w of allDyck(3)) {
      const tri = dyckToTriangulation(w);
      expect(tri).toHaveLength(3);
    }
  });

  it("pairs 6 seats with 3 noncrossing chords", () => {
    for (const w of allDyck(3)) {
      expect(dyckToHandshakes(w)).toHaveLength(3);
    }
  });
});

describe("reflection principle", () => {
  it("counts good paths as C_n", () => {
    const paths = allMonoPaths(3);
    expect(paths).toHaveLength(20);
    const good = paths.filter((p) => p.badIndex < 0);
    expect(good).toHaveLength(5);
  });

  it("sends (0,0) to (1,-1) and keeps the endpoint of a bad path", () => {
    expect(reflectAcrossBarrier({ x: 0, y: 0 })).toEqual({ x: 1, y: -1 });
    const bad = allMonoPaths(3).find((p) => p.badIndex >= 0);
    expect(bad).toBeDefined();
    const img = reflectBadPrefix(bad!);
    expect(img[0]).toEqual({ x: 1, y: -1 });
    expect(img[img.length - 1]).toEqual({ x: 3, y: 3 });
  });

  it("keeps Dyck paths on or above the diagonal x <= y", () => {
    for (const w of allDyck(4)) {
      for (const p of dyckToPath(w)) {
        expect(p.x - p.y).toBeLessThanOrEqual(0);
      }
      expect(firstBad(dyckToPath(w))).toBe(-1);
    }
  });
});
