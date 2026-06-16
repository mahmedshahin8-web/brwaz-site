const fs = require('fs');
let c = fs.readFileSync('src/pages/ScriptEditor.tsx', 'utf8');

c = c.replace(
  /<button onClick={\(\) => setActiveInspectorTab\('traceability'\)} className={`flex-1 p-3 text-\[9px\] font-mono uppercase tracking-widest transition-colors \${activeInspectorTab === 'traceability' \? 'bg-\[#121214\] text-\[#fafafa\] border-b-2 border-\[#4f46e5\]' : 'text-\[#a1a1aa\] active:scale-95 border-\[#27272a\] shadow-sm'}`}>/g,
  '<button onClick={() => setActiveInspectorTab(\'traceability\')} className={`flex-1 p-3 text-xs font-semibold font-arabic transition-colors ${activeInspectorTab === \'traceability\' ? \'bg-[#121214] text-[#fafafa] border-b-2 border-[#4f46e5]\' : \'text-[#a1a1aa] hover:text-[#fafafa] active:scale-95\'}`}>'
);

c = c.replace(
  /<button onClick={\(\) => setActiveInspectorTab\('director'\)} className={`flex-1 p-3 text-\[9px\] font-mono uppercase tracking-widest transition-colors \${activeInspectorTab === 'director' \? 'bg-cyan-500\/10 text-cyan-400 border-b-2 border-cyan-400' : 'text-\[#a1a1aa\] active:scale-95 border-\[#27272a\] shadow-sm'}`}>/g,
  '<button onClick={() => setActiveInspectorTab(\'director\')} className={`flex-1 p-3 text-xs font-semibold font-arabic transition-colors ${activeInspectorTab === \'director\' ? \'bg-[#121214] text-[#fafafa] border-b-2 border-[#4f46e5]\' : \'text-[#a1a1aa] hover:text-[#fafafa] active:scale-95\'}`}>'
);

c = c.replace(
  /<List className="w-3 h-3 mx-auto mb-1" \/>\s*Trace\s*<\/button>/g,
  '<List className="w-4 h-4 mx-auto mb-1" />\nالمساعد والمصادر\n</button>'
);

c = c.replace(
  /<Film className="w-3 h-3 mx-auto mb-1" \/>\s*Director\s*<\/button>/g,
  '<Film className="w-4 h-4 mx-auto mb-1" />\nإخراج المشاهد\n</button>'
);

fs.writeFileSync('src/pages/ScriptEditor.tsx', c);
