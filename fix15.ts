import fs from 'fs';
let lines = fs.readFileSync('src/App.tsx', 'utf-8').split('\n');

const missingFuncs = `  const saveDossier = () => {
    if (!data) return;
    setIsSaved(true);
    autoSaveDossier(data);
    showToast('تم الحفظ في الأرشيف بنجاح!');
  };

  const handleDownloadVoiceScript = () => {
    if (!finalVoiceScript) return;
    const blob = new Blob([finalVoiceScript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`VoiceScript_\${data?.video_title.replace(/\\s+/g, '_')}.txt\`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('تم تحميل النص الصوتي بنجاح!');
  };`;

const targetIdx = lines.findIndex(l => l.includes('const handleDownloadNote = () => {'));
if (targetIdx !== -1) {
  lines.splice(targetIdx, 0, ...missingFuncs.split('\n'));
}

fs.writeFileSync('src/App.tsx', lines.join('\n'));
