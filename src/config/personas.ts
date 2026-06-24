import { PersonaType } from "../types";
import { MOODS } from "./moods";

export interface PersonaDefinition {
  id: PersonaType;
  label: string;
  desc: string;
  defaultCompatibility: number;
  quote?: string;
  dna?: string[];
  avatar?: string;
}

export const getPersonaCompatibility = (personaId: PersonaType, moodType: string): { score: number; isRecommended: boolean } => {
  return { score: 100, isRecommended: true };
};

export const PERSONAS: PersonaDefinition[] = [
  { 
    id: "الدحيح", 
    label: "صوت الدحيح (The Master Voice)", 
    desc: "صوت راوي واحد موحد بيقدم كل المواضيع (تاريخ، اقتصاد، فلسفة، علوم) بنفس الكاريزما العالية، السخرية الذكية، والوتيرة السريعة بدون ما يغير هويته الأساسية. بيلعب بكل الطبقات.", 
    defaultCompatibility: 100, 
    quote: "«بص يا سيدي الفاضل، الموضوع أعقد مما تتخيل... بس خليني أبسطهالك.»", 
    dna: ["بوب كالشر", "سريع لاهث", "ذكي", "ساخر"] 
  }
];
