import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CreatorState {
  data: any | null;
  setData: (data: any) => void;
  status: string;
  setStatus: (status: string | ((prev: string) => string)) => void;
  progress: number;
  setProgress: (progress: number | ((prev: number) => number)) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean | ((prev: boolean) => boolean)) => void;
  finalVoiceScript: string;
  setFinalVoiceScript: (script: string | ((prev: string) => string)) => void;
  fragmenterData: any | null;
  setFragmenterData: (data: any) => void;
  
  // Input Form States
  topic: string;
  setTopic: (topic: string | ((prev: string) => string)) => void;
  creatorMode: "documentary" | "reels" | null;
  setCreatorMode: (mode: "documentary" | "reels" | null) => void;
  isLongForm: boolean;
  setIsLongForm: (isLongForm: boolean) => void;
  useOllama: boolean;
  setUseOllama: (useOllama: boolean) => void;
  activeMood: string;
  setActiveMood: (mood: string) => void;
  narrativeStrategy: "HCS" | "HAP";
  setNarrativeStrategy: (strategy: "HCS" | "HAP") => void;
  showAdvanced: boolean;
  setShowAdvanced: (show: boolean) => void;
  pipelineStep: number;
  setPipelineStep: (step: number | ((prev: number) => number)) => void;
}

export const useCreatorStore = create<CreatorState>()(
  persist(
    (set) => ({
  data: null,
  setData: (data) => set({ data }),
  status: "",
  setStatus: (status) => set((state) => ({ status: typeof status === 'function' ? status(state.status) : status })),
  progress: 0,
  setProgress: (progress) => set((state) => ({ progress: typeof progress === 'function' ? progress(state.progress) : progress })),
  isLoading: false,
  setIsLoading: (isLoading) => set((state) => ({ isLoading: typeof isLoading === 'function' ? isLoading(state.isLoading) : isLoading })),
  finalVoiceScript: "",
  setFinalVoiceScript: (finalVoiceScript) => set((state) => ({ finalVoiceScript: typeof finalVoiceScript === 'function' ? finalVoiceScript(state.finalVoiceScript) : finalVoiceScript })),
  fragmenterData: null,
  setFragmenterData: (fragmenterData) => set({ fragmenterData }),
  
  topic: "",
  setTopic: (topic) => set((state) => ({ topic: typeof topic === 'function' ? topic(state.topic) : topic })),
  creatorMode: null,
  setCreatorMode: (creatorMode) => set({ creatorMode }),
  isLongForm: false,
  setIsLongForm: (isLongForm) => set({ isLongForm }),
  useOllama: (() => {
    try {
      const stored = localStorage.getItem("useOllama");
      return stored !== "false"; // Default to true
    } catch {
      return true;
    }
  })(),
  ollamaUrl: localStorage.getItem("ollamaUrl") || "https://improvise-attire-giblet.ngrok-free.dev",
  ollamaModel: localStorage.getItem("ollamaModel") || "gemma4:31b-cloud",
  setUseOllama: (useOllama) => set({ useOllama }),
  activeMood: "investigative",
  setActiveMood: (activeMood) => set({ activeMood }),
  narrativeStrategy: "HCS",
  setNarrativeStrategy: (narrativeStrategy) => set({ narrativeStrategy }),
  showAdvanced: false,
  setShowAdvanced: (showAdvanced) => set({ showAdvanced }),
  pipelineStep: 1,
  setPipelineStep: (step) => set((state) => ({ pipelineStep: typeof step === 'function' ? step(state.pipelineStep) : step })),
    }),
    {
      name: 'creator-storage',
      partialize: (state) => ({ 
        data: state.data, 
        finalVoiceScript: state.finalVoiceScript, 
        fragmenterData: state.fragmenterData, 
        topic: state.topic,
        creatorMode: state.creatorMode,
        isLongForm: state.isLongForm,
        activeMood: state.activeMood,
        narrativeStrategy: state.narrativeStrategy
      }),
    }
  )
);
