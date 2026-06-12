import fs from "fs";
import path from "path";

const root = path.resolve(process.cwd());
const exts = [".ts", ".tsx", ".js", ".jsx"];
const ignoreDirs = new Set(["node_modules", ".git", "dist", "build"]);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const ent of entries) {
    if (ent.isDirectory()) {
      if (ignoreDirs.has(ent.name)) continue;
      files.push(...walk(path.join(dir, ent.name)));
    } else if (ent.isFile()) {
      const e = path.extname(ent.name).toLowerCase();
      if (exts.includes(e)) files.push(path.join(dir, ent.name));
    }
  }
  return files;
}

function countSLOC(filePath) {
  const src = fs.readFileSync(filePath, "utf8");
  const lines = src.split(/\r?\n/);
  let inBlock = false;
  let count = 0;
  for (let line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (inBlock) {
      if (t.includes("*/")) {
        inBlock = false;
        // remove up to end and continue checking remainder
        const after = t.split("*/").pop().trim();
        if (!after) continue;
        if (after.startsWith("//")) continue;
        // fallthrough to count
        count++;
        continue;
      }
      continue;
    }
    if (t.startsWith("//")) continue;
    if (t.startsWith("/*")) {
      if (!t.includes("*/")) {
        inBlock = true;
        continue;
      }
      // single-line block /* ... */
      const after = t.split("*/").pop().trim();
      if (!after) continue;
      if (after.startsWith("//")) continue;
      count++;
      continue;
    }
    // ignore TS/JS triple-slash directives
    if (t.startsWith("///")) continue;
    count++;
  }
  return count;
}

function main() {
  const files = walk(root);
  const totals = { files: 0, sloc: 0 };
  const byExt = {};
  for (const f of files) {
    const sloc = countSLOC(f);
    totals.files += 1;
    totals.sloc += sloc;
    const e = path.extname(f).toLowerCase();
    byExt[e] = (byExt[e] || 0) + sloc;
  }

  console.log("Files scanned:", totals.files);
  console.log("Total SLOC:", totals.sloc.toLocaleString());
  console.log("Breakdown by extension:");
  for (const k of Object.keys(byExt).sort()) {
    console.log(`  ${k}: ${byExt[k].toLocaleString()}`);
  }
}

main();
