import { promises as fs } from 'fs';

async function updateFile() {
  const path = 'src/pages/ContentCreationPage.tsx';
  let text = await fs.readFile(path, 'utf8');

  // We add handleSweepNow and handleTrendSelect just before "return (" inside "export default function ContentCreationPage"
  const sweepHandler = `
  const handleSweepNow = async () => {
    if (isSweeping) return;
    setIsSweeping(true);
    showToast("جاري البحث في مصادر البيانات (يوتيوب، تريندات، تعليقات الخصوم)...", "info");
    try {
      const data = await sweepLiveTrends();
      setLiveTrends(data);
      showToast("تم تحديث الرادار الاستقصائي بنجاح!", "success");
    } catch (e) {
      showToast("فشل الاتصال بالمحرك المحلي. راجع إعدادات السيرفر.", "error");
    } finally {
      setIsSweeping(false);
    }
  };

  const handleTrendSelect = async (trend: LiveTrend) => {
    if (isTriaging) return;
    setIsTriaging(true);
    setTopic(trend.title + ": " + trend.topic);
    showToast("جاري تحليل التريند واختيار الهوية الدرامية المناسبة...", "info");
    try {
      const { mood: newMood, recommendedNote } = await triageTrendMood(trend.topic);
      setMood(newMood);
      setNote(recommendedNote);
      showToast(\`تم ضبط المود على: \${newMood}\`, "success");
    } catch(e) {
       // fallback
    } finally {
      setIsTriaging(false);
    }
  };
`;

  if (!text.includes('const handleSweepNow = async () => {')) {
     text = text.replace('return (', sweepHandler + '\\n  return (');
  }
  
  if (!text.includes('LinkIcon')) {
     text = text.replace('import { Search, Link } from "lucide-react";', 'import { Search, Link as LinkIcon } from "lucide-react";');
  }

  await fs.writeFile(path, text);
  console.log('Fixed handlers');
}

updateFile().catch(console.error);
