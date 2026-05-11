import fs from 'fs';

let lines = fs.readFileSync('src/App.tsx', 'utf-8');
// Replace the very end
lines = lines.replace(
  /      <\/AnimatePresence>\n    <\/div>\n  \);\n}/,
  "      </AnimatePresence>\n      </main>\n    </div>\n  );\n}"
);

fs.writeFileSync('src/App.tsx', lines);
