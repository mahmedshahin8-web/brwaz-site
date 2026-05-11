
/**
 * Utility to process raw Barwaz scripts into Egyptian phonetic voice-over scripts.
 */

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

/**
 * Phonetically converts Arabic text to Egyptian colloquialisms for TTS.
 */
export function convertToEgyptian(text: string): string {
  let processed = text;

  // 1. Word Swapping (Formal to Egyptian)
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

  // 2. Convert numbers to words (Basic)
  processed = processed.replace(/\d+/g, (match) => {
    return NUMBER_MAP[match] || match;
  });

  // 3. Letter Swapping: Selective but aggressive for colloquial
  const formalWords = ["قرآن", "قانون", "قاهرة", "قدس", "قارة", "قوم", "قوة", "قسم", "قصة", "ثقافة", "تاريخ", "عظيم", "ظروف"];
  
  // Split words and process
  const words = processed.split(/\s+/);
  const convertedWords = words.map(word => {
    let cleanWord = word.replace(/^[ال|فال|وال|بال|كال|لل]/, '');
    
    if (formalWords.some(f => word.includes(f))) {
      return word;
    }
    
    // Replace letters
    return word
      .replace(/ق/g, 'أ')
      .replace(/ث/g, 'ت')
      .replace(/ذ/g, 'د')
      .replace(/ظ/g, 'ض');
  });

  // 4. Breathing: Inject (...) every 5-7 words to force natural pauses
  let withPauses = [];
  let wordCount = 0;
  for (let i = 0; i < convertedWords.length; i++) {
    withPauses.push(convertedWords[i]);
    wordCount++;
    if (wordCount >= 6 && i < convertedWords.length - 1) {
      if (!/[،.!؟]/.test(convertedWords[i])) {
        withPauses.push("...");
      }
      wordCount = 0; // Reset
    }
  }

  processed = withPauses.join(' ')
    .replace(/\s+\.\.\./g, '...')
    .replace(/،/g, '، ... '); // Add dramatic pause after commas

  return processed;
}

/**
 * Parses raw input and extracts only the dialogue.
 */
export function extractAndCleanScript(rawText: string): string {
  let lines = rawText.split('\n');
  let extractedLines: string[] = [];

  // Filter for lines that look like dialogue
  // Pattern: Look for text after common headers or inside table cells
  lines.forEach(line => {
    let cleanLine = line.trim();
    
    // Skip table headers and separators
    if (cleanLine.startsWith('|') && (cleanLine.includes('---') || cleanLine.includes('visual'))) return;

    // Handle Markdown tables: Extract content between | and |
    if (cleanLine.startsWith('|')) {
      const cells = cleanLine.split('|').map(c => c.trim()).filter(c => c.length > 0);
      
      // If it's the header row or separator, skip it
      if (cells.some(c => c.toLowerCase().includes('asset id') || c.includes('---'))) return;

      // In the new Barwaz table format:
      // Column 0: Asset ID, Column 1: Voiceover, Column 2: Visual Map
      if (cells.length >= 3) {
        cleanLine = cells[1]; // Take the second column (Voiceover)
      } else if (cells.length === 2) {
        // Fallback for smaller tables
        const cText = cells[1];
        const hasArabic = /[\u0600-\u06FF]/.test(cText);
        if (hasArabic) cleanLine = cText;
      }
    }

    // Remove "المشهد X:" or "السكريبت:" labels
    cleanLine = cleanLine.replace(/^(المشهد \d+:|السكريبت:|نص السرد:|الراوي:)/, '');

    // Remove text in brackets [action cues]
    cleanLine = cleanLine.replace(/\[.*?\]/g, '');
    cleanLine = cleanLine.replace(/\(.*?\)/g, '');

    // Remove English words/sentences mixed in
    cleanLine = cleanLine.replace(/[A-Za-z]{3,}/g, '');

    // Final trim and check
    const final = cleanLine.trim();
    if (final && /[\u0600-\u06FF]/.test(final)) {
      extractedLines.push(final);
    }
  });

  return extractedLines.join('\n');
}
