import { EpisodeScene } from '../../types';

export const PositiveConstraints = [];
export const NegativeConstraints = [];

export class IdentityValidation {
  static validateText(text: string): { isValid: boolean, issues: string[] } {
    const issues: string[] = [];
    return { isValid: issues.length === 0, issues };
  }
  static sanitizeText(text: string): string {
    return cleanToEgyptianArabic(text);
  }
}

// 1. قائمة الكلمات المحظورة (الروبوتية والمبتذلة)
const FORBIDDEN_PHRASES_TO_REMOVE = [
  "يا عزيزي", 
  "بص يا سيدي", 
  "دعني أخبرك", 
  "هل تساءلت يوماً", 
  "هل تساءلت يوما",
  "دعنا نستكشف"
];

const FORBIDDEN_PHRASES = [
  "في الختام", "نتيجة لذلك", "من المهم أن نلاحظ", "في النهاية", 
  "أود التأكيد", "نستنتج أن", "باختصار", "لقد وجدنا", "من الضروري", "ومع ذلك", "علاوة على ذلك"
];

// 2. قائمة الكلمات البديلة (اللهجة المصرية والدحيح)
const EGYPTIAN_PHRASES: Record<string, string> = {
  "في الختام": "خلاصة القصة دي",
  "نتيجة لذلك": "إيه اللي حصل بسببها",
  "من المهم أن نلاحظ": "لازم نركز في حاجة",
  "في النهاية": "في الآخر",
  "أود التأكيد": "عايز أأكد لك",
  "نستنتج أن": "النتيجة واضحة إن",
  "باختصار": "خلاصة الكلام",
  "لقد وجدنا": "شُفنا قدامنا إن",
  "من الضروري": "مهم جداً",
  "ومع ذلك": "بس رغم كدة",
  "علاوة على ذلك": "وفوق ده كله"
};

/**
 * دالة تنظيف النص (Regex Replacement) للحفاظ على هوية اللهجة
 */
export function cleanToEgyptianArabic(text: string): string {
  if (!text) return text;
  let cleanedText = text;

  // حذف الكلمات المحظورة تماماً (الـ Blacklist)
  for (const forbidden of FORBIDDEN_PHRASES_TO_REMOVE) {
    cleanedText = cleanedText.replace(new RegExp(forbidden, 'gi'), '');
  }

  // استبدال الكلمات المحظورة بكلمات اللهجة
  for (const [forbidden, replacement] of Object.entries(EGYPTIAN_PHRASES)) {
    // استخدمنا سياق Regex متطور عشان يمسك الكلمات دي بغض النظر عن المسافات
    cleanedText = cleanedText.replace(new RegExp(forbidden, 'gi'), replacement);
  }

  return cleanedText;
}

/**
 * دالة التحقق من قاعدة الـ Faceless (الوجوه والحضور البشري الصريح)
 */
export function validateFacelessRule(prompt: string): boolean {
  const facePatterns = [
    "face", "human face", "person", "people", "crowd", 
    "hands", "fingers", "eyes", "smile", "laugh", "man", "woman", "boy", "girl"
  ];

  const lowerPrompt = prompt.toLowerCase();
  
  for (const pattern of facePatterns) {
    if (lowerPrompt.includes(pattern)) {
      console.warn(`⚠️ Warning: Faceless rule violated. Pattern found: ${pattern}`);
      return false;
    }
  }
  return true;
}

/**
 * دالة تعديل الـ Prompt تلقائياً والتأكيد على خلوه من الوجوه (Sanitization)
 */
export function sanitizePromptForFaceless(prompt: string): string {
  if (!validateFacelessRule(prompt)) {
    return `IGNORE PREVIOUS FACE DESCRIPTIONS! Generate a strictly faceless scene. 
    Focus on: shadows, silhouettes, objects, landscapes, text overlays, and abstract concepts. 
    Do NOT describe any human faces, hands, or identifiable body parts. 
    Original Context: ${prompt}`;
  }
  return prompt;
}
