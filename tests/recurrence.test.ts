import { describe, expect, it } from "vitest";
import {
  closedFormLatex,
  evalClosed,
  generatingFunction,
  PRESETS,
  sequence,
} from "../src/lib/recurrence";

function almost(a: number, b: number, eps = 1e-6): void {
  expect(Math.abs(a - b)).toBeLessThan(eps);
}

describe("lecture presets", () => {
  it("tiles a 1×n board with F_{n+1} tilings", () => {
    const r = PRESETS.find((p) => p.name.startsWith("1×n"))!;
    expect(sequence(r, 4)).toEqual([1, 1, 2, 3, 5]);
  });

  it("counts 22 three-colourings of 3 cells with no adjacent reds", () => {
    const r = PRESETS.find((p) => p.name.startsWith("Three"))!;
    expect(sequence(r, 3)).toEqual([1, 3, 8, 22]);
  });

  it("solves a_n = 3 a_{n-1} + 2, a_0 = 1", () => {
    const r = PRESETS.find((p) => p.name.startsWith("a_n"))!;
    expect(sequence(r, 3)).toEqual([1, 5, 17, 53]);
    const { latex } = generatingFunction(r);
    expect(latex).toContain("1 + x");
    for (let n = 0; n <= 8; n++) {
      almost(evalClosed(r, n), 2 * 3 ** n - 1, 1e-4);
    }
  });

  it("gives Binet values for Fibonacci", () => {
    const r = PRESETS.find((p) => p.name.startsWith("Fibonacci"))!;
    expect(sequence(r, 7)).toEqual([0, 1, 1, 2, 3, 5, 8, 13]);
    const phi = (1 + Math.sqrt(5)) / 2;
    const hat = (1 - Math.sqrt(5)) / 2;
    for (let n = 0; n <= 12; n++) {
      const binet = (phi ** n - hat ** n) / Math.sqrt(5);
      almost(evalClosed(r, n), Math.round(binet), 1e-4);
    }
  });

  it("solves Hanoi as 2^n − 1", () => {
    const r = PRESETS.find((p) => p.name.startsWith("Towers"))!;
    expect(sequence(r, 4)).toEqual([0, 1, 3, 7, 15]);
    for (let n = 0; n <= 10; n++) almost(evalClosed(r, n), 2 ** n - 1, 1e-3);
  });
});

describe("closed form printer", () => {
  it("returns a non-empty formula", () => {
    for (const r of PRESETS) {
      expect(closedFormLatex(r).length).toBeGreaterThan(3);
    }
  });
});
