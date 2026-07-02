const fs = require('fs');
let content = fs.readFileSync('src/modules/editor/ContentEditorModule.tsx', 'utf8');

// 1. Add generationTook to ContentEditorModuleProps
content = content.replace(
  'renderSceneCards: React.ReactNode;',
  'renderSceneCards: React.ReactNode;\n  generationTook?: number | null;'
);

// 2. Add it to parameters 
content = content.replace(
  'renderSceneCards',
  'renderSceneCards,\n  generationTook'
);

// 3. Render it inside the header of the Editor Module
const targetHeader = `<h3 className="text-sm font-mono text-[#6d6964] uppercase tracking-widest flex items-center gap-3 font-bold">`;
const replacementHeader = `<div className="flex items-center gap-4">
          <h3 className="text-sm font-mono text-[#6d6964] uppercase tracking-widest flex items-center gap-3 font-bold">`;

content = content.replace(targetHeader, replacementHeader);

const targetHeaderEnd = `الرادار والتقييم الذكي (Evaluation)
        </h3>`;
const replacementHeaderEnd = `الرادار والتقييم الذكي (Evaluation)
          </h3>
          {generationTook && (
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-mono font-bold animate-fade-in">
              <Activity size={14} className="animate-pulse" />
              تم التوليد في {generationTook} ثانية
            </div>
          )}
        </div>`;

content = content.replace(targetHeaderEnd, replacementHeaderEnd);

// Also add it near the top script header if he wants to see it there
const topHeaderTarget = `<span className="flex items-center gap-1 text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded animate-pulse">
                 Live Editor
               </span>
            </div>`;

const topHeaderReplacement = `<span className="flex items-center gap-1 text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded animate-pulse">
                 Live Editor
               </span>
               {generationTook && (
                 <span className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 border border-emerald-500/20 px-2 py-0.5 rounded animate-fade-in shadow-inner">
                   <Activity size={12} className="animate-pulse" />
                   {generationTook}S
                 </span>
               )}
            </div>`;
content = content.replace(topHeaderTarget, topHeaderReplacement);

fs.writeFileSync('src/modules/editor/ContentEditorModule.tsx', content);

let pageContent = fs.readFileSync('src/pages/ContentCreationPage.tsx', 'utf8');
pageContent = pageContent.replace(
  '<ContentEditorModule ',
  '<ContentEditorModule \n                generationTook={generationTook}'
);
fs.writeFileSync('src/pages/ContentCreationPage.tsx', pageContent);
