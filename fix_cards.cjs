const fs = require('fs');
let c = fs.readFileSync('src/pages/ScriptEditor.tsx', 'utf8');

c = c.replace(
  /const isVRAM = block.sourceAgent === 'VRAM_MGR';\s*const isNLP = block.sourceAgent === 'NLP_ENGINE';\s*const isTTS = block.sourceAgent === 'TTS_ENGINE';\s*const isWritersRoom = block.sourceAgent === 'WRITERS_ROOM';/,
  `const isVRAM = block.sourceAgent === 'VRAM_MGR';
                         const isNLP = block.sourceAgent === 'NLP_ENGINE';
                         const isTTS = block.sourceAgent === 'TTS_ENGINE';
                         const isWritersRoom = block.sourceAgent === 'WRITERS_ROOM';
                         
                         let agentName = block.sourceAgent === 'WRITERS_ROOM' ? 'وكيل الصياغة' : block.sourceAgent === 'VRAM_MGR' ? 'مدير الموارد' : block.sourceAgent === 'TTS_ENGINE' ? 'مهندس الصوت' : 'باحث المعلومات (غندور)';
                         `
);

c = c.replace(
  /<p className="text-\[10px\] text-\[#a1a1aa\] mt-1 leading-relaxed">System Trace Event<\/p>/g,
  '<p className="text-[10px] text-[#a1a1aa] mt-0.5 font-medium">بطاقة إفادة بحثية / اقتراح</p>'
);

c = c.replace(
  /<h4 className={`text-\[10px\] font-mono tracking-widest uppercase font-bold \${iconColor}`}>{block.sourceAgent \|\| 'SYSTEM_NODE'}<\/h4>/g,
  '<h4 className={`text-sm font-bold font-arabic ${iconColor}`}>{agentName}</h4>'
);

c = c.replace(
  /<div key=\{idx\} className="border border-\[#27272a\] bg-\[#27272a\]\/50 active:scale-95 transition-colors duration-100">/g,
  '<div key={idx} className="border border-[#27272a] bg-[#121214] rounded-xl hover:bg-[#27272a]/20 transition-all duration-200">'
);

c = c.replace(
  /<div className={`w-6 h-6 border \${borderColor} flex items-center justify-center shrink-0`}>/g,
  '<div className={`w-8 h-8 rounded-lg bg-[#27272a]/50 flex items-center justify-center shrink-0`}>'
);

c = c.replace(
  /<div className="p-3 text-\[11px\] text-\[#fafafa\]\/80 leading-relaxed font-mono tracking-wide line-clamp-3">/g,
  '<div className="p-4 text-xs text-[#fafafa]/80 leading-relaxed font-medium line-clamp-3">'
);

c = c.replace(
  /<span className={`\${iconColor} font-mono inline-block mr-2 opacity-80`}>{'>'}<\/span>/g,
  ''
);

fs.writeFileSync('src/pages/ScriptEditor.tsx', c);
