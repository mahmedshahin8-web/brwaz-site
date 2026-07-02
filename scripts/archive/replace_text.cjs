const fs = require("fs");
const path = require("path");

const replaceInDir = (dir) => {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith(".tsx") || fullPath.endsWith(".ts")) {
      let content = fs.readFileSync(fullPath, "utf-8");
      
      const replacements = {
        'text-\\[10px\\]': 'text-micro',
        'text-\\[12px\\]': 'text-xs',
        'text-\\[14px\\]': 'text-base',
        'text-\\[20px\\]': 'text-xl',
        'text-\\[24px\\]': 'text-2xl',
        'text-\\[11px\\]': 'text-[11px]' // keep as is
      };
      
      let modified = false;
      Object.keys(replacements).forEach(key => {
        const regex = new RegExp(key, 'g');
        if (regex.test(content)) {
            content = content.replace(regex, replacements[key]);
            modified = true;
        }
      });
      
      if(modified) {
        fs.writeFileSync(fullPath, content);
        console.log("Replaced in " + fullPath);
      }
    }
  });
};

replaceInDir("src");
