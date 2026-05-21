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
        'px-24 py-7': 'px-10 py-3.5',
        'px-14 py-7': 'px-8 py-3.5',
        'px-16 py-6': 'px-8 py-3',
        'px-8 lg:px-20 py-12': 'px-6 lg:px-12 py-8',
        'px-10 py-4': 'px-6 py-3',
      };
      
      let modified = false;
      Object.keys(replacements).forEach(key => {
        if (content.includes(key)) {
            content = content.replace(new RegExp(key, 'g'), replacements[key]);
            modified = true;
        }
      });
      
      const spaceReplacements = {
        'space-y-16': 'space-y-10',
        'space-y-12': 'space-y-8',
        'gap-10': 'gap-6',
        'gap-20': 'gap-8',
      }
      
      Object.keys(spaceReplacements).forEach(key => {
        if (content.includes(key)) {
            content = content.replace(new RegExp(key, 'g'), spaceReplacements[key]);
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
