const fs = require("fs");
const path = require("path");

const OUTPUT_FILE = "v5_summary.txt";
const MAX_PREVIEW_LINES = 10;
const ALLOWED_EXT = [".js", ".ts", ".tsx", ".json", ".md", ".txt"];

let result = "";

function summarizeFile(filePath) {
  const ext = path.extname(filePath);
  if (!ALLOWED_EXT.includes(ext)) return;

  const relativePath = path.relative(__dirname, filePath);
  let content = "";

  try {
    content = fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    return;
  }

  const lines = content.split("\n").slice(0, MAX_PREVIEW_LINES);
  const preview = lines.join("\n");
  const commentMatch = content.match(/\/\*\*([\s\S]*?)\*\//) || content.match(/\/\/(.*)/);

  result += `\n---\n📄 ${relativePath}\n`;
  if (commentMatch) {
    result += `📝 Komentář:\n${commentMatch[1].trim()}\n`;
  }
  result += `🔍 Náhled:\n${preview.trim()}\n`;
}

function walkDir(dirPath) {
  fs.readdirSync(dirPath).forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else {
      summarizeFile(fullPath);
    }
  });
}

// Start
console.log("📦 Skenuji repozitář...");
walkDir(__dirname);
fs.writeFileSync(OUTPUT_FILE, result);
console.log(`✅ Hotovo. Shrnutí zapsáno do ${OUTPUT_FILE}`);
