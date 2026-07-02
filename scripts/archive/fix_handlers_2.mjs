import { promises as fs } from 'fs';

async function updateFile() {
  const path = 'src/pages/ContentCreationPage.tsx';
  let text = await fs.readFile(path, 'utf8');

  const oldCodeStr = `  const handleSweepNow = async () => {
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
  };`;

  text = text.replace(oldCodeStr, '');

  const correctSweepHandler = `
  const handleSweepNow = async () => {
    if (isSweeping) return;
    setIsSweeping(true);
    // showToast("جاري البحث في مصادر البيانات (يوتيوب، تريندات، تعليقات الخصوم)...", "success");
    try {
      const data = await sweepLiveTrends();
      setLiveTrends(data);
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
    // showToast("جاري تحليل التريند واختيار الهوية الدرامية المناسبة...", "success");
    try {
      const { mood: newMood, recommendedNote } = await triageTrendMood(trend.topic);
      setMood(newMood);
      setNote(recommendedNote);
    } catch(e) {
       // fallback
    } finally {
      setIsTriaging(false);
    }
  };
`;
  
  // Actually, we replaced ONE `return (` with the `useEffect` body! Let's check where the MAIN `return (` is.
  text = text.replace('return (', correctSweepHandler + '\\n  return (');

  // And let's fix LinkIcon import.
  if (!text.includes('LinkIcon,') && !text.includes('Link as LinkIcon')) {
     text = text.replace('import { Search, Link } from "lucide-react";', 'import { Search, Link as LinkIcon } from "lucide-react";');
  } else if (!text.includes('LinkIcon')) {
     text = text.replace('Link,', 'Link,\n  Link as LinkIcon,');
  }

  await fs.writeFile(path, text);
  console.log('Fixed handlers properly');
}

updateFile().catch(console.error);
