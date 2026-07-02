import fs from 'fs';

let lines = fs.readFileSync('src/App.tsx', 'utf-8').split('\n');

// Find the line that has "غرفة عمليات صناعة المحتوى"
const lineIdx = lines.findIndex(l => l.includes("غرفة عمليات صناعة المحتوى"));

if (lineIdx !== -1) {
  // It's followed by `            </p>` and `          </div>`
  
  // We need to insert:
  // `        </div>`
  // `      </header>`
  // `      {/* Main Content Area */}`
  // `      <main className="relative z-30 max-w-7xl mx-auto px-6 py-12 flex flex-col items-center">`
  // `        {!data && (`
  
  lines.splice(lineIdx + 3, 0, 
    '        </div>',
    '      </header>',
    '      {/* Main Content Area */}',
    '      <main className="relative z-30 max-w-7xl mx-auto px-6 py-12 flex flex-col items-center">',
    '        {!data && ('
  );
  
  // Also we need to make sure the matching closing tags exist.
  // We need a `</main>` before the final `</div>\n  );\n}`
  // wait, what is near the end?
  
  fs.writeFileSync('src/App.tsx', lines.join('\n'));
}
