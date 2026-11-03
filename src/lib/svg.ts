// tiny SVG helpers. nothing fancy.

export function svgEl(tag: string, attrs: Record<string, string | number> = {}, text?: string): SVGElement {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  if (text !== undefined) el.textContent = text;
  return el;
}

export function clear(node: Element): void {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export function svgRoot(w: number, h: number, view?: string): SVGSVGElement {
  const s = svgEl("svg", {
    viewBox: view ?? `0 0 ${w} ${h}`,
    width: "100%",
    height: "100%",
    role: "img",
  }) as SVGSVGElement;
  return s;
}
