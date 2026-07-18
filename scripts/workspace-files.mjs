import { cp, rm } from "node:fs/promises";

const [operation, source, destination] = process.argv.slice(2);

if (operation === "clean" && source && !destination) {
  await rm(source, { recursive: true, force: true });
} else if (operation === "copy" && source && destination) {
  await cp(source, destination);
} else {
  throw new Error("Usage: workspace-files.mjs clean <path> | copy <source> <destination>");
}
