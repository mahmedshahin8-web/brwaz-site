const fs = require("fs");
const path = require("path");

const replaceInDir = (dir) => {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith(".tsx") || fullPath.endsWith(".ts") || fullPath.endsWith(".css")) {
      let content = fs.readFileSync(fullPath, "utf-8");
      if(content.includes("premium-gold")) {
        fs.writeFileSync(fullPath, content.replace(/premium-gold/g, "muted-amber"));
        console.log("Replaced in " + fullPath);
      }
    }
  });
};

replaceInDir("src");
