import fs from "fs";
import path from "path";

const replaces = [
  { from: /#f0c722/g, to: "#3B82F6" },
  { from: /f0c722/g, to: "3B82F6" }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith(".tsx") || fullPath.endsWith(".ts")) {
      let code = fs.readFileSync(fullPath, "utf8");
      let original = code;
      
      replaces.forEach(r => {
        code = code.replace(r.from, r.to);
      });
      
      if (code !== original) {
        fs.writeFileSync(fullPath, code, "utf8");
      }
    }
  }
}

processDirectory("src");
console.log("Processed all files for f0c722.");
