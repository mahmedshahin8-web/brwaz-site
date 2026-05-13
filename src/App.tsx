import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  generateTitle,
  generateResearchMap,
  generateEpisode,
  executePipeline_Orchestrator,
  generateChapter,
  generatePackaging,
  MoodType,
  applyGlobalStyle,
  getMoodContext,
  getPersonaForMood,
} from "./lib/gemini";
import {
  EpisodeData,
  RadarSuggestion,
  MasterOutline,
  ChapterOutline,
  EpisodeScene,
  PersonaType
} from "./types";
import { ImageWithFallback } from "./components/ImageWithFallback";
import {
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
  Square,
  Headphones,
  FileText,
  Wand2,
  Download,
  Users,
  ServerCrash,
  TrendingDown,
  Eye,
  ExternalLink,
  Trash2,
  Layers,
  Hourglass,
  Video,
  Settings,
  Volume2,
} from "lucide-react";
import {
  extractAndCleanScript,
  convertToEgyptian,
} from "./services/audioProcessor";
import { SceneCard } from "./components/SceneCard";
import { TimelineEditor } from "./components/TimelineEditor";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { db, storage } from "./lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function App() {
  const [topic, setTopic] = useState(() => {
    const saved = localStorage.getItem("barwaz_topic") || "";
    if (saved.startsWith("حدث خطأ")) return "";
    return saved;
  });
  const [duration, setDuration] = useState(10);
  const [note, setNote] = useState("");
  const [mood, setMood] = useState<MoodType>("أرشيف الضلمة");
  const persona = getPersonaForMood(mood);

  const [suggestedTitles, setSuggestedTitles] = useState<RadarSuggestion[]>([]);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);

  const [researchMap, setResearchMap] = useState<MasterOutline | null>(null);
  const [isLongForm, setIsLongForm] = useState(false);
  const [generatedScenes, setGeneratedScenes] = useState<EpisodeScene[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [loadingTip, setLoadingTip] = useState("");
  const [data, setData] = useState<EpisodeData | null>(() => {
    const saved = localStorage.getItem("barwaz_session_data");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });

  // Auto-save session data on changes to persist 40-minute workflows
  useEffect(() => {
    if (data) {
      localStorage.setItem("barwaz_session_data", JSON.stringify(data));
    }
  }, [data]);

  const [error, setError] = useState("");

      
  const loadingTips = [
    "الذكاء الاصطناعي ينقّب الآن في بطون الكتب والمصادر المنسية...",
    "يتم الآن صياغة السكربت بلهجة مصرية تليق بـ 'النبّاش'..",
    "تصميم المشاهد البصرية يحتاج لدقة عالية لضمان احترافية الحلقة..",
    "نحن لا نكتب سكربت عادي، نحن نصنع تجربة بصرية متكاملة..",
    "جاري استدعاء مراجع من الأرشيف السري لقصتك..",
    "لحظات ويخرج لك محتوى يكسر الدنيا!",
  ];

  useEffect(() => {
    let tipInterval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingTip(
        loadingTips[Math.floor(Math.random() * loadingTips.length)],
      );
      tipInterval = setInterval(() => {
        setLoadingTip(
          loadingTips[Math.floor(Math.random() * loadingTips.length)],
        );
      }, 5000);
    }
    return () => clearInterval(tipInterval);
  }, [isLoading]);

  useEffect(() => {
    localStorage.setItem("barwaz_topic", topic);
  }, [topic]);

  useEffect(() => {
     console.log("GEMINI KEY:", !!process.env.GEMINI_API_KEY);
  }, []);

  const [activeTab, setActiveTab] = useState<
    "script" | "kit" | "shorts" | "processor"
  >("script");
  const [rawScriptText, setRawScriptText] = useState("");
  const [finalVoiceScript, setFinalVoiceScript] = useState("");
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

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
      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlayingVoice(true);
    }
  };
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [useOllama, setUseOllama] = useState(() => localStorage.getItem("useOllama") === "true");
  const [ollamaUrl, setOllamaUrl] = useState(() => {
    const stored = localStorage.getItem("ollamaUrl");
    return (stored && stored !== "http://127.0.0.1:11434") ? stored : "http://localhost:11434";
  });
  const [ollamaModel, setOllamaModel] = useState(() => localStorage.getItem("ollamaModel") || "llama3.1");
  const [elevenLabsKey, setElevenLabsKey] = useState(() => localStorage.getItem("elevenLabsKey") || "");
  const [elevenLabsVoiceId, setElevenLabsVoiceId] = useState(() => localStorage.getItem("elevenLabsVoiceId") || "pNInz6obbfDQGcgMyIGC");

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

  useEffect(() => {
    localStorage.setItem("barwaz_radar_cache", JSON.stringify(titleCache));
  }, [titleCache]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading && estimatedTime > 0) {
      timer = setInterval(() => {
        setEstimatedTime((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLoading, estimatedTime]);

  // Abort Controller for generation
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setIsGeneratingTitle(false);
    setStatus("تم إيقاف المعالجة بناءً على طلبك.");
    setTimeout(() => {
      setStatus("");
      setProgress(0);
    }, 3000);
  };

  // Pinboard State
  const boardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDraggingString, setIsDraggingString] = useState(false);
  const [notePos, setNotePos] = useState({ x: 100, y: 150 });
  const [isDraggingNote, setIsDraggingNote] = useState(false);
  const [noteDragOffset, setNoteDragOffset] = useState({ x: 0, y: 0 });
  const [modePositions, setModePositions] = useState<
    Record<string, { x: number; y: number }>
  >({});

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [streamedChunk, setStreamedChunk] = useState("");

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: "success" | "error" = "success") =>
    setToast({ message, type });

  const copyToClipboard = async (
    text: string,
    identifier: string = "تم النسخ بنجاح",
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(identifier, "success");
    } catch (err) {
      showToast("فشل النسخ", "error");
    }
  };

  const moods: {
    type: MoodType;
    icon: any;
    color: string;
    description: string;
  }[] = [
    {
      type: "طريقة الدحيح",
      icon: Smile,
      color: "#facc15",
      description: "أسلوب تبسيط استعراضي وكوميدي للأفكار المعقدة",
    },
    {
      type: "أرشيف الضلمة",
      icon: Archive,
      color: "#f59e0b",
      description: "قصص تاريخية غريبة وأرشيفات مظلمة ومجهولة",
    },
    {
      type: "كلاكيت وتزوير",
      icon: Youtube,
      color: "#ef4444",
      description: "تريندات مزيفة، قصص السينما وصناعة الوهم",
    },
    {
      type: "ملفات متقفلش",
      icon: Database,
      color: "#8B5CF6",
      description: "ألغاز وقضايا غامضة لم يتم حلها بعد",
    },
    {
      type: "خرافات شعبية",
      icon: Ghost,
      color: "#3b82f6",
      description: "أساطير مرعبة وحكايات شعبية من التراث",
    },
    {
      type: "سبوبة ولا ابتكار",
      icon: Zap,
      color: "#10B981",
      description: "كشف الخدع التسويقية والمشاريع الوهمية",
    },
    {
      type: "حواديت شوارع",
      icon: Users,
      color: "#fb923c",
      description: "قصص الناس، الحارات، وتاريخ الشارع العربي",
    },
    {
      type: "صراع العروش العربي",
      icon: Swords,
      color: "#b91c1c",
      description: "خلفيات الصراع التاريخي والمعارك في المنطقة",
    },
    {
      type: "تكنولوجيا مرعبة",
      icon: ServerCrash,
      color: "#0ea5e9",
      description: "الوجه الأسود للتكنولوجيا والذكاء الاصطناعي",
    },
    {
      type: "اقتصاد الشارع",
      icon: TrendingDown,
      color: "#14b8a6",
      description: "كيف تدار الأموال في العالم السفلي والاقتصاد الخفي",
    },
    {
      type: "ملفات مخابراتية",
      icon: Eye,
      color: "#6366f1",
      description: "قصص الجواسيس وعمليات الذئاب المنفردة",
    },
    {
      type: "خرائط دموية (Faceless)",
      icon: Radar,
      color: "#8b0000",
      description: "تحليل جيوسياسي ووثائقيات تعتمد على خرائط متحركة",
    },
    {
      type: "سبورة بيضاء (Whiteboard)",
      icon: FileText,
      color: "#555",
      description: "شرح تعليمي مبسط يعتمد على رسم وتخطيط بصري",
    },
    {
      type: "ميمز ومقاطع (Faceless)",
      icon: Zap,
      color: "#10B981",
      description: "شرح قضايا التريند والسوشيال ميديا بأسلوب الميمز",
    },
    {
      type: "رحلة في عقل مجرم",
      icon: Skull,
      color: "#4c0519",
      description: "تحليل نفسي وتشريح لدوافع أشهر الجرائم",
    },
    {
      type: "المستقبل الديسطوبي",
      icon: TerminalSquare,
      color: "#8A2BE2",
      description: "سيناريوهات نهاية العالم وتوقعات كابوسية",
    },
    {
      type: "محاكمة التاريخ",
      icon: PenLine,
      color: "#b8860b",
      description: "إعادة فتح محاكمات لشخصيات تاريخية",
    },
    {
      type: "اقتصاد البقاء",
      icon: Flame,
      color: "#ea580c",
      description: "كيف يعيش الناس في ظل الانهيارات الاقتصادية الكبرى",
    },
    {
      type: "جبل الجليد (Iceberg)",
      icon: Layers,
      color: "#0ea5e9",
      description: "رحلة استكشاف تبدأ بالمعروف وتنتهي بأعمق النظريات المرعبة",
    },
    {
      type: "همس الحكايات (Dark ASMR)",
      icon: Headphones,
      color: "#4b5563",
      description: "سرد قصصي همساً يعتمد كلياً على المؤثرات الصوتية والعزلة",
    },
    {
      type: "مسافر عبر الزمن",
      icon: Hourglass,
      color: "#8b5cf6",
      description: "سرد الأحداث كأنها وثيقة تاريخية يرويها مسافر من المستقبل",
    },
    {
      type: "شريط ملعون (Found Footage)",
      icon: Video,
      color: "#a3e635",
      description: "توثيق مرعب بأسلوب أشرطة الفيديو القديمة المفقودة (VHS)",
    },
  ];

  const getMoodColor = () =>
    moods.find((m) => m.type === mood)?.color || "#f59e0b";
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
      }
      setIsDraggingString(false);
    }
  };

  const handleSpinRadar = async () => {
    if (isGeneratingTitle || cooldown > 0) return;

    const cacheKey = topic.trim() ? `${topic.trim()}_${mood}` : null;
    if (cacheKey && titleCache[cacheKey]) {
      setSuggestedTitles(titleCache[cacheKey]);
      showToast("تم استعادة النتيجة من أرشيفك المحلي");
      return;
    }

    setError("");
    setData(null);
    setSuggestedTitles([]);
    setIsGeneratingTitle(true);
    setStatus(`جاري صيد الأفكار...`);
    abortControllerRef.current = new AbortController();
    try {
      const titles = await generateTitle(
        topic.trim(),
        mood,
        note,
        undefined,
        (chunk) =>
          setStatus(`جاري التوليد (Streaming)...\n\n${chunk.slice(-1000)}`),
        abortControllerRef.current.signal
      );
      if (abortControllerRef.current?.signal.aborted) return;

      if (titles.length === 0) {
        showToast(
          "لم نتمكن من العثور على أفكار حالياً. حاول صياغة موضوعك بشكل مختلف عبر النوتة.",
          "error",
        );
        setError(
          "فشل الموديل في استخراج عناوين مقترحة. قد يكون الموضوع غامضاً جداً أو هناك ضغط على الخادم حالياً.",
        );
      } else {
        setSuggestedTitles(titles);
        if (cacheKey) {
          setTitleCache((prev) => ({ ...prev, [cacheKey]: titles }));
        }
        if (!topic.trim()) showToast("تم اصطياد فكرة عشوائية!");
      }
      setCooldown(30);
    } catch (err: any) {
      if (err.name === "AbortError" || err.message === "AbortError" || err.message?.toLowerCase().includes("abort")) {
        showToast("تم إيقاف الإنشاء بناءً على طلبك", "success");
        return;
      }
      const errorMsg = err.message || "";
      const isApiKeysFailure = errorMsg.includes("فشل كلا المزودين") || errorMsg.includes("المفتاح غير صالح");
      
      const isQuota =
        errorMsg.includes("429") ||
        errorMsg.toLowerCase().includes("quota") ||
        errorMsg.includes("RESOURCE_EXHAUSTED") ||
        errorMsg.includes("عفواً");
      const isFailedProxy = errorMsg.includes("Failed to call") || (!isApiKeysFailure && (errorMsg.includes("500") || errorMsg.includes("6")));

      if (isApiKeysFailure) {
        showToast("فقد الاتصال بالمولد", "error");
        setError(errorMsg.replace("Ollama Proxy Error: 500 -", "").trim());
      } else if (isQuota) {
        showToast("انتهى حد الاستخدام. يرجى الانتظار قليلاً.", "error");
        setError("تجاوزت الحد المسموح. يرجى الانتظار.");
      } else if (isFailedProxy || err.message?.includes("Failed to call")) {
        setError("تعثر الاتصال بالخادم بسبب الضغط. حاول مرة أخرى لاحقاً.");
        showToast("واجهنا مشكلة في التوليد", "error");
      } else {
        const errorMsg = err.message || "حدث خطأ أثناء الاتصال بالخادم";
        setError(errorMsg);
      }
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  const handleGenerateEpisode = async (selectedTitle: string) => {
    if (!selectedTitle) return;
    setError("");
    setIsLoading(true);
    setProgress(0);
    setEstimatedTime(duration * 12); // rough estimate 12s per minute of video
    setStatus(`جاري البدء...`);
    setIsSaved(false);
    let hasError = false;
    abortControllerRef.current = new AbortController();
    try {
      if (duration >= 4) {
        setIsLongForm(true);
        setStatus(`جاري جمع المصادر الأولية...`);
        setProgress(5);

        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 95) return prev;
            if (abortControllerRef.current?.signal.aborted)
              throw new Error("AbortError");
            return prev + Math.floor(Math.random() * 5) + 1;
          });

          setStatus((prevStatus) => {
            if (abortControllerRef.current?.signal.aborted) return prevStatus;
            const statuses = [
              "جاري جمع المصادر الأولية...",
              "يتم الآن استخلاص المعلومات التاريخية الدقيقة...",
              "يتم تقسيم المحاور وتحديد (الشرخ) في كل فصل...",
              "يتم بناء الخريطة البحثية وربط الوثائق (قد يستغرق هذا وقتاً طويلاً)...",
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
          const map = await generateResearchMap(
            selectedTitle,
            duration,
            mood,
            note,
            undefined,
            undefined,
            abortControllerRef.current?.signal
          );
          clearInterval(progressInterval);
          setProgress(100);
          setStatus("تم بناء الخريطة بنجاح!");
          setTimeout(() => setIsLoading(false), 500);
          setResearchMap(map);
        } catch (err: any) {
          clearInterval(progressInterval);
          const isFailedProxy =
            err.message?.includes("Failed to call") ||
            err.message?.includes("500") ||
            err.message?.includes("6");
          if (isFailedProxy) {
            throw new Error(
              "يبدو أن الاتصال تعثر أثناء بناء الخريطة البحثية بسبب ضغط على الخادم أو طول المحتوى. يرجى المحاولة مرة أخرى.",
            );
          }
          throw err;
        }
      } else {
        setIsLongForm(false);
        let targetProgress = 5;
        setProgress(5);

        const smoothProgressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= targetProgress) return prev;
            return prev + Math.floor(Math.random() * 2) + 1;
          });
        }, 1000);

        try {
          // Initialize data for UI to stream scenes gracefully
          setData({
            video_title: selectedTitle,
            thumbnail: { image_prompt: "", text_on_image: "" },
            opening_sketch: { asset_id: "", voice_over: "", visual_cue: "", montage_instructions: "", sound_design: "", image_prompt_nano_banana: "", ai_video_prompt: "" },
            scenes: [],
            sources: [],
            publishing_kit: { youtube_titles: [], thumbnail_concept: "", thumbnail_midjourney_prompt: "", description_al_daheeh_style: "", tags: [] },
            shorts: []
          });

          const result = await executePipeline_Orchestrator(
            selectedTitle,
            duration,
            note,
            mood,
            persona,
            (p, s) => {
              targetProgress = Math.max(targetProgress, p);
              setStatus(`${s}`);
            },
            (scene) => {
              setData((prev: any) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  scenes: [...(prev.scenes || []), scene]
                };
              });
            },
            (text) => setStreamedChunk(text),
            "gemini", "gemini", "gemini"
          );
          
          clearInterval(smoothProgressInterval);
          setProgress(100);
          setData(result);

          const allVoiceovers = [result.opening_sketch, ...result.scenes]
            .map((s) => s.voice_over)
            .join("\n\n");
          setRawScriptText(allVoiceovers);

          const extracted = extractAndCleanScript(allVoiceovers);
          const optimized = convertToEgyptian(extracted);
          setFinalVoiceScript(optimized);

          setTimeout(() => setActiveTab("script"), 500);
        } catch (err) {
          clearInterval(smoothProgressInterval);
          throw err;
        }
      }
    } catch (err: any) {
      hasError = true;
      const errorMsg = err.message || "";
      const isApiKeysFailure = errorMsg.includes("فشل كلا المزودين") || errorMsg.includes("المفتاح غير صالح");

      const isQuota =
        errorMsg.includes("429") ||
        errorMsg.toLowerCase().includes("quota") ||
        errorMsg.includes("RESOURCE_EXHAUSTED") ||
        errorMsg.includes("عفواً");
      const isFailedProxy =
        errorMsg.includes("Failed to call") ||
        (!isApiKeysFailure && (errorMsg.includes("500") || errorMsg.includes("6")));

      if (isApiKeysFailure) {
        showToast("مشكلة في مفاتيح API", "error");
        setError(errorMsg.replace("Ollama Proxy Error: 500 -", "").trim());
      } else if (isQuota) {
        showToast(
          "انتهى حد الاستخدام المجاني حالياً. يرجى الانتظار قليلاً.",
          "error",
        );
        setError("تجاوزت الحد المجاني لموديل AI (Quota Exceeded).");
      } else if (isFailedProxy) {
        showToast("واجهنا مشكلة في خوادم النظام بسبب طول المحتوى.", "error");
        setError(
          "يبدو أن الاتصال تعثر بسبب استغراق الذكاء الاصطناعي وقتاً طويلاً في التفكير. يمكنك المحاولة مرة أخرى، أو تقليل مدة الحلقة.",
        );
      } else {
        setError(err.message || "حدث خطأ أثناء الاتصال بالخادم");
      }
    } finally {
      if (!hasError) {
        if (duration !== 60) {
          setIsLoading(false);
          setProgress(0);
          setStatus("");
        }
      }
    }
  };

  const handleApproveResearchMap = async () => {
    if (!researchMap) return;
    setIsLoading(true);
    setError("");
    let cumulativeScenes: EpisodeScene[] = [];
    let previousSummary = "";

    let hasErrorInApprove = false;
    abortControllerRef.current = new AbortController();

    try {
      if (!researchMap.chapters || !Array.isArray(researchMap.chapters)) {
        throw new Error("فشلت قراءة الفصول، يرجى إعادة المحاولة.");
      }
      const targetWordsPerChapter = Math.round(
        (duration * 130) / Math.max(1, researchMap.chapters.length),
      );
      for (let i = 0; i < researchMap.chapters.length; i++) {
        if (abortControllerRef.current?.signal.aborted)
          throw new Error("AbortError");
        setCurrentChapterIndex(i);
        setStatus(
          `جاري كتابة الفصل ${i + 1} من ${researchMap.chapters.length}: ${researchMap.chapters[i].chapter_title}...`,
        );
        setProgress(10 + Math.round((i / researchMap.chapters.length) * 70));

        let retryCount = 0;
        let chapterScenes: EpisodeScene[] = [];
        while (retryCount < 2) {
          try {
            chapterScenes = await generateChapter(
              researchMap.chapters[i],
              researchMap.research_data,
              mood,
              previousSummary,
              i === 0,
              i === researchMap.chapters.length - 1,
              researchMap.video_title,
              targetWordsPerChapter,
              undefined,
              undefined,
              abortControllerRef.current?.signal
            );
            if (chapterScenes && chapterScenes.length > 0) {
              break;
            }
          } catch (e: any) {
            console.warn(`Retry chapter ${i + 1}`, e);
            if (
              e.message?.includes("عفواً") ||
              e.message?.toLowerCase().includes("quota") ||
              e.message?.includes("429")
            ) {
              throw e;
            }
          }
          retryCount++;
          if (abortControllerRef.current?.signal.aborted)
            throw new Error("AbortError");
        }

        if (chapterScenes.length > 0) {
          const chapterText = chapterScenes.map((s) => s.voice_over).join(" ");
          previousSummary += `\n- الفصل ${i + 1} (${researchMap.chapters[i].chapter_title}): تم سرد ${chapterText.substring(0, 150)}...`;
        } else {
          throw new Error("تعذر توليد أحد الفصول، يرجى المحاولة مرة أخرى.");
        }

        cumulativeScenes = [...cumulativeScenes, ...chapterScenes];
        setGeneratedScenes(cumulativeScenes);
      }

      if (abortControllerRef.current?.signal.aborted)
        throw new Error("AbortError");
      setStatus("جاري تغليف الحلقة والشورتس...");
      setProgress(90);
      const packagingResult = await generatePackaging(
        researchMap.video_title,
        researchMap.research_data,
        cumulativeScenes,
        undefined,
        undefined,
        abortControllerRef.current?.signal
      );

      if (abortControllerRef.current?.signal.aborted)
        throw new Error("AbortError");
      const allChapterSources = cumulativeScenes.flatMap(
        (s) => s.sources || [],
      );

      const processedScenes = cumulativeScenes.map((s, idx) => ({
        ...s,
        asset_id: `[Scene ${String(idx + 1).padStart(2, "0")}]`,
        image_prompt_nano_banana: applyGlobalStyle(
          s.image_prompt_nano_banana || "",
        ),
      }));
      const processedShorts = (packagingResult.shorts || []).map((s: any) => ({
        ...s,
        visual_prompt: applyGlobalStyle(s.visual_prompt || ""),
      }));
      packagingResult.shorts = processedShorts;

      const finalData: EpisodeData = {
        video_title: researchMap.video_title,
        thumbnail: researchMap.thumbnail
          ? {
              ...researchMap.thumbnail,
              image_prompt: applyGlobalStyle(
                researchMap.thumbnail.image_prompt || "",
              ),
            }
          : { image_prompt: "", text_on_image: "" },
        opening_sketch: processedScenes[0] || {
          asset_id: "[ASSET-006]",
          voice_over: "",
          visual_cue: "",
          montage_instructions: "",
          sound_design: "",
          image_prompt_nano_banana: "",
          ai_video_prompt: "",
        },
        scenes: processedScenes.slice(1),
        sources: [...(researchMap.sources || []), ...allChapterSources],
        publishing_kit: packagingResult.packaging,
        shorts: packagingResult.shorts,
      };

      setData(finalData);

      try {
        const docRef = await addDoc(collection(db, "projects"), {
          title: finalData.video_title,
          topic,
          mood,
          persona,
          data: finalData,
          createdAt: serverTimestamp()
        });
        console.log("Project saved to Firebase with ID: ", docRef.id);
      } catch (e) {
        console.error("Error saving to Firebase: ", e);
      }

      const allVoiceovers = [finalData.opening_sketch, ...finalData.scenes]
        .map((s) => s.voice_over)
        .join("\n\n");
      setRawScriptText(allVoiceovers);
      const extracted = extractAndCleanScript(allVoiceovers);
      const optimized = convertToEgyptian(extracted);
      setFinalVoiceScript(optimized);

      autoSaveDossier(finalData);

      setResearchMap(null);
      setActiveTab("script");
    } catch (err: any) {
      if (err.name === "AbortError" || err.message === "AbortError" || err.message?.toLowerCase().includes("abort")) {
        showToast("تم إيقاف الإنشاء بناءً على طلبك", "success");
        return;
      }
      hasErrorInApprove = true;
      const errorMsg = err.message || "";
      const isApiKeysFailure = errorMsg.includes("فشل كلا المزودين") || errorMsg.includes("المفتاح غير صالح");

      const isQuota =
        errorMsg.includes("429") ||
        errorMsg.toLowerCase().includes("quota") ||
        errorMsg.includes("RESOURCE_EXHAUSTED") ||
        errorMsg.includes("عفواً");
      const isFailedProxy =
        errorMsg.includes("Failed to call") ||
        (!isApiKeysFailure && (errorMsg.includes("500") || errorMsg.includes("6")));

      if (isApiKeysFailure) {
        showToast("مشكلة في مفاتيح API", "error");
        setError(errorMsg.replace("Ollama Proxy Error: 500 -", "").trim());
      } else if (isQuota) {
        showToast("انتهى حد الاستخدام المجاني. يرجى الانتظار دقيقة.", "error");
        setError(
          "عفواً، انتهى حد الاستخدام المتاح حالياً. يرجى المحاولة مرة أخرى بعد دقيقة.",
        );
      } else if (isFailedProxy) {
        setError("واجه الاتصال مشكلة أثناء التوليد، حاول مجددًا");
      } else {
        const errorMsg = err.message || "حدث خطأ غير متوقع";
        setError(errorMsg);
      }
    } finally {
      if (!hasErrorInApprove) {
        setIsLoading(false);
        setProgress(0);
        setStatus("");
      }
    }
  };

  const autoSaveDossier = (dossierData: EpisodeData) => {
    try {
      if (!dossierData.video_title) return;
      const existing = JSON.parse(localStorage.getItem("dossiers") || "[]");
      const newDossier = {
        ...dossierData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      existing.unshift(newDossier);
      localStorage.setItem("dossiers", JSON.stringify(existing));
      setIsSaved(true);
    } catch (err: any) {
      console.error("Auto-save failed", err);
    }
  };

  const saveDossier = () => {
    if (!data) return;
    setIsSaved(true);
    autoSaveDossier(data);
    showToast("تم الحفظ في الأرشيف بنجاح!");
  };

  const handleDownloadVoiceScript = () => {
    if (!finalVoiceScript) return;
    const blob = new Blob([finalVoiceScript], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `VoiceScript_${data?.video_title.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("تم تحميل النص الصوتي بنجاح!");
  };
  const handleDownloadNote = () => {
    if (!data) return;

    let content = `# 📑 السكريبت الكامل لبرنامج برواز - حلقة: ${data.video_title}\n\n`;
    content += `*تم إنشاؤه عبر نظام تصنيع المحتوى الآلي*\n\n`;
    content += `---\n\n`;

    content += `## 💡 الصورة المصغرة (Thumbnail)\n`;
    content += `- **النص المقترح على الغلاف:** ${data.thumbnail.text_on_image}\n`;
    content += `- **وصف تصميم الغلاف للفريق البصري:** ${data.publishing_kit?.thumbnail_concept || ""}\n`;
    content += `- **توليد الخلفية (AI Image Prompt):** \n\`\`\`text\n${data.thumbnail.image_prompt}\n\`\`\`\n\n`;

    content += `## 🚀 بيانات النشر (SEO & Publishing Kit)\n`;
    content += `- **عناوين مقترحة (اختر الأقوى):**\n${(data.publishing_kit?.youtube_titles || []).map((t) => `  - 🎬 ${t}`).join("\n")}\n\n`;
    content += `- **الوصف (Description):**\n${data.publishing_kit?.description_al_daheeh_style || ""}\n\n`;
    content += `- **الكلمات المفتاحية (Tags):**\n${(data.publishing_kit?.tags || []).join(", ")}\n\n`;

    content += `---\n\n`;
    content += `## 🎬 المشاهد والأسكريبت (Scene by Scene & Montage Instructions)\n\n`;

    const allScenes = [data.opening_sketch, ...data.scenes];
    allScenes.forEach((scene, index) => {
      content += `### 🎬 المشهد ${index === 0 ? "[00 - المقدمة والتمهيد]" : `[0${index}]`}\n`;
      content += `**🔖 Asset ID:** \`${scene.asset_id}\`\n\n`;

      content += `#### 🎙️ التعليق الصوتي (Voiceover):\n`;
      content += `> ${scene.voice_over}\n\n`;

      content += `#### 👁️ الرؤية البصرية وملحوظات المونتاج:\n`;
      if (scene.visual_cue)
        content += `- **الشاشة/الكاميرا:** ${scene.visual_cue}\n`;
      if (scene.visual_motif)
        content += `- **الموتيف البصري:** ${scene.visual_motif}\n`;
      if (scene.cinematic_movement)
        content += `- **الحركة السينمائية:** ${scene.cinematic_movement}\n`;
      if (scene.montage_instructions)
        content += `- **توجيهات المونتاج:** ${scene.montage_instructions}\n`;
      if (scene.sound_design)
        content += `- **الهندسة الصوتية:** ${scene.sound_design}\n`;
      if (scene.asmr_soundscape)
        content += `- **خلفية ASMR (Lyria 3):** ${scene.asmr_soundscape}\n`;

      content += `#### 🎨 التصميمات والبرومبتات:\n`;
      if (scene.image_prompt_nano_banana)
        content += `- **Nano Banana/DALL-E:** \`${scene.image_prompt_nano_banana}\`\n`;
      if (scene.ai_video_prompt)
        content += `- **Runway/Kling:** \`${scene.ai_video_prompt}\`\n`;
      if (scene.b_roll_keywords)
        content += `- **B-Roll Keywords:** \`${scene.b_roll_keywords}\`\n`;

      content += `\n--------------------------------------------------\n\n`;
    });

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Barwaz_Script_${data.video_title.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("تم تحميل السكريبت بنجاح!");
  };

  const handleExportAudioZip = async () => {
    if (!data) return;
    
    if (!elevenLabsKey) {
      alert("يرجى إضافة مفتاح ElevenLabs من الإعدادات للتمكين من تحميل ملفات الـ MP3");
      setShowSettings(true);
      return;
    }

    setIsProcessingAudio(true);
    showToast("جاري توليد ملفات الصوت وإعداد الـ ZIP...", "info");
    
    try {
      const zip = new JSZip();
      const allScenes = [data.opening_sketch, ...data.scenes];
      const audioFolder = zip.folder("Voice_Tracks");
      
      let failCount = 0;

      for (let index = 0; index < allScenes.length; index++) {
        const scene = allScenes[index];
        let cleanText = scene.voice_over.replace(/\[صمت درامي\]/g, "... ");
        cleanText = cleanText.replace(/🔊/g, "");

        if (!cleanText.trim()) continue;

        try {
          const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}?output_format=mp3_44100_128`, {
              method: "POST",
              headers: {
                 "Content-Type": "application/json",
                 "xi-api-key": elevenLabsKey
              },
              body: JSON.stringify({
                text: cleanText,
                model_id: "eleven_multilingual_v2"
              })
          });
          if (!res.ok) throw new Error("API Error");
          
          const blob = await res.blob();
          const fileName = `Track_${index.toString().padStart(2, '0')}_${scene.asset_id.replace(/\W+/g, "_")}.mp3`;
          audioFolder?.file(fileName, blob);
        } catch(err) {
          console.error(`Failed to generate audio for scene ${index}`, err);
          failCount++;
        }
      }
      
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `Barwaz_Master_Audio_${data.video_title.replace(/\s+/g, "_")}.zip`);
      showToast(`تم تصدير الصوتيات بنجاح! ${failCount > 0 ? `فشل ${failCount} مقطع.` : ''}`);
    } catch (e) {
      console.error(e);
      showToast("حدث خطأ أثناء تصدير الصوتيات.", "error");
    } finally {
      setIsProcessingAudio(false);
    }
  };

  const handleExportZip = async () => {
    if (!data) return;
    showToast("جاري تجهيز الأصول وبناء المصنع المغلق...");
    
    try {
      const zip = new JSZip();
      const allScenes = [data.opening_sketch, ...data.scenes];
      const assetsFolder = zip.folder("Assets");
      
      // 1. Text script
      let transcript = `# 🎙️ التعليق الصوتي - ${data.video_title}\n\n`;
      allScenes.forEach(scene => { transcript += `${scene.voice_over}\n\n`; });
      zip.file("Voiceover_Script.txt", transcript);
      
      let prompts = `# 🎨 توجيهات بصرية وهندسية - ${data.video_title}\n\n`;

      // Master JSON Metadata
      const metadata = {
        title: data.video_title,
        channel_dna: "barwaz_classic", // From dynamic channel DNA implementation
        generation_date: new Date().toISOString(),
        duration_minutes: duration.toString(),
        total_scenes: allScenes.length,
        research_angle: data.research_angle,
        packaging: data.packaging,
        shorts: data.shorts
      };
      zip.file("metadata.json", JSON.stringify(metadata, null, 2));
      
      // We will map over scenes and download their generated images to add to the Assets folder
      for (let index = 0; index < allScenes.length; index++) {
        const scene = allScenes[index];
        prompts += `### المشهد ${index}\n`;
        if (scene.image_prompt_nano_banana) prompts += `- Image Prompt: ${scene.image_prompt_nano_banana}\n`;
        if (scene.visual_motif) prompts += `- Visual Motif: ${scene.visual_motif}\n`;
        if (scene.cinematic_movement) prompts += `- Cinematic Movement (Veo/Runway): ${scene.cinematic_movement}\n`;
        if (scene.voiceover_notes) prompts += `- VO Notes: ${scene.voiceover_notes}\n`;
        if (scene.sound_design) prompts += `- SFX / Music: ${scene.sound_design}\n`;
        if (scene.asmr_soundscape) prompts += `- ASMR Soundscape (Lyria 3): ${scene.asmr_soundscape}\n\n`;

        // Fetch image if generated
        if (scene.generated_image_url && assetsFolder) {
          try {
            const response = await fetch(scene.generated_image_url);
            const blob = await response.blob();
            // Name files by scene number
            assetsFolder.file(`Scene_${index.toString().padStart(2, '0')}.png`, blob);
          } catch (e) {
            console.error(`Failed to download image for scene ${index}`, e);
          }
        }
      }
      zip.file("Production_Assets_Manifest.txt", prompts);
      
      const content = await zip.generateAsync({ type: "blob" });
      
      // Upload to Firebase Storage
      try {
        const storageRef = ref(storage, `exports/${data.video_title.replace(/\s+/g, "_")}_${Date.now()}.zip`);
        await uploadBytes(storageRef, content);
        const downloadUrl = await getDownloadURL(storageRef);
        console.log("Uploaded successfully to Firebase Storage:", downloadUrl);
        showToast("تم رفع الملف إلى المكتبة السحابية بنجاح!");
      } catch (e) {
        console.error("Firebase Storage Upload Failed:", e);
      }

      saveAs(content, `Barwaz_Production_${data.video_title.replace(/\s+/g, "_")}.zip`);
      showToast("تم التصدير بنجاح!");
    } catch (e) {
      console.error(e);
      showToast("حدث خطأ أثناء التصدير.");
    }
  };

  const handleDownloadVisuals = () => {
    if (!data) return;

    let content = `# 🎨 أوامر التصميم البصري - حلقة: ${data.video_title}\n\n`;
    content += `*خاص بفريق الجرافيك والموشن*\n\n`;
    content += `---\n\n`;

    const allScenes = [data.opening_sketch, ...data.scenes];
    allScenes.forEach((scene, index) => {
      if (
        !scene.image_prompt_nano_banana &&
        !scene.ai_video_prompt &&
        !scene.visual_cue
      )
        return;

      content += `### 🎬 المشهد ${index === 0 ? "[00 - المقدمة والتمهيد]" : `[0${index}]`}\n`;
      content += `**🔖 Asset ID:** \`${scene.asset_id}\`\n\n`;

      if (scene.visual_cue) {
        content += `👁️ المشهد (Visual Cue):\n`;
        content += `${scene.visual_cue}\n\n`;
      }
      if (scene.image_prompt_nano_banana) {
        content += `🎨 برومبت الصورة (Nano Banana / DALL-E / LM Arena):\n`;
        content += `${scene.image_prompt_nano_banana}\n\n`;
      }
      if (scene.ai_video_prompt) {
        content += `🎬 برومبت التحريك (Runway/Luma):\n`;
        content += `${scene.ai_video_prompt}\n\n`;
      }
      if (scene.montage_instructions) {
        content += `✂️ ملاحظات المونتاج:\n`;
        content += `${scene.montage_instructions}\n\n`;
      }
      content += `--------------------------------------------------\n\n`;
    });

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Barwaz_Visuals_${data.video_title.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("تم تحميل أوامر التصميم بنجاح!");
  };
  const fetchArchive = async () => {
    try {
      const docs = JSON.parse(localStorage.getItem("dossiers") || "[]");
      setArchive(docs);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDeleteArchive = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const current = JSON.parse(localStorage.getItem("dossiers") || "[]");
      const updated = current.filter((item: any) => item.id !== id);
      localStorage.setItem("dossiers", JSON.stringify(updated));
      setArchive(updated);
      showToast("تم حذف الملف من الأرشيف", "success");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (showArchive) fetchArchive();
  }, [showArchive]);

  const resetBoard = () => {
    setSuggestedTitles([]);
    setTopic("");
    setNote("");
    setError("");
    setData(null);
    setProgress(0);
    setStatus("");
    setIsSaved(false);
  };

  return (
    <div
      className="min-h-screen relative overflow-x-hidden bg-[var(--color-base)] text-[#1a1a1a]"
      dir="rtl"
    >
      {/* Newspaper Background Textures */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
          backgroundSize: "15px 15px",
        }}
      ></div>

      {/* Header (Classic Ahram Masthead) */}
      <header className="sticky top-0 z-50 bg-[#fdfbf7] border-b-[8px] border-double border-[#1a1a1a] px-6 py-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[4px] bg-[#8b0000]"></div>
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center space-y-4">
          <div className="w-full flex items-center justify-between border-y-2 border-[#1a1a1a] py-2 mb-4">
            <span className="text-sm font-bold text-[#1a1a1a] font-mono tracking-widest uppercase">
              العدد الرئيسي - طبعة خاصة
            </span>
            <div className="flex gap-4">
              <button
                onClick={() => setShowSettings(true)}
                className={`px-4 py-1.5 border-x-2 border-[#1a1a1a] transition-all text-xs font-bold flex items-center gap-2 ${useOllama ? "bg-green-100 text-green-900" : "hover:bg-[#1a1a1a] hover:text-white"}`}
                title="إعدادات المحرك"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">المحرك: {useOllama ? "محلي" : "سحابي"}</span>
              </button>
              <button
                onClick={() => setShowArchive(true)}
                className="px-4 py-1.5 bg-[#1a1a1a] text-white hover:bg-[#8b0000] transition-all text-xs font-bold flex items-center gap-2"
              >
                <Archive className="w-4 h-4" />
                <span>غرفة الأرشيف</span>
              </button>
            </div>
          </div>
          <div className="text-center cursor-pointer relative" onClick={resetBoard}>
            <div className="absolute -left-12 top-1/2 -translate-y-1/2 hidden md:block w-8 h-8 rounded-full border border-gray-300"></div>
            <div className="absolute -right-12 top-1/2 -translate-y-1/2 hidden md:block w-8 h-8 rounded-full border border-gray-300"></div>
            <h1
              className="text-7xl md:text-9xl font-bold tracking-tight text-[#1a1a1a] newspaper leading-none"
              style={{ textShadow: "3px 3px 0px rgba(0,0,0,0.1), -1px -1px 0 #fff" }}
            >
              بَرْوَاز
            </h1>
            <p className="mt-2 text-xl md:text-2xl text-[#8b0000] max-w-2xl mx-auto tracking-widest leading-relaxed font-bold relative z-10 newspaper border-y border-[#1a1a1a] py-1">
               صــــالــة الــتـــحـــريـــر الإســــتــــقــــصــــائــــيــــة
            </p>
          </div>
        </div>
      </header>
      {/* MAIN HUD CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 py-8 pt-20 relative z-30">
        {/* STEPPER */}
        <div className="w-full max-w-4xl mx-auto flex items-center justify-between mb-12 relative px-4">
          <div className="absolute top-5 left-8 right-8 h-1 bg-gray-300 z-0" />
          <div
            className="absolute top-5 left-8 right-8 h-1 bg-[#1a1a1a] z-0 origin-left transition-all duration-500"
            style={{
              transform: `scaleX(${data ? 1 : researchMap ? 0.66 : suggestedTitles.length > 0 ? 0.33 : 0})`,
            }}
          />
          {[
            { step: 1, label: "تجهيز المطبخ", active: true },
            {
              step: 2,
              label: "اختيار المانشيت",
              active: suggestedTitles.length > 0 || researchMap || data,
            },
            { step: 3, label: "الخريطة البحثية", active: researchMap || data },
            { step: 4, label: "الأرشيف النهائي", active: !!data },
          ].map((s, i) => (
            <div
              key={i}
              className="relative z-10 flex flex-col items-center gap-2"
            >
              <div
                className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center font-bold font-mono ${s.active ? "border-[#1a1a1a] bg-[#8b0000] text-white shadow-[0_0_0_4px_#f4eee0]" : "border-gray-400 bg-white text-gray-400"}`}
              >
                {s.step}
              </div>
              <span
                className={`text-xs font-bold px-2 py-1 newspaper ${s.active ? "text-[#1a1a1a]" : "text-gray-400"}`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {!data && !researchMap && suggestedTitles.length === 0 && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-3xl mx-auto dossier-card overflow-hidden"
          >
            <div className="bg-white/80 p-5 flex justify-between items-center border-b-2 border-[#1a1a1a] relative z-10 pl-12 pr-12">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border-2 border-[#1a1a1a] flex items-center justify-center bg-[#f4eee0]">
                   <FileText className="w-5 h-5 text-[#8b0000]" />
                </div>
                <h3 className="font-bold newspaper text-3xl text-[#1a1a1a]">
                  ملف القضية الجديد
                </h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const description =
                      moods.find((m) => m.type === mood)?.description || "";
                    copyToClipboard(
                      `أنا صانع محتوى وأبحث عن أفكار مبتكرة باستخدام قالب: "${mood}". الرجاء اقتراح 5 أفكار غير تقليدية لحلقات.`,
                    );
                  }}
                  className="text-xs bg-white hover:bg-[#1a1a1a] hover:text-white text-[#1a1a1a] px-3 py-1.5 transition-all border-2 border-[#1a1a1a] flex items-center gap-2 font-bold shadow-[2px_2px_0_#1a1a1a] hover:shadow-none hover:translate-y-[2px]"
                >
                  <Copy className="w-4 h-4" /> برومبت العصف
                </button>
              </div>
            </div>

            {error && !isGeneratingTitle && !isLoading && (
              <div className="bg-[#8b0000] p-4 text-white text-sm font-bold flex items-center gap-3 relative z-10 border-b border-[#1a1a1a]">
                 <AlertTriangle className="w-5 h-5 ml-2" />
                 {error}
              </div>
            )}

            <div className="p-6 sm:p-10 space-y-8 relative z-10 pl-12 pr-12">
              <div>
                <label className="block text-xl font-bold text-[#1a1a1a] mb-3 newspaper border-b-2 border-dotted border-gray-400 pb-1">
                  1. عنوان القضية الفرعي أو الموضوع
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="حدثنا عما تبحث عنه... (مثل: سيليكون فالي، أسرار الحرب الباردة، اختفاء كاتي)..."
                  className="w-full h-32 bg-transparent border-none p-2 text-2xl text-[#1a1a1a] font-arabic-body focus:ring-0 focus:outline-none resize-none placeholder:text-gray-400 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-y-2 border-dotted border-gray-400 py-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-lg font-bold text-[#1a1a1a] newspaper">
                      التوجه الصحفي (القالب):
                    </label>
                  </div>
                  <div
                    onClick={() => setShowMoodModal(true)}
                    className="w-full p-4 border-2 border-[#1a1a1a] bg-white cursor-pointer hover:bg-[#1a1a1a] hover:text-white transition-colors flex items-center gap-4 group shadow-[4px_4px_0_#1a1a1a]"
                  >
                    <div className="w-10 h-10 border-2 border-[#1a1a1a] group-hover:border-white bg-[#f4eee0] group-hover:bg-[#1a1a1a] flex items-center justify-center transition-colors">
                      {React.createElement(
                        moods.find((m) => m.type === mood)?.icon || Smile,
                        { className: "w-6 h-6 text-[#8b0000] group-hover:text-white" },
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-xl newspaper leading-tight">{mood}</h4>
                      <p className="text-[12px] opacity-80 font-serif mt-1">المحقق: {persona}</p>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-white" />
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-bold text-[#1a1a1a] mb-3 newspaper flex justify-between">
                    <span>زمن التقرير (المدة):</span>
                    <span className="text-[#8b0000] font-mono text-xl">{duration} د.</span>
                  </label>
                  <div className="flex items-center h-[56px] px-6 border-2 border-[#1a1a1a] bg-[#f4eee0] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)]">
                    <input
                      type="range"
                      min="5"
                      max="60"
                      step="5"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value))}
                      className="w-full accent-[#1a1a1a]"
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-2 font-serif italic font-bold">
                    * الحلقات الأطول من 30 دقيقة تتطلب بناء أرشيف بحثي أعمق قبل الكتابة.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={
                    isGeneratingTitle ? handleStopGeneration : handleSpinRadar
                  }
                  disabled={(cooldown > 0 && !isGeneratingTitle) || isLoading}
                  className={`w-full py-5 px-4 text-white font-bold text-2xl newspaper border-2 transition-all flex flex-col items-center justify-center gap-2 ${(cooldown > 0 && !isGeneratingTitle) || isLoading ? "bg-gray-400 border-gray-500 cursor-not-allowed" : "bg-[#8b0000] border-[#1a1a1a] hover:bg-[#1a1a1a] shadow-[6px_6px_0_#1a1a1a] hover:shadow-none hover:translate-y-[4px] hover:translate-x-[4px]"}`}
                >
                  {isGeneratingTitle ? (
                    <>
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>جاري المسح... (انقر للإلغاء)</span>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-300 font-mono mt-1 opacity-80 whitespace-pre-wrap text-center overflow-hidden max-h-20 w-full px-2" dir="ltr">{status}</span>
                    </>
                  ) : cooldown > 0 ? (
                    <>
                      <Clock className="w-5 h-5 animate-pulse" />
                      <span>تبريد الأجهزة ({cooldown}ث)</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 text-[#f4eee0]" />
                      <span>ابدأ توليد الأفكار</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {!data && !researchMap && suggestedTitles.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative z-40 w-full max-w-6xl mx-auto"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b-4 border-double border-[#1a1a1a] gap-4">
                <div>
                  <h3 className="text-[#1a1a1a] font-bold text-5xl newspaper flex items-center gap-4">
                    مانشيتات عاجلة
                    <span className="text-[#8b0000] animate-pulse">!</span>
                  </h3>
                  <p className="text-[#1a1a1a] font-arabic-body font-bold text-xl mt-3 tracking-wide">
                    وصلنا للتو من المحررين الزوايا التالية للقضية:
                  </p>
                </div>
                <button
                  onClick={() => setSuggestedTitles([])}
                  className="px-6 py-3 bg-white border-2 border-[#1a1a1a] text-[#1a1a1a] font-bold text-lg flex items-center gap-2 hover:bg-[#1a1a1a] hover:text-white transition-all shadow-[4px_4px_0_#1a1a1a] hover:shadow-none hover:translate-y-[4px]"
                >
                  <ChevronRight className="w-5 h-5" /> مسح المكتب
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {suggestedTitles.map((suggestion, idx) => (
                  <div
                    key={suggestion.id}
                    className="bg-[#f0ece1] border border-[#1a1a1a] flex flex-col justify-between shadow-[6px_6px_0_#1a1a1a] hover:shadow-[10px_10px_0_#8b0000] hover:-translate-y-2 transition-all p-2 group relative"
                  >
                    <div className="border border-[#1a1a1a] border-dashed p-6 flex flex-col h-full relative bg-white">
                      
                      <div className="absolute top-4 left-4 w-12 h-12 rounded-full border border-[#8b0000] text-[#8b0000] flex items-center justify-center font-serif text-xl opacity-20 transform -rotate-12">
                         {idx + 1}
                      </div>

                      <div className="mb-6">
                        <div className="text-[10px] font-mono font-bold text-gray-500 mb-3 border-b border-gray-300 pb-2">
                          DOC ID: {suggestion.id} | TYPE: EDITORIAL
                        </div>
                        <h4 className="text-[#1a1a1a] text-3xl font-bold mb-4 newspaper leading-[1.3] text-justify group-hover:text-[#8b0000] transition-colors">
                          {suggestion.title}
                        </h4>
                        
                        <div className="relative">
                          <span className="absolute -right-2 -top-2 text-4xl text-gray-300 font-serif">"</span>
                          <p className="text-[#333] text-lg font-arabic-body leading-relaxed mx-4 relative z-10 font-bold border-r-4 border-[#8b0000] pr-4 bg-gray-50 p-2">
                            {suggestion.hook}
                          </p>
                        </div>
                      </div>

                      <div className="pt-6 border-t-[3px] border-double border-[#1a1a1a] mt-auto">
                        <button
                          onClick={() => handleGenerateEpisode(suggestion.title)}
                          disabled={isLoading}
                          className={`w-full py-4 border-2 border-[#1a1a1a] font-bold text-xl newspaper transition-all flex items-center justify-center gap-3 ${isLoading ? "opacity-50 cursor-not-allowed text-gray-500 bg-gray-200" : "bg-black text-white hover:bg-[#8b0000] shadow-[4px_4px_0_rgba(0,0,0,0.5)] hover:shadow-none hover:translate-y-[2px]"}`}
                        >
                          <FileText className="w-5 h-5" />
                          <span>توليد واصدار هذا التحقيق</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-[#f4eee0]/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-2xl bg-white border-4 border-double border-[#1a1a1a] shadow-[16px_16px_0_#1a1a1a] p-8 relative"
            >
              <div className="flex flex-col items-center text-center space-y-6">
                {error ? (
                  <div className="z-20 flex flex-col items-center">
                    <AlertTriangle className="w-16 h-16 text-[#8b0000] mb-4" />
                    <h3 className="text-2xl font-bold text-[#8b0000] mb-2 newspaper">
                      حدث خطأ في المطبعة
                    </h3>
                    <div className="text-[#1a1a1a] max-w-lg font-arabic-body mb-8 border border-[#1a1a1a] p-4 bg-white/80 leading-relaxed text-right">
                      <p className="font-bold mb-2">{error}</p>
                      {error.includes("المتصفح يمنع الاتصال") && (
                        <ol className="list-decimal list-inside space-y-4 mt-4 text-sm bg-red-50 p-4 border border-red-200">
                          <li>
                            <strong>تخطي حماية المتصفح (CORS/PNA):</strong> انسخ
                            هذا الرابط <br />
                            <code
                              className="bg-white px-2 py-1 select-all font-mono text-xs block mt-1"
                              dir="ltr"
                            >
                              chrome://flags/#block-insecure-private-network-requests
                            </code>
                            <br /> وافتحه في نافذة جديدة، ثم اختر{" "}
                            <strong>Disabled</strong> وأعد تشغيل المتصفح.
                          </li>
                          <li>
                            <strong>
                              السماح بالمحتوى غير الآمن (Mixed Content):
                            </strong>{" "}
                            اضغط على القفل 🔒 بجوار رابط موقعنا، اختر Site
                            Settings، واجعل <strong>Insecure Content</strong> هو{" "}
                            <strong>Allow</strong>.
                          </li>
                          <li>
                            <strong>تشغيل Ollama بشكل صحيح:</strong> أغلق Ollama تماماً بجوار الساعة، ثم افتح CMD (موجه الأوامر) شغل الأمر:
                            <code
                              className="bg-white px-2 py-1 select-all font-mono text-xs block mt-1 border border-gray-300"
                              dir="ltr"
                            >
                              set OLLAMA_ORIGINS="*" && ollama serve
                            </code>
                            وإذا كنت تستخدم <strong>Mac/Linux</strong>:
                            <code
                              className="bg-white px-2 py-1 select-all font-mono text-xs block mt-1 border border-gray-300"
                              dir="ltr"
                            >
                              OLLAMA_ORIGINS="*" ollama serve
                            </code>
                          </li>
                        </ol>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setIsLoading(false);
                        setError("");
                      }}
                      className="px-6 py-2 bg-[#1a1a1a] hover:bg-[#8b0000] text-white font-bold transition-all border-2 border-transparent"
                    >
                      العودة للتحرير
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative flex justify-center items-center mb-4">
                      {/* Newspaper Printing Press Animation Simulation */}
                      <div className="w-16 h-16 border-4 border-dashed border-[#1a1a1a] rounded-full animate-[spin_3s_linear_infinite]" />
                      <div className="absolute w-12 h-12 border-4 border-dashed border-[#8b0000] rounded-full animate-[spin_2s_linear_infinite_reverse]" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PenLine className="w-6 h-6 text-[#1a1a1a] animate-pulse" />
                      </div>
                    </div>

                    <div className="space-y-4 text-center">
                      <div className="border-y-4 border-double border-[#1a1a1a] py-2 mb-4">
                        <h3 className="text-3xl font-bold newspaper text-[#8b0000] tracking-wider uppercase">
                          الطبعة الإضافية - عاجل
                        </h3>
                      </div>
                      <h4 className="text-xl font-bold newspaper text-[#1a1a1a] mb-2">
                        صالة التحرير تعكف على إعداد التحقيق...
                      </h4>
                      <div className="mx-auto max-w-2xl text-sm font-bold text-[#1a1a1a] bg-[#f4eee0] px-6 py-4 border-l-8 border-[#8b0000] border-y border-r border-[#1a1a1a] font-serif whitespace-pre-wrap text-right shadow-[4px_4px_0_#1a1a1a]">
                        <div className="text-lg mb-2 flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-[#8b0000] animate-ping" />
                           <span className="typewriter">{status}</span>
                        </div>
                        {streamedChunk && (
                          <div className="font-mono text-xs text-left bg-[#1a1a1a] text-[#f4eee0] p-3 mt-4 rounded-sm overflow-hidden border border-[#8b0000]" dir="ltr" style={{ maxHeight: "150px", overflowY: "auto" }}>
                            {streamedChunk}
                          </div>
                        )}
                      </div>

                      <AnimatePresence mode="wait">
                        <motion.p
                          key={loadingTip}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="text-sm text-[#555] font-serif italic h-8 typewriter border-b border-dashed border-gray-400 inline-block px-4 pb-1"
                        >
                          " {loadingTip} "
                        </motion.p>
                      </AnimatePresence>
                    </div>

                    <div className="w-full space-y-2 mt-6">
                      <div className="flex justify-between text-xs font-bold font-mono text-[#1a1a1a]">
                        <span>[ {Math.round(progress)}% اكتمل ]</span>
                        <span>
                          الوقت المتوقع للطباعة:{" "}
                          {estimatedTime > 0
                            ? `${estimatedTime} ثانية`
                            : "لحظات..."}
                        </span>
                      </div>
                      <div className="w-full h-6 bg-[#f4eee0] border-2 border-[#1a1a1a] shadow-inner relative overflow-hidden">
                        {/* Newspaper stripe pattern for progress */}
                        <motion.div
                          className="absolute top-0 left-0 bottom-0 bg-[#8b0000]"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5 }}
                          style={{
                             backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)'
                          }}
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-[#555] font-serif italic max-w-sm border-t border-[#1a1a1a] pt-2 mt-4">
                      ملحوظة: العمل الصحفي الاستقصائي يتطلب وقتاً. نحن نقوم ببناء حلقة احترافية، مراجع دقيقة، ومونتاج بصري عميق.
                    </p>

                    <button
                      onClick={handleStopGeneration}
                      className="mt-6 px-6 py-2 border-2 border-[#1a1a1a] bg-white text-xs font-bold hover:bg-[#8b0000] hover:text-white transition-all flex items-center gap-2 mx-auto shadow-[2px_2px_0_#1a1a1a] hover:shadow-none hover:translate-y-[2px]"
                    >
                      <X className="w-4 h-4" />
                      إلغاء العملية
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {researchMap && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-6xl mx-auto bg-white border-2 border-[#1a1a1a] shadow-[8px_8px_0_#1a1a1a] overflow-hidden mt-8 relative z-40"
          >
            {/* Dossier Header */}
            <div className="bg-[#1a1a1a] text-white p-4 flex flex-col sm:flex-row items-center justify-between border-b-2 border-[#1a1a1a] gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 border border-white/20 bg-white/10">
                  <Radar className="w-5 h-5 text-[#8b0000]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold newspaper leading-none text-[#f4eee0]">
                    الخريطة البحثية: {researchMap.video_title}
                  </h2>
                  <div className="flex gap-4 mt-1">
                    <span className="text-[10px] font-mono text-gray-400">
                      CODE:{" "}
                      {Math.random().toString(36).substring(7).toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">
                      DATE: {new Date().toLocaleDateString("ar-EG")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleApproveResearchMap}
                  className="bg-white hover:bg-[#8b0000] text-[#1a1a1a] hover:text-white font-bold py-2 px-6 border-2 border-[#1a1a1a] flex items-center gap-2 transition-all shadow-[2px_2px_0_#8b0000]"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>اعتماد الخريطة وبدء الكتابة</span>
                </button>
              </div>
            </div>

            <div className="p-0 flex flex-col-reverse lg:grid lg:grid-cols-4 bg-[#f4eee0]/30">
              {/* Left Panel: Research and Data */}
              <div className="lg:col-span-3 p-6 sm:p-8 border-t-2 lg:border-t-0 lg:border-l-2 border-[#1a1a1a] space-y-8">
                <div className="relative">
                  <h3 className="text-2xl font-bold newspaper mb-4 flex items-center gap-2 border-b-2 border-dashed border-gray-300 pb-2">
                    <FileSearch className="w-6 h-6 text-[#8b0000]" />
                    ملخص البحث والتوجه (Research Angle)
                  </h3>
                  <div className="bg-white p-6 border border-[#1a1a1a] italic font-arabic-body text-lg leading-relaxed shadow-[2px_2px_0_rgba(0,0,0,0.1)] text-gray-800">
                    {researchMap.research_data}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-bold newspaper border-b-2 border-dashed border-gray-300 pb-2">
                    هيكل التحقيق (فصول السكريبت)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {researchMap.chapters.map((c, i) => (
                      <div
                        key={i}
                        className="bg-white border-2 border-[#1a1a1a] p-5 relative group hover:bg-[#f4eee0]/50 transition-all shadow-[2px_2px_0_#1a1a1a]"
                      >
                        <div className="absolute top-0 right-0 p-1 bg-[#1a1a1a] text-white text-[10px] font-mono font-bold px-2">
                          CH-0{i + 1}
                        </div>
                        <h4 className="text-lg font-bold newspaper text-[#8b0000] mb-2 pr-4">
                          {c.chapter_title}
                        </h4>
                        <p className="text-sm text-[#555] font-serif leading-relaxed line-clamp-4">
                          {c.chapter_description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Panel: Metadata and Sources */}
              <div className="p-6 bg-white flex flex-col space-y-8 lg:col-span-1">
                <div className="border-b-2 border-dotted border-[#1a1a1a] pb-6">
                  <div className="bg-[#f4eee0] border-2 border-[#1a1a1a] p-4 text-center shadow-[2px_2px_0_#1a1a1a]">
                    <div className="w-12 h-12 bg-[#8b0000] text-white flex items-center justify-center mb-3 mx-auto shadow-[2px_2px_0_#1a1a1a]">
                      <PenLine className="w-6 h-6" />
                    </div>
                    <p className="text-lg font-bold newspaper mb-2 text-[#1a1a1a]">
                      انتظار الموافقة
                    </p>
                    <p className="text-xs font-serif mb-4 text-gray-600 leading-relaxed">
                      راجع زوايا البحث وفصول التحقيق. عند الاعتماد سيبدأ الذكاء
                      الاصطناعي بكتابتها نصياً.
                    </p>
                    <button
                      onClick={handleApproveResearchMap}
                      disabled={isLoading}
                      className={`w-full py-2 flex items-center justify-center gap-2 font-bold transition-all border-2 border-[#1a1a1a] ${isLoading ? "opacity-50 cursor-not-allowed bg-gray-200" : "bg-[#1a1a1a] text-white hover:bg-[#8b0000] shadow-[2px_2px_0_#8b0000] hover:shadow-none hover:translate-y-[2px]"}`}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs">جاري...</span>
                        </>
                      ) : (
                        <span className="text-sm">ابدأ الكتابة</span>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold newspaper mb-4 flex items-center gap-2 border-b-2 border-dotted border-[#1a1a1a] pb-2">
                    <Database className="w-4 h-4 text-[#8b0000]" />
                    المصادر المقترحة
                  </h3>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {researchMap.sources?.map((src, i) => {
                      const isObj = typeof src === "object" && src !== null;
                      const title = isObj ? (src as any).title : src;
                      const url = isObj ? (src as any).url : "";

                      return (
                        <div
                          key={i}
                          className="text-xs font-serif flex flex-col gap-1 border-b border-gray-200 pb-2 mb-2 last:border-0 last:pb-0 last:mb-0"
                        >
                          <div className="flex items-start gap-1">
                            <span className="text-[#8b0000] font-bold">#</span>
                            <span className="font-bold text-[#1a1a1a]">
                              {title}
                            </span>
                          </div>
                          {isObj && (src as any).info && (
                            <p className="text-[10px] text-gray-500 line-clamp-2 mr-3">
                              {(src as any).info}
                            </p>
                          )}
                          {url && (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-blue-600 hover:underline mr-3 truncate block"
                            >
                              {url}
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {data && !isLoading && !researchMap && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 p-4"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-6 border-4 border-double border-[#1a1a1a] shadow-[8px_8px_0_#1a1a1a] gap-4">
              <div>
                <h2 className="text-4xl font-bold text-[#8b0000] mb-2 newspaper">
                  {data.video_title}
                </h2>
                <div className="flex gap-4 text-sm font-serif text-[#555] mt-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> مدة المشاهدة:{" "}
                    {Math.ceil(
                      [data.opening_sketch, ...data.scenes].reduce(
                        (acc, s) =>
                          acc + (s.voice_over?.split(/\s+/).length || 0),
                        0,
                      ) / 130,
                    )}{" "}
                    د.
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" /> الكلمات:{" "}
                    {[data.opening_sketch, ...data.scenes].reduce(
                      (acc, s) =>
                        acc + (s.voice_over?.split(/\s+/).length || 0),
                      0,
                    )}
                  </span>
                  <span className="flex items-center gap-1">
                    <Camera className="w-4 h-4" /> المشاهد:{" "}
                    {data.scenes.length + 1}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={saveDossier}
                  disabled={isSaving || isSaved}
                  className={`px-4 py-2 font-bold border-2 flex items-center gap-2 transition-all shadow-[2px_2px_0_#1a1a1a] hover:shadow-none hover:translate-y-[2px] ${isSaved ? "bg-[#f4eee0] text-[#1a1a1a] border-[#1a1a1a]" : "bg-transparent hover:bg-[#1a1a1a] text-[#1a1a1a] hover:text-white border-[#1a1a1a]"}`}
                >
                  {isSaved ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{isSaved ? "تم أرشفة النسخة" : "حفظ في الأرشيف"}</span>
                </button>
                <button
                  onClick={handleDownloadNote}
                  className="px-4 py-2 bg-transparent hover:bg-[#1a1a1a] text-[#1a1a1a] hover:text-white font-bold border-2 border-[#1a1a1a] flex items-center gap-2 shadow-[2px_2px_0_#1a1a1a] hover:shadow-none hover:translate-y-[2px] transition-all"
                  title="تحميل الملف كامل (Markdown)"
                >
                  <Download className="w-4 h-4" />
                  <span>الملف الشامل</span>
                </button>
                <button
                  onClick={handleExportZip}
                  className="px-4 py-2 bg-[#8b0000] text-white font-bold border-2 border-[#1a1a1a] flex items-center gap-2 shadow-[2px_2px_0_#1a1a1a] hover:shadow-none hover:translate-y-[2px] transition-all"
                  title="تصدير للإنتاج البصري والمونتاج (ZIP)"
                >
                  <Archive className="w-4 h-4" />
                  <span>تصدير الإنتاج (ZIP)</span>
                </button>
                <button
                  onClick={handleExportAudioZip}
                  disabled={isProcessingAudio}
                  className="px-4 py-2 bg-[#1a1a1a] text-[#f4eee0] font-bold border-2 border-[#1a1a1a] flex items-center gap-2 shadow-[2px_2px_0_#1a1a1a] hover:shadow-none hover:translate-y-[2px] transition-all disabled:opacity-50"
                  title="تصدير حزمة الأصوات (ElevenLabs MP3s)"
                >
                  <Volume2 className={`w-4 h-4 ${isProcessingAudio ? "animate-pulse" : ""}`} />
                  <span>{isProcessingAudio ? "جاري المعالجة..." : "حزمة الأصوات (ElevenLabs)"}</span>
                </button>
                <button
                  onClick={handleDownloadVoiceScript}
                  className="px-4 py-2 bg-[#f4eee0] hover:bg-[#e6dfcc] text-[#1a1a1a] font-bold border-2 border-[#1a1a1a] flex items-center gap-2 shadow-[2px_2px_0_#1a1a1a] hover:shadow-none hover:translate-y-[2px] transition-all"
                  title="تحميل التعليق الصوتي فقط (Text)"
                >
                  <Mic className="w-4 h-4" />
                  <span>النص الصوتي</span>
                </button>
                <button
                  onClick={handleDownloadVisuals}
                  className="px-4 py-2 bg-[#eae5d8] hover:bg-[#dcd3b6] text-[#1a1a1a] font-bold border-2 border-[#1a1a1a] flex items-center gap-2 shadow-[2px_2px_0_#1a1a1a] hover:shadow-none hover:translate-y-[2px] transition-all"
                  title="تحميل أوامر التصميم للصور والتحريك"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>توجيهات المطبعة</span>
                </button>
              </div>
            </div>

            <div className="bg-[#f4eee0] border-b-2 border-t-2 border-[#1a1a1a] p-1 flex overflow-x-auto gap-2">
              {["script", "processor", "kit", "shorts"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`flex-1 min-w-[120px] py-3 text-lg font-bold transition-all newspaper border-x border-[#1a1a1a] ${activeTab === tab ? "bg-white text-[#8b0000] border-b-0" : "text-[#1a1a1a] hover:bg-[#eae5d8]"}`}
                >
                  {tab === "script"
                    ? "نص التحقيق"
                    : tab === "processor"
                      ? "معالج الصوتحات"
                      : tab === "kit"
                        ? "ملصق العدد"
                        : "إصدارات قصيرة"}
                </button>
              ))}
            </div>

            {activeTab === "script" && (
              <TimelineEditor
                scenes={[data.opening_sketch, ...data.scenes].filter(s => s && (s.asset_id || s.voice_over))}
                onUpdateScene={(index, updatedScene) => {
                  if (index === 0) {
                    setData({ ...data, opening_sketch: updatedScene });
                  } else {
                    const newScenes = [...data.scenes];
                    newScenes[index - 1] = updatedScene;
                    setData({ ...data, scenes: newScenes });
                  }
                }}
                onReorderScenes={(newSeq) => {
                  setData({
                    ...data,
                    opening_sketch: newSeq[0],
                    scenes: newSeq.slice(1)
                  });
                }}
                copyToClipboard={copyToClipboard}
              />
            )}

            {activeTab === "processor" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[#f4eee0] border-2 border-[#1a1a1a] p-6 shadow-[8px_8px_0_#1a1a1a]">
                  <h3 className="text-[#1a1a1a] font-bold mb-4 uppercase text-lg flex items-center gap-2 border-b-2 border-[#1a1a1a] pb-2 newspaper">
                    <Database className="w-5 h-5" /> النص الاصلي
                  </h3>
                  <textarea
                    value={rawScriptText}
                    onChange={(e) => setRawScriptText(e.target.value)}
                    className="w-full h-[400px] bg-transparent border-none resize-none focus:ring-0 text-[#1a1a1a] font-arabic-body text-lg"
                  />
                </div>
                <div className="bg-white border-2 border-[#1a1a1a] p-6 shadow-[8px_8px_0_#1a1a1a] relative">
                  <div className="flex items-center justify-between mb-4 border-b-2 border-[#1a1a1a] pb-2">
                    <h3 className="text-[#8b0000] font-bold text-lg flex items-center gap-2 newspaper">
                      <Mic className="w-5 h-5" /> النص المعالج (اللهجة المطلوبة)
                    </h3>
                    <button
                      onClick={handlePlayVoice}
                      className={`p-2 border border-[#1a1a1a] transition-all font-bold ${isPlayingVoice ? "bg-[#8b0000] text-white" : "bg-transparent text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white"}`}
                    >
                      {isPlayingVoice ? (
                        <Square className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <textarea
                    value={finalVoiceScript}
                    onChange={(e) => setFinalVoiceScript(e.target.value)}
                    placeholder="سيظهر النص المعالج هنا للمذيع..."
                    className="w-full h-[400px] bg-[#f4eee0] p-6 overflow-y-auto border border-[#1a1a1a] text-xl leading-10 text-[#1a1a1a] font-arabic-body whitespace-pre-wrap focus:outline-none focus:ring-0 resize-none"
                  />
                </div>
              </div>
            )}

            {activeTab === "kit" && data.publishing_kit && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                <div className="bg-white border-2 border-[#1a1a1a] shadow-[8px_8px_0_#1a1a1a] p-8 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-[#8b0000] newspaper border-b-2 border-[#1a1a1a] pb-2">
                      مانشيتات يوتيوب المقترحة
                    </h3>
                    <div className="space-y-3">
                      {(
                        data.publishing_kit.youtube_titles || [
                          data.publishing_kit.youtube_title,
                        ]
                      ).map((t: string, i: number) => (
                        <div
                          key={i}
                          className="p-4 bg-[#f4eee0] border border-[#1a1a1a] flex justify-between items-center group"
                        >
                          <span className="text-lg font-bold text-[#1a1a1a]">
                            {t}
                          </span>
                          <button
                            onClick={() => copyToClipboard(t, "تم نسخ العنوان")}
                            className="opacity-0 group-hover:opacity-100 p-2 bg-white border border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-all"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  {data.thumbnail && (
                    <div className="space-y-4 pt-6 border-t-2 border-[#1a1a1a]">
                      <h3 className="text-xl font-bold text-[#8b0000] newspaper flex items-center gap-2">
                        <ImageIcon className="w-5 h-5" /> فكرة الغلاف التصويري
                      </h3>

                      <div className="p-6 bg-[#f4eee0] border border-[#1a1a1a] space-y-4">
                        {data.thumbnail.text_on_image && (
                          <div>
                            <div className="text-sm font-bold text-[#1a1a1a] mb-2 underline">
                              خط عريض على الغلاف:
                            </div>
                            <div className="text-2xl font-bold text-[#8b0000] newspaper bg-white p-2 border border-[#1a1a1a] text-center">
                              {data.thumbnail.text_on_image}
                            </div>
                          </div>
                        )}

                        {data.thumbnail.image_prompt && (
                          <div className="relative group mt-4 pt-4 border-t border-[#1a1a1a]">
                            <div className="text-xs pr-8 text-[#555] font-mono break-all">
                              {data.thumbnail.image_prompt}
                            </div>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  data.thumbnail!.image_prompt,
                                  "تم نسخ برومبت الصورة المصغرة",
                                )
                              }
                              className="absolute top-2 right-0 opacity-0 group-hover:opacity-100 p-1.5 border border-[#1a1a1a] bg-white hover:bg-[#1a1a1a] hover:text-white transition-all"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="bg-[#f4eee0] p-8 border-2 border-[#1a1a1a] shadow-[8px_8px_0_#1a1a1a] flex flex-col">
                  <div className="flex items-center justify-between mb-6 border-b-2 border-[#1a1a1a] pb-2">
                    <h3 className="text-xl font-bold text-[#8b0000] newspaper">
                      تقرير وصف الفيديو للمنصات
                    </h3>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          data.publishing_kit.description_al_daheeh_style || "",
                          "تم نسخ الوصف",
                        )
                      }
                      className="p-2 border border-[#1a1a1a] hover:bg-[#1a1a1a] text-[#1a1a1a] hover:text-white transition-all"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="overflow-y-auto flex-1 bg-white border border-[#1a1a1a] p-6">
                    <p className="text-lg leading-relaxed text-[#333] whitespace-pre-wrap font-serif">
                      {data.publishing_kit.description_al_daheeh_style}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "shorts" && data.shorts && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-20">
                {data.shorts.map((short, i) => (
                  <div
                    key={i}
                    className="bg-white p-6 border-2 border-[#1a1a1a] shadow-[4px_4px_0_#1a1a1a] space-y-4 flex flex-col hover:-translate-y-1 transition-transform"
                  >
                    <div className="w-10 h-10 bg-[#1a1a1a] flex items-center justify-center text-white font-bold text-xl newspaper">
                      {i + 1}
                    </div>
                    <h4 className="font-bold text-[#8b0000] text-xl newspaper leading-tight">
                      {short.title}
                    </h4>
                    <p className="text-sm text-[#555] italic font-serif">
                      "{short.hook}"
                    </p>

                    <div className="relative group/script">
                      <div className="bg-[#f4eee0] p-4 text-base text-[#1a1a1a] leading-relaxed font-arabic-body h-[150px] overflow-y-auto border border-[#1a1a1a]">
                        <strong className="block text-[#8b0000] mb-1">
                          المتن:
                        </strong>
                        {short.body}
                        <strong className="block text-[#8b0000] mt-3 mb-1">
                          الخاتمة (CTA):
                        </strong>
                        {short.cta}
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            `المتن: \n${short.body}\n\nالخاتمة: \n${short.cta}`,
                            "تم نسخ سكريبت الشورت",
                          )
                        }
                        className="absolute top-2 left-2 opacity-0 group-hover/script:opacity-100 p-2 bg-white hover:bg-[#1a1a1a] text-[#1a1a1a] border border-[#1a1a1a] hover:text-white transition-all"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="relative group/prompt mt-auto border-t-2 border-dashed border-[#1a1a1a] pt-4">
                      <div className="text-xs font-mono text-[#555] uppercase pr-6 break-all">
                        {short.visual_instructions}
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            short.visual_instructions,
                            "تم نسخ التعليمات",
                          )
                        }
                        className="absolute top-3 right-0 opacity-0 group-hover/prompt:opacity-100 p-1.5 border border-[#1a1a1a] bg-white hover:bg-[#1a1a1a] text-[#1a1a1a] hover:text-white transition-all"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Mood Selector Modal */}
      <AnimatePresence>
        {showMoodModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMoodModal(false)}
              className="absolute inset-0 bg-[#f4eee0]/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-5xl bg-white border-2 border-[#1a1a1a] shadow-[8px_8px_0_#1a1a1a] flex flex-col max-h-[90vh]"
            >
              <div className="p-4 sm:p-6 border-b-2 border-[#1a1a1a] flex flex-col sm:flex-row items-start sm:items-center justify-between shrink-0 bg-[#1a1a1a] text-white gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 border border-white/20 bg-white/10">
                    <Wand2 className="w-5 h-5 text-[#f4eee0]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold newspaper leading-none mb-1 text-[#f4eee0]">
                      توجيهات الإخراج الفني
                    </h3>
                    <p className="text-xs font-serif text-gray-300">
                      اختر القالب الأنسب لقصتك، سيؤثر هذا على طبيعة المشاهد وسرد
                      التعليق الصوتي.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMoodModal(false)}
                  className="p-2 bg-white text-[#1a1a1a] border-2 border-transparent hover:border-[#8b0000] hover:text-[#8b0000] transition-all shadow-[2px_2px_0_rgba(255,255,255,0.5)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 sm:p-6 overflow-y-auto bg-[#f4eee0] flex-1 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {moods.map((m) => {
                    const isActive = mood === m.type;
                    return (
                      <div
                        key={m.type}
                        onClick={() => {
                          setMood(m.type);
                          setShowMoodModal(false);
                        }}
                        className={`p-4 border-2 border-[#1a1a1a] cursor-pointer transition-all group flex flex-col gap-2 ${isActive ? "bg-[#1a1a1a] text-white shadow-[4px_4px_0_#8b0000]" : "bg-white text-[#1a1a1a] shadow-[4px_4px_0_#1a1a1a] hover:-translate-y-1 hover:shadow-[6px_6px_0_#1a1a1a]"}`}
                      >
                        <div className="flex justify-between items-start">
                          <div
                            className={`p-2 border-2 ${isActive ? "border-white bg-[#333]" : "border-[#1a1a1a] bg-[#f4eee0]"}`}
                          >
                            <m.icon
                              className={`w-5 h-5 ${isActive ? "text-white" : "text-[#8b0000]"}`}
                            />
                          </div>
                          {isActive && (
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                          )}
                        </div>
                        <h4 className="font-bold text-lg mt-2 newspaper">
                          {m.type}
                        </h4>
                        <p
                          className={`text-xs font-serif leading-relaxed line-clamp-3 ${isActive ? "text-gray-300" : "text-[#555]"}`}
                        >
                          {m.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Archive Modal */}
      <AnimatePresence>
        {showArchive && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowArchive(false)}
              className="absolute inset-0 bg-[#f4eee0]/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-4xl bg-white border-2 border-[#1a1a1a] shadow-[8px_8px_0_#1a1a1a] flex flex-col max-h-[90vh]"
            >
              <div className="p-4 sm:p-6 border-b-2 border-[#1a1a1a] flex items-center justify-between shrink-0 bg-[#1a1a1a] text-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 border border-white/20 bg-white/10">
                    <Archive className="w-5 h-5 text-[#f4eee0]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold newspaper text-[#f4eee0] leading-none mb-1">
                      الأرشيف الصحفي
                    </h3>
                    <p className="text-xs font-serif text-gray-300">
                      مكتبة الأعمال والمطبوعات السابقة
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowArchive(false)}
                  className="p-2 bg-white text-[#1a1a1a] border-2 border-transparent hover:border-[#8b0000] hover:text-[#8b0000] transition-all shadow-[2px_2px_0_rgba(255,255,255,0.5)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto bg-[#f4eee0] flex-1 custom-scrollbar">
                {archive.length === 0 ? (
                  <div className="py-20 text-center opacity-70 flex flex-col items-center gap-4">
                    <FileSearch className="w-16 h-16 text-[#8b0000]" />
                    <p className="text-xl font-bold newspaper text-[#1a1a1a]">
                      غرفة الأرشيف فارغة
                    </p>
                    <p className="text-sm font-serif text-gray-500">
                      جرب توليد أول نسخة لك الآن
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {archive.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white border-2 border-[#1a1a1a] p-4 flex items-center justify-between group hover:bg-[#1a1a1a] hover:text-white transition-colors cursor-pointer shadow-[2px_2px_0_#1a1a1a] hover:shadow-none"
                        onClick={() => {
                          setData(item);
                          setShowArchive(false);
                          setActiveTab("script");
                        }}
                      >
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className="w-12 h-12 border-2 border-[#1a1a1a] bg-[#f4eee0] group-hover:border-white group-hover:bg-[#333] flex items-center justify-center p-1 shrink-0 transition-colors">
                            <FileText className="w-6 h-6 text-[#1a1a1a] group-hover:text-white transition-colors" />
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="font-bold text-lg line-clamp-1 newspaper">
                              {item.video_title}
                            </h4>
                            <p className="text-[10px] font-mono mt-1 opacity-60">
                              {item.createdAt
                                ? new Date(item.createdAt).toLocaleDateString(
                                    "ar-EG",
                                  )
                                : "تاريخ المطبوعة غير معروف"}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={(e) => handleDeleteArchive(item.id, e)}
                            className="p-2 border border-[#1a1a1a] group-hover:border-white text-[#1a1a1a] group-hover:text-white hover:bg-red-600 hover:border-red-600 transition-colors z-10"
                            title="مسح من الأرشيف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <ChevronLeft className="w-6 h-6 opacity-30 group-hover:opacity-100 group-hover:-translate-x-1 transition-all self-center" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-[#f4eee0]/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl max-h-[85vh] bg-white border-4 border-double border-[#1a1a1a] shadow-[16px_16px_0_#1a1a1a] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b-4 border-double border-[#1a1a1a] flex justify-between items-start bg-[#1a1a1a] text-[#f4eee0]">
                <div>
                  <h2 className="text-3xl font-bold newspaper text-[#8b0000] drop-shadow-md">
                    إعدادات محرك الذكاء الاصطناعي
                  </h2>
                  <p className="font-serif italic mt-2 text-sm text-gray-300">
                    يمكنك استخدام سيرفر Ollama في جهازك لكتابة المحتوى محلياً، مجاناً وبلا حدود.
                  </p>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1 hover:bg-[#8b0000] hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6 text-[#1a1a1a]">
                <div className="flex items-center gap-4 bg-[#f4eee0] p-4 border border-[#1a1a1a]">
                  <input
                    type="checkbox"
                    id="useOllamaCheck"
                    checked={useOllama}
                    onChange={(e) => setUseOllama(e.target.checked)}
                    className="w-6 h-6 border-2 border-[#1a1a1a] accent-[#8b0000]"
                  />
                  <label htmlFor="useOllamaCheck" className="text-xl font-bold font-arabic-body cursor-pointer">
                    تفعيل Ollama بدلاً من السحابي
                  </label>
                </div>

                <div className={`space-y-4 ${!useOllama ? "opacity-50 pointer-events-none" : ""}`}>
                  <div>
                    <label className="block text-sm font-bold mb-2 font-mono">رابط سيرفر Ollama</label>
                    <input
                      type="text"
                      className="w-full text-xl font-mono p-3 border-2 border-[#1a1a1a] bg-white text-left focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
                      dir="ltr"
                      value={ollamaUrl}
                      onChange={(e) => setOllamaUrl(e.target.value)}
                      placeholder="http://localhost:11434"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 font-mono">اسم الموديل</label>
                    <input
                      type="text"
                      className="w-full text-xl font-mono p-3 border-2 border-[#1a1a1a] bg-white text-left focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
                      dir="ltr"
                      value={ollamaModel}
                      onChange={(e) => setOllamaModel(e.target.value)}
                      placeholder="llama3.1"
                    />
                  </div>
                  
                  <div className="bg-red-50 p-4 border-l-4 border-[#8b0000] text-sm">
                    <h4 className="font-bold mb-2 flex items-center gap-2 text-[#8b0000]">
                      <AlertTriangle className="w-4 h-4" /> هام جداً ليعمل في المتصفح
                    </h4>
                    <p className="mb-2">بسبب حماية المتصفح، يجب عليك تفعيل CORS في Ollama وإلا سيتم حجب الاتصال.</p>
                    <ol className="list-decimal list-inside space-y-2 mt-2 font-mono text-[10px] sm:text-xs text-left overflow-hidden" dir="ltr">
                      <li>تأكد من إغلاق Ollama من شريط المهام بجوار الساعة (Quit)</li>
                      <li className="font-bold text-black font-arabic-body text-right">في الويندوز (افتح CMD أو PowerShell والصق):</li>
                      <code className="block mt-1 bg-black text-green-400 p-2 select-all overflow-x-auto whitespace-nowrap">
                        $env:OLLAMA_ORIGINS="*"; ollama serve
                      </code>
                      <li className="font-bold text-black font-arabic-body text-right mt-2">في Mac/Linux (افتح Terminal):</li>
                      <code className="block mt-1 bg-black text-green-400 p-2 select-all overflow-x-auto whitespace-nowrap">
                        OLLAMA_ORIGINS="*" ollama serve
                      </code>
                      <li className="font-bold text-[#8b0000] font-arabic-body text-right mt-2 pt-2 border-t border-red-200">
                        لحل مشكلة (Mixed Content / HTTPS) باستخدام ngrok:
                      </li>
                      <code className="block mt-1 bg-black text-yellow-400 p-2 select-all overflow-x-auto whitespace-nowrap">
                        ngrok http 11434 --host-header="localhost:11434"
                      </code>
                      <li className="mt-2 text-right font-arabic-body text-[#1a1a1a]">انسخ الرابط الذي يبدأ بـ https من ngrok وضعه في مربع (رابط سيرفر Ollama) بالأعلى. (لا يزال عليك تشغيل سيرفر ollama مع OLLAMA_ORIGINS="*" كما أسلفنا).</li>
                    </ol>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t-2 border-dashed border-gray-300">
                  <h3 className="text-xl font-bold mb-4 newspaper text-[#8b0000]">
                    إعدادات الصوت (ElevenLabs)
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">مفتاح API الخاص بـ ElevenLabs (اختياري)</label>
                      <input
                        type="password"
                        className="w-full text-xl font-mono p-3 border-2 border-[#1a1a1a] bg-white text-left focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
                        dir="ltr"
                        value={elevenLabsKey}
                        onChange={(e) => setElevenLabsKey(e.target.value)}
                        placeholder="sk-..."
                      />
                      <p className="text-xs text-gray-500 mt-1">يُستخدم لتوليد الأصوات بدقة عالية وتعبيرات واقعية. يمكنك تركه فارغاً للاستماع للصوت الافتراضي.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">معرف الصوت (Voice ID)</label>
                      <input
                        type="text"
                        className="w-full text-xl font-mono p-3 border-2 border-[#1a1a1a] bg-white text-left focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
                        dir="ltr"
                        value={elevenLabsVoiceId}
                        onChange={(e) => setElevenLabsVoiceId(e.target.value)}
                        placeholder="pNInz6obbfDQGcgMyIGC"
                      />
                      <p className="text-xs text-gray-500 mt-1">المعرف الافتراضي لصوت ذكوري عميق (مثل آدم). يمكنك تغييره لمعرف أي صوت قمت بنسخه (Voice Cloning) من ElevenLabs.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-4 border-2 border-[#1a1a1a] shadow-[4px_4px_0_#1a1a1a] flex items-center gap-3 ${toast.type === "success" ? "bg-[#f4eee0] text-[#1a1a1a]" : "bg-[#1a1a1a] text-[#f4eee0]"}`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            <span className="text-sm font-bold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
