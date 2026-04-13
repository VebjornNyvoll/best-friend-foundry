import { compilePack } from "@foundryvtt/foundryvtt-cli";
import { readFileSync, rmSync, existsSync } from "fs";
import { resolve } from "path";

const moduleJson = JSON.parse(readFileSync("module.json", "utf-8"));
const clean = process.argv.includes("--clean");

for (const pack of moduleJson.packs) {
  const src = resolve("src", "packs", pack.name);
  const dest = resolve(pack.path);

  if (clean && existsSync(dest)) {
    rmSync(dest, { recursive: true });
    console.log(`Cleaned ${dest}`);
  }

  console.log(`Compiling ${pack.name}: ${src} -> ${dest}`);
  await compilePack(src, dest, { yaml: true, log: true });
}

console.log("Build complete.");
