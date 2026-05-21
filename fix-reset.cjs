const fs = require('fs');

let content = fs.readFileSync('src/pages/ContentCreationPage.tsx', 'utf8');

content = content.replace(/  const resetBoard = \(\) => {\n    setSuggestedTitles\(\[\]\);\n    setTopic\(""\);\n    setNote\(""\);\n    setError\(""\);\n    setData\(null\);\n  };\n/g, '');

fs.writeFileSync('src/pages/ContentCreationPage.tsx', content);
