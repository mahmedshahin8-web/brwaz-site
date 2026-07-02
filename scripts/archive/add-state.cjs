const fs = require('fs');

let code = fs.readFileSync('src/pages/ContentCreationPage.tsx', 'utf8');

const target = `  const [suggestedTitles, setSuggestedTitles] = useState<RadarSuggestion[]>([]);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [generatingStepIndex, setGeneratingStepIndex] = useState(0);`;

const replacement = `  const [suggestedTitles, setSuggestedTitles] = useState<RadarSuggestion[]>([]);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [generatingStepIndex, setGeneratingStepIndex] = useState(0);
  
  const [diverseTopics, setDiverseTopics] = useState<{title: string, description: string}[]>([]);
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);
  
  const handleGenerateDiverseTopics = async () => {
    setIsGeneratingTopics(true);
    setDiverseTopics([]);
    try {
      const res = await generateDiverseTopics(mood, useOllama ? "ollama" : "gemini");
      setDiverseTopics(res);
    } catch (e) {
      console.error(e);
      notify.breach("فشل استخراج الأفكار المقترحة.");
    } finally {
      setIsGeneratingTopics(false);
    }
  };`;

if(code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/pages/ContentCreationPage.tsx', code);
  console.log("Added state");
} else {
  console.log("Target not found");
}
