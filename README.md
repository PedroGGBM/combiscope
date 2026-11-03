# Combiscope

Browser lab for Tsinghua **70240384**. Catalan bijections, Ferrers diagrams, generating functions from a linear recurrence.

Open [pedroggbm.com/combinatorics](https://pedroggbm.com/combinatorics). No install.

| Room | What's on the page | Where in the course |
| --- | --- | --- |
| Catalan | One Dyck word as a path, parentheses, stack pops, plane tree, triangulation, handshakes. Reflection under that. | Week 6-2, HW 9 |
| Partitions | Ferrers, conjugate, L-hooks (self-conjugate ↔ distinct odd parts). Table of `p(n)`. | Week 5 Q3, Brualdi 8.3 |
| Generating functions | Recurrence → `G(x)=P/Q` → closed form. Plots of `a_n` and `a_{n+1}/a_n`. | HW 7, HW 8 |

## Local

```bash
npm install
npm test
npm run dev
```

Vite prints a localhost URL. `npm run build` writes `dist/`, that's what gets copied onto the site.

## Report figures

```bash
python -m venv .venv
.venv/bin/pip install -r figures/requirements.txt
.venv/bin/python figures/make_figures.py
```

## Tests

Against lecture / HW numbers, not just "it renders":

- `C_3 = 5`, `C_4 = 14`, n=3 stack words (312 missing)
- `p(5)=7`, the n=8 self-conjugate examples, Euler product through n=12
- tiling `a_4=5`, no-adjacent-reds `a_3=22`, `a_n=2·3^n-1`, Hanoi `2^n-1`

## License

MIT.
