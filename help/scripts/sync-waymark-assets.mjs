import { cp, copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const helpRoot = resolve(scriptDir, "..");
const repoRoot = resolve(helpRoot, "..");
const assetRoot = resolve(helpRoot, "public/assets");

const directoryCopies = [
  ["waymark-js/dist/css", "waymark-js/css"],
  ["waymark-js/dist/js", "waymark-js/js"],
  ["waymark-js/dist/fonts", "waymark-js/fonts"],
  ["waymark-js/dist/images", "waymark-js/images"],
];

const fileCopies = [
  ["assets/css/front.min.css", "css/front.min.css"],
];

for (const [source, destination] of directoryCopies) {
  const from = resolve(repoRoot, source);
  const to = resolve(assetRoot, destination);

  await mkdir(to, { recursive: true });
  await cp(from, to, { recursive: true, force: true });
}

for (const [source, destination] of fileCopies) {
  const from = resolve(repoRoot, source);
  const to = resolve(assetRoot, destination);

  await mkdir(dirname(to), { recursive: true });
  await copyFile(from, to);
}

console.log("Synced Waymark assets into help/public/assets/");
