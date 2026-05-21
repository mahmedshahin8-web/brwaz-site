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
        'p-1': 'p-2', // wait p-1 is 4px (multiple of 4), the user explicitly allowed p-2, p-4, p-6.
        'p-3': 'p-4',
        'p-5': 'p-6',
        'p-7': 'p-8',
        'px-3': 'px-4',
        'px-5': 'px-6',
        'py-3': 'py-4',
        'py-5': 'py-6',
        'gap-3': 'gap-4',
        'gap-5': 'gap-6',
        'm-3': 'm-4',
        'm-5': 'm-6',
        'mx-3': 'mx-4',
        'mx-5': 'mx-6',
        'my-3': 'my-4',
        'my-5': 'my-6',
      };
      
      let modified = false;
      Object.keys(replacements).forEach(key => {
        // regex to match word boundary
        const regex = new RegExp(`\\b${key}\\b`, 'g');
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
