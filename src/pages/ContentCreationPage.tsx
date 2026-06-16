import { apiFetch } from "../lib/apiFetch";
import { ExportCenterModule } from "../modules/export/ExportCenterModule";
import { ContentEditorModule } from "../modules/editor/ContentEditorModule";
import { TimelineModule } from "../components/modules/TimelineModule";
import { PlannerModule } from "../components/modules/PlannerModule";
import { PersonaModal } from "../components/modals/PersonaModal";
import { MoodSelectionModal } from "../components/modals/MoodSelectionModal";
import { ArchiveModal } from "../components/modals/ArchiveModal";
import { SettingsModal } from "../components/modals/SettingsModal";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { notify } from "../lib/notify";
import { useCreatorStore } from "../store/useCreatorStore";
import { useStudioStore } from "../store/useStudioStore";
import { motion, AnimatePresence } from "motion/react";
import {
  sweepLiveTrends,
  triageTrendMood,
  LiveTrend,
} from "../services/radarAPI";
import {
  generateTitle,
  generateResearchMap,
  generateEpisode,
  executePipeline_Orchestrator,
  executePipeline_Phase1_ResearchAndOutline,
  generateChapter,
  generatePackaging,
  classifyTopic,
  auditScriptWithDevilsAdvocate,
  MoodType,
  applyGlobalStyle,
  getMoodContext,
  getPersonaForMood,
} from "../lib/gemini";
import {
  EpisodeData,
  RadarSuggestion,
  MasterOutline,
  ChapterOutline,
  EpisodeScene,
  PersonaType,
  SecurityAudit,
} from "../types";
import { ImageWithFallback } from "../components/ImageWithFallback";
import { applySmartChaining } from "../services/videoService";
import { SceneCard } from "../components/SceneCard";
import { useTacticalSound } from "../hooks/useTacticalSound";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { executeAgent3_ArtDirector, executeAgent6_ArchiveSearch, executeAgent7_ComplianceAudit, executeAgent8_EchoChamber, executeAgent9_KnowledgeLinker, executeAgent_SceneRefiner, executeAgent_TTSNormalizer } from "../lib/agents";
import { ollamaQueue } from "../lib/queue";
import {
  Cloud,
  Cpu,
  Loader2,
  Copy,
  CheckCircle2,
  Radar,
  Newspaper,
  Clock,
  AlertTriangle,
  PenLine,
  Smile,
  Flame,
  Sparkles,
  Skull,
  TerminalSquare,
  Search,
  Swords,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  LayoutDashboard,
  Database,
  ImageIcon,
  Camera,
  LogIn,
  FileSearch,
  Ghost,
  Archive,
  Save,
  Youtube,
  Zap,
  Share2,
  Mic,
  Play,
  User,
  Square,
  Headphones,
  FileText,
  Wand2,
  Download,
  Users,
  ServerCrash,
  TrendingDown,
  TrendingUp,
  Eye,
  ExternalLink,
  Trash2,
  Upload,
  Layers,
  Hourglass,
  Video,
  Settings,
  Volume2,
  BookOpen,
  Lightbulb,
  AlertCircle,
  RefreshCw,
  Link as LinkIcon,
  Terminal,
  Fingerprint,
  Building2,
  Network,
  Activity,
  Waypoints,
  Scale,
  ShieldAlert,
  MessageSquare,
  Network as LinkLink,
  RefreshCcw,
  Scissors,
  Sliders,
  Music,
  Microscope,
  ImagePlus,
  Plus,
  FileBox,
  Mic2,
  AudioLines
} from "lucide-react";
import { MOODS, SECTORS } from "../config/moods";
import { PERSONAS, getPersonaCompatibility } from "../config/personas";
import {
  extractAndCleanScript,
  convertToEgyptian,
} from "../services/audioProcessor";
import { saveAs } from "file-saver";
import { ThumbnailBlueprintCard } from "../components/ThumbnailBlueprintCard";
import { TtsScratchTrack } from "../components/TtsScratchTrack";
import { NarrativeDNAEditor } from "../components/NarrativeDNAEditor";
import { PublishingKitCard } from "../components/PublishingKitCard";
import { TeleprompterOverlay } from "../components/TeleprompterOverlay";
import { calculateTension } from "../lib/analysis";
import { TimelineEditor } from "../components/TimelineEditor";
import { AudioWaveform } from "../components/AudioWaveform";
import { AudioEngine, MasteringConfig } from "../services/audioEngine";
// Removed firebase import for Air-Gapped Privacy

import toast from "react-hot-toast";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";


const IntelGraph = ({ research }: { research: MasterOutline }) => {
  return (
    <div className="relative w-full aspect-square bg-[#121214]  border border-[#27272a] overflow-hidden rounded">
      <svg viewBox="0 0 400 400" className="w-full h-full">
        {/* Central Hub */}
        <circle
          cx="200"
          cy="200"
          r="40"
          className="fill-blue-500/10 stroke-blue-500"
          strokeWidth="2"
        />
        <text
          x="200"
          y="205"
          className="text-[10px] font-arabic fill-blue-600 text-center"
          textAnchor="middle"
        >أساسي</text>

        {/* Connections & Chapters */}
        {research.chapters.map((ch, i) => {
          const angle = (i / research.chapters.length) * Math.PI * 2;
          const x = 200 + Math.cos(angle) * 120;
          const y = 200 + Math.sin(angle) * 120;
          return (
            <g key={i}>
              <line
                x1="200"
                y1="200"
                x2={x}
                y2={y}
                className="stroke-gray-200"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <circle
                cx={x}
                cy={y}
                r="30"
                className="fill-white stroke-gray-300"
                strokeWidth="1"
              />
              <text
                x={x}
                y={y + 4}
                className="text-[8px] font-arabic font-bold fill-gray-700"
                textAnchor="middle"
              >
                C_{i + 1}
              </text>
            </g>
          );
        })}
      </svg>
      {/* AUTO-SAVE INDICATOR */}
      {lastSaved && (
        <div className="fixed bottom-6 left-6 z-[200] flex items-center justify-center p-3 px-4 rounded-full bg-[#121214] border border-[#27272a] shadow-lg transition-all duration-300 gap-2">
          {isDraftSaving ? (
            <>
              <div className="w-2 h-2 rounded-full bg-[#4f46e5] animate-pulse"></div>
              <span className="text-xs text-[#a1a1aa] font-arabic hidden md:inline">جاري الحفظ...</span>
            </>
          ) : (
            <>
              <span className="text-[#4f46e5]">✓</span>
              <span className="text-xs text-[#a1a1aa] font-arabic hidden md:inline">تم حفظ المسودة {lastSaved.toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}</span>
            </>
          )}
        </div>
      )}
      
    </div>
  );
};

export default function ContentCreationPage() {
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const { playClick, playHover, startFilmReel } = useTacticalSound();
  const {
    data, setData,
    status, setStatus,
    isLoading, setIsLoading,
    progress, setProgress,
    finalVoiceScript, setFinalVoiceScript,
    fragmenterData, setFragmenterData,
    topic, setTopic,
    isLongForm, setIsLongForm,
    useOllama, setUseOllama,
    activeMood, setActiveMood,
    narrativeStrategy, setNarrativeStrategy,
    showAdvanced, setShowAdvanced,
    pipelineStep, setPipelineStep
  } = useCreatorStore();

  useEffect(() => {
    // Initial fetch of topic from LocalStorage
    const saved = localStorage.getItem("barwaz_topic") || "";
    if (saved && !saved.startsWith("حدث خطأ")) {
      setTopic(saved);
    }
  }, []);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedSector, setSelectedSector] = useState(SECTORS[0].id);
  const [selectedAngle, setSelectedAngle] = useState<{title: string, hook: string} | null>(null);
  
  const [duration, setDuration] = useState(10);
  const [note, setNote] = useState("");
  const [ragContext, setRagContext] = useState("");
  const [isUploadingPDF, setIsUploadingPDF] = useState(false);
  const [mood, setMood] = useState<MoodType>("التحليل الاستقصائي");
  const [activeMoodCategory, setActiveMoodCategory] = useState("all");
  const [suspenseLevel, setSuspenseLevel] = useState(5);
  const [persona, setPersona] = useState<PersonaType>("النبّاش");

  // Conflict state
  const [conflictOpen, setConflictOpen] = useState(false);
  const [conflictCorrection, setConflictCorrection] = useState("");
  const [conflictResolver, setConflictResolver] = useState<any>(null);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [isAutoPilot, setIsAutoPilot] = useState(true);
  const [isExpertMode, setIsExpertMode] = useState(false);
  const [liveTrends, setLiveTrends] = useState<LiveTrend[]>([]);
  const [isSweeping, setIsSweeping] = useState(false);
  const [isTriaging, setIsTriaging] = useState(false);
  const moodContext = getMoodContext(mood);
  const ragVaults = moodContext.ragVaults || [];

  const [suggestedTitles, setSuggestedTitles] = useState<RadarSuggestion[]>([]);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [activeTab, setActiveTab] = useState<"script" | "kit" | "assets" | "shorts" | "audit" | "echo" | "planner">(
    "script",
  );
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<{
     archives: { title: string; url: string; description: string }[];
     notable_quotes?: { speaker: string, quote: string, source: string, fallback_strategy?: string }[];
     risks: { severity: string; finding: string; fix: string }[];
     historical_accuracy: { statement: string; status: string; notes: string }[];
  } | null>(null);

  const [isEchoing, setIsEchoing] = useState(false);
  const [echoResult, setEchoResult] = useState<{
    skeptics: { user: string; comment: string; rebuttal_tip: string }[];
    hype_men: { user: string; comment: string; viral_hook: string }[];
    critics: { user: string; comment: string; risk_factor: string }[];
    suggested_links: { title: string; connection_logic: string; loop_strategy: string }[];
  } | null>(null);


  const [researchMap, setResearchMap] = useState<MasterOutline | null>(null);
  const [generatedScenes, setGeneratedScenes] = useState<EpisodeScene[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  const [isGeneratingFragments, setIsGeneratingFragments] = useState(false);

  const [elapsedTime, setElapsedTime] = useState(0);
  const [loadingTip, setLoadingTip] = useState("");
  const [intelTab, setIntelTab] = useState<"audit" | "research" | "assets" | "map">("audit");
  const [error, setError] = useState("");

  const [precision, setPrecision] = useState("عالي_الدقة");
  const [intelligenceCore, setIntelligenceCore] = useState("المحرك_المحلي");

  useEffect(() => {
    if (narrativeStrategy === "HCS") {
      setPrecision("عالي_الدقة");
    } else {
      setPrecision("سريع_الأداء");
    }
  }, [narrativeStrategy]);
  const [highlightedLoopId, setHighlightedLoopId] = useState<string | null>(
    null,
  );

  const [rawScriptText, setRawScriptText] = useState("");

  const getSimulatedPulse = (currentMood: string) => {
    if (currentMood === "محلل التكنولوجيا" || currentMood === "برواز التكنو") {
      return [
        "[SYSLOG] الترقب النشط لسيرفرات البيانات الخام...",
        "فك تشفير الخوارزميات المرجعية للصفقات الخفية...",
        "تجميع شظايا الداتا في نسق رقمي محكم...",
        "هندسة إيقاع المخرجات... وتأكيد الاتصال البصري..."
      ];
    }
    if (currentMood === "تشريح الحكايات") {
      return [
        "تجهيز غرفة التشريح الدرامي...",
        "اقتطاع الأوصال لسرد القصة من الداخل...",
        "البحث في شرايين الأحداث المتشابكة...",
        "ربط الاستنتاجات بالنتائج النهائية وعزل التدخلات..."
      ];
    }
    if (currentMood === "صانع وثائقيات التاريخ" || currentMood === "برواز التاريخ") {
      return [
        "نفض الغبار عن المخطوطات القديمة وسجلات المواليد...",
        "ربط الحِقَب الزمنية المتناثرة بخيط ذهبي واحد...",
        "استحضار أصوات القادة من خطب الراديو العتيقة...",
        "بناء هيكل القصة على أسس ملحمية خالدة..."
      ];
    }
    // Default (النبّاش / الصحفي)
    return [
      "النبّاش يغوص في العميق والمخفي الآن...",
      "مطابقة الروايات الرسمية مع أوراق النيابة وشهود العيان...",
      "طمس الأسماء لحماية المصادر السرية...",
      "يتم هندسة الإيقاع الدرامي للمشاهد بدقة...",
      "جارِ تلوين الرؤية البصرية استعداداً للنشر..."
    ];
  };

  useEffect(() => {
    let tipInterval: NodeJS.Timeout;
    if (isLoading) {
      const tips = getSimulatedPulse(mood);
      let i = 0;
      setLoadingTip(tips[0]);
      tipInterval = setInterval(() => {
        i = (i + 1) % tips.length;
        setLoadingTip(tips[i]);
      }, 3500);
    }
    return () => clearInterval(tipInterval);
  }, [isLoading, mood]);

  useEffect(() => {
    localStorage.setItem("barwaz_topic", topic);
  }, [topic]);

  // AUTO-SAVE: Work-in-Progress Data
  useEffect(() => {
    if (data && data.video_title) {
      setIsDraftSaving(true);
      const draft = {
        topic,
        data,
        finalVoiceScript,
        timestamp: Date.now()
      };
      localStorage.setItem("barwaz_autosave_draft", JSON.stringify(draft));
      setLastSaved(new Date());
      setTimeout(() => setIsDraftSaving(false), 800);
    }
  }, [data, topic, finalVoiceScript]);

  
  

  const loadDraft = () => {
    try {
      const saved = localStorage.getItem("barwaz_autosave_draft");
      if (saved) {
        const parsed = JSON.parse(saved);
        setTopic(parsed.topic || "");
        setFinalVoiceScript(parsed.finalVoiceScript || "");
        setData(parsed.data || null);
        setPipelineStep(3);
        setActiveTab("script");
        notify.classified("استعادة المسودة بنجاح");
      } else {
        notify.systemVoice("لا توجد مسودات محفوظة");
      }
    } catch (e) {
      notify.breach("فشل استرجاع المسودة");
    }
  };

  useEffect(() => {
    let cleanupAudio: (() => void) | undefined;
    if (mood === "تشريح الحكايات") {
      cleanupAudio = startFilmReel();
    }
    return () => {
        if (cleanupAudio) cleanupAudio();
    };
  }, [mood, startFilmReel]);

  useEffect(() => {
    // Session initialization
  }, []);

  const [tensionPoints, setTensionPoints] = useState<number[]>([]);
  const [showTeleprompter, setShowTeleprompter] = useState(false);

  // Focus and infinite loop prevention helper
  // Helper to downsample tension points for extreme performance to avoid freezing the browser on long scripts
  const downsampleTension = (arr: number[], limit = 50): number[] => {
    if (arr.length <= limit) return arr;
    const step = arr.length / limit;
    const result: number[] = [];
    for (let i = 0; i < limit; i++) {
      const start = Math.floor(i * step);
      const end = Math.floor((i + 1) * step);
      const chunk = arr.slice(start, end);
      const avg = chunk.reduce((sum, val) => sum + val, 0) / (chunk.length || 1);
      result.push(avg);
    }
    return result;
  };

  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastForcedContent = useRef('');

  const buildHtml = (text: string) => {
    if (!text) return "";
    let lines = text.split('\n').map(line => {
      let parsedLine = line || '';
      
      const sourceRegex = /\[SOURCE:\s*([a-zA-Z0-9_-]+)\]/g;
      parsedLine = parsedLine.replace(sourceRegex, (match, id) => {
        const index = parseInt(id, 10) - 1;
        if (data?.sources && data.sources[index]) {
          const s = data.sources[index];
          const srcTitle = s.title || `المصدر ${id}`;
          return `<a href="${s.url}" target="_blank" class="citation-hover-link text-[#6366f1] underline font-arabic font-bold mx-1 text-xs" title="${srcTitle}">[المصدر ${id}: ${srcTitle.substring(0, 20)}...]</a>`;
        }
        return `<span class="text-[#6366f1]/60 font-arabic text-xs cursor-help" title="مرجع أرشيفي مفترض">[المصدر ${id}]</span>`;
      });
      
      return `<p>${parsedLine}</p>`;
    });
    return lines.join('');
  };

  const editor = useEditor({
    extensions: [
      StarterKit, 
      Highlight,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'citation-hover-link text-[#6366f1] underline cursor-pointer font-bold',
        },
      })
    ],
    content: buildHtml(finalVoiceScript),
    onUpdate: ({ editor }) => {
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = setTimeout(() => {
        const text = editor.getText({ blockSeparator: '\n' });
        if (lastForcedContent.current !== text) {
           lastForcedContent.current = text;
           setFinalVoiceScript(text);
        }
      }, 500);
    },
  });

  useEffect(() => {
    if (editor && finalVoiceScript !== undefined && !editor.isFocused) {
      if (lastForcedContent.current !== finalVoiceScript) {
        lastForcedContent.current = finalVoiceScript;
        editor.commands.setContent(buildHtml(finalVoiceScript));
      }
    }
  }, [finalVoiceScript, editor]);

  const handleUpdateGraph = (scriptOrEvent?: string | React.MouseEvent | any) => {
    const text = typeof scriptOrEvent === "string" ? scriptOrEvent : finalVoiceScript;
    if (text) {
      const rawPoints = calculateTension(text);
      const downsampled = downsampleTension(rawPoints, 50);
      setTensionPoints(downsampled);
    }
  };

  const renderTensionHeatmap = () => (
    <div className="w-full flex items-center gap-4">
      <button onClick={handleUpdateGraph} className="text-[10px] bg-[#4f46e5]/10 border border-[#4f46e5]/40 text-[#4f46e5] px-2 py-1 rounded-lg cursor-pointer shrink-0">تحديث الغراف</button>
      <div className="flex gap-[1px] h-2 w-full flex-1">
        {tensionPoints.length > 0 ? tensionPoints.map((score, i) => (
          <div
            key={i}
            className={`flex-1 ${score > 7 ? "bg-red-500" : score > 4 ? "bg-[#4f46e5]" : "bg-[#121214]"}`}
            title={`مستوى التوتر: ${score.toFixed(1)}`}
          />
        )) : <div className="text-[10px] text-gray-500">جراف التوتر معلق للحفاظ على الذاكرة، اضغط تحديث</div>}
      </div>
    </div>
  );

  const handleMergeTitles = async () => {
    if (suggestedTitles.length < 2) return;
    setIsGeneratingTitle(true);
    setStatus(
      "[!] صراع العقول: يتم الآن دمج الزوايا المختارة في سياق سردي موحد...",
    );
    try {
      const mergedTopic = (suggestedTitles || [])
        .slice(0, 3)
        .map((t) => t.title)
        .join(" vs ");
      const titles = await generateTitle(
        mergedTopic,
        "صراع العروش العربي",
        "ادمج هذه المنظورات في فكرة سيناريو واحدة مثيرة للجدل والمخاطر عالية.",
        "",
        useOllama ? "ollama" : "gemini",
        undefined,
        undefined,
        ollamaModel
      );
      if (Array.isArray(titles)) {
        setSuggestedTitles(titles);
        notify.classified("TITLES_MERGED");
      }
    } catch (e) {
      notify.breach("فشل الدمج");
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [isABTesting, setIsABTesting] = useState<string | null>(null);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  // Audio Engine State
  const [sceneAudioBlobs, setSceneAudioBlobs] = useState<Record<string, Blob>>(
    {},
  );
  const [sceneAudioUrls, setSceneAudioUrls] = useState<Record<string, string>>(
    {},
  );
  const [isRecording, setIsRecording] = useState<string | null>(null);
  const [wordTimestamps, setWordTimestamps] = useState<Record<string, any[]>>(
    {},
  );
  const [seekPositions, setSeekPositions] = useState<Record<string, number>>(
    {},
  );
  const audioEngine = useRef(new AudioEngine());
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async (sceneId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        const url = URL.createObjectURL(audioBlob);

        setSceneAudioBlobs((prev) => ({ ...prev, [sceneId]: audioBlob }));
        setSceneAudioUrls((prev) => ({ ...prev, [sceneId]: url }));

        // Auto-align after recording
        handleAlignAudio(sceneId, audioBlob);
      };

      mediaRecorder.current.start();
      setIsRecording(sceneId);
    } catch (err) {
      notify.breach("فشل الوصول للميكروفون");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach((t) => t.stop());
      setIsRecording(null);
    }
  };

  const handleVSMode = async (sceneId: string) => {
    const scene = [data?.opening_sketch, ...(data?.scenes || [])].find(s => s?.asset_id === sceneId);
    if (!scene || !data) return;

    setIsABTesting(sceneId);
    notify.classified("بدء توليد النسخة المقارنة (VS Mode)...");

    const otherEngine = !useOllama ? "ollama" : "gemini";
    
    try {
      // Re-generate this specific scene with the other engine
      // We compare BOTH art direction and script
      const visualResult = await executeAgent3_ArtDirector(scene, mood, otherEngine);
      await new Promise(r => setTimeout(r, 1500)); // Smart Delay
      const scriptResult = await executeAgent_SceneRefiner(scene, mood, otherEngine);
      
      const updatedComparisonScene = {
        ...scene,
        ...visualResult,
        voice_over: scriptResult.voiceover_text,
        engine_source: otherEngine as any
      };

      if (data.opening_sketch?.asset_id === sceneId) {
        setData({
          ...data,
          opening_sketch: {
            ...data.opening_sketch,
            comparison_version: updatedComparisonScene
          }
        });
      } else {
        const newScenes = data.scenes.map(s => 
          s.asset_id === sceneId ? { ...s, comparison_version: updatedComparisonScene } : s
        );
        setData({ ...data, scenes: newScenes });
      }
      
      notify.classified("تم توفير النسخة البديلة للمقارنة");
    } catch (err) {
      notify.breach("فشل توليد النسخة المقارنة");
    } finally {
      setIsABTesting(null);
    }
  };

  const handleAcceptVersion = (sceneId: string, version: "original" | "comparison") => {
    if (!data) return;
    
    if (version === "original") {
       // Just clear the comparison
       if (data.opening_sketch?.asset_id === sceneId) {
         const { comparison_version, ...rest } = data.opening_sketch;
         setData({ ...data, opening_sketch: rest as any });
       } else {
         const newScenes = data.scenes.map(s => {
           if (s.asset_id === sceneId) {
             const { comparison_version, ...rest } = s;
             return rest as any;
           }
           return s;
         });
         setData({ ...data, scenes: newScenes });
       }
    } else {
       // Replace original with comparison
       if (data.opening_sketch?.asset_id === sceneId) {
         const comp = data.opening_sketch.comparison_version;
         if (comp) {
            const { comparison_version, ...rest } = comp;
            setData({ ...data, opening_sketch: rest as any });
         }
       } else {
         const newScenes = data.scenes.map(s => {
           if (s.asset_id === sceneId && s.comparison_version) {
             const { comparison_version, ...rest } = s.comparison_version;
             return rest as any;
           }
           return s;
         });
         setData({ ...data, scenes: newScenes });
       }
    }
    notify.classified("تم اعتماد النسخة المختارة");
  };

  const handleRunAudit = async () => {
    if (!data) return;
    setIsAuditing(true);
    setIsEchoing(true);
    try {
      const script = [data.opening_sketch.voice_over, ...data.scenes.map(s => s.voice_over)].join("\n\n");
      const archiveData = await executeAgent6_ArchiveSearch(data.video_title, script);
      await new Promise(r => setTimeout(r, 1500));
      const auditData = await executeAgent7_ComplianceAudit(script);
      await new Promise(r => setTimeout(r, 1500));
      const echoData = await executeAgent8_EchoChamber(script, data.video_title);
      await new Promise(r => setTimeout(r, 1500));
      const linksData = await executeAgent9_KnowledgeLinker(data.video_title, JSON.stringify(researchMap));
      setAuditResult({
        archives: archiveData.archives,
        notable_quotes: archiveData.notable_quotes,
        risks: auditData.risks,
        historical_accuracy: auditData.historical_accuracy
      });
      setEchoResult({
        ...echoData,
        suggested_links: linksData.suggested_links
      });
      notify.classified("تم اكتمال تدقيق الملف والبحث في الأرشيف ومحاكاة غرفة الصدى");
    } catch (err) {
      console.error(err);
      notify.breach("فشل في عملية التدقيق الشامل");
    } finally {
      setIsAuditing(false);
      setIsEchoing(false);
    }
  };

  const AuditUI = () => {
    if (isAuditing) return (
      <div className="p-20 text-center space-y-4">
        <Loader2 className="animate-spin mx-auto text-[#4f46e5]" size={40} />
        <p className="font-arabic text-xs  text-[#a1a1aa]  animate-pulse">جاري مراجعة المحتوى والتدقيق الشامل...</p>
      </div>
    );

    if (!auditResult) return (
      <div className="p-20 bg-[#121214]  border-[#27272a] shadow-sm border border-dashed border-[#27272a] flex flex-col items-center justify-center gap-6 text-center">
         <ShieldAlert size={40} className="text-[#4f46e5]" />
         <div className="space-y-2">
            <h4 className="text-xl font-arabic font-bold text-[#fafafa]">رادار التدقيق (Audit Radar)</h4>
            <p className="text-sm font-arabic text-[#71717a] max-w-sm">فحص المحتوى بحثاً عن المغالطات التاريخية، مخاطر السياسات، والمصادر الأرشيفية الحقيقية</p>
         </div>
         <button 
          onClick={handleRunAudit}
          className="px-8 py-3 bg-[#4f46e5]/10 border border-[#4f46e5]/40 text-[#4f46e5] font-arabic text-[10px] font-medium active:scale-95 transition-all"
         >
           بدء التدقيق
         </button>
      </div>
    );

    return (
      <div className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* ACCURACY SECTION */}
           <div className="space-y-4">
              <h4 className="text-[10px] font-arabic text-cyan-400 font-medium">فحص الحقائق التاريخية</h4>
              <div className="space-y-3">
                 {auditResult.historical_accuracy.map((acc, i) => (
                    <div key={i} className="p-4 bg-[#121214]  border-[#27272a] shadow-sm border border-[#27272a] space-y-2">
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] font-arabic text-[#a1a1aa] ">إفادة</span>
                          <span className={`text-[8px] font-arabic px-2 py-0.5 rounded-full ${acc.status === 'verified' ? 'bg-green-500/20 text-green-500' : acc.status === 'contested' ? 'bg-red-500/20 text-[#ef4444]' : 'bg-yellow-500/20 text-yellow-500'}`}>{acc.status}</span>
                       </div>
                       <p className="text-xs text-[#fafafa]/80">{acc.statement}</p>
                       <p className="text-[10px] text-[#71717a] italic">{acc.notes}</p>
                    </div>
                 ))}
              </div>
           </div>

           {/* POLICY SECTION */}
           <div className="space-y-4">
              <h4 className="text-[10px] font-arabic text-[#ef4444] font-medium">سياسات النشر والمخاطر</h4>
              <div className="space-y-3">
                 {auditResult.risks.map((risk, i) => (
                    <div key={i} className="p-4 bg-[#121214]  border-[#27272a] shadow-sm border border-[#27272a] space-y-2">
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] font-arabic text-[#a1a1aa] ">ملاحظة</span>
                          <span className={`text-[8px] font-arabic px-2 py-0.5 rounded-full bg-red-500/20 text-[#ef4444] `}>{risk.severity}</span>
                       </div>
                       <p className="text-xs text-[#fafafa]/80">{risk.finding}</p>
                       <div className="p-2 bg-[#121214]  shadow-sm border-l-2 border-[#4f46e5]">
                          <span className="text-[8px] font-arabic text-[#4f46e5]  block mb-1">تصحيح مقترح</span>
                          <p className="text-[10px] text-[#a1a1aa]">{risk.fix}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* ARCHIVES SECTION */}
        <div className="space-y-6 pt-6 border-t border-[#27272a]">
           <h4 className="text-sm font-arabic text-[#4f46e5] font-medium flex items-center gap-3">
             <FileSearch size={16} /> تجميع الأرشيف العالمي
           </h4>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {auditResult.archives.map((arc, i) => (
                 <a key={i} href={arc.url} target="_blank" rel="noopener noreferrer" className="p-4 bg-[#121214]  border-[#27272a] shadow-sm border border-[#27272a] active:scale-95 transition-all group block">
                    <div className="flex justify-between items-start mb-3">
                       <div className="p-2 bg-[#4f46e5]/10 text-[#4f46e5]">
                          <Database size={14} />
                       </div>
                       <ArrowRight size={14} className="text-[#71717a] group-hover:-rotate-45 transition-all" />
                    </div>
                    <h5 className="text-[11px] font-arabic text-[#fafafa] mb-2 line-clamp-1">{arc.title}</h5>
                    <p className="text-[10px] text-[#71717a] line-clamp-2 leading-relaxed">{arc.description}</p>
                 </a>
              ))}
           </div>

           {auditResult.notable_quotes && auditResult.notable_quotes.length > 0 && (
              <div className="mt-8 pt-6 border-t border-[#27272a]">
                 <h4 className="text-sm font-arabic text-amber-600 font-medium flex items-center gap-3 mb-6">
                   <Archive size={16} /> شهادات موثوقة
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {auditResult.notable_quotes.map((quote, i) => (
                       <div key={i} className="p-5 bg-amber-50/50 border border-amber-100 rounded-xl relative group/quote hover:shadow-medium transition-shadow">
                          <div className="flex justify-between items-center mb-3 text-amber-900 font-bold  text-xs tracking-wider">
                             {quote.speaker}
                          </div>
                          <blockquote className="text-base font-arabic text-amber-800 italic pr-3 border-r-2 border-amber-300">
                             "{quote.quote}"
                          </blockquote>
                          <div className="mt-4 pt-3 border-t border-amber-200/50 space-y-2 opacity-0 group-hover/quote:opacity-100 transition-opacity duration-300">
                             <p className="text-[10px] font-arabic text-amber-700/80 ">
                                <strong className="text-amber-900/60 mr-1">Source:</strong> {quote.source}
                             </p>
                             {quote.fallback_strategy && (
                                <p className="text-[10px] font-arabic text-[#4f46e5]/80 ">
                                   <strong className="text-blue-900/60 mr-1">Fallback:</strong> {quote.fallback_strategy}
                                </p>
                             )}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           )}
        </div>
      </div>
    );
  };

  const EchoChamberUI = () => {
    if (isEchoing) return (
      <div className="p-20 text-center space-y-4">
        <Loader2 className="animate-spin mx-auto text-purple-500" size={40} />
        <p className="font-arabic text-xs  text-[#a1a1aa]  animate-pulse">جاري محاكاة تفاعل الجمهور المستهدف...</p>
      </div>
    );

    if (!echoResult) return (
      <div className="p-20 bg-[#121214]  border-[#27272a] shadow-sm border border-dashed border-[#27272a] flex flex-col items-center justify-center gap-6 text-center">
         <MessageSquare size={40} className="text-purple-500" />
         <div className="space-y-2">
            <h4 className="text-xl font-arabic font-bold text-[#fafafa]">غرفة الصدى (Echo Chamber)</h4>
            <p className="text-sm font-arabic text-[#71717a] max-w-sm">محاكاة لردود أفعال الجمهور قبل النشر، وتحديد نقاط الضعف والقوة وبناء حلقات المشاهدة</p>
         </div>
         <button 
          onClick={handleRunAudit}
          className="px-8 py-3 bg-purple-500/10 border border-purple-500/40 text-purple-500 font-arabic text-[10px] font-medium active:scale-95 transition-all"
         >
           دخول غرفة التقييم
         </button>
      </div>
    );

    return (
      <div className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* SKEPTICS */}
           <div className="space-y-4">
              <h4 className="text-[10px] font-arabic text-yellow-500 font-medium flex items-center gap-2">
                <ShieldAlert size={14} /> Persona: Skeptics
              </h4>
              <div className="space-y-3">
                 {echoResult.skeptics.map((s, i) => (
                    <div key={i} className="p-4 bg-yellow-500/5 border border-yellow-500/10 space-y-3">
                       <span className="text-[10px] font-arabic text-yellow-500/60 block">{s.user}</span>
                       <p className="text-sm font-arabic text-[#fafafa]/80 italic">"{s.comment}"</p>
                       <div className="p-2 bg-[#121214]  shadow-sm border-r-2 border-yellow-500 text-right">
                          <span className="text-[8px] font-arabic text-yellow-500  block mb-1">طريقة الرد المقترحة</span>
                          <p className="text-[10px] text-[#a1a1aa]">{s.rebuttal_tip}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* HYPE MEN */}
           <div className="space-y-4">
              <h4 className="text-[10px] font-arabic text-green-500 font-medium flex items-center gap-2">
                <Flame size={14} /> Persona: Hype_Men
              </h4>
              <div className="space-y-3">
                 {echoResult.hype_men.map((s, i) => (
                    <div key={i} className="p-4 bg-green-500/5 border border-green-500/10 space-y-3">
                       <span className="text-[10px] font-arabic text-green-500/60 block">{s.user}</span>
                       <p className="text-sm font-arabic text-[#fafafa]/80 italic">"{s.comment}"</p>
                       <div className="p-2 bg-[#121214]  shadow-sm border-r-2 border-green-500 text-right">
                          <span className="text-[8px] font-arabic text-green-500  block mb-1">نقطة تفاعل قوية</span>
                          <p className="text-[10px] text-[#a1a1aa]">{s.viral_hook}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* CRITICS */}
           <div className="space-y-4">
              <h4 className="text-[10px] font-arabic text-[#ef4444] font-medium flex items-center gap-2">
                <AlertTriangle size={14} /> Persona: Critics
              </h4>
              <div className="space-y-3">
                 {echoResult.critics.map((s, i) => (
                    <div key={i} className="p-4 bg-red-500/5 border border-red-500/10 space-y-3">
                       <span className="text-[10px] font-arabic text-[#ef4444]/60 block">{s.user}</span>
                       <p className="text-sm font-arabic text-[#fafafa]/80 italic">"{s.comment}"</p>
                       <div className="p-2 bg-[#121214]  shadow-sm border-r-2 border-red-500 text-right">
                          <span className="text-[8px] font-arabic text-[#ef4444]  block mb-1">مخاطر جدلية</span>
                          <p className="text-[10px] text-[#a1a1aa]">{s.risk_factor}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* KNOWLEDGE LOOPS */}
        <div className="pt-10 border-t border-[#27272a] space-y-6">
           <h4 className="text-sm font-arabic text-[#4f46e5] font-medium flex items-center gap-3">
             <LinkLink size={16} /> حلقة المشاهدة المعرفية
           </h4>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {echoResult.suggested_links.map((link, i) => (
                 <div key={i} className="p-5 bg-[#121214]  border-[#27272a] shadow-sm border border-[#27272a] space-y-4 group active:scale-95 transition-all">
                    <h5 className="text-sm font-arabic font-bold text-[#fafafa] group-active:scale-95 transition-colors">{link.title}</h5>
                    <p className="text-[11px] text-[#a1a1aa] leading-relaxed">{link.connection_logic}</p>
                    <div className="bg-[#27272a]/50 p-3 border-l-2 border-[#4f46e5]">
                       <span className="text-[8px] font-arabic text-[#4f46e5]  block mb-2">تنفيذ حلقة المشاهدة</span>
                       <p className="text-[11px] font-arabic text-[#fafafa]/80 italic">"{link.loop_strategy}"</p>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </div>
    );
  };

  const SettingsUI = () => {
    if (!showSettings) return null;

    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowSettings(false)}
          className="absolute inset-0 bg-[#121214] /80 "
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-xl bg-[#27272a]/50 border border-[#27272a] p-8 shadow-2xl space-y-8 no-scrollbar overflow-y-auto max-h-[90vh]"
        >
          <div className="flex justify-between items-center border-b border-[#27272a] pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#4f46e5]/10 text-[#4f46e5]">
                <Settings size={20} />
              </div>
              <h3 className="text-xl font-arabic font-black text-[#fafafa]">إعدادات المحرك (Engine Settings)</h3>
            </div>
            <button onClick={() => setShowSettings(false)} className="text-[#71717a] active:scale-95 transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-[#121214]  border-[#27272a] shadow-sm border border-[#27272a]">
              <div className="space-y-1">
                <span className="text-sm font-arabic text-[#fafafa]">استخدام Ollama محلياً</span>
                <p className="text-[10px] text-[#71717a] font-arabic">الاتصال بمحرك الذكاء الاصطناعي</p>
              </div>
              <button 
                onClick={() => setUseOllama(!useOllama)}
                className={`w-12 h-6 rounded-full transition-all relative ${useOllama ? 'bg-[#4f46e5]' : 'bg-[#121214]'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-[#121214]  transition-all ${useOllama ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            {useOllama && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pt-4 border-t border-[#27272a]"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-arabic text-[#a1a1aa] font-medium">Ollama_Endpoint_URL</label>
                  <input 
                    type="text" 
                    value={ollamaUrl} 
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    className="w-full bg-[#121214]  shadow-sm border border-[#27272a] p-3 text-[#fafafa] font-arabic text-xs focus:border-[#4f46e5] outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-arabic text-[#a1a1aa] font-medium">AI_Model_Target</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {["gemma4:31b-cloud", "gemma2:9b-instruct-q4_0", "llama3:8b", "mistral"].map(m => (
                      <button 
                         key={m} 
                         onClick={() => setOllamaModel(m)}
                         className={`px-2 py-1 text-[9px] font-arabic border transition-all ${ollamaModel === m ? 'bg-[#4f46e5] border-[#4f46e5] text-black' : 'bg-[#121214]  border-[#27272a] shadow-sm border-[#27272a] text-[#a1a1aa] active:scale-95'}`}
                      >
                         {m.includes('cloud') ? '🌩️ ' + m.split(':')[0] : m.split(':')[0]}
                      </button>
                    ))}
                  </div>
                  <input 
                    type="text" 
                    value={ollamaModel} 
                    onChange={(e) => setOllamaModel(e.target.value)}
                    className="w-full bg-[#121214]  shadow-sm border border-[#27272a] p-3 text-[#fafafa] font-arabic text-xs focus:border-[#4f46e5] outline-none transition-all"
                    placeholder="e.g. gemma2:9b-instruct-q4_0"
                  />
                  <p className="text-[9px] text-[#4f46e5]/50 italic">Recommended: gemma4:31b-cloud</p>
                </div>
              </motion.div>
            )}

            <div className="space-y-6 pt-6 border-t border-[#27272a]">
              <h4 className="text-[10px] font-arabic text-[#a1a1aa] font-medium">Multi-Engine Protocols</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[#121214]  border-[#27272a] shadow-sm border border-[#27272a]">
                  <div className="space-y-1">
                    <span className="text-[11px] font-arabic text-[#fafafa]">نظام التوزيع الذكي (Tag-Team)</span>
                    <p className="text-[9px] text-[#71717a] font-arabic">GEMINI_RESEARCH + OLLAMA_DRAFTING</p>
                  </div>
                  <button 
                    onClick={() => setIsTagTeam(!isTagTeam)}
                    className={`w-10 h-5 rounded-full transition-all relative ${isTagTeam ? 'bg-[#4f46e5]' : 'bg-[#121214]'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-[#121214]  transition-all ${isTagTeam ? 'left-5.5' : 'left-0.5'}`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-[#121214]  border-[#27272a] shadow-sm border border-[#27272a]">
                  <div className="space-y-1">
                    <span className="text-[11px] font-arabic text-[#fafafa]">درع الرصيد (Quota Shield)</span>
                    <p className="text-[9px] text-[#71717a] font-arabic">AUTO_FAILOVER_TO_OLLAMA_ON_GEMINI_LIMIT</p>
                  </div>
                  <button 
                    onClick={() => setIsQuotaShield(!isQuotaShield)}
                    className={`w-10 h-5 rounded-full transition-all relative ${isQuotaShield ? 'bg-[#4f46e5]' : 'bg-[#121214]'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-[#121214]  transition-all ${isQuotaShield ? 'left-5.5' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-[#27272a]">
              <h4 className="text-[10px] font-arabic text-[#a1a1aa] font-medium">External_Voice_Engines</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-arabic text-[#a1a1aa] font-medium">ElevenLabs_API_Key</label>
                  <input 
                    type="password" 
                    value={elevenLabsKey} 
                    onChange={(e) => setElevenLabsKey(e.target.value)}
                    className="w-full bg-[#121214]  shadow-sm border border-[#27272a] p-3 text-[#fafafa] font-arabic text-xs focus:border-[#4f46e5] outline-none transition-all"
                    placeholder="sk_..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-arabic text-[#a1a1aa] font-medium">ElevenLabs_Voice_ID</label>
                  <input 
                    type="text" 
                    value={elevenLabsVoiceId} 
                    onChange={(e) => setElevenLabsVoiceId(e.target.value)}
                    className="w-full bg-[#121214]  shadow-sm border border-[#27272a] p-3 text-[#fafafa] font-arabic text-xs focus:border-[#4f46e5] outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setShowSettings(false)}
            className="w-full py-4 bg-[#4f46e5] text-black font-arabic font-bold text-lg active:scale-95 transition-all shadow-deep shadow-blue-500/10"
          >
            حفظ التغييرات (Save_Configuration)
          </button>
        </motion.div>
      </div>
    );
  };

  const handleMasterAudio = async (sceneId: string) => {
    const blob = sceneAudioBlobs[sceneId];
    if (!blob) return;

    setIsProcessingAudio(true);
    notify.topSecret("AUDIO_PROCESSING");

    try {
      await audioEngine.current.loadAudio(blob);
      const masteredBlob = await audioEngine.current.process({
        noiseFloor: -50,
        eqHigh: 4,
        eqMid: 1,
        eqLow: 2,
        compressionRatio: 4,
        reverbMix: 0.1,
      });

      const url = URL.createObjectURL(masteredBlob);
      setSceneAudioBlobs((prev) => ({ ...prev, [sceneId]: masteredBlob }));
      setSceneAudioUrls((prev) => ({ ...prev, [sceneId]: url }));
      notify.classified("AUDIO_SUCCESS");
    } catch (err) {
      notify.breach("AUDIO_ERROR");
    } finally {
      setIsProcessingAudio(false);
    }
  };

  const handleApplySmartChaining = () => {
    if (!data) return;
    try {
      const chainedScenes = applySmartChaining(data.scenes);
      setData(prev => prev ? { ...prev, scenes: chainedScenes } : prev);
      notify.classified("Smart Chaining Applied Successfully!");
    } catch (err) {
      console.error(err);
      notify.breach("Chaining Failed");
    }
  };

  const handleAlignAudio = async (sceneId: string, blob: Blob) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(",")[1];
        const scene = [data?.opening_sketch, ...(data?.scenes || [])].find(
          (s) => s?.asset_id === sceneId,
        );
        if (!scene) return;

        const response = await apiFetch("/api/audio/align", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audioBase64: base64Audio,
            text: scene.voice_over,
          }),
        });

        if (response.ok) {
          const timestamps = await response.json();
          setWordTimestamps((prev) => ({ ...prev, [sceneId]: timestamps }));

          // Update the scene data with timestamps
          if (data) {
            if (data.opening_sketch?.asset_id === sceneId) {
              setData({
                ...data,
                opening_sketch: {
                  ...data.opening_sketch,
                  word_timestamps: timestamps,
                },
              });
            } else {
              const newScenes = data.scenes.map((s) =>
                s.asset_id === sceneId
                  ? { ...s, word_timestamps: timestamps }
                  : s,
              );
              setData({ ...data, scenes: newScenes });
            }
          }
        }
      };
    } catch (err) {
      console.error("Alignment failed", err);
    }
  };

  const handlePlayVoice = () => {
    if (isPlayingVoice) {
      window.speechSynthesis.cancel();
      setIsPlayingVoice(false);
      return;
    }

    if (finalVoiceScript) {
      const utterance = new SpeechSynthesisUtterance(finalVoiceScript);
      utterance.lang = "ar-EG";
      utterance.rate = 1.1; // Daheeh-style fast pace slightly
      utterance.onend = () => setIsPlayingVoice(false);
      utterance.onpause = () => setIsPlayingVoice(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingVoice(true);
    }
  };


  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isTagTeam, setIsTagTeam] = useState(() => 
    localStorage.getItem("isTagTeam") === "true"
  );
  const [isQuotaShield, setIsQuotaShield] = useState(() => 
    localStorage.getItem("isQuotaShield") !== "false"
  );

  useEffect(() => {
    localStorage.setItem("isTagTeam", String(isTagTeam));
  }, [isTagTeam]);

  useEffect(() => {
    localStorage.setItem("isQuotaShield", String(isQuotaShield));
  }, [isQuotaShield]);

  const mainAccent = useOllama ? "#10B981" : "#3b82f6";
  const mainAccentLight = useOllama ? "rgba(16, 185, 129, 0.2)" : "rgba(59, 130, 246, 0.2)";
  const [ollamaUrl, setOllamaUrl] = useState(() => {
    const stored = localStorage.getItem("ollamaUrl");
    return stored ? stored : "";
  });
  const [ollamaModel, setOllamaModel] = useState(
    () => localStorage.getItem("ollamaModel") || "gemma4:31b-cloud",
  );
  const [elevenLabsKey, setElevenLabsKey] = useState(
    () => localStorage.getItem("elevenLabsKey") || "",
  );
  const [elevenLabsVoiceId, setElevenLabsVoiceId] = useState(
    () => localStorage.getItem("elevenLabsVoiceId") || "pNInz6obbfDQGcgMyIGC",
  );

  useEffect(() => {
    localStorage.setItem("useOllama", useOllama ? "true" : "false");
    localStorage.setItem("ollamaUrl", ollamaUrl);
    localStorage.setItem("ollamaModel", ollamaModel);
    localStorage.setItem("elevenLabsKey", elevenLabsKey);
    localStorage.setItem("elevenLabsVoiceId", elevenLabsVoiceId);
  }, [useOllama, ollamaUrl, ollamaModel, elevenLabsKey, elevenLabsVoiceId]);

  const [archive, setArchive] = useState<EpisodeData[]>([]);
  const [archiveSearchQuery, setArchiveSearchQuery] = useState("");
  const [titleCache, setTitleCache] = useState<
    Record<string, RadarSuggestion[]>
  >(() => {
    try {
      const saved = localStorage.getItem("barwaz_radar_cache");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Removed cooldown logic completely

  useEffect(() => {
    localStorage.setItem("barwaz_radar_cache", JSON.stringify(titleCache));
  }, [titleCache]);

  const handleOpeningSketchUpdate = React.useCallback((updated: EpisodeScene) => {
    setData((prev) => prev ? { ...prev, opening_sketch: updated } : prev);
  }, []);

  const handleSceneUpdate = React.useCallback((sceneId: string, updated: EpisodeScene) => {
    setData((prev) => {
      if (!prev) return prev;
      const newScenes = prev.scenes.map(s => s.asset_id === sceneId ? updated : s);
      return { ...prev, scenes: newScenes };
    });
  }, []);

  const renderSceneCards = React.useMemo(() => {
    if (!data) return null;
    return (
      <div className="space-y-6">
        {data.opening_sketch && (
          <SceneCard
            scene={data.opening_sketch}
            isOpening={true}
            onUpdate={handleOpeningSketchUpdate}
            onVSMode={() => handleVSMode(data.opening_sketch?.asset_id || "0")}
            onAcceptVersion={(version) => handleAcceptVersion(data.opening_sketch?.asset_id || "0", version)}
            isABTesting={isABTesting === data.opening_sketch?.asset_id}
            audioUrl={sceneAudioUrls[data.opening_sketch?.asset_id || "0"]}
            onRecord={() => startRecording(data.opening_sketch?.asset_id || "0")}
            onStopRecording={stopRecording}
            isRecording={isRecording === data.opening_sketch?.asset_id}
            onMaster={() => handleMasterAudio(data.opening_sketch?.asset_id || "0")}
            copyToClipboard={(text) => copyToClipboard(text)}
            isProcessingAudio={isProcessingAudio}
          />
        )}
        {data.scenes?.map((scene, i) => scene ? (
          <SceneCard
            key={`${scene.asset_id || 'scene'}-${i}`}
            scene={scene}
            onUpdate={(updated) => handleSceneUpdate(scene.asset_id, updated)}
             onVSMode={() => handleVSMode(scene.asset_id)}
             onAcceptVersion={(version) => handleAcceptVersion(scene.asset_id, version)}
             isABTesting={isABTesting === scene.asset_id}
            audioUrl={sceneAudioUrls[scene.asset_id]}
            onRecord={() => startRecording(scene.asset_id)}
            onStopRecording={stopRecording}
            isRecording={isRecording === scene.asset_id}
            onMaster={() => handleMasterAudio(scene.asset_id)}
            copyToClipboard={(text) => {
               navigator.clipboard.writeText(text);
               notify.classified("تم نسخ النص");
            }}
            isProcessingAudio={isProcessingAudio}
          />
        ) : null)}
      </div>
    );
  }, [data?.scenes, data?.opening_sketch, isRecording, isABTesting, isProcessingAudio, sceneAudioUrls]);







  const renderIntelGraph = (research: MasterOutline) => {
    return (
      <div className="relative w-full aspect-square bg-[#121214]  border border-[#27272a] overflow-hidden rounded">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {/* Central Hub */}
          <circle
            cx="200"
            cy="200"
            r="40"
            className="fill-blue-500/10 stroke-blue-500 stroke-1"
          />
          <text
            x="200"
            y="200"
            textAnchor="middle"
            dy=".3em"
            fontSize="10"
            className="fill-blue-500 font-arabic font-black "
          >أساسي</text>

          {/* Connections & Chapters */}
          {research.chapters.map((ch, i) => {
            const angle = (i / research.chapters.length) * Math.PI * 2;
            const x = 200 + Math.cos(angle) * 120;
            const y = 200 + Math.sin(angle) * 120;
            return (
              <g key={i}>
                <line
                  x1="200"
                  y1="200"
                  x2={x}
                  y2={y}
                  className="stroke-white/10 stroke-1"
                  strokeDasharray="4 4"
                />
                <circle
                  cx={x}
                  cy={y}
                  r="30"
                  className="fill-white/5 stroke-white/20 stroke-1 active:scale-95 transition-colors"
                />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dy=".3em"
                  fontSize="8"
                  className="fill-white/40 font-arabic"
                >
                  0{i + 1}
                </text>
                <foreignObject x={x + 35} y={y - 20} width="100" height="40">
                  <div className="text-[8px] font-arabic text-[#71717a] whitespace-nowrap overflow-hidden text-ellipsis">
                    {ch.chapter_title}
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none"></div>
      </div>
    );
  };

  const renderFragmenterUI = () => {
    if (isGeneratingFragments) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-6 relative p-8 border border-[#27272a] bg-[#121214]/40 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(6,182,212,0.05)_50%)] bg-[length:100%_4px] pointer-events-none z-0" />
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent animate-scan z-10" />
          
          <div className="relative w-24 h-24 flex items-center justify-center z-10">
            <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
               className="absolute inset-0 border-2 border-dashed border-cyan-500/30 rounded-full" 
            />
            <motion.div 
               animate={{ rotate: -360 }}
               transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
               className="absolute inset-4 border border-cyan-500/50 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.2)]" 
            />
            <Activity className="w-8 h-8 text-cyan-400 relative z-20 animate-pulse drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
          </div>
          
          <div className="text-center space-y-3 z-10 relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/50 border border-cyan-500/30 rounded-lg text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-cyan-400 font-arabic  ">Fragmentation Core Active</span>
            </div>
            <h3 className="text-xl font-arabic font-bold text-gray-200 mt-2">يتم تفكيك النص لسوشيال ميديا...</h3>
            <p className="text-sm font-arabic text-gray-500">جاري استخلاص الفيديوهات القصيرة (Shorts) وأربطة تويتر (Threads).</p>
          </div>
        </div>
      );
    }
    if (!fragmenterData) return null;
    return (
      <div className="space-y-6">
        {fragmenterData.shorts && fragmenterData.shorts.length > 0 && (
          <div className="space-y-4">
             <label className="text-[9px] font-arabic text-cyan-500 font-medium flex items-center gap-2">
                 <Zap className="w-3 h-3" /> Short_Form_Clips (Vertical 9:16)
             </label>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {fragmenterData.shorts.map((short, idx) => (
                 <div key={idx} className="bg-[#121214]  border text-right font-arabic border-[#27272a] p-4 relative group shadow-sm hover:shadow-medium transition-shadow">
                    <div className="absolute left-2 top-2 px-2 py-1 bg-black text-white text-[8px] font-arabic">REEL_{idx+1}</div>
                    <h5 className="font-bold text-sm text-[#fafafa] mb-2 mt-4">{short.title}</h5>
                    <p className="text-xs text-[#ef4444] font-bold mb-1">Hook: {short.hook}</p>
                    <p className="text-xs text-[#e5e3e0] leading-relaxed mb-3">{short.body}</p>
                    <p className="text-xs text-[#4f46e5] mb-3 block border-t pt-2 border-dashed border-[#27272a]">CTA: {short.cta}</p>
                    {short.image_prompt_vertical_nano && (
                      <div className="mt-3 p-3 bg-[#27272a]/50 border border-[#27272a] text-left relative">
                        <label className="text-[8px] font-arabic text-[#71717a] mb-1 flex items-center gap-1 group-hover:text-amber-500 transition-colors"><ImagePlus className="w-3 h-3" /> Image Prompt [9:16]</label>
                        <p className="text-[10px] font-arabic text-[#71717a] break-words leading-relaxed">{short.image_prompt_vertical_nano}</p>
                      </div>
                    )}
                 </div>
               ))}
             </div>
          </div>
        )}

        {fragmenterData.x_thread && fragmenterData.x_thread.length > 0 && (
            <div className="space-y-3">
              <label className="text-[9px] font-arabic text-cyan-400/50 font-medium flex items-center gap-2 border-t border-[#27272a] pt-6">
                <Share2 className="w-3 h-3" /> X_Thread_Structure
              </label>
              <div className="space-y-2">
                {fragmenterData.x_thread.map((post, i) => (
                  <div
                    key={i}
                    className="p-4 bg-[#121214]  border-[#27272a] shadow-sm border border-[#27272a] text-micro text-[#a1a1aa] leading-relaxed font-arabic relative"
                  >
                    <span className="absolute top-2 right-2 text-[8px] font-arabic text-[#71717a]">
                      {i + 1}/{fragmenterData.x_thread!.length}
                    </span>
                    {post}
                  </div>
                ))}
              </div>
            </div>
        )}
        {fragmenterData.tiktok_hook && (
            <div className="p-4 bg-cyan-400/5 border border-cyan-400/20">
              <label className="text-[9px] font-arabic text-cyan-400 font-medium block mb-2 font-bold">
                TikTok_Hook (Legacy)
              </label>
              <p className="text-sm font-arabic text-[#fafafa]/90 ">
                "{fragmenterData.tiktok_hook}"
              </p>
            </div>
        )}

        {fragmenterData.social_posts && fragmenterData.social_posts.length > 0 && (
          <div className="space-y-4">
             <label className="text-[9px] font-arabic text-cyan-500 font-medium flex items-center gap-2 border-t border-[#27272a] pt-6">
                 <Share2 className="w-3 h-3" /> Social Network Posts (Facebook/Insta/LinkedIn)
             </label>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {fragmenterData.social_posts.map((post, idx) => (
                 <div key={idx} className="bg-[#121214]  border text-right font-arabic border-[#27272a] p-4 relative group shadow-sm hover:shadow-medium transition-shadow">
                    <div className="absolute left-2 top-2 px-2 py-1 bg-black text-white text-[8px] font-arabic">{post.platform}</div>
                    <div className="mt-8">
                       <p className="text-xs text-[#fafafa] leading-relaxed whitespace-pre-wrap">{post.content}</p>
                    </div>
                    {post.image_prompt_square && (
                      <div className="mt-3 p-3 bg-[#27272a]/50 border border-[#27272a] text-left relative">
                        <label className="text-[8px] font-arabic text-[#71717a] mb-1 flex items-center gap-1 group-hover:text-cyan-600 transition-colors"><ImagePlus className="w-3 h-3" /> Image Prompt [1:1]</label>
                        <p className="text-[10px] font-arabic text-[#71717a] break-words leading-relaxed">{post.image_prompt_square}</p>
                      </div>
                    )}
                 </div>
               ))}
             </div>
          </div>
        )}
      </div>
    );
  };



  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(timer);
  }, [isLoading]);

  const dynamicRemaining = useMemo(() => {
    if (elapsedTime < 3 || progress < 2) return duration * 10; // Start with rough but stable estimate
    if (progress >= 100) return 0;
    
    const timePerPercent = elapsedTime / progress;
    const rawRemaining = Math.max(0, Math.ceil(timePerPercent * (100 - progress)));
    
    // Cap at a reasonable maximum to avoid wild spikes if progress briefly stalls
    return Math.min(rawRemaining, duration * 15);
  }, [elapsedTime, progress, duration]);

  const formattedRemaining = useMemo(() => {
    if (progress === 0 && elapsedTime < 3) return "CALCULATING...";
    const mins = Math.floor(dynamicRemaining / 60);
    const secs = dynamicRemaining % 60;
    if (mins > 0) return `~${mins}M ${secs.toString().padStart(2, '0')}S`;
    return `~${secs}S`;
  }, [dynamicRemaining, progress, elapsedTime]);

  // Abort Controller for generation
  const abortControllerRef = useRef<AbortController | null>(null);
  const isSpinningRef = useRef(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (cooldown > 0) {
      cooldownRef.current = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => {
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
    };
  }, [cooldown]);

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    ollamaQueue.clear();
    setIsLoading(false);
    setIsGeneratingTitle(false);
    isSpinningRef.current = false;
    setStatus("تم إيقاف المعالجة بناءً على طلبك.");
    setTimeout(() => {
      setStatus("");
      setProgress(0);
    }, 3000);
  };

  // Pinboard State
  const terminalRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDraggingString, setIsDraggingString] = useState(false);
  const [notePos, setNotePos] = useState({ x: 100, y: 150 });
  const [isDraggingNote, setIsDraggingNote] = useState(false);
  const [noteDragOffset, setNoteDragOffset] = useState({ x: 0, y: 0 });
  const [modePositions, setModePositions] = useState<
    Record<string, { x: number; y: number }>
  >({});

  const copyToClipboard = async (
    text: string,
    identifier: string = "تم النسخ بنجاح",
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      notify.classified(identifier);
    } catch (err) {
      notify.breach("فشل النسخ");
    }
  };

  const getMoodColor = () =>
    MOODS.find((m) => m.type === mood)?.color || "#f59e0b";
  const activeColor = getMoodColor();

  const handlePointerMove = (e: React.PointerEvent) => {
    if (boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (isDraggingString) {
        let snapX = mx;
        let snapY = my;
        let minDistance = 150;
        Object.entries(modePositions).forEach(([m, pos]) => {
          const position = pos as { x: number; y: number };
          const dist = Math.hypot(position.x - mx, position.y - my);
          if (dist < minDistance) {
            minDistance = dist;
            snapX = position.x;
            snapY = position.y;
          }
        });
        setMousePos({ x: snapX, y: snapY });
      } else {
        setMousePos({ x: mx, y: my });
      }

      if (isDraggingNote) {
        setNotePos({ x: mx - noteDragOffset.x, y: my - noteDragOffset.y });
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingNote) setIsDraggingNote(false);
    if (isDraggingString) {
      if (boardRef.current) {
        const rect = boardRef.current.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        let closestMode = mood;
        let minDistance = 150;
        Object.entries(modePositions).forEach(([m, pos]) => {
          const position = pos as { x: number; y: number };
          const dist = Math.hypot(position.x - mx, position.y - my);
          if (dist < minDistance) {
            minDistance = dist;
            closestMode = m as MoodType;
          }
        });
        setMood(closestMode);
        setPersona(getPersonaForMood(closestMode));
      }
      setIsDraggingString(false);
    }
  };

  const handleSpinRadar = async () => {
    console.log(
      "DEBUG: handleSpinRadar clicked, isGeneratingTitle:",
      isGeneratingTitle,
    );
    if (isGeneratingTitle || isSpinningRef.current) return;
    isSpinningRef.current = true;

    const cacheKey = topic.trim() ? `${topic.trim()}_${mood}` : null;
    if (cacheKey && titleCache[cacheKey]) {
      const cached = titleCache[cacheKey];
      if (Array.isArray(cached)) {
        setSuggestedTitles(cached);
        notify.classified("ARCHIVE_RESTORED");
        isSpinningRef.current = false;
        return;
      }
    }

    setError("");
    setData(null);
    setSuggestedTitles([]);
    setIsGeneratingTitle(true);
    abortControllerRef.current = new AbortController();
    try {
      const titles = await generateTitle(
        topic.trim(),
        mood,
        persona,
        note,
        useOllama ? "ollama" : "gemini",
        undefined,
        abortControllerRef.current.signal,
        ollamaModel
      );
      if (abortControllerRef.current?.signal.aborted) return;

      if (!titles || titles.length === 0 || !Array.isArray(titles)) {
        notify.breach(
          "لم نتمكن من العثور على أفكار حالياً. حاول صياغة موضوعك بشكل مختلف عبر النوتة.",
        );
        setError(
          "فشل الموديل في استخراج عناوين مقترحة. قد يكون الموضوع غامضاً جداً أو هناك ضغط على الخادم حالياً.",
        );
      } else {
        setSuggestedTitles(titles);
        if (cacheKey) {
          setTitleCache((prev) => ({ ...prev, [cacheKey]: titles }));
        }
        if (!topic.trim()) notify.classified("تم اصطياد فكرة عشوائية!");
      }
    } catch (err: any) {
      if (
        err.name === "AbortError" ||
        err.message === "AbortError" ||
        err.message?.toLowerCase().includes("abort")
      ) {
        notify.classified("تم إيقاف الإنشاء بناءً على طلبك");
        return;
      }
      const errorMsg = err.message || "";
      const isApiKeysFailure =
        errorMsg.includes("فشل كلا المزودين") ||
        errorMsg.includes("المفتاح غير صالح");

      const isQuota =
        errorMsg.includes("429") ||
        errorMsg.toLowerCase().includes("quota") ||
        errorMsg.includes("RESOURCE_EXHAUSTED");
      
      const isOllamaError = errorMsg.toLowerCase().includes("ollama") || errorMsg.toLowerCase().includes("local ai");
      const isFailedProxy = errorMsg.includes("Failed to call") || (!isApiKeysFailure && errorMsg.includes("500"));

      if (isApiKeysFailure) {
        notify.breach("فقد الاتصال بالمولد");
        setError(errorMsg.replace("Ollama Proxy Error: 500 -", "").trim());
      } else if (isQuota) {
        notify.breach(`تجاوزت الحد المسموح لـ Gemini (Cloud). يرجى الانتظار واعادة المحاولة.`);
        setError(`تجاوزت الحد المسموح لـ Gemini. يمكنك تقديم مفتاحك الخاص في الإعدادات، أو المحاولة مرة أخرى.`);
      } else if (isOllamaError) {
        setError("تعذر الاتصال بمحرك Ollama المحلي أو السيرفر مشغول. تأكد من تشغيل Ollama وصحة الرابط.");
        notify.breach("مشكلة في محرك Ollama المحلي");
      } else if (isFailedProxy || err.message?.includes("Failed to call")) {
        setError("تعثر الاتصال بالخادم بسبب الضغط. حاول مرة أخرى لاحقاً.");
        notify.breach("واجهنا مشكلة في التوليد");
      } else {
        const errorMsg = err.message || "حدث خطأ أثناء الاتصال بالخادم";
        setError(errorMsg);
        notify.breach(errorMsg);
      }
    } finally {
      setIsGeneratingTitle(false);
      isSpinningRef.current = false;
    }
  };

  const handleSweepNow = async () => {
    if (isSweeping) return;
    setIsSweeping(true);
    try {
      const data = await sweepLiveTrends(mood, useOllama ? "ollama" : "gemini");
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
      const { mood: newMood, recommendedNote } = await triageTrendMood(
        trend.topic,
        useOllama ? "ollama" : "gemini"
      );
      setMood(newMood);
      setPersona(getPersonaForMood(newMood));
      setNote(recommendedNote);
    } catch (e) {
      // fallback
    } finally {
      setIsTriaging(false);
    }
  };
  const handleGenerateEpisode = async (selectedTitle: string, hookVariant?: string, angleVariant?: string) => {
    if (!selectedTitle) return;
    
    // Clear cheat sheets and snapshot
    useStudioStore.getState().setBRollKeywords([]);
    useStudioStore.getState().setSfxList([]);
    useStudioStore.getState().setFinalProductionSnapshot(null);

    setError("");
    setIsLoading(true);
    setProgress(0);
    setElapsedTime(0);
    setStatus(`يتم الآن تجهيز غرفة العمليات...`);
    setIsحفظd(false);
    let hasError = false;
    abortControllerRef.current = new AbortController();
    try {
      let activeMood = mood;
      let activePersona = persona;

      // Inject the selective hook variant instruction if available
      const hookInstructionContext = (hookVariant && angleVariant) 
        ? `\n\n[USER SELECTED HOOK VARIANT]: ${hookVariant}\n[ASSOCIATED ANGLE]: ${angleVariant}\nCRITICAL INSTRUCTION: Utilize this exact hook as the primary rhythm driver, and shape the scenes and pacing around this angle.` 
        : "";
        
      const tuningContext = `\n[CALIBRATION]: Suspense Level = ${suspenseLevel}/10 (1=Calm/Analytical, 10=Action/Adrenaline). Narrative Strategy = ${narrativeStrategy} (${narrativeStrategy === "HCS" ? "Phase 01: Document Analysis & Information Density" : "Phase 02: Dramatic Suspense & Fast Pacing"}). You MUST enforce this pacing and logic rigidly throughout the script.`;
      
      const effectiveNote = note + (ragContext ? `\n\n[ACADEMIC_RAG_CONTEXT]:\n${ragContext}` : "") + hookInstructionContext + tuningContext;

      if (isAutoPilot) {
        setStatus(
          `[OPERATION: ANALYSIS] // جاري استجواب البيانات وتحديد العقيدة الإخراجية للصورة...`,
        );
        try {
          const classification = await classifyTopic(
            selectedTitle,
            effectiveNote,
            useOllama ? "ollama" : "gemini",
            abortControllerRef.current.signal,
          );
          setMood(classification.mood);
          setPersona(classification.persona);
          activeMood = classification.mood;
          activePersona = classification.persona;
          // Short delay to let the user see the visual change in UI
          await new Promise((r) => setTimeout(r, 1200));
        } catch (e) {
          console.error("AutoPilot classification failed:", e);
        }
      }

        setIsLongForm(true);
        setStatus(`[!] يتم الآن التنقيب في سجلات التحقيق وإعداد الخريطة البحثية...`);
        setProgress(5);

        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 95) return prev;
            if (abortControllerRef.current?.signal.aborted) {
               clearInterval(progressInterval);
               return prev;
            }
            return prev + Math.floor(Math.random() * 5) + 1;
          });

          setStatus((prevStatus) => {
            if (abortControllerRef.current?.signal.aborted) {
               clearInterval(progressInterval);
               return prevStatus;
            }
            const statuses = [
              "يتم الآن التنقيب في سجلات التحقيق...",
              "يتم الآن استخلاص المعلومات التاريخية الدقيقة...",
              "يتم بناء الخريطة البحثية وربط الوثائق المرفقة...",
              "يتم صياغة الفصول (الزوايا الدرامية)...",
              "اقتربنا من الانتهاء، يتم تنسيق الخريطة بصيغة برواز...",
            ];
            const currentIndex = statuses.indexOf(prevStatus);
            if (
              currentIndex !== -1 &&
              currentIndex < statuses.length - 1 &&
              Math.random() > 0.5
            ) {
              return statuses[currentIndex + 1];
            }
            return prevStatus;
          });
        }, 3000);

        try {
          const phase1 = await executePipeline_Phase1_ResearchAndOutline(
            selectedTitle,
            duration,
            effectiveNote,
            activeMood,
            persona,
            undefined, // onProgress
            useOllama ? "ollama" : "gemini",
            useOllama ? "ollama" : "gemini",
            abortControllerRef.current?.signal,
            ollamaModel,
            (chunk) => {
              if (terminalRef.current) {
                terminalRef.current.innerHTML += chunk.replace(/\n/g, '<br/>');
                terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
              }
            },
            async (correction) => {
              return new Promise((resolve) => {
                 setConflictCorrection(correction);
                 setConflictResolver(() => resolve);
                 setConflictOpen(true);
              });
            }
          );
          
          clearInterval(progressInterval);
          setProgress(100);
          setStatus("تم بناء الخريطة بنجاح! راجعها الآن..");
          setTimeout(() => setIsLoading(false), 500);
          if (phase1 && phase1.design) {
            setResearchMap(phase1.design);
          } else {
            throw new Error("لم نتمكن من بناء الخريطة بنجاح. حاول مرة أخرى.");
          }
        } catch (err: any) {
          clearInterval(progressInterval);
          throw err;
        }
    } catch (err: any) {
      hasError = true;
      const errorMsg = err.message || "";
      
      const isHallucinationError = errorMsg.includes("ZERO_HALLUCINATION_ENFORCER") || errorMsg.includes("Ghandour failed to retrieve verified");
      if (!isHallucinationError) {
         console.error('Error in handleGenerateEpisode:', err);
      } else {
         console.log('Stopped generator intentionally due to ZERO_HALLUCINATION_ENFORCER rule.');
      }

      const isApiKeysFailure =
        errorMsg.includes("فشل كلا المزودين") ||
        errorMsg.includes("المفتاح غير صالح");

      const isQuota =
        errorMsg.includes("429") ||
        errorMsg.toLowerCase().includes("quota") ||
        errorMsg.includes("RESOURCE_EXHAUSTED");
      
      const isOllamaError = errorMsg.toLowerCase().includes("ollama") || errorMsg.toLowerCase().includes("local ai") || errorMsg.includes("AI Fabric Proxy");
      const isFailedProxy = errorMsg.includes("Failed to call") || (!isApiKeysFailure && errorMsg.includes("500"));

      if (errorMsg === "MANUAL_EDIT_ABORT") {
         setError(""); // Clear error to allow manual edit
         notify.systemVoice("تم إيقاف المولد التجريبي. يمكنك الآن تعديل الفكرة وتصحيحها يدوياً.");
      } else if (isApiKeysFailure) {
        notify.breach("مشكلة في مفاتيح API");
        setError(errorMsg.replace("Ollama Proxy Error: 500 -", "").trim());
      } else if (isQuota) {
        notify.breach(`تجاوزت الحد المسموح لـ Gemini (Cloud). يرجى الانتظار واعادة المحاولة.`);
        setError(`تجاوزت الحد المجاني لموديل Gemini (Quota Exceeded). يمكنك تقديم مفتاحك الخاص في الإعدادات، أو المحاولة مرة أخرى.`);
      } else if (isOllamaError) {
        setError("انقطع الاتصال بمحرك Ollama. إما أن السيرفر متوقف، أو أن ngrok أنهى الاتصال لأن המوديل (مثل 31b) استغرق أكثر من 60 ثانية للتفكير قبل الرد. جرب استخدام موديل أصغر (مثل gemma2:9b) لتسريع الاستجابة.");
        notify.breach("تأخر محرك Ollama في الاستجابة (Timeout)");
      } else if (isFailedProxy) {
        notify.breach("واجهنا مشكلة في خوادم النظام بسبب طول المحتوى.");
        setError(
          "يبدو أن الاتصال تعثر بسبب استغراق الذكاء الاصطناعي وقتاً طويلاً في التفكير. يمكنك المحاولة مرة أخرى، أو تقليل مدة الحلقة.",
        );
      } else {
        setError(err.message || "حدث خطأ أثناء الاتصال بالخادم");
        notify.breach(err.message || "حدث خطأ أثناء الاتصال بالخادم");
      }
    } finally {
      setIsLoading(false);
      if (duration !== 60 || hasError) {
        setProgress(0);
        setStatus("");
      }
    }
  };

  const handleApproveResearchMap = async () => {
    if (!researchMap) return;
    setIsLoading(true);
    setError("");
    let targetProgress = 10;
    setProgress(targetProgress);
    abortControllerRef.current = new AbortController();

    const smoothProgressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= targetProgress) return prev;
        if (abortControllerRef.current?.signal.aborted) {
           clearInterval(smoothProgressInterval);
           return prev;
        }
        return prev + Math.floor(Math.random() * 2) + 1;
      });
    }, 1000);

    let hasErrorInApprove = false;

    try {
      const hookInstructionContext = (selectedAngle?.hook && selectedAngle?.title) 
        ? `\n\n[USER SELECTED HOOK VARIANT]: ${selectedAngle.hook}\n[ASSOCIATED ANGLE]: ${selectedAngle.title}\nCRITICAL INSTRUCTION: Utilize this exact hook as the primary rhythm driver, and shape the scenes and pacing around this angle.` 
        : "";
        
      const tuningContext = `\n[CALIBRATION]: Suspense Level = ${suspenseLevel}/10. Narrative Strategy = ${narrativeStrategy} (${narrativeStrategy === "HCS" ? "Phase 01: Document Analysis & Information Density" : "Phase 02: Dramatic Suspense & Fast Pacing"}). You MUST enforce this pacing and logic rigidly throughout the script.`;
      
      const effectiveNote = note + (ragContext ? `\n\n[ACADEMIC_RAG_CONTEXT]:\n${ragContext}` : "") + hookInstructionContext + tuningContext;

      // Clean global state to prevent data leakage from previous episode
      setFragmenterData(null);
      setFinalVoiceScript("");
      
      // Initialize data state early
      setData({
        video_title: researchMap.video_title || topic,
        thumbnail: { image_prompt: "", text_on_image: "" },
        opening_sketch: {
          asset_id: "", voice_over: "", visual_cue: "", montage_instructions: "", sound_design: "", image_prompt: "", ai_video_prompt: "",
        },
        scenes: [], sources: [],
        publishing_kit: { youtube_titles: [], thumbnail_prompt: "", description: "", tags: [] },
        shorts: [], audit_report: { status: "verified", executive_summary: "", issues: [] },
      });

      const activeMoodToPass = activeMoodCategory !== "all" ? activeMoodCategory : mood;

      const result = await executePipeline_Orchestrator(
        topic,
        duration,
        effectiveNote,
        activeMoodToPass as any,
        persona,
        (p, s) => {
          targetProgress = Math.max(targetProgress, p);
          setStatus(s);
        },
        (scene) => {
          setData((prev) => {
            if (!prev) return prev;
            return { ...prev, scenes: [...(prev.scenes || []), scene] };
          });
        },
        (chunk) => {
          if (terminalRef.current) {
            terminalRef.current.innerHTML += chunk.replace(/\n/g, '<br/>');
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
          }
        }, // onChunk
        useOllama ? "ollama" : "gemini",
        useOllama ? "ollama" : "gemini",
        useOllama ? "ollama" : "gemini",
        "HCS",
        5,
        async (correction) => {
           return new Promise((resolve) => {
              setConflictCorrection(correction);
              setConflictResolver(() => resolve);
              setConflictOpen(true);
           });
        },
        researchMap // Passes the Map -> instantly jumps to Phase 2 (Ramzy & Fox)
      );

      clearInterval(smoothProgressInterval);
      setProgress(100);
      setData(result);
      useStudioStore.getState().setFinalProductionSnapshot(result);

      // Auto-generate fragments
      setIsGeneratingFragments(true);
      try {
        const fullScript = [
          result.opening_sketch.voice_over,
          ...result.scenes.map((s) => s.voice_over),
        ].join(" ");
        const { generateFragmenterContent } = await import("../lib/gemini");
        const fragments = await generateFragmenterContent(
          topic,
          mood,
          fullScript,
          useOllama ? "ollama" : "gemini",
          useOllama ? ollamaModel : undefined
        );
        setFragmenterData(fragments);
      } catch (err) {
        console.warn("Fragmenter failed:", err);
      } finally {
        setIsGeneratingFragments(false);
      }

      const allVoiceovers = [result.opening_sketch, ...result.scenes]
        .map((s) => s.voice_over || s.clean_tts)
        .join("\n\n");
      setRawScriptText(allVoiceovers);
      
      try {
          const extracted = await extractAndCleanScript(allVoiceovers);
          let optimized = extracted;
          if (persona !== "الهرم الرابع" && activeMoodToPass !== "قصص الأنبياء والتاريخ الإسلامي" && activeMoodToPass !== "عصر الفتوحات والدول الإسلامية") {
              optimized = await convertToEgyptian(extracted);
          }
          
          setStatus("[!] يتم الآن المعالجة الصوتية النهائية والتشكيل الذكي (TTS Normalization)...");
          const ttsNormalized = await executeAgent_TTSNormalizer(
            optimized,
            useOllama ? "ollama" : "gemini",
            persona,
            (chunk) => {
              if (terminalRef.current) {
                terminalRef.current.innerHTML += chunk.replace(/\n/g, '<br/>');
                terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
              }
            }
          );
          
          setFinalVoiceScript(ttsNormalized || optimized);
      } catch (err) {
          console.warn("Script extraction & TTS Normalization failed", err);
          setFinalVoiceScript(allVoiceovers);
      }

      setPipelineStep(3); // Transition to Phase 3 (Output tab)
      setTimeout(() => setActiveTab("script"), 500);

    } catch (err: any) {
      clearInterval(smoothProgressInterval);
      console.error(err);
      if (err.message === "AbortError" || err.message === "MANUAL_EDIT_ABORT") {
        notify.systemVoice("تم إيقاف عملية الصياغة.");
        return;
      }
      hasErrorInApprove = true;
      setError(
        err.message ||
          "حدث خطأ أثناء التصنيع المرحلي. يرجى التحقق من الشبكة وإعادة المحاولة.",
      );
    } finally {
      setIsLoading(false);
      if (duration !== 60 || hasErrorInApprove) {
        setProgress(0);
        setStatus("");
      }
    }
  };


  // Export handles have been moved to ExportCenterModule

  return (
    <div
      className="min-h-full flex flex-col font-arabic relative overflow-hidden bg-transparent"
      dir="rtl"
      onClick={playClick}
    >
      {/* SYSTEM PULSE (Kill Switch Visuals active/Background active) */}
      {isLoading && (
        <div className="fixed bottom-6 left-6 z-[200] pointer-events-none flex items-center gap-3 opacity-60">
          <div className="w-1.5 h-1.5 rounded-full bg-[#4f46e5] animate-pulse" />
          <span className="text-[10px] font-arabic text-[#71717a] font-medium">
            راصد يحلل الآن...
          </span>
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none z-50 mix-blend-overlay opacity-10 bg-[url('https://www.transparenttextures.com/patterns/clean-textile.png')]" />

      {/* MAIN HEADER - STYLED TO MATCH OTHER PAGES */}
      <header className="relative z-10 bg-[#121214]  rounded-lg border border-[#27272a] p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm overflow-hidden max-w-7xl mx-auto mt-[76px] w-[calc(100%-2rem)]">
        <div className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(circle_at_100%_0%,_#4f46e5_1px,_transparent_1px)] bg-[size:40px_40px]" />
        
        <div className="relative z-10 flex gap-4">
           <div>
              <h2 className="text-3xl font-black  text-[#fafafa] leading-none font-arabic mb-2  flex items-center gap-3">
                 <TerminalSquare className="w-8 h-8 text-[#4f46e5]" />
                 [STUDIO] // أستوديو صناعة المحتوى
              </h2>
              <p className="text-[#a1a1aa] font-arabic text-xs leading-relaxed max-w-2xl mt-2 font-medium">
                 خط إنتاج الإبداع: من استخلاص الفكرة إلى التدقيق والمونتاج.
              </p>
           </div>
        </div>
      </header>

      {/* PIPELINE PROGRESS TRACKER */}
      <div className="relative z-[100] px-4 py-4 pointer-events-none transition-all duration-300 w-[calc(100%-2rem)] max-w-7xl mx-auto -mt-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between pointer-events-auto bg-[#121214]/80  border border-[#27272a] p-3 rounded-lg shadow-mamluk">
          <div className="flex items-center gap-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-3">
                <div 
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center font-arabic text-xs font-bold transition-all duration-500 ${
                    pipelineStep === step 
                      ? "bg-gradient-to-br from-[#4f46e5] to-[#4f46e5] border-[#6366f1] text-[#09090b] shadow-sm scale-110" 
                      : pipelineStep > step 
                        ? "bg-[#27272a] border-[#4f46e5]/30 text-[#4f46e5]" 
                        : "bg-[#09090b] border-[#27272a] text-[#71717a]"
                  }`}
                >
                  {step === 1 ? <Search size={14} /> : step === 2 ? <PenLine size={14} /> : <ImageIcon size={14} />}
                </div>
                <span className={`text-[10px] font-arabic font-bold  tracking-wider transition-opacity ${pipelineStep === step ? "opacity-100 text-[#4f46e5]" : "opacity-50 text-[#71717a]"}`}>
                  {step === 1 ? "رصد وبحث" : step === 2 ? "تأليف وسرد" : "إنتاج ووسائط"}
                </span>
                {step < 3 && <div className="w-10 h-[2px] bg-[#27272a] mx-2" />}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 border-r border-[#27272a] pr-4 mr-2">
             <button 
               onClick={() => setShowArchive(true)}
               className="p-2 text-[#a1a1aa] hover:text-[#4f46e5] active:scale-95 rounded-lg transition-colors relative group"
             >
                <Archive size={18} />
                <div className="absolute top-full right-0 mt-2 p-2 bg-[#121214] border border-[#27272a] rounded-lg text-[10px] font-arabic text-[#4f46e5] whitespace-nowrap opacity-0 group-active:scale-95 pointer-events-none transition-opacity shadow-mamluk z-[50]">
                   الأرشيف والسجلات
                </div>
             </button>
             <button 
               onClick={() => setShowSettings(true)}
               className="p-2 text-[#a1a1aa] hover:text-[#4f46e5] active:scale-95 rounded-lg transition-colors relative group"
             >
                <Settings size={18} />
                <div className="absolute top-full right-0 mt-2 p-2 bg-[#121214] border border-[#27272a] rounded-lg text-[10px] font-arabic text-[#4f46e5] whitespace-nowrap opacity-0 group-active:scale-95 pointer-events-none transition-opacity shadow-mamluk z-[50]">
                   إعدادات المحرك
                </div>
             </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA - PIPELINE ORIENTED */}
      <main className="flex-1 relative z-10 px-10 pt-12 pb-40 min-h-screen max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {/* STEP 1: GATHERING (الرصد) */}
          {pipelineStep === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {error && (
                <div className="flex flex-col items-center justify-center animate-in fade-in duration-500 mb-8 mt-4">
                  <div className="text-center space-y-4 max-w-2xl bg-red-950/30 p-10 border border-red-500/30 relative rounded-xl w-full">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 bg-red-950 border border-red-500/30 text-[10px] font-arabic text-red-400  ">SYSTEM_ERROR</div>
                    <p className="text-red-300/80 font-arabic text-lg leading-relaxed">{error}</p>
                  </div>
                </div>
              )}
              <div className="text-center space-y-4 mb-8">
                <motion.h1 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-5xl lg:text-7xl font-arabic font-extrabold tracking-tight text-[#fafafa] mb-2"
                >
                  ماذا تريد أن تصنع اليوم؟
                </motion.h1>
                <p className="text-[#71717a] font-arabic text-sm max-w-2xl mx-auto font-medium font-semibold flex items-center justify-center gap-2">
                  <Database size={16} className="text-[#6366f1]" /> Gathering Data for Archive
                </p>
              </div>

              {/* SMART DASHBOARD WIDGETS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  <div className="bg-[#121214]  border border-[#27272a] p-6 rounded-3xl shadow-sm flex flex-col justify-between relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#4f46e5] opacity-5 blur-3xl group-hover:opacity-10 transition-opacity" />
                      <div className="relative z-10 flex items-center justify-between mb-4 text-[#4f46e5]">
                          <div className="flex items-center gap-3">
                              <Activity size={20} />
                              <h3 className="font-arabic text-[10px] font-bold font-medium">Active Engine</h3>
                          </div>
                      </div>
                      <div className="relative z-10 flex justify-between items-end">
                          <div>
                              <p className="text-2xl font-black text-[#fafafa]  tracking-wider">{useOllama ? "Ollama Local" : "Gemini Cloud"}</p>
                              <p className="text-[10px] text-[#71717a] font-arabic  mt-1 ">Ready for operations</p>
                          </div>
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)] animate-pulse mb-1" />
                      </div>
                  </div>

                  <div className="bg-[#121214]  border border-[#27272a] p-6 rounded-3xl shadow-sm flex flex-col justify-between relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#6366f1] opacity-5 blur-3xl group-hover:opacity-10 transition-opacity" />
                      <div className="relative z-10 flex items-center justify-between mb-4 text-[#6366f1]">
                          <div className="flex items-center gap-3">
                              <Archive size={20} />
                              <h3 className="font-arabic text-[10px] font-bold font-medium">Local Records</h3>
                          </div>
                      </div>
                      <div className="relative z-10">
                          <p className="text-2xl font-black text-[#fafafa]  tracking-wider font-arabic">11 <span className="text-sm text-[#71717a]">cases</span></p>
                          <p className="text-[10px] text-[#71717a] font-arabic  mt-1  text-right">Resolved</p>
                      </div>
                  </div>

                  <div className="bg-[#121214]  border border-[#27272a] p-6 rounded-3xl shadow-sm flex flex-col justify-between relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#2b5797] opacity-5 blur-3xl group-hover:opacity-10 transition-opacity" />
                      <div className="relative z-10 flex items-center justify-between mb-4 text-[#a1a1aa]">
                          <div className="flex items-center gap-3">
                              <TrendingUp size={20} />
                              <h3 className="font-arabic text-[10px] font-bold font-medium">Market Intel</h3>
                          </div>
                      </div>
                      <div className="relative z-10 bg-[#27272a]/50 border border-[#27272a] rounded-xl p-3 flex justify-between items-center cursor-pointer hover:border-[#4f46e5] transition-colors">
                          <div className="text-right">
                              <p className="text-sm font-bold text-[#fafafa] leading-tight font-arabic w-full truncate">اغتيال في ظروف غامضة</p>
                              <p className="text-[9px] text-[#4f46e5] font-arabic  mt-1  text-right flex items-center gap-1 justify-end">
                                 <Plus size={10} /> Add to brief
                              </p>
                          </div>
                          <div className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-arabic rounded-lg">HOT</div>
                      </div>
                  </div>
              </div>

              {/* INPUT AREA */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <div className="space-y-8">
                  {/* EDIT AREA */}
                  <div className="bg-[#121214]  border border-[#27272a] rounded-3xl p-8 relative overflow-hidden shadow-sm">
                    <div className="relative z-10 space-y-6">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-arabic text-[#71717a] font-medium font-bold">Concept Input</label>
                        <div className="flex gap-2">
                           <button 
                             onClick={loadDraft}
                             className="px-3 py-1 bg-[#27272a]/50 active:scale-95 border border-[#27272a] rounded-lg transition-colors group text-[#a1a1aa]"
                             title="استرجاع آخر مسودة"
                           >
                             <span className="text-[10px] font-arabic group-hover:text-[#4f46e5]">استرجاع مسودة</span>
                           </button>
                           <button 
                             onClick={handleSweepNow}
                             disabled={isSweeping}
                             className="p-2 active:scale-95 border border-[#27272a] rounded-lg transition-colors group/sweep"
                             title="تحديث المؤشرات الحيّة"
                           >
                             <TrendingUp className={`w-4 h-4 transition-colors ${isSweeping ? "animate-pulse text-[#6366f1]" : "text-[#71717a] group-hover/sweep:text-[#4f46e5]"}`} />
                           </button>
                        </div>
                      </div>

                      <div className="relative group">
                        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#4f46e5]/40 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
                        <div className="absolute inset-y-0 -left-px w-px bg-gradient-to-b from-transparent via-[#4f46e5]/20 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
                        
                        <textarea
                          placeholder="أدخل فكرتك هنا (أو ارفع ملف .docx ليتم استخراج النص تلقائياً...)"
                          className="w-full h-40 bg-[#09090b]/80  border border-[#27272a] rounded-2xl p-6 text-xl lg:text-2xl font-arabic leading-relaxed text-[#fafafa] placeholder:text-[#71717a]/50 focus:ring-1 focus:ring-[#4f46e5]/50 focus:border-[#4f46e5]/40 transition-all outline-none resize-none custom-scrollbar shadow-[inset_0_2px_20px_rgba(0,0,0,0.5)]"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                        />
                        
                        {/* Corner decorative bracket */}
                        <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-[#4f46e5]/30 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                        <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-[#4f46e5]/30 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                        <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-[#4f46e5]/30 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                        <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-[#4f46e5]/30 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                        
                        <Search className="absolute bottom-6 left-6 w-5 h-5 text-[#71717a] group-focus-within:text-[#4f46e5]/60 transition-colors" />
                        <label className="absolute bottom-6 right-6 p-2 bg-[#121214]  rounded-lg border border-[#27272a] cursor-pointer shadow-sm hover:bg-[#4f46e5]/10 hover:border-[#4f46e5]/30 active:scale-95 transition-all text-[#71717a] hover:text-[#4f46e5]" title="رفع ملف وورد (.docx)">
                          <FileText className="w-5 h-5" />
                          <input 
                              type="file"
                              accept=".docx"
                              className="hidden"
                              onChange={async (e) => {
                                 const file = e.target.files?.[0];
                                 if (!file) return;
                                 try {
                                   const buffer = await file.arrayBuffer();
                                   const mammoth = await import("mammoth");
                                   const result = await mammoth.extractRawText({ arrayBuffer: buffer });
                                   if (result.value) {
                                      setTopic(prev => prev + (prev ? '\n\n' : '') + result.value);
                                   } else {
                                      alert("لم يتم العثور على نص في هذا الملف.");
                                   }
                                 } catch (err) {
                                   console.error("Docx parsing error:", err);
                                   alert("خطأ في قراءة ملف الوورد. يرجى التأكد من أنه بصيغة .docx صحيحة.");
                                 }
                                 // Reset the input
                                 e.target.value = '';
                              }}
                          />
                        </label>

                        {/* PDF RAG Upload Button */}
                        <label className="absolute bottom-6 right-16 p-2 bg-[#121214]  rounded-lg border border-[#27272a] cursor-pointer shadow-sm active:scale-95 transition-colors" title="رفع ملف PDF الأكاديمي للبحث العضوي (RAG)">
                          {isUploadingPDF ? <Loader2 className="w-5 h-5 text-[#4f46e5] animate-spin" /> : <FileBox className="w-5 h-5 text-[#4f46e5] active:scale-95" />}
                          <input 
                              type="file"
                              accept=".pdf"
                              disabled={isUploadingPDF}
                              className="hidden"
                              onChange={async (e) => {
                                 const file = e.target.files?.[0];
                                 if (!file) return;
                                 setIsUploadingPDF(true);
                                 try {
                                    const formData = new FormData();
                                    formData.append("file", file);
                                    
                                    const res = await fetch("/api/documents/upload", {
                                      method: "POST",
                                      body: formData
                                    });
                                    if (!res.ok) throw new Error(await res.text());
                                    const data = await res.json();
                                    
                                    if (data.text) {
                                      setRagContext(data.text);
                                      setNote(prev => prev + (prev ? " " : "") + `مرفق سياق بحثي أكاديمي محلي (RAG) بعنوان ${file.name}.`);
                                      alert(`تم رفع الملف بنجاح واستخراج ${data.text.length} حرف كـ (RAG Context).`);
                                    }
                                 } catch (err: any) {
                                   console.error("PDF upload error:", err);
                                   alert("خطأ في قراءة ملف الـ PDF: " + err.message);
                                 } finally {
                                   setIsUploadingPDF(false);
                                   e.target.value = '';
                                 }
                              }}
                          />
                        </label>
                      </div>

                      <div className="flex flex-wrap gap-4 items-center">
                         <div className="flex-1">
                           <label className="text-[10px] font-arabic text-[#71717a]  block mb-2  font-bold">Tactical Instruction</label>
                           <input 
                              type="text"
                              placeholder="إضافة ملاحظة للمحرك..."
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                              className="w-full bg-[#27272a]/50 border border-[#27272a] rounded-xl p-3 text-sm font-arabic text-[#e5e3e0] outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#4f46e5] transition-all"
                           />
                         </div>
                      </div>

                      <button
                        onClick={handleSpinRadar}
                        disabled={isGeneratingTitle}
                        className="w-full h-16 bg-[#4f46e5] hover:bg-[#6366f1] active:scale-95 disabled:opacity-50 text-[#0b0f17] font-arabic font-bold text-xl rounded-xl flex items-center justify-center gap-3 transition-all relative overflow-hidden group/radar shadow-sm"
                      >
                         {isGeneratingTitle ? (
                           <>
                             <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(11,15,23,0.1)_50%)] bg-[length:100%_4px] pointer-events-none" />
                             <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#0b0f17]/50 to-transparent animate-scan z-10" />
                             <Loader2 className="w-6 h-6 animate-spin relative z-20" />
                             <span className="relative z-20 text-[#0b0f17]">جاري بناء الخيارات السردية...</span>
                           </>
                         ) : (
                           <>
                             <Radar className="w-6 h-6 group-hover/radar:animate-spin" />
                             <span>بناء القصة المتوقعة</span>
                           </>
                         )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* QUICK FORMATS OR EXPERT MODE */}
                  {!isExpertMode ? (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center px-2">
                          <label className="text-[10px] font-arabic text-[#71717a] font-medium font-bold">القوالب الجاهزة (Quick Formats)</label>
                          <button 
                            onClick={(_) => { setIsExpertMode(true); playClick(); }}
                            className="text-[10px] font-arabic text-[#4f46e5] hover:underline font-medium font-bold active:scale-95 transition-transform"
                          >
                            عرض كل القوالب (Show All Formats)
                          </button>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                          <button 
                            onClick={() => { setMood("خرافات شعبية"); setPersona("النبّاش"); playClick(); }}
                            className={`p-6 border text-right transition-all group relative rounded-2xl flex items-center justify-between ${
                              mood === "خرافات شعبية" 
                                ? "bg-[#121214]/80  border-[#4f46e5] shadow-sm" 
                                : "bg-[#27272a]/50 border-[#27272a] active:scale-95 hover:bg-[#121214]  opacity-70 hover:opacity-100"
                            }`}
                          >
                            <div className="text-right">
                              <h4 className={`text-lg font-arabic font-bold transition-colors ${mood === "خرافات شعبية" ? "text-[#4f46e5]" : "text-[#fafafa]"}`}>قصة سريعة (Shorts / Reels)</h4>
                              <p className="text-xs font-arabic text-[#a1a1aa] mt-1">سرد سريع وخلاصة جذابة للجمهور السريع</p>
                            </div>
                            <span className="text-2xl font-arabic text-[#71717a] font-black opacity-30">Short</span>
                          </button>

                          <button 
                            onClick={() => { setMood("طريقة الدحيح"); setPersona("النبّاش"); playClick(); }}
                            className={`p-6 border text-right transition-all group relative rounded-2xl flex items-center justify-between ${
                              mood === "طريقة الدحيح"
                                ? "bg-[#121214]/80  border-[#4f46e5] shadow-sm" 
                                : "bg-[#27272a]/50 border-[#27272a] active:scale-95 hover:bg-[#121214]  opacity-70 hover:opacity-100"
                            }`}
                          >
                            <div className="text-right">
                              <h4 className={`text-lg font-arabic font-bold transition-colors ${mood === "طريقة الدحيح" ? "text-[#4f46e5]" : "text-[#fafafa]"}`}>حلقة يوتيوب قياسية (Standard)</h4>
                              <p className="text-xs font-arabic text-[#a1a1aa] mt-1">سرد مكثف ومرن مع إيقاع سريع وجرعة من الترفيه</p>
                            </div>
                            <span className="text-2xl font-arabic text-[#71717a] font-black opacity-30">Standard</span>
                          </button>

                          <button 
                            onClick={() => { setMood("أرشيف الضلمة"); setPersona("برواز التاريخ"); playClick(); }}
                            className={`p-6 border text-right transition-all group relative rounded-2xl flex items-center justify-between ${
                              mood === "أرشيف الضلمة"
                                ? "bg-[#121214]/80  border-[#4f46e5] shadow-sm" 
                                : "bg-[#27272a]/50 border-[#27272a] active:scale-95 hover:bg-[#121214]  opacity-70 hover:opacity-100"
                            }`}
                          >
                            <div className="text-right">
                              <h4 className={`text-lg font-arabic font-bold transition-colors ${mood === "أرشيف الضلمة" ? "text-[#4f46e5]" : "text-[#fafafa]"}`}>وثائقي عميق (Deep Dive)</h4>
                              <p className="text-xs font-arabic text-[#a1a1aa] mt-1">تحليل تاريخي معمق وسرد ملحمي بأسلوب وثائقي غامض</p>
                            </div>
                            <span className="text-2xl font-arabic text-[#71717a] font-black opacity-30">Deep</span>
                          </button>

                          <button 
                            onClick={() => { setMood("قصص الأنبياء والتاريخ الإسلامي"); setPersona("الهرم الرابع"); playClick(); }}
                            className={`p-6 border text-right transition-all group relative rounded-2xl flex items-center justify-between ${
                              mood === "قصص الأنبياء والتاريخ الإسلامي"
                                ? "bg-[#121214]/80  border-[#4f46e5] shadow-sm" 
                                : "bg-[#27272a]/50 border-[#27272a] active:scale-95 hover:bg-[#121214]  opacity-70 hover:opacity-100"
                            }`}
                          >
                            <div className="text-right">
                              <h4 className={`text-lg font-arabic font-bold transition-colors ${mood === "قصص الأنبياء والتاريخ الإسلامي" ? "text-[#4f46e5]" : "text-[#fafafa]"}`}>قصص الأنبياء (الهرم الرابع)</h4>
                              <p className="text-xs font-arabic text-[#a1a1aa] mt-1">سرد وثائقي ديني وتاريخي ملحمي وموثق</p>
                            </div>
                            <span className="text-2xl font-arabic text-[#71717a] font-black opacity-30">Epic</span>
                          </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* MOOD GRID (القالب البرامجي) */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center px-2">
                           <label className="text-[10px] font-arabic text-[#71717a] font-medium font-bold">القالب البرامجي (Show Format)</label>
                           <button 
                              onClick={() => { setIsExpertMode(false); playClick(); }}
                              className="text-[10px] font-arabic text-[#4f46e5] hover:underline font-medium font-bold active:scale-95 transition-transform"
                            >
                              تبسيط الخيارات (Quick Formats)
                            </button>
                        </div>
                        {/* CATEGORY TABS */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-2">
                           {SECTORS.map(cat => (
                             <button
                               key={cat.id}
                               onClick={() => { setActiveMoodCategory(cat.id); playClick(); }}
                               className={`px-4 py-2 text-xs font-arabic font-bold rounded-full whitespace-nowrap transition-all ${
                                 activeMoodCategory === cat.id 
                                  ? "bg-[#4f46e5] text-white shadow-medium cursor-default pointer-events-none" 
                                  : "bg-[#121214] text-[#a1a1aa] hover:bg-[#27272a] active:scale-95"
                               }`}
                             >
                               {cat.label}
                             </button>
                           ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                          {MOODS.filter(m => activeMoodCategory === "all" || m.sector === activeMoodCategory).map((m) => {
                            
                            // Compatibility logic
                            const compRes = getPersonaCompatibility(persona, m.type);
                            let compatibility = compRes.score;
                            let isRecommended = compRes.isRecommended;

                            if (!isRecommended) {
                               compatibility = Math.floor(Math.random() * 20) + 40; // baseline if not strictly clustered
                            }

                            return { ...m, isRecommended, compatibility };
                          })
                          .sort((a, b) => b.compatibility - a.compatibility)
                          .map((m) => (
                            <button
                              key={m.type}
                              onClick={() => {
                                const newMood = m.type as MoodType;
                                setMood(newMood);
                                const currentScore = getPersonaCompatibility(persona, newMood).score;
                                if (currentScore < 50) {
                                  const newPersona = [...PERSONAS].map(p => ({...p, score: getPersonaCompatibility(p.id, newMood).score})).sort((a,b) => b.score - a.score)[0];
                                  if (newPersona) setPersona(newPersona.id as PersonaType);
                                }
                                playClick();
                              }}
                              onPointerOver={() => playHover()}
                              className={`p-4 border text-right transition-all group relative rounded-2xl flex items-start gap-4 ${
                                mood === m.type 
                                  ? "bg-[#121214]/80  border-[#4f46e5] shadow-sm" 
                                  : m.isRecommended 
                                    ? "bg-[#121214]/40 border-[#10b981]/50 hover:bg-[#121214] hover:border-[#10b981] active:scale-95"
                                    : "bg-[#27272a]/50 border-[#27272a] active:scale-95 hover:bg-[#121214]  opacity-70 hover:opacity-100"
                              }`}
                            >
                               <div className={`p-3 rounded-xl border shrink-0 transition-colors ${mood === m.type ? "bg-[#27272a] border-[#4f46e5]/30" : "bg-[#121214] border-[#27272a]"}`}>
                                 <m.icon className={`w-6 h-6 transition-colors ${mood === m.type ? "text-[#4f46e5]" : m.isRecommended ? "text-[#10b981]" : "text-[#71717a] group-hover:text-[#6366f1]"}`} />
                               </div>
                               <div className="flex-1">
                               <div className="flex justify-between items-start mb-1">
                                    <h4 className={`text-sm font-arabic font-bold transition-colors ${mood === m.type ? "text-[#4f46e5]" : "text-[#fafafa]"}`}>{m.type}</h4>
                                    {m.isRecommended && (
                                      <span className="text-[8px] font-arabic bg-[#10b981]/20 text-[#10b981] px-2 py-0.5 rounded-lg border border-[#10b981]/30 font-medium">
                                        Professional Fit {m.compatibility}%
                                      </span>
                                    )}
                                  </div>
                                 <p className="text-[10px] font-arabic text-[#a1a1aa] leading-relaxed line-clamp-2 mb-2">{m.description}</p>
                                 
                                 {/* DNA Tags */}
                                 <div className="flex flex-wrap gap-1 mt-auto">
                                    <span className="text-[8px] font-arabic bg-[#121214] text-[#71717a] px-1.5 py-0.5 rounded-lg border border-[#27272a]">{m.dna?.localization || 'Global'}</span>
                                 </div>
                               </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* PERSONA SELECTOR (أسلوب الراوي) */}
                      <div className="space-y-4 pt-4 border-t border-[#27272a] mt-6 relative">
                        <div className="flex justify-between items-center px-2">
                           <label className="text-[10px] flex items-center gap-2 font-arabic text-[#71717a] font-medium font-bold">
                              <Mic2 className="w-3 h-3 text-[#4f46e5]" />
                              هوية الراوي (Narrator Voice / Persona)
                           </label>
                           <span className="text-[9px] font-arabic text-[#a1a1aa] border border-[#27272a] px-2 py-0.5 rounded-full bg-[#121214]">
                               SYNC: {mood}
                           </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {PERSONAS.map((p) => {
                            const { score: compatibility, isRecommended } = getPersonaCompatibility(p.id, mood);

                            return { ...p, isRecommended, compatibility };
                          })
                          .filter(p => p.compatibility >= 40)
                          .sort((a, b) => b.compatibility - a.compatibility)
                          .map((p) => (
                             <button
                               key={p.id}
                               onClick={() => {
                                 setPersona(p.id as PersonaType);
                                 playClick();
                               }}
                               className={`p-4 text-right transition-all group relative overflow-hidden rounded-2xl border flex flex-col gap-3 ${
                                 persona === p.id 
                                   ? "bg-[#121214]/90  border-[#4f46e5] shadow-sm" 
                                   : p.isRecommended
                                     ? "bg-[#121214]/40 border-[#10b981]/50 hover:bg-[#121214]/80 hover:border-[#10b981] active:scale-95"
                                     : "bg-[#121214]  border-[#27272a] hover:bg-[#27272a]/50 active:scale-95 opacity-70 hover:opacity-100"
                               }`}
                             >
                                <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden opacity-5">
                                    <AudioLines className={`absolute -right-4 -top-4 w-24 h-24 ${persona === p.id ? "text-[#4f46e5]" : "text-white"}`} />
                                </div>
                               
                               <div className="flex justify-between items-start w-full relative z-10">
                                  <div className="flex flex-col items-start">
                                      <h3 className={`text-sm font-arabic font-bold block transition-colors ${persona === p.id ? "text-[#4f46e5]" : "text-[#fafafa]"}`}>{p.label}</h3>
                                      {p.quote && (
                                        <p className="text-[9px] text-[#a1a1aa] font-arabic mt-1 italic opacity-80 group-hover:opacity-100 transition-opacity">
                                            {p.quote}
                                        </p>
                                      )}
                                  </div>
                                  {p.isRecommended && (
                                     <div className="flex flex-col items-end gap-1">
                                         <span className={`text-[8px] font-arabic px-2 py-0.5 rounded-lg border font-medium shrink-0 ${persona === p.id ? "bg-[#4f46e5]/20 text-[#4f46e5] border-[#4f46e5]/40" : "bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30"}`}>
                                           Match {p.compatibility}%
                                         </span>
                                     </div>
                                  )}
                               </div>
                               <p className={`text-[10px] font-arabic leading-relaxed relative z-10 line-clamp-2 ${persona === p.id ? "text-[#4f46e5]" : "text-[#8c867e]"}`}>{p.desc}</p>
                               
                               {/* DNA tags for Persona */}
                               {p.dna && (
                                  <div className="flex flex-wrap gap-1 mt-auto relative z-10 pt-2 border-t border-[#27272a]/50 w-full">
                                      {p.dna.map(tag => (
                                          <span key={tag} className="text-[8px] font-arabic bg-[#0b0f17] text-[#71717a] px-1.5 py-0.5 rounded-lg border border-[#27272a] shadow-sm">{tag}</span>
                                      ))}
                                  </div>
                               )}
                             </button>
                          ))}
                        </div>
                      </div>

                      {/* Visual DNA DNA Informant */}
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-[#121214]/50 border-l-2 border-[#4f46e5] p-6 space-y-4 relative overflow-hidden rounded-xl mt-6"
                      >
                          <div className="absolute top-0 right-0 p-2 opacity-5">
                             <Fingerprint className="w-12 h-12 text-blue-900" />
                          </div>
                          <div className="flex items-center gap-2 text-[#4f46e5]">
                            <Activity className="w-4 h-4" />
                            <span className="text-[10px] font-arabic   font-bold">Visual DNA Report</span>
                          </div>
                          <div className="grid grid-cols-3 gap-6">
                            <div className="space-y-1">
                              <span className="text-[9px] font-arabic text-[#71717a]  block mb-1 font-bold">Style</span>
                              <span className="text-xs font-arabic text-[#e5e3e0] block font-semibold">{MOODS.find(m => m.type === mood)?.dna?.style || "Ink Sketch / Etching"}</span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] font-arabic text-[#71717a]  block mb-1 font-bold">Canvas</span>
                              <span className="text-xs font-arabic text-[#e5e3e0] block font-semibold">{MOODS.find(m => m.type === mood)?.dna?.paper || "Aged Yellow Paper"}</span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] font-arabic text-[#71717a]  block mb-1 font-bold">Localization IQ</span>
                              <span className="text-xs font-arabic text-[#4f46e5] block font-bold">نشط (Active)</span>
                            </div>
                          </div>
                          <p className="text-[10px] font-arabic text-[#71717a] leading-relaxed border-t border-blue-100/50 pt-4">
                            [!] يتم دمج "البصمة المصرية" أوتوماتيكياً في كل الصور. النظام يحلل العصر ويعدل الملامح والخلفيات لتناسب الهوية العربية دون تدخل يدوي.
                          </p>
                        </motion.div>
                    </>
                  )}

                  {/* RADAR SUGGESTIONS - RESULTS FOR STEP 1 */}
                  {suggestedTitles.length > 0 && (
                    <motion.div 
                      key="suggestions"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6 pt-6 border-t border-[#27272a]"
                    >
                      <div className="flex justify-between items-center px-2">
                        <label className="text-[10px] font-arabic text-[#4f46e5] font-medium font-bold flex items-center gap-2">
                          <Activity className="w-4 h-4" /> Radar Targets Found
                        </label>
                        {suggestedTitles.length > 1 && (
                          <button 
                            onClick={handleMergeTitles}
                            className="text-[9px] font-arabic text-[#71717a] active:scale-95  flex items-center gap-2 transition-colors font-bold bg-[#121214]  px-3 py-1 rounded-full border border-[#27272a] active:scale-95"
                          >
                            <Swords className="w-3 h-3" /> Merge Logic
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        {suggestedTitles.map((st, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              const hookVal = st.hook || st.hook_instruction || "";
                              setSelectedAngle({ title: st.title, hook: hookVal });
                              setSuspenseLevel(st.suspense_level || 5);
                              setNarrativeStrategy((st.narrative_strategy === "HAP" || st.narrative_strategy === "HCS") ? st.narrative_strategy as any : "HCS");
                              setIsTransitioning(true);
                              playClick();
                              window.scrollTo({ top: 0, behavior: "smooth" });
                              setTimeout(() => {
                                setIsTransitioning(false);
                                setPipelineStep(3);
                                handleGenerateEpisode(st.title, hookVal, st.title);
                              }, 2000);
                            }}
                            className="w-full text-right p-6 bg-[#121214]  border border-[#27272a] rounded-2xl active:scale-95 transition-all group relative overflow-hidden"
                          >
                            <div className="flex gap-4 items-center flex-row-reverse">
                              <span className="text-xl font-arabic text-gray-200 group-active:scale-95 transition-colors font-bold">0{i+1}</span>
                              <div className="flex-1 space-y-1">
                                <h5 className="text-lg font-arabic font-bold text-[#fafafa] group-active:scale-95 transition-colors">{st.title}</h5>
                                <p className="text-xs font-arabic text-[#71717a] leading-relaxed max-w-xl">"{st.hook || st.hook_instruction}"</p>
                              </div>
                              <ArrowRight className="w-5 h-5 text-[#71717a]/50 group-active:scale-95 transition-colors -rotate-180" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* MICRO ANIMATION BEFORE PRODUCTION */}
          {isTransitioning && selectedAngle && (
            <motion.div 
              key="transition"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[400px] space-y-8"
            >
               <div className="relative w-32 h-32 flex items-center justify-center">
                 <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                   className="absolute inset-0 border-[2px] border-dashed border-[#4f46e5]/30 rounded-full" 
                 />
                 <motion.div 
                   animate={{ rotate: -360 }}
                   transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                   className="absolute inset-6 border-[1px] border-[#4f46e5]/50 rounded-full" 
                 />
                 <Activity className="w-8 h-8 text-[#4f46e5] animate-pulse relative z-10" />
               </div>
               
               <div className="text-center space-y-3">
                 <h3 className="text-2xl font-arabic font-bold text-[#fafafa] tracking-tight">يتم معايرة بوصلة السرد...</h3>
                 <p className="text-[10px] font-arabic text-[#71717a] font-medium font-bold">Initializing Narrative Core</p>
               </div>
            </motion.div>
          )}

          {/* STEP 3: PRODUCTION (التحميض) */}
          {pipelineStep === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
               <div className="bg-[#121214]  border border-[#27272a] rounded-3xl min-h-[600px] p-8 lg:p-12 relative overflow-hidden shadow-sm">
                  {/* Neon scanline for active production */}
                  {isLoading && <div className="absolute top-0 left-0 w-full h-[2px] bg-[#4f46e5]/30 shadow-medium shadow-blue-500/20 animate-scan z-20" />}
                  
                  {error ? (
                    <div className="flex flex-col items-center justify-center min-h-[500px] space-y-8 animate-in fade-in duration-500">
                      <div className="relative">
                        <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />
                        <AlertTriangle className="w-24 h-24 text-[#ef4444] relative z-10 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                      </div>
                      
                      <div className="text-center space-y-4 max-w-2xl bg-red-950/30 p-10 border border-red-500/30 relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 bg-red-950 border border-red-500/30 text-[10px] font-arabic text-red-400  ">SYSTEM_ERROR</div>
                        <h3 className="text-3xl font-arabic font-black text-[#fafafa] leading-tight">عطل في غرفة العمليات</h3>
                        <p className="text-red-300/80 font-arabic text-lg leading-relaxed">{error}</p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <button 
                          onClick={() => {
                            setError("");
                            if (researchMap) {
                              handleApproveResearchMap();
                            } else if (selectedAngle) {
                              handleGenerateEpisode(selectedAngle.title, selectedAngle.hook, selectedAngle.title);
                            }
                          }}
                          className="px-12 py-5 bg-red-600/10 border border-red-500/50 text-[#fafafa] active:scale-95 font-arabic font-bold text-xl font-medium group transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                        >
                          <RefreshCcw className="w-6 h-6 inline ml-3 transition-transform group-active:scale-95" />
                          إعادة المحاولة
                        </button>

                        {useOllama && (
                          <button 
                            onClick={() => {
                              setUseOllama(false);
                              setError("");
                              // Small delay to ensure state propagates
                              setTimeout(() => {
                                if (researchMap) {
                                  handleApproveResearchMap();
                                } else if (selectedAngle) {
                                  handleGenerateEpisode(selectedAngle.title, selectedAngle.hook, selectedAngle.title);
                                }
                              }, 100);
                            }}
                            className="px-12 py-5 bg-blue-600/10 border border-blue-500/50 text-[#fafafa] active:scale-95 font-arabic font-bold text-xl font-medium group transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                          >
                            <Cloud className="w-6 h-6 inline ml-3" />
                            التحويل للمحرك السحابي (Gemini)
                          </button>
                        )}
                      </div>
                    </div>
                  ) : isLoading ? (
                    <div className="flex flex-col items-center justify-center min-h-[500px] space-y-12 bg-[#09090b]/50 relative p-8 border border-[#27272a]">
                       <div className="absolute inset-0 bg-gradient-to-b from-[#121214]/80 to-[#121214] pointer-events-none" />
                       <div className="relative z-10 w-64 h-64 flex items-center justify-center">
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border-[2px] border-[#168ee8]/30 rounded-full" 
                            style={{ borderStyle: "dashed dotted" }}
                          />
                          <motion.div 
                            animate={{ rotate: -360 }}
                            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-4 border-[1px] border-[#168ee8]/40 rounded-full shadow-[0_0_15px_rgba(22,142,232,0.1)]" 
                          />
                          <motion.div 
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-12 bg-[#168ee8]/5 rounded-full blur-md" 
                          />
                          <div className="relative z-10 flex flex-col items-center gap-3">
                            <div className="relative group">
                              <div className="absolute inset-0 bg-[#369ff0] blur-xl opacity-20 group-hover:opacity-40 animate-pulse" />
                              <Loader2 className="w-14 h-14 text-[#168ee8] animate-spin relative z-[1] drop-shadow-[0_0_5px_rgba(22,142,232,0.6)]" />
                            </div>
                            <span className="text-[14px] font-arabic text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] font-black drop-shadow-md">{progress}%</span>
                          </div>
                        </div>

                        {/* Action Panel Redesign (Cyber/Hacker Aesthetic) */}
                        <div className="text-center space-y-6 max-w-2xl bg-[#03060a]/90  shadow-[0_0_40px_rgba(22,142,232,0.15)] p-10 border border-[#168ee8]/30 relative z-10 w-full overflow-hidden rounded-md">
                          {/* Decorative border corners */}
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#168ee8]/70" />
                          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#168ee8]/70" />
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#168ee8]/70" />
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#168ee8]/70" />

                          {/* CRT Scanline effect */}
                          <div className="absolute inset-0 bg-[#168ee8]/[0.02] bg-[radial-gradient(#168ee8_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />
                          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30 z-0" />
                          
                          {/* Radar sweep effect */}
                          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#168ee8] to-transparent animate-scan mix-blend-screen opacity-70 z-10" />
                          
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 bg-[#03060a] border border-[#168ee8]/40 text-[10px] font-arabic text-[#168ee8]   shadow-[0_0_10px_rgba(22,142,232,0.3)] z-10 rounded">SYS.PROCESSING</div>
                          
                          <h3 className="text-2xl sm:text-3xl font-arabic font-black text-white leading-tight drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] relative z-10 mt-4">{status}</h3>
                          
                          {/* Focus Arabic Loading Tip */}
                          <div className="bg-[#0a1120]/80 p-4 border-l-2 border-r-2 border-[#168ee8]/60 text-center mt-4 relative group transition-all z-10">
                            <p className="text-[#a5d1f5] font-arabic text-lg sm:text-xl leading-relaxed font-bold tracking-wide drop-shadow-sm">
                               <motion.span
                                 key={loadingTip}
                                 initial={{ opacity: 0, scale: 0.95 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 exit={{ opacity: 0, scale: 1.05 }}
                                 transition={{ duration: 0.4 }}
                                 className="inline-block relative"
                               >
                                 <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#168ee8] animate-ping" />
                                 {loadingTip}
                                 <span className="absolute -right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#168ee8] animate-ping" />
                               </motion.span>
                            </p>
                          </div>
                          
                          {/* Raw Terminal Stream Output */}
                          <div className="relative mt-6 z-10 border border-[#168ee8]/20 bg-[#020408] rounded-lg shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] overflow-hidden p-1">
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#168ee8]/50 to-transparent" />
                            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#168ee8]/50 to-transparent" />
                            <div 
                              ref={terminalRef} 
                              className="text-left font-arabic text-[11px] sm:text-[12px] text-[#6b9dcc] max-h-[140px] overflow-y-auto p-4 custom-scrollbar whitespace-pre-wrap break-words"
                              style={{ direction: 'ltr', textShadow: '0 0 5px rgba(107,157,204,0.4)' }}
                            >
                               {/* terminal active log goes here */}
                            </div>
                            <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-[#020408] to-transparent pointer-events-none" />
                          </div>
                          
                          {/* Sleek Progress Bar */}
                          <div className="w-full bg-[#0a1120] shadow-inner h-2 mt-8 rounded-full overflow-hidden border border-[#168ee8]/30 relative z-10">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ ease: "circOut", duration: 0.5 }}
                              className="h-full bg-gradient-to-r from-[#0d558f] via-[#168ee8] to-[#6bc4ff] shadow-[0_0_15px_rgba(22,142,232,0.8)] rounded-full relative"
                            >
                                <div className="absolute top-0 right-0 w-4 h-full bg-white/50 blur-[2px]" />
                            </motion.div>
                          </div>
                          
                          <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-arabic text-[#6b9dcc] font-medium pt-4 opacity-90 z-10 relative">
                            <span className="flex items-center gap-2">
                              ESTIMATING: <span className="text-[#a5d1f5] font-bold">{formattedRemaining}</span>
                            </span>
                            <span className="animate-pulse text-[#168ee8] flex items-center gap-2 font-bold drop-shadow-[0_0_4px_rgba(22,142,232,0.8)]">
                              {progress === 100 ? "SYS.FINALIZING()" : "ACTIVE_PROCESSING..."}
                            </span>
                          </div>
                       </div>

                       <button 
                         onClick={handleStopGeneration}
                         className="px-8 py-4 border-b border-red-500/20 text-[#ef4444]/60 hover:text-red-400 hover:border-red-500/50 active:scale-95 transition-all font-arabic text-[10px] font-medium group relative z-10"
                        >
                          <Skull className="w-4 h-4 inline mr-2 transition-transform group-hover:scale-110" />
                          Abort_Operation
                        </button>
                     </div>
                  ) : researchMap && !data ? (
                    <div className="max-w-5xl mx-auto space-y-16 animate-in fade-in zoom-in-95 duration-700">
                      <div className="text-center space-y-6">
                        <div className="inline-flex items-center justify-center gap-3 px-4 py-1.5 rounded-full bg-[#121214]/80 border border-[#27272a] mb-4">
                          <div className="w-2 h-2 rounded-full bg-[#4f46e5] animate-pulse"></div>
                          <span className="text-[10px] font-arabic text-[#a1a1aa] font-medium">Architectural Blueprint</span>
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-arabic font-extrabold text-[#fafafa] tracking-tight leading-tight">الخريطة السردية (The Roadmap)</h2>
                        <p className="text-[#71717a] font-arabic text-lg font-semibold max-w-2xl mx-auto">
                           تم هندسة مسار الحلقة بدقة. هذه هي الفصول والمحاور الرئيسية التي سيرتكز عليها السيناريو. راجعها قبل البدء في مرحلة التصنيع (Production).
                        </p>
                      </div>
                      
                      <div className="relative before:absolute before:inset-0 before:ml-[28px] md:before:ml-1/2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#42444a] before:to-transparent">
                        <div className="space-y-16">
                          {researchMap.chapters?.map((chapter, idx) => {
                            const isEven = idx % 2 === 0;
                            
                            return (
                              <div key={idx} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group`}>
                                {/* Timeline Marker */}
                                <div className={`flex items-center justify-center w-14 h-14 rounded-full border-4 border-[#0b0f17] bg-[#121214] text-[#4f46e5] font-arabic font-bold text-xl shrink-0 z-10 transition-transform duration-500 group-hover:scale-110 group-hover:shadow-sm md:order-1 md:group-odd:-ml-7 md:group-even:-mr-7 shadow-sm`}>
                                  0{idx + 1}
                                </div>
                                
                                {/* Content Card */}
                                <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2rem)] p-6 md:p-8 bg-[#121214]/80  border border-[#27272a] rounded-2xl shadow-sm group-hover:border-[#4f46e5]/40 transition-colors duration-500`}>
                                  <div className="space-y-3 relative z-10">
                                     <h3 className="text-xl md:text-2xl font-arabic font-bold text-[#fafafa] group-hover:text-[#4f46e5] transition-colors">{chapter.chapter_title || (chapter as any).title || `الفصل ${idx + 1}`}</h3>
                                     <p className="text-[#a1a1aa] font-arabic text-sm leading-relaxed">{chapter.core_premise || chapter.chapter_description}</p>
                                     
                                     {/* Key points/revelations - styled as a checklist */}
                                     {((chapter.key_revelations || chapter.key_points || []) as string[]).length > 0 && (
                                       <div className="mt-6 pt-4 border-t border-[#27272a] space-y-3">
                                         <h4 className="text-[10px]  font-arabic  text-[#71717a] mb-3">Key Focus Areas</h4>
                                         {(chapter.key_revelations || chapter.key_points || []).map((rev: string, revIdx: number) => (
                                           <div key={revIdx} className="flex gap-3 items-start text-xs font-arabic text-[#8c867e] transition-colors hover:text-[#e5e3e0]">
                                             <div className="w-1.5 h-1.5 bg-[#27272a] rounded-lg border border-[#71717a] mt-1 shrink-0 flex items-center justify-center group-hover:border-[#4f46e5]/50 transition-colors">
                                                 <div className="w-0.5 h-0.5 bg-[#4f46e5] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                             </div>
                                             <span className="leading-snug">{rev}</span>
                                           </div>
                                         ))}
                                       </div>
                                     )}
                                  </div>
                                  
                                  {/* Decorative abstract node background */}
                                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#10b981]/5 to-transparent rounded-bl-full pointer-events-none" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row gap-4 justify-center items-center pt-10 border-t border-[#27272a]">
                        <button
                          onClick={handleApproveResearchMap}
                          className="w-full md:w-auto px-12 py-5 bg-[#4f46e5] hover:bg-[#6366f1] text-[#0b0f17] font-arabic font-bold text-xl tracking-wide transition-all duration-300 rounded-xl shadow-sm active:scale-95 flex items-center justify-center gap-3"
                        >
                          اعتماد المخطط وبدء التصنيع
                          <ChevronRight className="w-5 h-5 rtl:rotate-180" />
                        </button>
                        
                        <button
                          onClick={() => setPipelineStep(1)}
                          className="w-full md:w-auto px-8 py-5 bg-[#121214] hover:bg-[#27272a]/80 border border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa] active:scale-95 font-arabic font-bold transition-all duration-300 flex items-center justify-center gap-2 rounded-xl shadow-sm"
                        >
                          تعديل المعطيات (تراجع)
                        </button>
                      </div>
                    </div>
                  ) : data ? (
                    <div className="space-y-16 animate-in fade-in zoom-in-95 duration-700">
                      
                      {/* DASHBOARD HEADER */}
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 pb-12 border-b border-[#27272a]">
                        <div className="space-y-4 text-right flex-1">
                          <div className="flex items-center justify-end gap-4">
                            <span className="px-3 py-1 bg-[#121214] border border-blue-100 text-[#4f46e5] text-[9px] font-arabic font-medium font-bold rounded-full">Operation Complete</span>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)] animate-pulse" />
                          </div>
                          <h1 className="text-5xl lg:text-7xl font-arabic font-extrabold text-[#fafafa] tracking-tight leading-tight drop-shadow-sm">
                            {data.video_title}
                          </h1>
                        </div>
                        
                        <div className="w-full lg:w-auto lg:min-w-[320px]">
                          <ExportCenterModule fragmenterData={fragmenterData} finalVoiceScript={finalVoiceScript} data={data} />

                          <button
                            onClick={() => {
                              window.scrollTo({ top: 0, behavior: "smooth" });
                              const currentData = { ...data };
                              setArchive((prev) => [currentData, ...prev]);
                              setIsحفظd(true);
                              notify.classified("تم أرشفة التقرير في السجلات");
                            }}
                            disabled={isحفظd}
                            className={`w-full px-4 py-3 ${isحفظd ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-[#121214]  text-[#e5e3e0] border-[#27272a] hover:bg-[#27272a]/50 active:scale-95"} border text-[10px] font-arabic font-bold font-medium flex items-center justify-center gap-2 transition-all rounded-xl mt-1`}
                          >
                            <Save size={14} />
                            {isحفظd ? "Archived" : "Archive in Radar"}
                          </button>
                        </div>
                      </div>

                      {/* TABS NAVIGATION */}
                      <div className="flex gap-8 border-b border-[#27272a] overflow-x-auto no-scrollbar">
                        {["script", "assets", "kit", "shorts", "audit", "echo", "planner"].map(tab => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`pb-4 px-6 text-[10px] font-arabic font-medium font-bold transition-all relative shrink-0 ${activeTab === tab ? "text-[#4f46e5]" : "text-[#71717a] active:scale-95"}`}
                          >
                            {activeTab === tab && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-[3px] bg-[#4f46e5] rounded-t-full shadow-[0_-5px_15px_rgba(37,99,235,0.2)]" />}
                            {tab === "script" ? "01 Script Core" : tab === "assets" ? "02 Media Manifest" : tab === "kit" ? "03 Visual Identity" : tab === "shorts" ? "04 Social Fragments" : tab === "audit" ? "05 Audit Radar" : tab === "echo" ? "06 Echo Chamber" : "07 Publish Planner"}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        {/* MAIN TAB CONTENT */}
        <div className="lg:col-span-8 space-y-12">
          <AnimatePresence mode="wait">
            {activeTab === "script" && (
              <ContentEditorModule 
                data={data}
                researchMap={researchMap}
                finalVoiceScript={finalVoiceScript}
                setFinalVoiceScript={setFinalVoiceScript}
                handleUpdateGraph={handleUpdateGraph}
                editor={editor}
                handlePlayVoice={handlePlayVoice}
                isPlayingVoice={isPlayingVoice}
                setShowTeleprompter={setShowTeleprompter}
                useOllama={useOllama}
                renderSceneCards={renderSceneCards}
              />
            )}

                            {activeTab === "assets" && (
                              <motion.div 
                                key="ts-assets"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="space-y-6"
                              >
                                <TimelineModule data={data} />
                              </motion.div>
                            )}

                            {activeTab === "kit" && (
                              <motion.div 
                                key="ts-kit"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="space-y-12"
                              >
                                 {data.thumbnail && (
                                   <ThumbnailBlueprintCard blueprint={{
                                     prompt: data.thumbnail.image_prompt || "",
                                     text: data.thumbnail.text_on_image || data.video_title,
                                     mood_color_instructions: "Cinematic, High Contrast, Documentary Style"
                                   }} />
                                 )}
                                 <PublishingKitCard data={data.publishing_kit} />
                              </motion.div>
                            )}

                            {activeTab === "shorts" && (
                              <motion.div 
                                key="ts-shorts"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="space-y-12"
                              >
                                {fragmenterData ? (
                                  <div className="space-y-10">
                                     <div className="flex justify-between items-center">
                                        <h3 className="text-[10px] font-arabic text-[#4f46e5] font-medium font-black">Unified_Feed_Array</h3>
                                        <button onClick={() => setFragmenterData(null)} className="text-[9px] font-arabic text-[#71717a] active:scale-95 ">Regenerate</button>
                                     </div>
                                     {renderFragmenterUI()}
                                  </div>
                                ) : (
                                  <div className="p-20 bg-[#121214]  border-[#27272a] shadow-sm border border-dashed border-[#27272a] flex flex-col items-center justify-center gap-6 text-center">
                                     <Zap size={40} className="text-[#4f46e5] animate-pulse" />
                                     <div className="space-y-2">
                                        <h4 className="text-xl font-arabic font-bold text-[#fafafa]">تحميض السوشيال ميديا</h4>
                                        <p className="text-sm font-arabic text-[#71717a] max-w-sm">تحويل المسودة الطويلة إلى ضربات مركزة (Twitter Threads, TikTok Scripts)</p>
                                     </div>
                                     <button 
                                      onClick={async () => {
                                        setIsGeneratingFragments(true);
                                        try {
                                           const script = [data.opening_sketch.voice_over, ...data.scenes.map(s => s.voice_over)].join("\n\n");
                                           const packResult = await generatePackaging(
                                             data.video_title, 
                                             script, 
                                             mood, 
                                             data.scenes,
                                             useOllama ? "ollama" : "gemini"
                                           );
                                           setFragmenterData({
                                              ...packResult.packaging,
                                              x_thread: packResult.omnichannel?.twitter_thread,
                                              social_posts: packResult.omnichannel?.social_posts?.map((p: any) => ({
                                                 ...p,
                                                 image_prompt_square: p.image_prompt_square ? applyGlobalStyle(p.image_prompt_square, mood) + " --ar 1:1" : undefined
                                              })),
                                              shorts: packResult.shorts?.map((s: any) => ({
                                                ...s,
                                                image_prompt_vertical_nano: applyGlobalStyle(s.image_prompt_vertical_nano || s.visual_instructions, mood, true)
                                              }))
                                           });
                                        } catch (e) {
                                          notify.breach("Fragmentation Failed");
                                        } finally {
                                          setIsGeneratingFragments(false);
                                        }
                                      }}
                                      disabled={isGeneratingFragments}
                                      className="px-10 py-4 bg-[#121214]  text-black font-arabic text-[10px]  font-black active:scale-95 transition-colors"
                                     >
                                       {isGeneratingFragments ? "Transmitting..." : "Execute_Fragmentation"}
                                     </button>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* SIDEBAR INTEL */}
                        <div className="lg:col-span-4 space-y-10">
                           <div className="bg-[#121214]  shadow-sm border border-[#27272a] p-8 space-y-8 ">
                              <div className="flex gap-1 p-1 bg-[#121214]  border-[#27272a] shadow-sm border border-[#27272a]">
                                 {["audit", "map", "assets"].map(tab => (
                                   <button 
                                    key={tab} 
                                    onClick={() => setIntelTab(tab as any)}
                                    className={`flex-1 py-3 text-[9px] font-arabic   font-black transition-all ${intelTab === tab ? "bg-[#4f46e5] text-white" : "text-[#71717a] active:scale-95"}`}
                                   >
                                     {tab === "audit" ? "Fact_Audit" : tab === "map" ? "Network" : "Vault"}
                                   </button>
                                 ))}
                              </div>

                              <AnimatePresence mode="wait">
                                {intelTab === "audit" && (
                                  <motion.div key="it-audit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                     <div className="flex gap-4">
                                       <div className="flex-1 p-5 bg-green-500/5 border border-green-500/10 text-right h-full">
                                         <p className="text-xs font-arabic text-green-500/80 leading-relaxed">
                                           {data.audit_report?.executive_summary || "لا يوجد تقرير فحص للأسكريبت كونه تم إنشاءه قبل تبني محامي الشيطان."}
                                         </p>
                                       </div>
                                       {data.audit_report?.red_team_score !== undefined && (
                                         <div className="w-24 shrink-0 flex flex-col items-center justify-center p-4 bg-slate-900 border border-slate-700 shadow-inner rounded">
                                           <span className="text-[10px]  font-black text-slate-500 tracking-wider mb-2 text-center leading-tight">Red Team<br/>Eval</span>
                                           <span className={`text-2xl font-arabic ${data.audit_report?.red_team_score > 80 ? 'text-green-400' : data.audit_report?.red_team_score > 60 ? 'text-yellow-400' : 'text-[#ef4444]'}`}>
                                             {data.audit_report?.red_team_score}<span className="text-xs text-slate-500">/100</span>
                                           </span>
                                         </div>
                                       )}
                                     </div>
                                     <div className="space-y-3">
                                        {(data.audit_report?.issues || []).map((issue: any, i) => (
                                          <div key={i} className="flex flex-col gap-2 p-4 border border-[#27272a] bg-[#121214]  shadow-sm">
                                            <div className="flex flex-row-reverse gap-4 items-start">
                                              {issue.severity === "high" || issue.type === "logic" || issue.type === "legal" ? <AlertTriangle size={14} className="text-[#ef4444] shrink-0" /> : <CheckCircle2 size={14} className="text-[#4f46e5] shrink-0" />}
                                              <p className="text-[11px] font-arabic max-w-full text-right leading-relaxed"><strong className="text-[#fafafa] ml-1">[{issue.type?.toUpperCase() || 'ISSUE'}]</strong> <span className="text-[#e5e3e0]">{issue.finding || issue.description}</span></p>
                                            </div>
                                            {(issue.recommendation) && (
                                              <div className="flex flex-row-reverse gap-2 text-[10px] text-[#71717a] font-arabic text-right">
                                                <strong className="text-[#4f46e5] shrink-0">التوصية:</strong>
                                                <span>{issue.recommendation}</span>
                                              </div>
                                            )}
                                            {issue.source_reference && (
                                              <div className="flex flex-row-reverse gap-2 text-[10px] text-[#71717a] font-arabic text-right mt-1">
                                                <strong className="text-[#71717a] shrink-0">المصدر:</strong>
                                                <span>{issue.source_reference}</span>
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                     </div>
                                  </motion.div>
                                )}

                                {intelTab === "map" && (
                                  <motion.div key="it-map" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                     {researchMap ? renderIntelGraph(researchMap) : (
                                       <div className="aspect-square bg-[#121214]  border-[#27272a] shadow-sm border border-dashed border-[#27272a] flex items-center justify-center">
                                          <Loader2 className="w-8 h-8 text-[#71717a] animate-spin" />
                                       </div>
                                     )}
                                     <div className="space-y-3 pt-4 border-t border-[#27272a]">
                                        <span className="text-[8px] font-arabic text-[#71717a]  block mb-3">Origin_Sources</span>
                                        {data.sources.slice(0, 5).map((s, i) => (
                                          typeof s !== "string" && s.url ? (
                                            <a key={i} href={s.url} target="_blank" className="flex flex-row-reverse justify-between items-center p-3 bg-[#121214]  border-[#27272a] shadow-sm active:scale-95 transition-colors group">
                                              <span className="text-[10px] font-arabic text-[#a1a1aa] group-active:scale-95 truncate max-w-[150px]">{s.title}</span>
                                              <ExternalLink size={10} className="text-[#71717a] group-active:scale-95" />
                                            </a>
                                          ) : (
                                            <div key={i} className="flex flex-row-reverse items-center p-3 bg-[#121214]  border-[#27272a] shadow-sm">
                                              <span className="text-[10px] font-arabic text-[#a1a1aa] truncate">{typeof s === "string" ? s : s.title}</span>
                                            </div>
                                          )
                                        ))}
                                     </div>
                                  </motion.div>
                                )}

                                {intelTab === "assets" && (
                                  <motion.div key="it-assets" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                     <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-[#121214]  border-[#27272a] shadow-sm border border-[#27272a] space-y-1">
                                           <span className="text-[8px] font-arabic text-[#71717a]  block">Prompts</span>
                                           <span className="text-lg font-arabic text-[#fafafa] font-bold">{data.scenes.length + 1}</span>
                                        </div>
                                        <div className="p-4 bg-[#121214]  border-[#27272a] shadow-sm border border-[#27272a] space-y-1">
                                           <span className="text-[8px] font-arabic text-[#71717a]  block">B-Roll</span>
                                           <span className="text-lg font-arabic text-[#fafafa] font-bold">DETECTED</span>
                                        </div>
                                     </div>
                                  </motion.div>
                                )}
                                {activeTab === "audit" && (
                               <motion.div 
                                 key="ts-audit"
                                 initial={{ opacity: 0, x: -10 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 exit={{ opacity: 0, x: 10 }}
                                 className="space-y-12"
                               >
                                  <AuditUI />
                               </motion.div>
                             )}
                             {activeTab === "echo" && (
                               <motion.div 
                                 key="ts-echo"
                                 initial={{ opacity: 0, x: -10 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 exit={{ opacity: 0, x: 10 }}
                                 className="space-y-12"
                               >
                                  <EchoChamberUI />
                               </motion.div>
                             )}
                             {activeTab === "planner" && (
                               <motion.div 
                                 key="ts-planner"
                                 initial={{ opacity: 0, x: -10 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 exit={{ opacity: 0, x: 10 }}
                                 className="space-y-12"
                               >
                                  <PlannerModule data={data} />
                               </motion.div>
                             )}
                           </AnimatePresence>

                               {/* TENSION / PACING MONITOR */}
                               <div className="bg-[#121214]  shadow-sm border border-[#27272a] p-8 space-y-6  overflow-hidden relative">
                                  <div className="absolute top-0 left-0 w-full h-[3px]">
                                    {renderTensionHeatmap()}
                                  </div>
                                  <div className="flex justify-between items-center pt-2">
                                     <span className="text-[9px] font-arabic text-[#71717a]   flex items-center gap-2 italic">
                                        <Activity size={12} className="text-[#ef4444] animate-pulse" /> Narrative_Pacing_Curve
                                     </span>
                                     <div className="flex gap-4">
                                      <span className="text-[10px] text-[#71717a] font-arabic flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 block"></span> ذروة (Climax)</span>
                                      <span className="text-[10px] text-[#71717a] font-arabic flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#4f46e5] block"></span> صعود (Rising)</span>
                                      <span className="text-[10px] text-[#71717a] font-arabic flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#27272a] block"></span> هدوء (Valley)</span>
                                     </div>
                                  </div>
                                  {tensionPoints.length > 0 && (
                                     <div className="h-32 w-full mt-4">
                                       <ResponsiveContainer width="100%" height="100%">
                                          <AreaChart data={tensionPoints.map((val, i) => ({ index: i, value: val }))} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                                            <defs>
                                              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                              </linearGradient>
                                            </defs>
                                            <Tooltip content={({ active, payload }) => {
                                              if (active && payload && payload.length) {
                                                return (
                                                  <div className="bg-slate-900 border border-slate-700 p-2 shadow-xl rounded-lg text-xs text-white">
                                                    Intensity: {payload[0].value}
                                                  </div>
                                                );
                                              }
                                              return null;
                                            }} />
                                            <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                                          </AreaChart>
                                       </ResponsiveContainer>
                                     </div>
                                  )}
                              
                              <div className="flex items-end gap-[2px] h-20 w-full pt-4">
                                {tensionPoints.map((p, i) => (
                                  <div 
                                    key={i}
                                    style={{ height: `${(p / 10) * 100}%` }}
                                    className={`flex-1 transition-all duration-500 ${p > 7 ? "bg-red-500" : p > 4 ? "bg-[#4f46e5]" : "bg-[#121214]"}`}
                                  />
                                ))}
                              </div>
                              <div className="flex justify-between text-[8px] font-arabic text-[#71717a] ">
                                 <span>Intro</span>
                                 <span>Crescendo</span>
                                 <span>Coda</span>
                              </div>
                           </div>
                         </div>

                         {/* DIRECTOR OVERRIDE SIDEBAR (lg:col-span-4) */}
                         <div className="lg:col-span-4 space-y-8">
                           <div className="bg-[#121214]  border border-[#27272a] rounded-3xl p-8 shadow-sm space-y-8 sticky top-12">
                             <div className="flex items-center justify-between border-b border-[#27272a] pb-4 flex-row-reverse">
                               <div className="flex items-center gap-3 flex-row-reverse">
                                  <Sliders className="w-5 h-5 text-[#4f46e5]" />
                                  <h3 className="text-xl font-arabic font-bold text-[#fafafa] text-right">قائمة المخرج</h3>
                               </div>
                               <button 
                                  onClick={() => { setIsExpertMode(!isExpertMode); playClick(); }}
                                  className="text-[10px] font-arabic text-[#4f46e5] hover:underline font-medium font-bold"
                                >
                                  {isExpertMode ? "العودة للقوالب السريعة" : "عرض كل القوالب"}
                                </button>
                             </div>

                             <div className="space-y-6">
                               {isExpertMode && (
                                 <>
                                   <div className="space-y-3">
                                      <div className="flex justify-between items-center text-right">
                                        <span className="text-sm font-arabic text-[#4f46e5] font-bold">{suspenseLevel}/10</span>
                                        <span className="text-xs font-arabic text-[#71717a] font-medium font-bold">حالة المود: تشويق</span>
                                      </div>
                                      <div className="relative h-2 w-full">
                                        <input 
                                         type="range"
                                         min="1"
                                         max="10"
                                         value={suspenseLevel}
                                         onChange={(e) => {
                                           setSuspenseLevel(Number(e.target.value));
                                           playHover();
                                         }}
                                         className="w-full h-2 bg-[#27272a] rounded-full appearance-none cursor-pointer accent-blue-600 relative z-10"
                                        />
                                      </div>
                                      <div className="flex justify-between text-[10px] font-arabic font-bold text-[#71717a]">
                                        <span>هادئ وتحليلي</span>
                                        <span>تشويق وأدرينالين</span>
                                      </div>
                                   </div>

                                   <div className="space-y-4 pt-4 border-t border-[#27272a] flex flex-col text-right">
                                     <label className="text-[10px] font-arabic text-[#71717a] font-medium font-bold block w-full text-right">Operational Strategy</label>
                                     <div className="grid grid-cols-2 gap-3">
                                        <button 
                                         onClick={() => setNarrativeStrategy("HCS")}
                                         className={`p-4 text-center border transition-all relative overflow-hidden group rounded-xl ${narrativeStrategy === "HCS" ? "bg-[#121214]  border-[#4f46e5] shadow-sm" : "bg-[#27272a]/50 border-[#27272a] active:scale-95"}`}
                                        >
                                           <span className={`text-[9px] font-arabic  block mb-1 font-bold ${narrativeStrategy === "HCS" ? "text-[#4f46e5]" : "text-[#71717a]"}`}>Phase 01</span>
                                           <h4 className={`text-sm font-arabic font-bold ${narrativeStrategy === "HCS" ? "text-[#fafafa]" : "text-[#71717a]"}`}>تحليل الوثائق</h4>
                                        </button>
                                        <button 
                                         onClick={() => setNarrativeStrategy("HAP")}
                                         className={`p-4 text-center border transition-all relative overflow-hidden group rounded-xl ${narrativeStrategy === "HAP" ? "bg-[#121214]  border-[#4f46e5] shadow-sm" : "bg-[#27272a]/50 border-[#27272a] active:scale-95"}`}
                                        >
                                           <span className={`text-[9px] font-arabic  block mb-1 font-bold ${narrativeStrategy === "HAP" ? "text-[#4f46e5]" : "text-[#71717a]"}`}>Phase 02</span>
                                           <h4 className={`text-sm font-arabic font-bold ${narrativeStrategy === "HAP" ? "text-[#fafafa]" : "text-[#71717a]"}`}>تشويق درامي</h4>
                                        </button>
                                     </div>
                                   </div>
                                 </>
                               )}

                               <button
                                 onClick={() => {
                                   if(selectedAngle) {
                                      handleGenerateEpisode(selectedAngle.title, selectedAngle.hook, selectedAngle.title);
                                      window.scrollTo({ top: 0, behavior: "smooth" });
                                   }
                                 }}
                                 className="w-full h-16 bg-[#4f46e5] active:scale-95 text-white font-arabic font-bold text-xl flex items-center justify-center gap-3 flex-row-reverse transition-all shadow-medium shadow-blue-500/20 group mt-6 active:scale-95 rounded-xl  tracking-wider"
                               >
                                 <RefreshCcw className="w-5 h-5 group-active:scale-95 transition-transform duration-500" />
                                 Re-roll (إعادة التوليد)
                               </button>

                             </div>
                           </div>
                         </div>

                       </div>
                     </div>
                   </div>
                 ) : null}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER BAR HUD */}
      <footer className="fixed bottom-0 left-0 w-full z-[150] px-10 py-6 border-t border-[#27272a] bg-[#121214] /80  flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-10 flex-row-reverse">
           <div className="flex gap-4 items-center flex-row-reverse">
              <div className="p-2 border border-[#27272a] bg-[#121214] ">
                {MOODS.find(m => m.type === mood)?.icon && React.createElement(MOODS.find(m => m.type === mood)!.icon, { size: 14, className: "text-[#4f46e5]" })}
              </div>
              <div>
                <p className="text-[9px] font-arabic text-[#71717a] font-medium mb-0.5">Narrative_Vector</p>
                <p className="text-xs font-arabic text-[#fafafa] font-bold leading-none">{mood}</p>
              </div>
           </div>
           
           <div className="w-[1px] h-8 bg-[#121214]  border-[#27272a] shadow-sm" />
           
           <button 
             onClick={() => setIsPersonaModalOpen(true)}
             title="تغيير العدسة السردية (Persona)"
             className="flex gap-4 items-center flex-row-reverse group cursor-pointer hover:bg-[#27272a]/50 p-2 transition-colors -m-2"
           >
              <div className="p-2 border border-[#27272a] bg-[#121214]  group-hover:border-cyan-400 transition-colors">
                <User size={14} className="text-cyan-400" />
              </div>
              <div className="text-right">
                <p className="text-[9px] font-arabic text-[#71717a] font-medium mb-0.5 group-hover:text-[#4f46e5] transition-colors">صوت الراوي</p>
                <p className="text-xs font-arabic text-[#fafafa] font-bold leading-none">
                  {persona === 'النبّاش' ? 'المحقق' : persona.replace('برواز ', '')}
                </p>
              </div>
           </button>
        </div>

        <div className="flex items-center gap-6">
           {pipelineStep > 1 && !isLoading && (
              <button 
                onClick={() => setPipelineStep(prev => (prev - 1) as any)}
                className="group px-8 py-4 border border-[#27272a] active:scale-95 text-[#a1a1aa] active:scale-95 font-arabic text-[10px]  transition-all flex items-center gap-3 active:scale-95"
              >
                <ChevronLeft size={14} className="transition-transform group-active:scale-95" />
                Previous_Phase
              </button>
           )}
           
           <div className="flex items-center gap-4 px-6 py-4 bg-[#121214]  border-[#27272a] shadow-sm border border-[#27272a] whitespace-nowrap">
              <div className="flex items-center gap-2">
                 <button 
                  onClick={() => setUseOllama(false)}
                  className={`p-1.5 border transition-all ${!useOllama ? 'border-[#3b82f6] bg-[#3b82f6]/10 text-[#3b82f6]' : 'border-[#27272a] text-[#71717a] active:scale-95'}`}
                  title="محرك سحابي (Gemini)"
                 >
                   <Zap size={14} />
                 </button>
                 <button 
                  onClick={() => setUseOllama(true)}
                  className={`p-1.5 border transition-all ${useOllama ? 'border-[#10B981] bg-[#10B981]/10 text-[#10B981]' : 'border-[#27272a] text-[#71717a] active:scale-95'}`}
                  title="محرك محلي (Ollama)"
                 >
                   <Database size={14} />
                 </button>
              </div>

              <div className="w-[1px] h-4 bg-[#121214] mx-1" />

              <button 
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 text-[#a1a1aa] active:scale-95 transition-colors"
                title="إعدادات المحرك"
              >
                <Settings size={14} />
                <span className="text-[10px] font-arabic   font-bold">CONFIG</span>
              </button>
              <div className="w-[1px] h-4 bg-[#121214] mx-1" />
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px_currentColor]`} style={{ color: mainAccent, backgroundColor: mainAccent }} />
              <span className="text-[10px] font-arabic text-[#a1a1aa]   font-bold">{useOllama ? 'LOCAL_ACTIVE' : 'CLOUD_ACTIVE'}</span>
           </div>
        </div>
      </footer>

      {/* MODALS & OVERLAYS */}
      <AnimatePresence>
         <ArchiveModal
           key="archive-modal"
           isOpen={showArchive}
           onClose={() => setShowArchive(false)}
           archive={archive}
           onSetArchive={setArchive}
         />
         <PersonaModal 
           key="persona-modal"
           isOpen={isPersonaModalOpen}
           onClose={() => setIsPersonaModalOpen(false)}
           currentPersona={persona}
           onSelect={setPersona}
         />
         <SettingsModal 
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            useOllama={useOllama}
            setUseOllama={setUseOllama}
            ollamaUrl={ollamaUrl}
            setOllamaUrl={setOllamaUrl}
            ollamaModel={ollamaModel}
            setOllamaModel={setOllamaModel}
            isTagTeam={isTagTeam}
            setIsTagTeam={setIsTagTeam}
            isQuotaShield={isQuotaShield}
            setIsQuotaShield={setIsQuotaShield}
            elevenLabsKey={elevenLabsKey}
            setElevenLabsKey={setElevenLabsKey}
            elevenLabsVoiceId={elevenLabsVoiceId}
            setElevenLabsVoiceId={setElevenLabsVoiceId}
         />
         {showTeleprompter && (
            <TeleprompterOverlay 
              key="teleprompter"
              script={rawScriptText}
              onClose={() => setShowTeleprompter(false)} 
            />
         )}

         {conflictOpen && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-[100] grid place-items-center bg-[#0a0f16]/90  p-4"
           >
             <motion.div
               initial={{ scale: 0.95, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.95, opacity: 0 }}
               className="bg-[#121214] border border-[#4f46e5]/30 p-8 rounded-xl max-w-xl w-full shadow-2xl relative overflow-hidden"
             >
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/20 via-orange-500/50 to-red-500/20"></div>
               <div className="flex items-center gap-4 mb-6">
                 <div className="p-3 bg-red-500/10 rounded-full border border-red-500/20">
                   <AlertCircle className="w-6 h-6 text-red-400" />
                 </div>
                 <h2 className="text-xl font-arabic font-bold text-white">
                   تنبيه استقصائي: تضارب تاريخي
                 </h2>
               </div>
               
               <p className="text-[#a1a1aa] font-arabic mb-6 text-sm leading-relaxed">
                 مصادرنا تشير إلى وجود تعارض بين الفكرة المطلوبة للبحث وبين الحقائق التاريخية الموثقة.
               </p>

               <div className="bg-[#27272a] border border-red-500/20 p-4 rounded-lg mb-8">
                 <h3 className="text-xs font-arabic text-red-400 mb-2">// التصحيح التاريخي للحلقة</h3>
                 <p className="text-white font-arabic text-sm">{conflictCorrection}</p>
               </div>

               <div className="flex flex-col gap-3">
                 <button
                   onClick={() => {
                     setConflictOpen(false);
                     if (conflictResolver) conflictResolver("approve");
                   }}
                   className="w-full bg-[#10b981] hover:bg-[#256a6f] text-white py-3 rounded-lg font-arabic font-bold transition-all border border-[#10b981]/50 flex items-center justify-center gap-2"
                 >
                   <RefreshCw className="w-4 h-4" />
                   موافق، صحح المعلومة وأكمل الحلقة
                 </button>
                 
                 <button
                   onClick={() => {
                     setConflictOpen(false);
                     if (conflictResolver) conflictResolver("manual");
                   }}
                   className="w-full bg-transparent hover:bg-white/5 text-white py-3 rounded-lg font-arabic transition-all border border-white/10 flex items-center justify-center gap-2"
                 >
                   <Settings className="w-4 h-4" />
                   إلغاء المولد لتعديل الفكرة يدوياً
                 </button>
                 
                 <button
                   onClick={() => {
                     setConflictOpen(false);
                     if (conflictResolver) conflictResolver("skip");
                   }}
                   className="w-full bg-transparent hover:bg-red-500/5 text-red-400/80 hover:text-red-400 py-3 rounded-lg font-arabic transition-all border border-transparent hover:border-red-500/20 flex items-center justify-center gap-2"
                 >
                   <Trash2 className="w-4 h-4" />
                   تخطي البحث التجريبي (استخدم مصادري)
                 </button>
               </div>
             </motion.div>
           </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}
