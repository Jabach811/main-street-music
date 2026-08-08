import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const publicDirectory = resolve(root, "public");
const sourceFiles = [
  "gear.html",
  "index.html",
  "lessons.html",
  "recitals.html",
  "rentals.html",
  "repairs.html",
  "stamp.js",
  "teachers.html",
  "visit.html"
];
const sourceDirectories = ["css", "img", "js", "partials"];

await rm(publicDirectory, { recursive: true, force: true });
await mkdir(publicDirectory, { recursive: true });

await Promise.all(sourceFiles.map((file) => cp(resolve(root, file), resolve(publicDirectory, file))));
await Promise.all(sourceDirectories.map((directory) => cp(
  resolve(root, directory),
  resolve(publicDirectory, directory),
  { recursive: true }
)));
