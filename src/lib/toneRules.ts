export const TONE_EXAMPLES = [
  {
    input: "يجب أن ندرك أن النظام الرأسمالي يعتمد على استهلاك الأفراد المستمر لاقتصادياته المعقدة.",
    output: "النظام الرأسمالي مبني على فكرة بسيطة جداً.. طول ما إنت بتستهلك، العجلة بتدور. اقتصاديات معقدة جداً قايمة على حاجة واحدة: تخليك دايمًا حاسس إن ناقصك حاجة."
  },
  {
    input: "أثبتت الدراسات أن الدماغ البشري يقوم بتعديل الذكريات في كل مرة نسترجعها، مما يعني أن الذاكرة ليست جهاز تسجيل دقيق.",
    output: "المخ البشري مش شريط كاسيت بتدوس بلاي فيعيد لك اللي حصل بالظبط. الدراسات أثبتت إنك كل مرة بتفتكر فيها ذكرى، مخك بيعملها 'تعديل'.. يعني حرفياً إنت بتألف ماضيك من أول وجديد."
  },
  {
    input: "في عام 1920، ظهرت أول بوادر الأزمة الاقتصادية، ولكن تجاهلها الكثيرون ظناً منهم أنها مجرد ركود مؤقت.",
    output: "سنة 1920.. أول جرس إنذار ضرب. أزمة اقتصادية بتتشكل في الأفق، بس الكل قرر يعمل نفسه مش واخد باله. كانوا فاكرينها غيمة وهتعدي، بس الحقيقة إنها كانت بداية الانهيار."
  }
];

export const BLACKLIST_WORDS = [
  "يا عزيزي",
  "دعني أخبرك",
  "بص يا سيدي",
  "هل تساءلت يوما",
  "هل تساءلت يوماً",
  "في هذا الفيديو",
  "اليوم سنتحدث عن",
  "تعال معايا",
  "تعالى معايا",
  "زي ما بنقول",
  "تخيل معي",
  "تخيل معايا",
  "كمل الفيديو للآخر",
  "مقدمة",
  "وفي النهاية",
  "خاتمة",
  "في الختام"
];

export function applyRegexPostProcessing(text: string): string {
  if (!text) return text;
  
  // Clean Korean chars
  text = text.replace(/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g, '');

  // Limit excessive dots (more than 3 becomes just 2)
  text = text.replace(/\.{3,}/g, '..');

  // Placeholder logic to protect text inside [brackets]
  const placeholders: string[] = [];
  let cleaned = text.replace(/\[.*?\]/g, (match) => {
    placeholders.push(match);
    return `__PLACEHOLDER_${placeholders.length - 1}__`;
  });

  BLACKLIST_WORDS.forEach(word => {
    // Create broad regex to catch the word
    const regex = new RegExp(word, 'gi');
    cleaned = cleaned.replace(regex, '');
  });
  
  // Restore placeholders
  placeholders.forEach((val, i) => {
    cleaned = cleaned.replace(`__PLACEHOLDER_${i}__`, val);
  });
  
  // Clean up any double spaces or dangling punctuation left over from replacement
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  cleaned = cleaned.replace(/^[،,.]\s*/g, '');
  return cleaned;
}
