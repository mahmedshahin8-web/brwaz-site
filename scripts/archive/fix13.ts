import fs from 'fs';
let lines = fs.readFileSync('src/App.tsx', 'utf-8');

// remove duplicate `</main>`
lines = lines.replace('      </main>\n      </main>\n    </div>', '      </main>\n    </div>\n    </div>');

fs.writeFileSync('src/App.tsx', lines);
