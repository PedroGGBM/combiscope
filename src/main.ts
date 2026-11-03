import { mountCatalan } from "./rooms/catalan";
import { mountGenerating } from "./rooms/generating";
import { mountPartitions } from "./rooms/partitions";
import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("#app missing");

app.innerHTML = `
  <div class="wrap">
    <header class="top">
      <div>
        <div class="kicker">70240384 · Combinatorics and Algorithms Design</div>
        <h1>Combiscope</h1>
        <p class="lede">Catalan bijections, Ferrers diagrams, G(x) for a linear recurrence. Pick a room at the top.</p>
      </div>
      <nav class="rooms" aria-label="Rooms">
        <button type="button" data-room="catalan" aria-current="page">Catalan</button>
        <button type="button" data-room="parts">Partitions</button>
        <button type="button" data-room="gf">Generating functions</button>
      </nav>
    </header>
    <section class="panel active" id="catalan"></section>
    <section class="panel" id="parts"></section>
    <section class="panel" id="gf"></section>
    <footer class="site">
      Pedro Gronda Garrigues · 2026280058 · Tsinghua 70240384 ·
      <a href="https://github.com/pedroggbm/combiscope">source</a>
    </footer>
  </div>
`;

mountCatalan(app.querySelector("#catalan") as HTMLElement);
mountPartitions(app.querySelector("#parts") as HTMLElement);
mountGenerating(app.querySelector("#gf") as HTMLElement);

const panels = app.querySelectorAll(".panel");
const buttons = app.querySelectorAll<HTMLButtonElement>("nav.rooms button");
for (const b of buttons) {
  b.addEventListener("click", () => {
    const id = b.dataset.room;
    buttons.forEach((x) => x.removeAttribute("aria-current"));
    b.setAttribute("aria-current", "page");
    panels.forEach((p) => p.classList.toggle("active", p.id === id));
  });
}
