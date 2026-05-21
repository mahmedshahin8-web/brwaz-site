import fs from "fs";
import path from "path";

const replaces = [
  { from: /bg-\[#050505\]/g, to: "bg-gray-50" },
  { from: /bg-\[#0a0a0a\]/g, to: "bg-white" },
  { from: /bg-\[#f0c722\]/gi, to: "bg-blue-600" },
  { from: /text-\[#f0c722\]/gi, to: "text-blue-600" },
  { from: /border-\[#f0c722\]/gi, to: "border-blue-500" },
  { from: /shadow-\[0_0_15px_#f0c722\]/gi, to: "shadow-md shadow-blue-500/20" },
  { from: /shadow-\[0_0_20px_#f0c722\]/gi, to: "shadow-md shadow-blue-500/20" },
  { from: /shadow-\[0_0_10px_#f0c722\]/gi, to: "shadow-md shadow-blue-500/20" },
  { from: /stroke-\[#f0c722\]/gi, to: "stroke-blue-500" },
  { from: /fill-\[#f0c722\]/gi, to: "fill-blue-500" },
  { from: /fill-\[#f0c722\]\/10/gi, to: "fill-blue-500/10" },
  { from: /hover:stroke-\[#f0c722\]/gi, to: "hover:stroke-blue-500" },
  { from: /shadow-\[0_10px_30px_rgba\(240,199,34,0\.2\)\]/gi, to: "shadow-lg shadow-blue-500/10" },
  { from: /shadow-\[0_10px_30px_rgba\(240,199,34,0\.3\)\]/gi, to: "shadow-lg shadow-blue-500/10" },
  { from: /shadow-\[0_15px_50px_rgba\(255,255,255,0\.4\)\]/gi, to: "shadow-xl shadow-gray-200" },
  { from: /shadow-\[0_15px_40px_rgba\(0,0,0,0\.4\)\]/g, to: "shadow-lg shadow-gray-200" },
  { from: /text-white\/10/g, to: "text-gray-400" },
  { from: /text-white\/20/g, to: "text-gray-500" },
  { from: /text-white\/30/g, to: "text-gray-500" },
  { from: /text-white\/40/g, to: "text-gray-600" },
  { from: /text-white\/50/g, to: "text-gray-600" },
  { from: /text-white\/60/g, to: "text-gray-600" },
  { from: /border-white\/5/g, to: "border-gray-200" },
  { from: /border-white\/10/g, to: "border-gray-200" },
  { from: /border-white\/20/g, to: "border-gray-300" },
  { from: /border-white\/30/g, to: "border-gray-300" },
  { from: /bg-white\/5/g, to: "bg-white border-gray-100 shadow-sm" },
  { from: /bg-white\/10/g, to: "bg-gray-100" },
  { from: /bg-white\/20/g, to: "bg-gray-100" },
  { from: /bg-white\/\[0\.02\]/g, to: "bg-gray-50" },
  { from: /bg-black\/40/g, to: "bg-white shadow-sm" },
  { from: /bg-black\/60/g, to: "bg-gray-50" },
  { from: /bg-black\/80/g, to: "bg-white/80" },
  { from: /bg-black\b/g, to: "bg-white" },
  { from: /text-white/g, to: "text-gray-900" },
  { from: /text-white\/90/g, to: "text-gray-800" },
  { from: /cyber-glass-glow/g, to: "" },
  { from: /cyber-glass/g, to: "bg-white border border-gray-200 shadow-md rounded-xl" },
  { from: /micro-grid/g, to: "" },
  { from: /"#f0c722"/g, to: '"#3B82F6"' },
  { from: /stroke-#f0c722/g, to: "stroke-blue-500" },
  { from: /fill-#f0c722\/10/g, to: "fill-blue-500/10" },
  { from: /fill-#f0c722/g, to: "fill-blue-500" },
  { from: /hover:stroke-#f0c722/g, to: "hover:stroke-blue-500" },
  { from: /hover:border-white\/30/g, to: "hover:border-gray-300" },
  { from: /text-gray-900 font-mono/g, to: "text-gray-800 font-mono" }
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
console.log("Processed all files.");
