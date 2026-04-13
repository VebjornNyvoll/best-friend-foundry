import { compilePack } from "@foundryvtt/foundryvtt-cli";
import { readFileSync, rmSync, existsSync } from "fs";
import { resolve } from "path";
import { ClassicLevel } from "classic-level";

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

// Post-process: fix _stats.compendiumSource on ALL entries in every pack
console.log("\nPost-processing: fixing _stats.compendiumSource...");

for (const pack of moduleJson.packs) {
  const dest = resolve(pack.path);
  const db = new ClassicLevel(dest, { valueEncoding: "json" });
  const batch = db.batch();
  let fixCount = 0;

  for await (const [key, value] of db.iterator()) {
    if (typeof value !== "object" || value === null) continue;

    if (!value._stats || value._stats.compendiumSource === "" || value._stats.compendiumSource === undefined) {
      value._stats = { ...value._stats, compendiumSource: null };
      batch.put(key, value);
      fixCount++;
    }
  }

  await batch.write();
  await db.close();
  console.log(`  ${pack.name}: fixed _stats on ${fixCount} entries`);
}

console.log("Build complete.");
