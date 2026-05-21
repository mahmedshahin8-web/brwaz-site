import { promises as fs } from 'fs';

async function updateFile() {
  const path = 'src/pages/ContentCreationPage.tsx';
  let text = await fs.readFile(path, 'utf8');

  // Strip ALL handleSweepNow and handleTrendSelect
  const badDef1 = `  const handleSweepNow = async () => {\\n    if (isSweeping) return;\\n    setIsSweeping(true);\\n    // showToast("جاري البحث في مصادر البيانات (يوتيوب، تريندات، تعليقات الخصوم)...", "success");\\n    try {\\n      const data = await sweepLiveTrends();\\n      setLiveTrends(data);\\n    } catch (e) {\\n      showToast("فشل الاتصال بالمحرك المحلي. راجع إعدادات السيرفر.", "error");\\n    } finally {\\n      setIsSweeping(false);\\n    }\\n  };\\n\\n  const handleTrendSelect = async (trend: LiveTrend) => {\\n    if (isTriaging) return;\\n    setIsTriaging(true);\\n    setTopic(trend.title + ": " + trend.topic);\\n    // showToast("جاري تحليل التريند واختيار الهوية الدرامية المناسبة...", "success");\\n    try {\\n      const { mood: newMood, recommendedNote } = await triageTrendMood(trend.topic);\\n      setMood(newMood);\\n      setNote(recommendedNote);\\n    } catch(e) {\\n       // fallback\\n    } finally {\\n      setIsTriaging(false);\\n    }\\n  };`;

  text = text.replace(badDef1, '').replace(badDef1, '').replace(badDef1, '');

  const correctSweepHandler = `
  const handleSweepNow = async () => {
    if (isSweeping) return;
    setIsSweeping(true);
    try {
      const data = await sweepLiveTrends();
      setLiveTrends(data);
    } catch (e) {
      // ignore
    } finally {
      setIsSweeping(false);
    }
  };

  const handleTrendSelect = async (trend: LiveTrend) => {
    if (isTriaging) return;
    setIsTriaging(true);
    setTopic(trend.title + ": " + trend.topic);
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

  // find the final return for the component
  const finalReturnRegex = /return \(\s*<div className="min-h-screen/g;
  text = text.replace(finalReturnRegex, correctSweepHandler + '\\n  return (\\n    <div className="min-h-screen');

  // Fix LinkIcon if still broken
  if (text.includes('<LinkIcon ')) {
     if (!text.includes('LinkIcon,') && !text.includes('Link as LinkIcon')) {
         text = text.replace('import { Search, Link }', 'import { Search, Link as LinkIcon }');
         text = text.replace('import { Link }', 'import { Link as LinkIcon }');
     }
  }

  await fs.writeFile(path, text);
  console.log('Final fix to handlers applied');
}

updateFile().catch(console.error);
