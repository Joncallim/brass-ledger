import Phaser from "phaser";
import { TableScene } from "./scenes/TableScene.js";
import { DeskScene } from "./scenes/DeskScene.js";

// Canvas text needs the real faces before the first frame, or map labels fall back.
await Promise.all([
  document.fonts.load("20px 'IBM Plex Sans'"),
  document.fonts.load("600 20px 'IBM Plex Sans'"),
  document.fonts.load("34px 'Newsreader'"),
  document.fonts.load("italic 34px 'Newsreader'"),
]);

new Phaser.Game({
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
