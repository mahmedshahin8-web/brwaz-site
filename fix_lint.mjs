import fs from 'fs';

let content = fs.readFileSync('src/pages/ContentCreationPage.tsx', 'utf8');

// remove second redeclaration of handleDownloadVoiceScript (from the one I added)
const secondHandleDownloadVoiceScript = `  const handleDownloadVoiceScript = () => {
    const blob = new Blob([finalVoiceScript], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "final_voice_script.txt");
  };`;
content = content.replace(secondHandleDownloadVoiceScript, "");

// Add SceneCard import under ImageWithFallback
content = content.replace(
  'import { ImageWithFallback } from "../components/ImageWithFallback";',
  'import { ImageWithFallback } from "../components/ImageWithFallback";\nimport { SceneCard } from "../components/SceneCard";'
);

// We still have error with SceneCard not found. Wait, is it `src/components/SceneCard.tsx` or what?
// The component is SceneCard.
fs.writeFileSync('src/pages/ContentCreationPage.tsx', content);
console.log('Fixed redeclaration and import');
