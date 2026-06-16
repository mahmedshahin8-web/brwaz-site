import * as Comlink from 'comlink';

const NUMBER_MAP: Record<string, string> = {
  "0": "صفر",
  "1": "واحد",
  "2": "اتنين",
  "3": "تلاتة",
  "4": "أربعة",
  "5": "خمسة",
  "6": "ستة",
  "7": "سبعة",
  "8": "تمانية",
  "9": "تسعة",
  "10": "عشرة",
  "11": "حدعشر",
  "12": "اتنعشر",
  "20": "عشرين",
  "30": "تلاتين",
  "40": "أربعين",
  "50": "خمسين",
  "60": "ستين",
  "70": "سبعين",
  "80": "تمانين",
  "90": "تسعين",
  "100": "مية",
  "1000": "ألف"
};

export const audioWorkerMethods = {
  convertToEgyptian(text: string): string {
    let processed = text;

    const wordSwaps: Record<string, string> = {
      "لماذا": "ليه",
      "ماذا": "إيه",
      "الذي": "اللي",
      "التي": "اللي",
      "الذين": "اللي",
      "لا أعلم": "مش عارف",
      "لا أعرف": "مش عارف",
      "كيف": "إزاي",
      "نعم": "أيوة",
      "هكذا": "كده",
      "الآن": "دلوقتي",
      "كثيراً": "أوي",
      "ليس": "مش",
      "هناك": "هناك",
      "جداً": "جداً"
    };
    
    Object.entries(wordSwaps).forEach(([formal, colloquial]) => {
      const regex = new RegExp(`\\b${formal}\\b`, 'g');
      processed = processed.replace(regex, colloquial);
    });

    processed = processed.replace(/\d+/g, (match) => {
      return NUMBER_MAP[match] || match;
    });

    const formalWords = ["قرآن", "قانون", "قاهرة", "قدس", "قارة", "قوم", "قوة", "قسم", "قصة", "ثقافة", "تاريخ", "عظيم", "ظروف"];
    
    const words = processed.split(/\s+/);
    const convertedWords = words.map(word => {
      let cleanWord = word.replace(/^[ال|فال|وال|بال|كال|لل]/, '');
      
      if (formalWords.some(f => word.includes(f))) {
        return word;
      }
      
      return word;
    });

    processed = convertedWords.join(' ');

    return processed;
  },

  extractAndCleanScript(rawText: string): string {
    // Remove anything in brackets: (), [], <>, {} to prevent TTS reading directions
    const withoutBrackets = rawText.replace(/[\[\(\<\{][^\]\)\>\}]*[\]\)\>\}]/g, '');
    
    // Remove remaining character names if structured like "Name: "
    const withoutNames = withoutBrackets.replace(/^[A-Za-z\u0600-\u06FF\s]+:/gm, '');
    
    // Clean up multiple dots
    const cleanedDots = withoutNames.replace(/\.{2,}/g, ' ');
    
    let lines = cleanedDots.split('\n');
    let extractedLines: string[] = [];

    lines.forEach(line => {
      let cleanLine = line.trim();
      if (!cleanLine) return;
      
      if (cleanLine.startsWith('|') && (cleanLine.includes('---') || cleanLine.includes('visual'))) return;

      if (cleanLine.startsWith('|')) {
        const cells = cleanLine.split('|').map(c => c.trim()).filter(c => c.length > 0);
        
        if (cells.some(c => c.toLowerCase().includes('asset id') || c.includes('---'))) return;

        if (cells.length >= 3) {
          cleanLine = cells[1]; 
        } else if (cells.length === 2) {
          const cText = cells[1];
          const hasArabic = /[\u0600-\u06FF]/.test(cText);
          if (hasArabic) cleanLine = cText;
        }
      }

      cleanLine = cleanLine.replace(/^(المشهد \d+:|السكريبت:|نص السرد:|الراوي:)/, '');

      const final = cleanLine.trim();
      if (final && /[\u0600-\u06FF]/.test(final)) {
        extractedLines.push(final);
      }
    });

    return extractedLines.join('\n');
  }
};

Comlink.expose(audioWorkerMethods);
