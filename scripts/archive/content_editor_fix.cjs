const fs = require('fs');
let content = fs.readFileSync('src/modules/editor/ContentEditorModule.tsx', 'utf8');

content = content.replace(
  'tsv += `${scene.visual_instruction}\\t${scene.narration}\\n`;',
  'tsv += `${scene.visual_cue}\\t${scene.voice_over}\\n`;'
);

fs.writeFileSync('src/modules/editor/ContentEditorModule.tsx', content);
