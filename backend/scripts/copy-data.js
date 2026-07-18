import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.resolve(__dirname, "../src/data");
const distDir = path.resolve(__dirname, "../dist/data");

function copyData() {
  try {
    if (!fs.existsSync(srcDir)) {
      console.error(`❌ Source data directory not found at: ${srcDir}`);
      process.exit(1);
    }

    fs.mkdirSync(distDir, { recursive: true });
    const files = fs.readdirSync(srcDir);

    let count = 0;
    for (const file of files) {
      if (file.endsWith(".json")) {
        fs.copyFileSync(path.join(srcDir, file), path.join(distDir, file));
        count++;
      }
    }
    console.log(`✅ Successfully copied ${count} data files to dist/data/`);
  } catch (err) {
    console.error("❌ Failed to copy data files:", err);
    process.exit(1);
  }
}

copyData();
