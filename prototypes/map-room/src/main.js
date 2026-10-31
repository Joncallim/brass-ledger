import Phaser from "phaser";
import { TableScene } from "./scenes/TableScene.js";
import { DeskScene } from "./scenes/DeskScene.js";
import { setWorld } from "./story/world.js";
import { worldFor } from "./gen/factions.js";

// `?seed=<code>` opens that code's theatre; no code (or KESTREL) is the authored one.
setWorld(worldFor(new URLSearchParams(location.search).get("seed")));

// Canvas text needs the real faces before the first frame, or map labels fall back.
await Promise.all([
  document.fonts.load("20px 'IBM Plex Sans'"),
  document.fonts.load("600 20px 'IBM Plex Sans'"),
  document.fonts.load("34px 'Newsreader'"),
  document.fonts.load("italic 34px 'Newsreader'"),
]);

// Supported sizes (README, "Supported sizes"). The table layout draws the whole 1920x1080
// table scaled to fit, words and all; no word is smaller than 14 px on the table, so at a
// scale of COMPACT_BELOW (a window of 1728x972) the smallest renders at 12.6 px. Below that the
// compact layout takes over: the chart scales into the space on the left, and every sheet,
// slip and voice sits in a column on the right at its own size, reflowing to the column's
// width and scrolling on its own.
//
// Browser zoom: fitting the table to the window would cancel it (the window just gets fewer
// CSS pixels). So zooming in after the page has loaded switches to the compact layout, where
// zoom enlarges the words. Zoom is told apart from a move to another screen: zoom keeps the
// window's width in device pixels and changes devicePixelRatio; a new screen changes both. A
// page that loads already zoomed can't be told from one on a denser screen.
// `?layout=table` or `?layout=compact` fixes the choice (used by the browser checks).
const COMPACT_BELOW = 0.9;
const forced = new URLSearchParams(location.search).get("layout");
const view = { dpr: devicePixelRatio, width: innerWidth * devicePixelRatio, zoom: 1 };
const trackZoom = () => {
  const dpr = devicePixelRatio, width = innerWidth * dpr;
  if (dpr !== view.dpr && Math.abs(width - view.width) <= 0.03 * view.width) view.zoom *= dpr / view.dpr;
  view.dpr = dpr; view.width = width;
};
const compact = () => forced ? forced === "compact" : view.zoom > 1.01 || Math.min(innerWidth / 1920, innerHeight / 1080) < COMPACT_BELOW;
document.body.classList.toggle("compact", compact());
window.mapRoomView = view; // test hook: the zoom the page has seen since it loaded

const game = new Phaser.Game({
  // ?renderer=canvas forces the 2D renderer (useful for headless capture without a GPU).
  type: new URLSearchParams(location.search).get("renderer") === "canvas" ? Phaser.CANVAS : Phaser.AUTO,
  parent: "stage",
  width: 1920,
  height: 1080,
  backgroundColor: "#141210",
  dom: { createContainer: true },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  // TableScene draws and moves the world; DeskScene sits on top with every word and control.
  scene: [TableScene, DeskScene],
});
// Toggled before the scale manager measures the stage, so the chart fits the space it has.
const relayout = () => {
  trackZoom();
  const was = document.body.classList.contains("compact"), now = compact();
  if (was === now) return;
  document.body.classList.toggle("compact", now);
  game.scale.getParentBounds(); // the stage changed width with the layout: measure it again
  game.scale.refresh();
  game.desk?.hideTip?.();
};
addEventListener("resize", relayout);
// A change of devicePixelRatio alone (another screen) fires no resize: watch the resolution too.
const watchDpr = () => matchMedia(`(resolution: ${devicePixelRatio}dppx)`).addEventListener("change", () => { relayout(); watchDpr(); }, { once: true });
watchDpr();
