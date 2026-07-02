import { promises as fs } from 'fs';

async function fixFile() {
  const path = 'src/pages/ContentCreationPage.tsx';
  let text = await fs.readFile(path, 'utf8');

  const handlerRegex = /const handleSweepNow[\s\S]*?const handleTrendSelect[\s\S]*?setIsTriaging\(false\);\n[ ]{4}\}\n[ ]{2}\};/;

  // remove it globally
  text = text.replace(handlerRegex, '');
  text = text.replace(handlerRegex, '');

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

  // insert it before   const handleGenerateEpisode
  text = text.replace('  const handleGenerateEpisode', correctSweepHandler + '\\n  const handleGenerateEpisode');

  // Fix LinkIcon and Search
  if (!text.includes('LinkIcon')) {
      text = text.replace('import {\\n  Mic,', 'import {\\n  Mic,\\n  Link as LinkIcon,\\n  Search,');
      text = text.replace('import { Mic,', 'import { Mic, Link as LinkIcon, Search,');
      text = text.replace('import {\\n  Play,', 'import {\\n  Play,\\n  Link as LinkIcon,\\n  Search,');
  }

  await fs.writeFile(path, text);
  console.log("Handlers forcefully planted where they belong.");
}

fixFile().catch(console.error);
