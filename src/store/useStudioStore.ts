import { create } from 'zustand';
import { EpisodeData, PersonaType } from '../types';
import { MoodType } from '../lib/gemini';

interface StudioState {
  // Episode Metadata
  topic: string;
  setTopic: (topic: string) => void;
  duration: number;
  setDuration: (duration: number) => void;
  mood: MoodType;
  setMood: (mood: MoodType) => void;
  persona: PersonaType;
  setPersona: (persona: PersonaType) => void;
  suspenseLevel: number;
  setSuspenseLevel: (level: number) => void;

  // Final Production Snapshot (For Export)
  finalProductionSnapshot: EpisodeData | null;
  setFinalProductionSnapshot: (data: EpisodeData | null) => void;
  
  // Chunked Generation State
  generatedScenes: any[];
  setGeneratedScenes: (scenes: any[] | ((prev: any[]) => any[])) => void;
  currentChapterIndex: number;
  setCurrentChapterIndex: (index: number) => void;

  // Cheat Sheet / B-Roll
  bRollKeywords: string[];
  setBRollKeywords: (keywords: string[]) => void;
  sfxList: string[];
  setSfxList: (sfx: string[]) => void;
}

export const useStudioStore = create<StudioState>((set) => ({
  topic: '',
  setTopic: (topic) => set({ topic }),
  duration: 10,
  setDuration: (duration) => set({ duration }),
  mood: 'التحليل الاستقصائي',
  setMood: (mood) => set({ mood }),
  persona: 'النبّاش',
  setPersona: (persona) => set({ persona }),
  suspenseLevel: 5,
  setSuspenseLevel: (suspenseLevel) => set({ suspenseLevel }),

  finalProductionSnapshot: null,
  setFinalProductionSnapshot: (finalProductionSnapshot) => set({ finalProductionSnapshot }),

  generatedScenes: [],
  setGeneratedScenes: (update) => set((state) => ({
    generatedScenes: typeof update === 'function' ? update(state.generatedScenes) : update
  })),
  currentChapterIndex: 0,
  setCurrentChapterIndex: (currentChapterIndex) => set({ currentChapterIndex }),

  bRollKeywords: [],
  setBRollKeywords: (bRollKeywords) => set({ bRollKeywords }),
  sfxList: [],
  setSfxList: (sfxList) => set({ sfxList }),
}));
