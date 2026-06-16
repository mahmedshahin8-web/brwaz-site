const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const removeRegex = (regex) => {
  code = code.replace(regex, '');
};

// Remove mock endpoints from server.ts
code = code.replace(/app\.post\("\/api\/rag\/retrieve", \([\s\S]*?\}\);\n/, '');
code = code.replace(/const routeToModel = \([\s\S]*?\};\n/, '');
code = code.replace(/app\.post\("\/api\/rag\/interrogate", \([\s\S]*?\}\);\n/, '');
code = code.replace(/app\.post\("\/api\/rag\/red_string_extract", \([\s\S]*?\}\);\n/, '');
code = code.replace(/app\.get\("\/api\/rag\/radar_nodes", \([\s\S]*?\}\);\n/, '');
code = code.replace(/app\.get\("\/api\/trends\/public", \([\s\S]*?\}\);\n/, '');

fs.writeFileSync('server.ts', code);
