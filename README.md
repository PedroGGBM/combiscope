# Combiscope

A zero-install lab for Tsinghua **70240384 Combinatorics and Algorithms Design**.

**Use it:** open [pedroggbm.com/combinatorics](https://pedroggbm.com/combinatorics).

Three rooms, each tied to a lecture and a homework:

| Room | What you see | Course hook |
| --- | --- | --- |
| Catalan | One Dyck word drawn as a path, parentheses, stack pops, a plane binary tree, a polygon triangulation, and noncrossing handshakes. Reflection principle on the side. | Week 6-2, HW 6.2 |
| Partitions | Ferrers diagram, conjugate, L-hook bijection with distinct odd parts. Table of `p(n)`. | Week 5, HW 5.1 Q3, Brualdi 8.3 |
| Generating functions | Recurrence → `G(x)=P/Q` → closed form, with plots of `a_n` and the ratio `a_{n+1}/a_n`. | Weeks 5–7, HW 7–8 |

Nothing to install for a demo. Click the rooms at the top.

## Run locally

```bash
npm install
npm test
npm run dev
```

Then open the URL Vite prints (the app is mounted at `/combinatorics/`).

```bash
npm run build
```

writes a static tree to `dist/`, which is what is copied to the course site.

## Figures for the report

```bash
python -m venv .venv
.venv/bin/pip install seaborn matplotlib numpy
.venv/bin/python figures/make_figures.py
```

## Tests

The suite checks lecture numbers, not just smoke:

- `C_3 = 5`, `C_4 = 14`, and the five stack words at `n=3` (312 is missing)
- `p(5)=7`, the `n=8` self-conjugate examples, and the Euler product up to `n=12`
- tiling `a_4=5`, no-adjacent-reds `a_3=22`, `a_n=2·3^n-1`, Hanoi `2^n-1`

## License

MIT. See `LICENSE`.
