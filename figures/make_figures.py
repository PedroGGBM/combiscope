#!/usr/bin/env python3
# appendix plots. run from repo root.
# seaborn because the report asked for it, the site itself is SVG.

from __future__ import annotations

from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns

OUT = Path(__file__).resolve().parent / "out"
OUT.mkdir(exist_ok=True)

sns.set_theme(style="whitegrid", context="paper", font="DejaVu Serif")


def catalan(n: int) -> int:
    # C_n = (4n-2)/(n+1) C_{n-1}, starting at 1
    c = 1
    for k in range(n):
        c = c * (4 * k + 2) // (k + 2)
    return c


def partitions_upto(n: int) -> list[int]:
    p = [0] * (n + 1)
    p[0] = 1
    for k in range(1, n + 1):
        for s in range(k, n + 1):
            p[s] += p[s - k]
    return p


def fig_catalan_ratio() -> None:
    ns = np.arange(1, 21)
    c = np.array([catalan(int(n)) for n in ns], dtype=float)
    ratio = c[1:] / c[:-1]
    fig, ax = plt.subplots(figsize=(6.2, 3.4))
    sns.lineplot(x=ns[1:], y=ratio, ax=ax, marker="o", color="#0f766e", label=r"$C_{n}/C_{n-1}$")
    ax.axhline(4, color="#9a3412", ls="--", lw=1, label=r"limit $4$")
    ax.set_xlabel(r"$n$")
    ax.set_ylabel("ratio")
    ax.legend(frameon=False)
    fig.tight_layout()
    fig.savefig(OUT / "catalan-ratio.pdf")
    fig.savefig(OUT / "catalan-ratio.png", dpi=160)
    plt.close(fig)


def fig_partition() -> None:
    p = partitions_upto(30)
    ns = np.arange(0, 31)
    fig, ax = plt.subplots(figsize=(6.2, 3.4))
    sns.lineplot(x=ns, y=p, ax=ax, marker="o", color="#1e3a5f")
    ax.set_xlabel(r"$n$")
    ax.set_ylabel(r"$p(n)$")
    fig.tight_layout()
    fig.savefig(OUT / "partition-p.pdf")
    fig.savefig(OUT / "partition-p.png", dpi=160)
    plt.close(fig)


def fig_recurrences() -> None:
    n = np.arange(0, 13)
    # Fibonacci shifted (tilings). could have generated it, whatever
    tiling = np.array([1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233])
    reds = []
    a0, a1 = 1, 3
    reds.append(a0)
    reds.append(a1)
    for _ in range(11):
        a0, a1 = a1, 2 * a1 + 2 * a0
        reds.append(a1)
    reds = np.array(reds[:13])
    hanoi = 2**n - 1
    fig, ax = plt.subplots(figsize=(6.2, 3.4))
    sns.lineplot(x=n, y=tiling, ax=ax, marker="o", label=r"tilings $F_{n+1}$")
    sns.lineplot(x=n, y=reds, ax=ax, marker="s", label="no adjacent reds")
    sns.lineplot(x=n, y=hanoi, ax=ax, marker="^", label=r"Hanoi $2^n-1$")
    ax.set_xlabel(r"$n$")
    ax.set_ylabel(r"$a_n$")
    ax.set_yscale("log")
    ax.legend(frameon=False)
    fig.tight_layout()
    fig.savefig(OUT / "recurrence-seq.pdf")
    fig.savefig(OUT / "recurrence-seq.png", dpi=160)
    plt.close(fig)


if __name__ == "__main__":
    fig_catalan_ratio()
    fig_partition()
    fig_recurrences()
    print("wrote", OUT)
