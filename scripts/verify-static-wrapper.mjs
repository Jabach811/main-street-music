import { access } from "node:fs/promises";
import { resolve } from "node:path";

const required = [
  "build/sites-vite-plugin.ts",
  "scripts/stage-static-files.mjs",
  "worker/index.ts"
];

for (const file of required) {
  await access(resolve(process.cwd(), file));
}

console.log("Static Sites wrapper files are present.");
