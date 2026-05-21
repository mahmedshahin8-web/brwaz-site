import React, { useState, useEffect, useRef } from "react";
import DocxWorker from "../workers/docxWorker?worker";
import ZipWorker from "../workers/zipWorker?worker";
import { notify } from "../lib/notify";
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
import { SceneCard } from "../components/SceneCard";
import { useTacticalSound } from "../hooks/useTacticalSound";
import { executeAgent3_ArtDirector, executeAgent6_ArchiveSearch, executeAgent7_ComplianceAudit, executeAgent8_EchoChamber, executeAgent9_KnowledgeLinker, executeAgent_SceneRefiner } from "../lib/agents";
import { ollamaQueue } from "../lib/queue";
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
} from "lucide-react";
import {
  extractAndCleanScript,
  convertToEgyptian,
} from "../services/audioProcessor";
import { ThumbnailBlueprintCard } from "../components/ThumbnailBlueprintCard";
import { TtsScratchTrack } from "../components/TtsScratchTrack";
import { NarrativeDNAEditor } from "../components/NarrativeDNAEditor";
import { PublishingKitCard } from "../components/PublishingKitCard";
import { TeleprompterOverlay } from "../components/TeleprompterOverlay";
import { calculateTension } from "../lib/analysis";
import { TimelineEditor } from "../components/TimelineEditor";
import { AudioWaveform } from "../components/AudioWaveform";
import { AudioEngine, MasteringConfig } from "../services/audioEngine";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { db, storage } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";

const sectors = [
  { id: "shadows", name: "قطاع الظلال", description: "غموض، رعب، تاريخ مفقود", icon: Ghost, color: "#f59e0b" },
  { id: "power", name: "قطاع النفوذ والمال", description: "سياسة، اقتصاد، استخبارات", icon: Activity, color: "#f43f5e" },
  { id: "anatomy", name: "قطاع التشريح والتحليل", description: "نقد أدبي، تشريح جنائي، بيانات", icon: Fingerprint, color: "#3B82F6" },
  { id: "modern", name: "الجيل الجديد", description: "ميمز، خرائط، فلوقات استقصائية", icon: Zap, color: "#10B981" },
];

interface MoodDefinition {
  type: MoodType;
  icon: any;
  color: string;
  description: string;
  sector: "shadows" | "power" | "anatomy" | "modern";
  dna?: {
    style: string;
    paper: string;
    localization: string;
  };
}

const moods: MoodDefinition[] = [
  {
    type: "طريقة الدحيح",
    icon: Smile,
    color: "#facc15",
    description: "تبسيط استعراضي وكوميدي للأفكار المعقدة",
    sector: "modern",
    dna: { style: "Sketchy Cutouts & Pop-Art", paper: "Modern White Graph Paper", localization: "Urban Cairo Casual" }
  },
  {
    type: "أرشيف الضلمة",
    icon: Archive,
    color: "#f59e0b",
    description: "قصص تاريخية غريبة وأرشيفات مظلمة ومجهولة",
    sector: "shadows",
    dna: { style: "Ink Sketch / Etching", paper: "Aged Yellow Tobacco Paper", localization: "Cairene 1940s Noir" }
  },
  {
    type: "كلاكيت وتزوير",
    icon: Youtube,
    color: "#ef4444",
    description: "تريندات مزيفة وقصص صناعة الوهم",
    sector: "modern",
    dna: { style: "Glitchy Mixed Media", paper: "Glossy Magazine Scan", localization: "Modern Media Hubs" }
  },
  {
    type: "ملفات متقفلش",
    icon: Database,
    color: "#8B5CF6",
    description: "ألغاز وقضايا غامضة لم يتم حلها بعد",
    sector: "shadows",
    dna: { style: "Noir Photography", paper: "Police Dossier Folder", localization: "Egyptian Bureaucracy" }
  },
  {
    type: "خرافات شعبية",
    icon: Ghost,
    color: "#3b82f6",
    description: "أساطير مرعبة وحكايات شعبية من التراث",
    sector: "shadows",
    dna: { style: "Mystical Brush Work", paper: "Ancient Parchment", localization: "Rural Egyptian Villages" }
  },
  {
    type: "سبوبة ولا ابتكار",
    icon: Zap,
    color: "#10B981",
    description: "كشف الخدع التسويقية والمشاريع الوهمية",
    sector: "power",
    dna: { style: "Blueprint / Schematic", paper: "Business Ledger", localization: "Cairene Business District" }
  },
  {
    type: "تشريح الحكايات",
    icon: BookOpen,
    color: "#3B82F6",
    description: "تحليل أدبي ونقدي للروايات والقصص العربية",
    sector: "anatomy",
    dna: { style: "Ink Sketching", paper: "Old Literary Manuscript", localization: "Naguib Mahfouz's Era" }
  },
  {
    type: "حواديت شوارع",
    icon: Users,
    color: "#fb923c",
    description: "قصص الناس، الحارات، والتاريخ المنسي",
    sector: "shadows",
    dna: { style: "Raw Charcoal Sketches", paper: "Dirty Map Textures", localization: "Popular Cairene Lanes" }
  },
  {
    type: "صراع العروش العربي",
    icon: Swords,
    color: "#b91c1c",
    description: "خلفيات الصراع التاريخي والمعارك في المنطقة",
    sector: "power",
    dna: { style: "Epic Oil Painting", paper: "Royal Decree Scroll", localization: "Historic Bazaars & Palaces" }
  },
  {
    type: "تكنولوجيا مرعبة",
    icon: ServerCrash,
    color: "#0ea5e9",
    description: "الوجه الأسود للتقنية والذكاء الاصطناعي",
    sector: "modern",
    dna: { style: "Cyber-Dystopian Grain", paper: "Digital Scanline Pattern", localization: "Modern Tech Infrastructure" }
  },
  {
    type: "اقتصاد الشارع",
    icon: TrendingDown,
    color: "#14b8a6",
    description: "تحليل العالم السفلي والاقتصاد الخفي",
    sector: "power",
    dna: { style: "Stencil / Industrial", paper: "Recycled Cardboard", localization: "Local Egyptian Markets" }
  },
  {
    type: "ملفات مخابراتية",
    icon: Eye,
    color: "#6366f1",
    description: "قصص الجواسيس وعمليات الذئاب المنفردة",
    sector: "power",
    dna: { style: "Typewriter / Redacted", paper: "Intelligence Folder", localization: "Strategic Regional Maps" }
  },
  {
    type: "حكاوي الأجداد",
    icon: Ghost,
    color: "#c2410c",
    description: "حكايات الجدات، الغولة، وأساطير الرعب",
    sector: "shadows",
    dna: { style: "Folklore Illustration", paper: "Faded Fabric Scraps", localization: "Oral Tradition Sites" }
  },
  {
    type: "خرائط دموية (Faceless)",
    icon: Radar,
    color: "#E62725",
    description: "تحليل جيوسياسي يعتمد على خرائط متحركة",
    sector: "modern",
    dna: { style: "Topographic / Strategic", paper: "Military Map Parchment", localization: "Regional Borders" }
  },
  {
    type: "سبورة بيضاء (Whiteboard)",
    icon: FileText,
    color: "#555",
    description: "شرح تعليمي مبسط يعتمد على التخطيط البصري",
    sector: "modern",
    dna: { style: "Hand Marker Sketches", paper: "Matte Whiteboard", localization: "Academic Context" }
  },
  {
    type: "ميمز ومقاطع (Faceless)",
    icon: Zap,
    color: "#10B981",
    description: "شرح قضايا التريند بأسلوب الميمز الحديث",
    sector: "modern",
    dna: { style: "Collage / Pop-Art", paper: "Digital Feed Texture", localization: "Social Media Sphere" }
  },
  {
    type: "رحلة في عقل مجرم",
    icon: Skull,
    color: "#4c0519",
    description: "تحليل نفسي وتشريح لدوافع أشهر الجرائم",
    sector: "anatomy",
    dna: { style: "Expressionist Ink", paper: "Psychiatric Notes", localization: "Cairene Crime Scenes" }
  },
  {
    type: "المستقبل الديسطوبي",
    icon: TerminalSquare,
    color: "#8A2BE2",
    description: "سيناريوهات نهاية العالم وتوقعات كابوسية",
    sector: "modern",
    dna: { style: "Neon Noir Grain", paper: "HUD Projection Look", localization: "Future Urban Cairo" }
  },
  {
    type: "محاكمة التاريخ",
    icon: PenLine,
    color: "#b8860b",
    description: "إعادة فتح محاكمات لشخصيات تاريخية",
    sector: "anatomy",
    dna: { style: "Legal Archive Sketches", paper: "Court Record Parchment", localization: "Historic Courthouses" }
  },
  {
    type: "اقتصاد البقاء",
    icon: Flame,
    color: "#ea580c",
    description: "العيش في ظل الانهيارات الاقتصادية الكبرى",
    sector: "power",
    dna: { style: "Gritty Industrial", paper: "Ration Card Paper", localization: "Survivalist Districts" }
  },
  {
    type: "جبل الجليد (Iceberg)",
    icon: Layers,
    color: "#0ea5e9",
    description: "رحلة استكشاف تبدأ بالمعروف وتنتهي بالأغمض",
    sector: "shadows",
    dna: { style: "Submerged Blue Tones", paper: "Water-Stained Paper", localization: "Deep Secret Vaults" }
  },
  {
    type: "همس الحكايات (Dark ASMR)",
    icon: Headphones,
    color: "#4b5563",
    description: "سرد قصصي يعتمد كلياً على العزلة الصوتية",
    sector: "shadows",
    dna: { style: "Deep Focus Textures", paper: "Velvet Matte Finish", localization: "Isolated Cairene Spaces" }
  },
  {
    type: "مسافر عبر الزمن",
    icon: Hourglass,
    color: "#8b5cf6",
    description: "سرد الأحداث كأنها وثيقة من المستقبل",
    sector: "shadows",
    dna: { style: "Anachrostic Blends", paper: "Temporal Map Scroll", localization: "Egyptian Epochs" }
  },
  {
    type: "شريط ملعون (Found Footage)",
    icon: Video,
    color: "#a3e635",
    description: "توثيق مرعب بأسلوب أشرطة الفيديو القديمة",
    sector: "shadows",
    dna: { style: "VHS / 8mm Grain", paper: "Celluloid Strip Look", localization: "Lost Personal Archives" }
  },
  {
    type: "فلوق استقصائي (Vlog)",
    icon: Eye,
    color: "#10B981",
    description: "نزول للشارع وبحث ميداني يكشف الحقائق",
    sector: "modern",
    dna: { style: "Handheld Realism", paper: "Field Notebook Scraps", localization: "Hyper-Local Realities" }
  },
  {
    type: "بودكاست كرسي الاعتراف",
    icon: Headphones,
    color: "#fbbf24",
    description: "مقابلات وتصريحات مسربة وتحليل لغة الجسد",
    sector: "anatomy",
    dna: { style: "Tight Contrast Portrait", paper: "Transcript Paper", localization: "Underground Studios" }
  },
  {
    type: "القصة وراء التريند",
    icon: TrendingUp,
    color: "#ec4899",
    description: "ربط التريندات وتفكيك أصلها المنسي",
    sector: "modern",
    dna: { style: "Graphic Collage", paper: "Screen Grain Finish", localization: "Social Ecosystems" }
  },
  {
    type: "التفكيك التاريخي",
    icon: Archive,
    color: "#8b5cf6",
    description: "تفكيك السرديات السائدة وربطها بالواقع",
    sector: "anatomy",
    dna: { style: "Lithographic Prints", paper: "Heavy Library Stock", localization: "Intellectual Cairo" }
  },
  {
    type: "التحليل الاستقصائي",
    icon: FileSearch,
    color: "#ef4444",
    description: "النبش في الفساد وتتبع مسار الأحداث بدقة",
    sector: "anatomy",
    dna: { style: "Evidence Collage", paper: "Investigation Dossier", localization: "Sites of Power" }
  },
  {
    type: "الدراما السوداء",
    icon: Skull,
    color: "#4c0519",
    description: "رصد الجوانب المظلمة للنفس البشرية",
    sector: "anatomy",
    dna: { style: "Chiaroscuro Sketches", paper: "Aged Charcoal Paper", localization: "Poetic Dark Spaces" }
  },
  {
    type: "الغموض الفلسفي",
    icon: Eye,
    color: "#9ca3af",
    description: "طرح أسئلة وجودية وميتافيزيقية عميقة",
    sector: "anatomy",
    dna: { style: "Abstract Voids", paper: "Coarse Linen Texture", localization: "Metaphysical Egypt" }
  },
  {
    type: "الصندوق الأسود",
    icon: Fingerprint,
    color: "#ef4444",
    description: "تحليل جنائي معمق وفك شفرات الجرائم",
    sector: "anatomy",
    dna: { style: "Macro Forensic Tech", paper: "Sterile Lab Logs", localization: "State Institutions" }
  },
  {
    type: "النبش المعماري",
    icon: Building2,
    color: "#f59e0b",
    description: "تاريخ المباني المنسية وأنفاق القاهرة السرية",
    sector: "anatomy",
    dna: { style: "Architectural Blueprint", paper: "Tracing Paper Crinkle", localization: "Cairene Structures" }
  },
  {
    type: "لوغاريتمات السلطة",
    icon: Network,
    color: "#3b82f6",
    description: "خرائط النفوذ والتحكم في الجماهير بالبيانات",
    sector: "power",
    dna: { style: "Data Visualization", paper: "Encrypted Stream Grid", localization: "Power Centers" }
  },
  {
    type: "أطلس الانهيار",
    icon: Activity,
    color: "#f43f5e",
    description: "رصد لحظات سقوط الأنظمة الكبرى",
    sector: "power",
    dna: { style: "Expressionist Ruin", paper: "Burnt Fragment Texture", localization: "Fragile Landscapes" }
  },
];

const IntelGraph = ({ research }: { research: MasterOutline }) => {
  return (
    <div className="relative w-full aspect-square bg-white border border-gray-200 overflow-hidden rounded-sm">
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
          className="text-[10px] font-mono fill-blue-600 text-center"
          textAnchor="middle"
        >
          Core
        </text>

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
    </div>
  );
};

export default function ContentCreationPage() {
  const { playClick, playHover, startFilmReel } = useTacticalSound();
  const [topic, setTopic] = useState(() => {
    const saved = localStorage.getItem("barwaz_topic") || "";
    if (saved.startsWith("حدث خطأ")) return "";
    return saved;
  });
  const [pipelineStep, setPipelineStep] = useState<1 | 2 | 3>(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedSector, setSelectedSector] = useState(sectors[0].id);
  const [selectedAngle, setSelectedAngle] = useState<{title: string, hook: string} | null>(null);
  
  const [duration, setDuration] = useState(10);
  const [note, setNote] = useState("");
  const [mood, setMood] = useState<MoodType>("التحليل الاستقصائي");
  const [suspenseLevel, setSuspenseLevel] = useState(5);
  const [persona, setPersona] = useState<PersonaType>("النبّاش");
  const [isAutoPilot, setIsAutoPilot] = useState(true);
  const [liveTrends, setLiveTrends] = useState<LiveTrend[]>([]);
  const [isSweeping, setIsSweeping] = useState(false);
  const [isTriaging, setIsTriaging] = useState(false);
  const moodContext = getMoodContext(mood);
  const ragVaults = moodContext.ragVaults || [];

  const [suggestedTitles, setSuggestedTitles] = useState<RadarSuggestion[]>([]);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [activeTab, setActiveTab] = useState<"script" | "kit" | "shorts" | "audit" | "echo">(
    "script",
  );
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<{
     archives: { title: string; url: string; description: string }[];
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
  const [isLongForm, setIsLongForm] = useState(false);
  const [generatedScenes, setGeneratedScenes] = useState<EpisodeScene[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [fragmenterData, setFragmenterData] = useState<{
    x_thread: string[];
    tiktok_hook: string;
    instagram_caption: string;
  } | null>(null);
  const [isGeneratingFragments, setIsGeneratingFragments] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [loadingTip, setLoadingTip] = useState("");
  const [data, setData] = useState<EpisodeData | null>(null);
  const [intelTab, setIntelTab] = useState<"audit" | "research" | "assets" | "map">(
    "audit",
  );
  const [error, setError] = useState("");

  const [narrativeStrategy, setNarrativeStrategy] = useState<"HCS" | "HAP">(
    "HCS",
  );
  const [precision, setPrecision] = useState("عالي_الدقة");
  const [intelligenceCore, setIntelligenceCore] = useState("المحرك_المحلي");
  const [showAdvanced, setShowAdvanced] = useState(false);

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
  const [finalVoiceScript, setFinalVoiceScript] = useState("");

  const loadingTips = [
    "الذكاء الاصطناعي ينقّب الآن في بطون الكتب والمقالات القديمة...",
    "[!] يتم استدعاء مراجع من صحف الستينات... واستنطاق دفاتر البوليس السري...",
    "يتم مطابقة الوقائع المذكورة مع سجلات الشهر العقاري ومحاضر النيابة...",
    "تصنيف الأدلة وربط الخيوط المبعثرة في أرشيف الحوادث...",
    "تجهيز الصياغة الدرامية وفق أسلوب المحقق الصحفي العتيق...",
    "تشفير البيانات وتوثيق المصادر الحصرية للتقرير...",
    "استخراج الميكروفيلم الخاص بالقضية من الدور السفلي للأرشيف...",
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

  // Let's debounce the editor's update to avoid rebuilding the entire 3700-line DOM on every keystroke
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    extensions: [StarterKit, Highlight],
    content: finalVoiceScript.split('\n').join('<br>'),
    onUpdate: ({ editor }) => {
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = setTimeout(() => {
        setFinalVoiceScript(editor.getHTML().replace(/<br>/g, '\n').replace(/<[^>]+>/g, ''));
      }, 500); // Debounce typing updates by 500ms
    },
  });

  useEffect(() => {
    if (editor && finalVoiceScript) {
      const currentText = editor.getHTML().replace(/<br>/g, '\n').replace(/<p><\/p>/g, '\n').replace(/<[^>]+>/g, '');
      if (finalVoiceScript !== currentText) {
        editor.commands.setContent(finalVoiceScript.split('\n').join('<br>'));
      }
    }
  }, [finalVoiceScript, editor]);

  useEffect(() => {
    if (finalVoiceScript) {
      setTensionPoints(calculateTension(finalVoiceScript));
    }
  }, [finalVoiceScript]);

  const renderTensionHeatmap = () => (
    <div className="flex gap-1 h-2 w-full">
      {tensionPoints.map((score, i) => (
        <div
          key={i}
          className={`flex-1 ${score > 0.7 ? "bg-red-500" : score > 0.4 ? "bg-blue-600" : "bg-gray-100"}`}
          title={`Tension: ${score}`}
        />
      ))}
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
        "Merge these specific perspectives into one high-stakes controversial script idea.",
      );
      setSuggestedTitles(titles);
      notify.classified("TITLES_MERGED");
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

    const otherEngine = globalEngine === "gemini" ? "ollama" : "gemini";
    
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

      if (data.opening_sketch.asset_id === sceneId) {
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
       if (data.opening_sketch.asset_id === sceneId) {
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
       if (data.opening_sketch.asset_id === sceneId) {
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
        <Loader2 className="animate-spin mx-auto text-blue-600" size={40} />
        <p className="font-mono text-xs uppercase text-gray-600 tracking-widest animate-pulse">Running_Global_Intel_Audit...</p>
      </div>
    );

    if (!auditResult) return (
      <div className="p-20 bg-white border-gray-100 shadow-sm border border-dashed border-gray-200 flex flex-col items-center justify-center gap-6 text-center">
         <ShieldAlert size={40} className="text-blue-600" />
         <div className="space-y-2">
            <h4 className="text-xl font-arabic font-bold text-gray-900">رادار التدقيق (Audit Radar)</h4>
            <p className="text-sm font-arabic text-gray-500 max-w-sm">فحص المحتوى بحثاً عن المغالطات التاريخية، مخاطر السياسات، والمصادر الأرشيفية الحقيقية</p>
         </div>
         <button 
          onClick={handleRunAudit}
          className="px-8 py-3 bg-blue-600/10 border border-blue-500/40 text-blue-600 font-mono text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-black transition-all"
         >
           Start_Audit_Scan
         </button>
      </div>
    );

    return (
      <div className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* ACCURACY SECTION */}
           <div className="space-y-4">
              <h4 className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Historical_Truth_Check</h4>
              <div className="space-y-3">
                 {auditResult.historical_accuracy.map((acc, i) => (
                    <div key={i} className="p-4 bg-white border-gray-100 shadow-sm border border-gray-200 space-y-2">
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] font-mono text-gray-600 uppercase">Statement</span>
                          <span className={`text-[8px] font-mono px-2 py-0.5 rounded-full ${acc.status === 'verified' ? 'bg-green-500/20 text-green-500' : acc.status === 'contested' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>{acc.status}</span>
                       </div>
                       <p className="text-xs text-gray-900/80">{acc.statement}</p>
                       <p className="text-[10px] text-gray-500 italic">{acc.notes}</p>
                    </div>
                 ))}
              </div>
           </div>

           {/* POLICY SECTION */}
           <div className="space-y-4">
              <h4 className="text-[10px] font-mono text-red-500 uppercase tracking-widest">Policy_&_Compliance</h4>
              <div className="space-y-3">
                 {auditResult.risks.map((risk, i) => (
                    <div key={i} className="p-4 bg-white border-gray-100 shadow-sm border border-gray-200 space-y-2">
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] font-mono text-gray-600 uppercase">Finding</span>
                          <span className={`text-[8px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-500 uppercase`}>{risk.severity}</span>
                       </div>
                       <p className="text-xs text-gray-900/80">{risk.finding}</p>
                       <div className="p-2 bg-white shadow-sm border-l-2 border-blue-500">
                          <span className="text-[8px] font-mono text-blue-600 uppercase block mb-1">Recommended_Patch</span>
                          <p className="text-[10px] text-gray-600">{risk.fix}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* ARCHIVES SECTION */}
        <div className="space-y-6 pt-6 border-t border-gray-200">
           <h4 className="text-sm font-mono text-blue-600 uppercase tracking-[0.5em] flex items-center gap-3">
             <FileSearch size={16} /> Global_Archive_Sourcing
           </h4>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {auditResult.archives.map((arc, i) => (
                 <a key={i} href={arc.url} target="_blank" rel="noopener noreferrer" className="p-4 bg-white border-gray-100 shadow-sm border border-gray-200 hover:border-blue-500/50 transition-all group block">
                    <div className="flex justify-between items-start mb-3">
                       <div className="p-2 bg-blue-600/10 text-blue-600">
                          <Database size={14} />
                       </div>
                       <ArrowRight size={14} className="text-gray-500 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                    <h5 className="text-[11px] font-mono text-gray-900 mb-2 line-clamp-1">{arc.title}</h5>
                    <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{arc.description}</p>
                 </a>
              ))}
           </div>
        </div>
      </div>
    );
  };

  const EchoChamberUI = () => {
    if (isEchoing) return (
      <div className="p-20 text-center space-y-4">
        <Loader2 className="animate-spin mx-auto text-purple-500" size={40} />
        <p className="font-mono text-xs uppercase text-gray-600 tracking-widest animate-pulse">Simulating_Audience_Sentiment...</p>
      </div>
    );

    if (!echoResult) return (
      <div className="p-20 bg-white border-gray-100 shadow-sm border border-dashed border-gray-200 flex flex-col items-center justify-center gap-6 text-center">
         <MessageSquare size={40} className="text-purple-500" />
         <div className="space-y-2">
            <h4 className="text-xl font-arabic font-bold text-gray-900">غرفة الصدى (Echo Chamber)</h4>
            <p className="text-sm font-arabic text-gray-500 max-w-sm">محاكاة لردود أفعال الجمهور قبل النشر، وتحديد نقاط الضعف والقوة وبناء حلقات المشاهدة</p>
         </div>
         <button 
          onClick={handleRunAudit}
          className="px-8 py-3 bg-purple-500/10 border border-purple-500/40 text-purple-500 font-mono text-[10px] uppercase tracking-widest hover:bg-purple-500 hover:text-gray-900 transition-all"
         >
           Enter_The_Chamber
         </button>
      </div>
    );

    return (
      <div className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* SKEPTICS */}
           <div className="space-y-4">
              <h4 className="text-[10px] font-mono text-yellow-500 uppercase tracking-widest flex items-center gap-2">
                <ShieldAlert size={14} /> Persona: Skeptics
              </h4>
              <div className="space-y-3">
                 {echoResult.skeptics.map((s, i) => (
                    <div key={i} className="p-4 bg-yellow-500/5 border border-yellow-500/10 space-y-3">
                       <span className="text-[10px] font-mono text-yellow-500/60 block">{s.user}</span>
                       <p className="text-sm font-arabic text-gray-900/80 italic">"{s.comment}"</p>
                       <div className="p-2 bg-white shadow-sm border-r-2 border-yellow-500 text-right">
                          <span className="text-[8px] font-mono text-yellow-500 uppercase block mb-1">REBUTTAL_IQ</span>
                          <p className="text-[10px] text-gray-600">{s.rebuttal_tip}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* HYPE MEN */}
           <div className="space-y-4">
              <h4 className="text-[10px] font-mono text-green-500 uppercase tracking-widest flex items-center gap-2">
                <Flame size={14} /> Persona: Hype_Men
              </h4>
              <div className="space-y-3">
                 {echoResult.hype_men.map((s, i) => (
                    <div key={i} className="p-4 bg-green-500/5 border border-green-500/10 space-y-3">
                       <span className="text-[10px] font-mono text-green-500/60 block">{s.user}</span>
                       <p className="text-sm font-arabic text-gray-900/80 italic">"{s.comment}"</p>
                       <div className="p-2 bg-white shadow-sm border-r-2 border-green-500 text-right">
                          <span className="text-[8px] font-mono text-green-500 uppercase block mb-1">VIRAL_HOOK</span>
                          <p className="text-[10px] text-gray-600">{s.viral_hook}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* CRITICS */}
           <div className="space-y-4">
              <h4 className="text-[10px] font-mono text-red-500 uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle size={14} /> Persona: Critics
              </h4>
              <div className="space-y-3">
                 {echoResult.critics.map((s, i) => (
                    <div key={i} className="p-4 bg-red-500/5 border border-red-500/10 space-y-3">
                       <span className="text-[10px] font-mono text-red-500/60 block">{s.user}</span>
                       <p className="text-sm font-arabic text-gray-900/80 italic">"{s.comment}"</p>
                       <div className="p-2 bg-white shadow-sm border-r-2 border-red-500 text-right">
                          <span className="text-[8px] font-mono text-red-500 uppercase block mb-1">CONFLICT_RISK</span>
                          <p className="text-[10px] text-gray-600">{s.risk_factor}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* KNOWLEDGE LOOPS */}
        <div className="pt-10 border-t border-gray-200 space-y-6">
           <h4 className="text-sm font-mono text-blue-600 uppercase tracking-[0.5em] flex items-center gap-3">
             <LinkLink size={16} /> Knowledge_Viewership_Loop
           </h4>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {echoResult.suggested_links.map((link, i) => (
                 <div key={i} className="p-5 bg-white border-gray-100 shadow-sm border border-gray-200 space-y-4 group hover:border-blue-500/40 transition-all">
                    <h5 className="text-sm font-arabic font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{link.title}</h5>
                    <p className="text-[11px] text-gray-600 leading-relaxed">{link.connection_logic}</p>
                    <div className="bg-gray-50 p-3 border-l-2 border-blue-500">
                       <span className="text-[8px] font-mono text-blue-600 uppercase block mb-2">LOOP_EXECUTION</span>
                       <p className="text-[11px] font-arabic text-gray-900/80 italic">"{link.loop_strategy}"</p>
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
          className="absolute inset-0 bg-white/80 backdrop-blur-md"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-xl bg-gray-50 border border-gray-200 p-8 shadow-2xl space-y-8 no-scrollbar overflow-y-auto max-h-[90vh]"
        >
          <div className="flex justify-between items-center border-b border-gray-200 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/10 text-blue-600">
                <Settings size={20} />
              </div>
              <h3 className="text-xl font-arabic font-black text-gray-900">إعدادات المحرك (Engine Settings)</h3>
            </div>
            <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-gray-900 transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white border-gray-100 shadow-sm border border-gray-200">
              <div className="space-y-1">
                <span className="text-sm font-arabic text-gray-900">استخدام Ollama محلياً</span>
                <p className="text-[10px] text-gray-500 font-mono">CONNECT_TO_LOCAL_AI_ENGINE</p>
              </div>
              <button 
                onClick={() => setUseOllama(!useOllama)}
                className={`w-12 h-6 rounded-full transition-all relative ${useOllama ? 'bg-blue-600' : 'bg-gray-100'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${useOllama ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            {useOllama && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pt-4 border-t border-gray-200"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Ollama_Endpoint_URL</label>
                  <input 
                    type="text" 
                    value={ollamaUrl} 
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    className="w-full bg-white shadow-sm border border-gray-200 p-3 text-gray-800 font-mono text-xs focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">AI_Model_Target</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {["gemma2:9b-instruct-q4_0", "gemma2:9b-instruct-q4_K_M", "llama3:8b", "mistral"].map(m => (
                      <button 
                         key={m} 
                         onClick={() => setOllamaModel(m)}
                         className={`px-2 py-1 text-[9px] font-mono border transition-all ${ollamaModel === m ? 'bg-blue-600 border-blue-500 text-black' : 'bg-white border-gray-100 shadow-sm border-gray-200 text-gray-600 hover:border-gray-300'}`}
                      >
                         {m.split(':')[0]}
                      </button>
                    ))}
                  </div>
                  <input 
                    type="text" 
                    value={ollamaModel} 
                    onChange={(e) => setOllamaModel(e.target.value)}
                    className="w-full bg-white shadow-sm border border-gray-200 p-3 text-gray-800 font-mono text-xs focus:border-blue-500 outline-none transition-all"
                    placeholder="e.g. gemma2:9b-instruct-q4_0"
                  />
                  <p className="text-[9px] text-blue-600/50 italic">Default: gemma2:9b-instruct-q4_0</p>
                </div>
              </motion.div>
            )}

            <div className="space-y-6 pt-6 border-t border-gray-200">
              <h4 className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Multi-Engine Protocols</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white border-gray-100 shadow-sm border border-gray-200">
                  <div className="space-y-1">
                    <span className="text-[11px] font-arabic text-gray-900">نظام التوزيع الذكي (Tag-Team)</span>
                    <p className="text-[9px] text-gray-500 font-mono">GEMINI_RESEARCH + OLLAMA_DRAFTING</p>
                  </div>
                  <button 
                    onClick={() => setIsTagTeam(!isTagTeam)}
                    className={`w-10 h-5 rounded-full transition-all relative ${isTagTeam ? 'bg-blue-600' : 'bg-gray-100'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isTagTeam ? 'left-5.5' : 'left-0.5'}`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white border-gray-100 shadow-sm border border-gray-200">
                  <div className="space-y-1">
                    <span className="text-[11px] font-arabic text-gray-900">درع الرصيد (Quota Shield)</span>
                    <p className="text-[9px] text-gray-500 font-mono">AUTO_FAILOVER_TO_OLLAMA_ON_GEMINI_LIMIT</p>
                  </div>
                  <button 
                    onClick={() => setIsQuotaShield(!isQuotaShield)}
                    className={`w-10 h-5 rounded-full transition-all relative ${isQuotaShield ? 'bg-blue-600' : 'bg-gray-100'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isQuotaShield ? 'left-5.5' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h4 className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">External_Voice_Engines</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">ElevenLabs_API_Key</label>
                  <input 
                    type="password" 
                    value={elevenLabsKey} 
                    onChange={(e) => setElevenLabsKey(e.target.value)}
                    className="w-full bg-white shadow-sm border border-gray-200 p-3 text-gray-800 font-mono text-xs focus:border-blue-500 outline-none transition-all"
                    placeholder="sk_..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">ElevenLabs_Voice_ID</label>
                  <input 
                    type="text" 
                    value={elevenLabsVoiceId} 
                    onChange={(e) => setElevenLabsVoiceId(e.target.value)}
                    className="w-full bg-white shadow-sm border border-gray-200 p-3 text-gray-800 font-mono text-xs focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setShowSettings(false)}
            className="w-full py-4 bg-blue-600 text-black font-arabic font-bold text-lg hover:bg-white transition-all shadow-lg shadow-blue-500/10"
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

        const response = await fetch("/api/audio/align", {
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
            if (data.opening_sketch.asset_id === sceneId) {
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

  const handleDownloadVoiceScript = () => {
    if (!finalVoiceScript) return;
    const blob = new Blob([finalVoiceScript], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(
      blob,
      `VoiceScript_${data?.video_title.replace(/\s+/g, "_") || "script"}.txt`,
    );
    notify.classified("DOWNLOAD_SUCCESS");
  };
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [globalEngine, setGlobalEngine] = useState<"gemini" | "ollama">(() => 
    (localStorage.getItem("globalEngine") as "gemini" | "ollama") || "gemini"
  );
  const [isTagTeam, setIsTagTeam] = useState(() => 
    localStorage.getItem("isTagTeam") === "true"
  );
  const [isQuotaShield, setIsQuotaShield] = useState(() => 
    localStorage.getItem("isQuotaShield") !== "false"
  );

  useEffect(() => {
    localStorage.setItem("globalEngine", globalEngine);
  }, [globalEngine]);

  useEffect(() => {
    localStorage.setItem("isTagTeam", String(isTagTeam));
  }, [isTagTeam]);

  useEffect(() => {
    localStorage.setItem("isQuotaShield", String(isQuotaShield));
  }, [isQuotaShield]);

  const mainAccent = globalEngine === "ollama" ? "#10B981" : "#3b82f6";
  const mainAccentLight = globalEngine === "ollama" ? "rgba(16, 185, 129, 0.2)" : "rgba(59, 130, 246, 0.2)";
  
  const [useOllama, setUseOllama] = useState(
    () => localStorage.getItem("useOllama") === "true",
  );
  const [ollamaUrl, setOllamaUrl] = useState(() => {
    const stored = localStorage.getItem("ollamaUrl");
    return stored && stored !== "http://127.0.0.1:11434"
      ? stored
      : "http://localhost:11434";
  });
  const [ollamaModel, setOllamaModel] = useState(
    () => localStorage.getItem("ollamaModel") || "gemma2:9b-instruct-q4_0",
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
        <SceneCard
          scene={data.opening_sketch}
          isOpening={true}
          onUpdate={handleOpeningSketchUpdate}
          onVSMode={() => handleVSMode(data.opening_sketch.asset_id)}
          onAcceptVersion={(version) => handleAcceptVersion(data.opening_sketch.asset_id, version)}
          isABTesting={isABTesting === data.opening_sketch.asset_id}
          audioUrl={sceneAudioUrls[data.opening_sketch.asset_id]}
          onRecord={() => startRecording(data.opening_sketch.asset_id)}
          onStopRecording={stopRecording}
          isRecording={isRecording === data.opening_sketch.asset_id}
          onMaster={() => handleMasterAudio(data.opening_sketch.asset_id)}
          copyToClipboard={(text) => copyToClipboard(text)}
          isProcessingAudio={isProcessingAudio}
        />
        {data.scenes.map((scene, i) => (
          <SceneCard
            key={scene.asset_id}
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
        ))}
      </div>
    );
  }, [data?.scenes, data?.opening_sketch, isRecording, isABTesting, isProcessingAudio, sceneAudioUrls]);

  const handleExportXML = () => {
    
    // A simplified FCP XML format (Premiere Pro compatible) to create sequences/placeholders
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xmeml>
<xmeml version="4">
  <project>
    <name>${data.video_title.replace(/[&<>"']/g, '')}</name>
    <children>
      <bin>
        <name>Barwaz Auto-Sequence</name>
        <children>
          <sequence>
            <name>${data.video_title.replace(/[&<>"']/g, '')} - Master</name>
            <duration>${data.scenes.length * 300}</duration>
            <rate>
              <timebase>25</timebase>
              <ntsc>FALSE</ntsc>
            </rate>
            <media>
              <video>
                <format>
                  <samplecharacteristics>
                    <rate><timebase>25</timebase><ntsc>FALSE</ntsc></rate>
                    <width>1920</width>
                    <height>1080</height>
                  </samplecharacteristics>
                </format>
                <track>
                  ${data.scenes.map((s, i) => `
                  <clipitem id="clipitem-${i}">
                    <name>Scene ${i + 1}: ${s.visual_cue.replace(/[&<>"']/g, '').substring(0, 50)}...</name>
                    <duration>300</duration>
                    <rate><timebase>25</timebase><ntsc>FALSE</ntsc></rate>
                    <in>0</in>
                    <out>300</out>
                    <start>${i * 300}</start>
                    <end>${(i + 1) * 300}</end>
                    <file id="file-${i}">
                      <name>Placeholder</name>
                      <media>
                        <video>
                          <duration>300</duration>
                        </video>
                      </media>
                    </file>
                  </clipitem>
                  `).join('')}
                </track>
              </video>
            </media>
          </sequence>
        </children>
      </bin>
    </children>
  </project>
</xmeml>`;

    const blob = new Blob([xml], { type: "text/xml;charset=utf-8" });
    saveAs(blob, `Barwaz_${data.video_title.replace(/\s+/g, "_")}.xml`);
    notify.classified("تم تصدير ملف XML بنجاح للمونتاج");
  };

    const handleExportDocx = async () => {
    if (!data || isExportingDocx) return;
    setIsExportingDocx(true);
    notify.classified("بدأ تصدير DOCX في الخلفية...");

    const worker = new DocxWorker();
    
    worker.onmessage = (e) => {
      const { success, blob, error } = e.data;
      if (success) {
        saveAs(blob, `Barwaz_Script_${data.video_title.replace(/\s+/g, "_")}.docx`);
        notify.classified("تم تصدير ملف DOCX بنجاح");
      } else {
        console.error("Worker Error: ", error);
        notify.breach("فشل في التصدير لـ DOCX");
      }
      setIsExportingDocx(false);
      worker.terminate();
    };

    worker.onerror = (err) => {
      console.error(err);
      notify.breach("فشل في التصدير لـ DOCX");
      setIsExportingDocx(false);
      worker.terminate();
    };

    // Pass data without parsing complex objects (functions/DOM nodes) to the worker
    worker.postMessage({
      video_title: data.video_title,
      mood: data.mood,
      finalVoiceScript,
      scenes: data.scenes || []
    });
  };

  const handleExportZip = async () => {
    if (!data || isExportingZip) return;
    setIsExportingZip(true);
    notify.classified("بدأ تجميع محرك الـ Omnichannel في الخلفية...");

    try {
      const worker = new ZipWorker();
      
      worker.onmessage = (e) => {
        const { success, blob, error } = e.data;
        if (success) {
          saveAs(blob, `Omnichannel_Barwaz_${data.video_title.replace(/[\s:]+/g, "_")}.zip`);
          notify.classified("تم تصدير حزمة الـ ZIP الشاملة بنجاح!");
        } else {
          console.error("Worker Error: ", error);
          notify.breach("فشل في بناء حزمة הZIP");
        }
        setIsExportingZip(false);
        worker.terminate();
      };

      worker.onerror = (err) => {
        console.error(err);
        notify.breach("فشل استدعاء محرك الـ Omnichannel (ZIP)");
        setIsExportingZip(false);
        worker.terminate();
      };

      worker.postMessage({
        data,
        exportType: "omni",
        finalVoiceScript
      });
    } catch(err) {
        console.error(err);
        notify.breach("Error");
        setIsExportingZip(false);
    }
  };

  const handleExportIntelligenceDocument = () => {
    if (!data) return;
    const doc = `
================================================================================
CONFIDENTIAL // LEAKED INTELLIGENCE DOCUMENT
PROJECT: BARWAZ_ARCHIVE_GATEWAY
TIMESTAMP: ${new Date().toISOString()}
TOPIC: ${data.video_title}
MOOD: ${data.mood}
STATUS: FINAL_ASSEMBLY
================================================================================

[EXECUTIVE SUMMARY]
${researchMap?.central_hypothesis || "No hypothesis generated."}

[CORE ARCHITECTURE]
${data.scenes.map((s, i) => `ACT ${i + 1}: ${s.asset_id}\nVO: ${s.voice_over}\nVISUAL: ${s.visual_cue}\n---`).join("\n\n")}

[RESEARCH VERIFICATION]
${data.audit_report?.executive_summary || "Pending search audit."}

[DISTRIBUTION CHANNELS]
X Thread: ${fragmenterData?.x_thread.join("\n\n") || "Not generated"}
TikTok Hook: ${fragmenterData?.tiktok_hook || "Not generated"}

[SOURCES]
${data.sources.map((s) => typeof s === "string" ? `- ${s}` : `- ${s.title}: ${s.url}`).join("\n")}

================================================================================
END OF DOCUMENT // NO UNAUTHORIZED DUPLICATION
================================================================================
    `;
    const blob = new Blob([doc], { type: "text/plain" });
    saveAs(blob, `CLASSIFIED_${data.video_title.replace(/\s+/g, "_")}.txt`);
    notify.classified("DOWNLOAD_SUCCESS");
  };

  const renderIntelGraph = (research: MasterOutline) => {
    return (
      <div className="relative w-full aspect-square bg-white border border-gray-200 overflow-hidden rounded-sm">
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
            className="fill-blue-500 font-mono font-black uppercase"
          >
            Core
          </text>

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
                  className="fill-white/5 stroke-white/20 stroke-1 hover:stroke-blue-500 transition-colors"
                />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dy=".3em"
                  fontSize="8"
                  className="fill-white/40 font-mono"
                >
                  0{i + 1}
                </text>
                <foreignObject x={x + 35} y={y - 20} width="100" height="40">
                  <div className="text-[8px] font-mono text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
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
        <div className="flex flex-col items-center justify-center py-6 gap-4">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <span className="text-micro font-mono text-gray-500 uppercase tracking-widest">
            Generating_Fragments
          </span>
        </div>
      );
    }
    if (!fragmenterData) return null;
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-[9px] font-mono text-cyan-400/50 uppercase tracking-widest flex items-center gap-2">
            <Share2 className="w-3 h-3" /> X_Thread_Structure
          </label>
          <div className="space-y-2">
            {fragmenterData.x_thread.map((post, i) => (
              <div
                key={i}
                className="p-4 bg-white border-gray-100 shadow-sm border border-gray-200 text-micro text-gray-600 leading-relaxed font-arabic relative"
              >
                <span className="absolute top-2 right-2 text-[8px] font-mono text-gray-500">
                  {i + 1}/7
                </span>
                {post}
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 bg-cyan-400/5 border border-cyan-400/20">
          <label className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest block mb-2 font-bold">
            TikTok_Hook
          </label>
          <p className="text-sm font-arabic text-gray-900/90 ">
            "{fragmenterData.tiktok_hook}"
          </p>
        </div>
      </div>
    );
  };
  const [isSaving, setIsSaving] = useState(false);
  const [isحفظd, setIsحفظd] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);

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
  const isSpinningRef = useRef(false);

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
    if (cooldown > 0) {
      notify.breach(`يرجى الانتظار ${cooldown} ثانية قبل المحاولة مرة أخرى`);
      isSpinningRef.current = false;
      return;
    }

    const cacheKey = topic.trim() ? `${topic.trim()}_${mood}` : null;
    if (cacheKey && titleCache[cacheKey]) {
      setSuggestedTitles(titleCache[cacheKey]);
      notify.classified("ARCHIVE_RESTORED");
      isSpinningRef.current = false;
      return;
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
        note,
        undefined,
        undefined,
        abortControllerRef.current.signal,
      );
      if (abortControllerRef.current?.signal.aborted) return;

      if (titles.length === 0) {
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
      setCooldown(30);
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
        errorMsg.includes("RESOURCE_EXHAUSTED") ||
        errorMsg.includes("عفواً");
      const isFailedProxy =
        errorMsg.includes("Failed to call") ||
        (!isApiKeysFailure &&
          (errorMsg.includes("500") || errorMsg.includes("6")));

      if (isApiKeysFailure) {
        notify.breach("فقد الاتصال بالمولد");
        setError(errorMsg.replace("Ollama Proxy Error: 500 -", "").trim());
      } else if (isQuota) {
        let waitSecs = "";
        const match = errorMsg.match(/429_all_keys_suspended:(\d+)/i);
        if (match && match[1]) waitSecs = ` (${match[1]} ثانية)`;
        
        notify.breach(`انتهى حد الاستخدام. يرجى الانتظار${waitSecs}.`);
        setError(`تجاوزت الحد المسموح. يرجى الانتظار${waitSecs}.`);
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
      const data = await sweepLiveTrends();
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
    setError("");
    setIsLoading(true);
    setProgress(0);
    setEstimatedTime(duration * 12); // rough estimate 12s per minute of video
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
      
      const effectiveNote = note + hookInstructionContext + tuningContext;

      if (isAutoPilot) {
        setStatus(
          `[OPERATION: ANALYSIS] // جاري استجواب البيانات وتحديد العقيدة الإخراجية للصورة...`,
        );
        try {
          const classification = await classifyTopic(
            selectedTitle,
            effectiveNote,
            undefined,
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

      if (duration >= 4) {
        setIsLongForm(true);
        setStatus(`[!] يتم الآن التنقيب في سجلات التحقيق...`);
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
              "[!] يتم الآن التنقيب في سجلات التحقيق...",
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
            activeMood,
            effectiveNote,
            undefined,
            undefined,
            abortControllerRef.current?.signal,
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
            opening_sketch: {
              asset_id: "",
              voice_over: "",
              visual_cue: "",
              montage_instructions: "",
              sound_design: "",
              image_prompt_nano_banana: "",
              ai_video_prompt: "",
            },
            scenes: [],
            sources: [],
            publishing_kit: {
              youtube_titles: [],
              thumbnail_prompt: "",
              description: "",
              tags: [],
            },
            shorts: [],
            audit_report: {
              status: "verified",
              executive_summary: "",
              issues: [],
            },
          });

          const result = await executePipeline_Orchestrator(
            selectedTitle,
            duration,
            effectiveNote,
            activeMood,
            activePersona,
            (p, s) => {
              targetProgress = Math.max(targetProgress, p);
              setStatus(`${s}`);
            },
            (scene) => {
              setData((prev: any) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  scenes: [...(prev.scenes || []), scene],
                };
              });
            },
            (text) => setStatus(`[SYSTEM] ${text}`),
            "gemini",
            "gemini",
            "gemini",
            narrativeStrategy,
            suspenseLevel
          );

          clearInterval(smoothProgressInterval);
          setProgress(100);
          setData(result);

          // Auto-generate fragments
          setIsGeneratingFragments(true);
          try {
            const fullScript = [
              result.opening_sketch.voice_over,
              ...result.scenes.map((s) => s.voice_over),
            ].join(" ");
            const { generateFragmenterContent } = await import("../lib/gemini");
            const fragments = await generateFragmenterContent(
              selectedTitle,
              activeMood,
              fullScript,
              useOllama ? "ollama" : "gemini",
            );
            setFragmenterData(fragments);
          } catch (e) {
            console.warn("Fragmenter failed", e);
          } finally {
            setIsGeneratingFragments(false);
          }

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
      const isApiKeysFailure =
        errorMsg.includes("فشل كلا المزودين") ||
        errorMsg.includes("المفتاح غير صالح");

      const isQuota =
        errorMsg.includes("429") ||
        errorMsg.toLowerCase().includes("quota") ||
        errorMsg.includes("RESOURCE_EXHAUSTED") ||
        errorMsg.includes("عفواً");
      const isFailedProxy =
        errorMsg.includes("Failed to call") ||
        (!isApiKeysFailure &&
          (errorMsg.includes("500") || errorMsg.includes("6")));

      if (isApiKeysFailure) {
        notify.breach("مشكلة في مفاتيح API");
        setError(errorMsg.replace("Ollama Proxy Error: 500 -", "").trim());
      } else if (isQuota) {
        let waitSecs = "";
        const match = errorMsg.match(/429_all_keys_suspended:(\d+)/i);
        if (match && match[1]) waitSecs = ` (${match[1]} ثانية)`;
        
        notify.breach(`انتهى حد الاستخدام المجاني حالياً. يرجى الانتظار${waitSecs}.`);
        setError(`تجاوزت الحد المجاني لموديل AI (Quota Exceeded)${waitSecs}.`);
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
          `[!] يتم تحميض أحداث الفصل ${i + 1} من ${researchMap.chapters.length}: ${researchMap.chapters[i].chapter_title}...`,
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
              abortControllerRef.current?.signal,
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
      setStatus("[!] يتم تجميع ملف القضية والأدلة النهائية...");
      setProgress(90);
      const packagingResult = await generatePackaging(
        researchMap.video_title,
        researchMap.research_data,
        mood,
        cumulativeScenes,
        globalEngine,
        undefined, // onChunk
        abortControllerRef.current?.signal,
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

      setStatus(
        "[!] محامي الشيطان: يتم الآن فحص المحتوى بحثاً عن أي ثغرات أو هلوسة...",
      );
      setProgress(85);
      const fullScriptForAudit = processedScenes
        .map((s) => s.voice_over)
        .join("\n");
      const auditReport = await auditScriptWithDevilsAdvocate(
        fullScriptForAudit,
        researchMap.research_data,
        mood,
      );

      const finalData: EpisodeData = {
        video_title: researchMap.video_title,
        thumbnail: researchMap.thumbnail
          ? {
              ...researchMap.thumbnail,
              image_prompt: applyGlobalStyle(
                researchMap.thumbnail.image_prompt || "",
              ),
              text_on_image: researchMap.thumbnail.text_on_image || "",
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
        scenes: (processedScenes || []).slice(1),
        sources: [...(researchMap.sources || []), ...allChapterSources],
        publishing_kit: packagingResult.packaging,
        shorts: packagingResult.shorts,
        audit_report: auditReport,
      };

      setData(finalData);

      try {
        const docRef = await addDoc(collection(db, "projects"), {
          title: finalData.video_title,
          topic,
          mood,
          persona,
          dataString: JSON.stringify(finalData),
          createdAt: serverTimestamp(),
        });
        console.log("Project saved to Firebase with ID: ", docRef.id);
      } catch (e) {
        console.error("Error saving to Firebase: ", e);
      }

      const allVoiceovers = [
        finalData.opening_sketch,
        ...(finalData.scenes || []),
      ]
        .map((s) => s.voice_over)
        .join("\n\n");
      setRawScriptText(allVoiceovers);
      const extracted = extractAndCleanScript(allVoiceovers);
      const optimized = convertToEgyptian(extracted);
      setFinalVoiceScript(optimized);

      // autoحفظDossier(finalData); removed

      setResearchMap(null);
      setActiveTab("script");
    } catch (err: any) {
      if (
        err.name === "AbortError" ||
        err.message === "AbortError" ||
        err.message?.toLowerCase().includes("abort")
      ) {
        notify.classified("تم إيقاف الإنشاء بناءً على طلبك");
        return;
      }
      hasErrorInApprove = true;
      const errorMsg = err.message || "";
      const isApiKeysFailure =
        errorMsg.includes("فشل كلا المزودين") ||
        errorMsg.includes("المفتاح غير صالح");

      const isQuota =
        errorMsg.includes("429") ||
        errorMsg.toLowerCase().includes("quota") ||
        errorMsg.includes("RESOURCE_EXHAUSTED") ||
        errorMsg.includes("عفواً");
      const isFailedProxy =
        errorMsg.includes("Failed to call") ||
        (!isApiKeysFailure &&
          (errorMsg.includes("500") || errorMsg.includes("6")));

      if (isApiKeysFailure) {
        notify.breach("مشكلة في مفاتيح API");
        setError(errorMsg.replace("Ollama Proxy Error: 500 -", "").trim());
      } else if (isQuota) {
        let waitSecs = "";
        const match = errorMsg.match(/429_all_keys_suspended:(\d+)/i);
        if (match && match[1]) waitSecs = ` (${match[1]} ثانية)`;
        
        notify.breach(`انتهى حد الاستخدام المجاني. يرجى الانتظار${waitSecs}.`);
        setError(`عفواً، انتهى حد الاستخدام المتاح حالياً. يرجى الانتظار${waitSecs}.`);
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

  const handleDownloadNote = async () => {
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

    const allScenes = [data.opening_sketch, ...(data.scenes || [])];
    for (const [index, scene] of allScenes.entries()) {
      content += `### 🎬 المشهد ${index === 0 ? "[00 - المقدمة والتمهيد]" : `[0${index}]`}\n`;
      content += `**🔖 Asset ID:** \`${scene.asset_id}\`\n`;
      if (scene.estimated_duration_seconds) {
        content += `**⏱️ المدة التقديرية:** ${scene.estimated_duration_seconds} ثانية\n`;
      } else {
        content += `**⏱️ المدة التقديرية:** ~${Math.ceil((scene.voice_over?.length || 100) / 15)} ثانية\n`;
      }
      content += `\n`;

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
      content += `\n\n`;
    }

    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    saveAs(blob, `Barwaz_Script_${data.video_title.replace(/\s+/g, "_")}.md`);
  };

  const handleGenerateAudioBatch = async () => {
    if (!data) return;
    setIsProcessingAudio(true);
    const elevenLabsKey = localStorage.getItem("elevenLabs_api_key");
    const elevenLabsVoiceId =
      localStorage.getItem("elevenLabs_voice_id") || "pNInz6obpgDQGcFmaJcg";
    if (!elevenLabsKey) {
      notify.breach("يرجى إدخال مفتاح ElevenLabs في الإعدادات");
      setIsProcessingAudio(false);
      return;
    }

    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const audioFolder = zip.folder("Voiceovers");
      const allScenes = [data.opening_sketch, ...(data.scenes || [])];
      let failCount = 0;

      for (const [index, scene] of allScenes.entries()) {
        let cleanText = scene.voice_over.replace(/\[صمت درامي\]/g, "... ");
        cleanText = cleanText.replace(/🔊/g, "");

        if (!cleanText.trim()) continue;

        try {
          const res = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}?output_format=mp3_44100_128`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "xi-api-key": elevenLabsKey,
              },
              body: JSON.stringify({
                text: cleanText,
                model_id: "eleven_multilingual_v2",
              }),
            },
          );
          if (!res.ok) throw new Error("API Error");

          const blob = await res.blob();
          const fileName = `Track_${index.toString().padStart(2, "0")}_${scene.asset_id.replace(/\W+/g, "_")}.mp3`;
          audioFolder?.file(fileName, blob);
        } catch (err) {
          console.error("Audio generation error:", err);
          failCount++;
        }
      }

      if (failCount === allScenes.length && allScenes.length > 0) {
        throw new Error("All audio requests failed.");
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(
        zipBlob,
        `Barwaz_Audio_${data.video_title.replace(/\s+/g, "_")}.zip`,
      );
      notify.classified("تم تصدير الملفات الصوتية بنجاح");
    } catch (err: any) {
      console.error(err);
      notify.breach("فشلت معالجة الصوت");
    } finally {
      setIsProcessingAudio(false);
    }
  };

  return (
    <div
      className="min-h-full flex flex-col font-arabic relative overflow-hidden bg-[#F8F9FA]"
      dir="rtl"
      onClick={playClick}
    >
      {/* SYSTEM PULSE (Kill Switch Visuals active/Background active) */}
      {isLoading && (
        <div className="fixed bottom-6 left-6 z-[200] pointer-events-none flex items-center gap-3 opacity-60">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
            راصد يحلل الآن...
          </span>
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none z-50 mix-blend-overlay opacity-10 bg-[url('https://www.transparenttextures.com/patterns/clean-textile.png')]" />

      {/* PIPELINE PROGRESS TRACKER */}
      <div className="fixed top-0 left-0 lg:left-64 right-0 z-[100] px-4 py-4 pointer-events-none transition-all duration-300">
        <div className="max-w-4xl mx-auto flex items-center justify-between pointer-events-auto bg-white/80 backdrop-blur-md border border-gray-200 p-3 rounded-2xl shadow-sm">
          <div className="flex items-center gap-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-3">
                <div 
                  className={`w-8 h-8 rounded-full border flex items-center justify-center font-mono text-xs font-bold transition-all duration-500 ${
                    pipelineStep === step 
                      ? "bg-blue-600 border-blue-600 text-gray-900 shadow-md scale-110" 
                      : pipelineStep > step 
                        ? "bg-blue-50 border-blue-200 text-blue-500" 
                        : "bg-gray-50 border-gray-200 text-gray-400"
                  }`}
                >
                  {step === 1 ? <Search size={14} /> : step === 2 ? <PenLine size={14} /> : <ImageIcon size={14} />}
                </div>
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider transition-opacity ${pipelineStep === step ? "opacity-100 text-blue-700" : "opacity-50 text-gray-400"}`}>
                  {step === 1 ? "رصد وبحث" : step === 2 ? "تأليف وسرد" : "إنتاج ووسائط"}
                </span>
                {step < 3 && <div className="w-10 h-[2px] bg-gray-200 mx-2" />}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 border-r border-gray-200 pr-4 mr-2">
             <button 
               onClick={() => setShowSettings(true)}
               className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors relative group"
             >
                <Settings size={18} />
                <div className="absolute top-full right-0 mt-2 p-2 bg-gray-800 rounded-md text-[10px] font-mono text-gray-100 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg">
                   إعدادات المحرك
                </div>
             </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA - PIPELINE ORIENTED */}
      <main className="flex-1 relative z-10 px-10 pt-32 pb-40 min-h-screen max-w-7xl mx-auto w-full">
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
              <div className="text-center space-y-4">
                <motion.h1 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-5xl lg:text-7xl font-arabic font-extrabold tracking-tight text-gray-900 mb-2"
                >
                  ماذا تريد أن تصنع اليوم؟
                </motion.h1>
                <p className="text-gray-400 font-mono text-sm max-w-2xl mx-auto uppercase tracking-widest font-semibold flex items-center justify-center gap-2">
                  <Database size={16} className="text-blue-500" /> Gathering Data for Archive
                </p>
              </div>

              {/* INPUT AREA */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <div className="space-y-8">
                  {/* EDIT AREA */}
                  <div className="bg-white border border-gray-200 rounded-3xl p-8 relative overflow-hidden shadow-sm">
                    <div className="relative z-10 space-y-6">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">Concept Input</label>
                        <div className="flex gap-2">
                           <button 
                            onClick={handleSweepNow}
                            disabled={isSweeping}
                            className="p-2 hover:bg-gray-50 border border-gray-100 rounded-lg transition-colors group/sweep"
                            title="Sweep Live Trends"
                          >
                            <TrendingUp className={`w-4 h-4 transition-colors ${isSweeping ? "animate-pulse text-blue-500" : "text-gray-400 group-hover/sweep:text-blue-600"}`} />
                          </button>
                        </div>
                      </div>

                      <div className="relative">
                        <textarea
                          placeholder="أدخل فكرتك هنا (أو ارفع ملف .docx ليتم استخراج النص تلقائياً...)"
                          className="w-full h-40 bg-gray-50 border border-gray-100 rounded-2xl p-6 text-xl lg:text-2xl font-arabic leading-relaxed text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none resize-none custom-scrollbar shadow-inner"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                        />
                        <Search className="absolute bottom-6 left-6 w-5 h-5 text-gray-400" />
                        <label className="absolute bottom-6 right-6 p-2 bg-white rounded-lg border border-gray-200 cursor-pointer shadow-sm hover:bg-gray-50 transition-colors" title="رفع ملف وورد (.docx)">
                          <FileText className="w-5 h-5 text-gray-400 hover:text-blue-600" />
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
                                      setTopic(prev => prev + (prev ? '\\n\\n' : '') + result.value);
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
                      </div>

                      <div className="flex flex-wrap gap-4 items-center">
                         <div className="flex-1">
                           <label className="text-[10px] font-mono text-gray-400 uppercase block mb-2 tracking-widest font-bold">Tactical Instruction</label>
                           <input 
                              type="text"
                              placeholder="إضافة ملاحظة للمحرك..."
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-arabic text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                           />
                         </div>
                         <div className="w-28">
                           <label className="text-[10px] font-mono text-gray-400 uppercase block mb-2 tracking-widest font-bold">Duration</label>
                           <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3">
                             <input 
                                type="number"
                                min="1"
                                max="60"
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                                className="w-full bg-transparent font-mono text-sm text-gray-900 font-bold outline-none text-center"
                             />
                             <span className="text-[10px] font-mono text-gray-400 uppercase font-bold">min</span>
                           </div>
                         </div>
                      </div>

                      <button
                        onClick={handleSpinRadar}
                        disabled={isGeneratingTitle}
                        className="w-full h-16 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-gray-900 font-arabic font-bold text-xl rounded-2xl flex items-center justify-center gap-3 transition-all relative overflow-hidden group/radar shadow-md shadow-blue-500/20"
                      >
                         {isGeneratingTitle ? (
                           <>
                             <Loader2 className="w-6 h-6 animate-spin" />
                             <span>جاري المسح...</span>
                           </>
                         ) : (
                           <>
                             <Radar className="w-6 h-6 group-hover/radar:animate-spin" />
                             <span>بناء القصة</span>
                           </>
                         )}
                      </button>
                    </div>
                  </div>

                  {/* SECTOR SELECTOR */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold px-2">Operational Sectors</label>
                    <div className="grid grid-cols-2 gap-4">
                      {sectors.map((sec) => (
                        <button
                          key={sec.id}
                          onClick={() => {
                            setSelectedSector(sec.id);
                            playClick();
                          }}
                          className={`p-6 text-right transition-all group relative overflow-hidden rounded-2xl border ${
                            selectedSector === sec.id 
                              ? "bg-white border-blue-500 shadow-sm" 
                              : "bg-gray-50 border-gray-100 hover:border-gray-200 hover:bg-white"
                          }`}
                        >
                          <div className={`p-2 rounded-xl inline-flex mb-4 transition-colors ${selectedSector === sec.id ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400 group-hover:text-gray-600"}`}>
                            <sec.icon className="w-6 h-6" />
                          </div>
                          <h3 className={`text-lg font-arabic font-bold block ${selectedSector === sec.id ? "text-gray-900" : "text-gray-500"}`}>{sec.name}</h3>
                          <p className="text-[10px] font-mono mt-1 tracking-widest font-bold uppercase text-gray-400">{sec.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* MOOD GRID */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                      <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">Select Narrative</label>
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold bg-white px-2 py-0.5 rounded-full border border-gray-100">{moods.filter(m => m.sector === selectedSector).length} FOUND</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {moods.filter(m => m.sector === selectedSector).map((m) => (
                        <button
                          key={m.type}
                          onClick={() => {
                            setMood(m.type);
                            setPersona(getPersonaForMood(m.type));
                            playClick();
                          }}
                          onPointerOver={() => playHover()}
                          className={`p-6 border text-right transition-all group relative rounded-2xl ${
                            mood === m.type 
                              ? "bg-white border-blue-500 shadow-sm ring-1 ring-blue-500" 
                              : "bg-gray-50 border-gray-100 hover:bg-white hover:border-gray-200"
                          }`}
                        >
                           <div className="flex flex-row-reverse items-center justify-between mb-4">
                             <div className={`p-2 rounded-xl border transition-colors ${mood === m.type ? "text-blue-600 border-blue-200 bg-blue-50" : "text-gray-400 bg-white border-gray-100 group-hover:text-gray-600"}`}>
                               <m.icon className="w-5 h-5" />
                             </div>
                             {mood === m.type && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
                           </div>
                           <h4 className={`text-base font-arabic font-bold transition-colors ${mood === m.type ? "text-gray-900" : "text-gray-500 group-hover/mood:text-gray-700"}`}>{m.type}</h4>
                           <p className="text-[11px] font-arabic text-gray-500 mt-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity h-0 group-hover:h-auto overflow-hidden">{m.description}</p>
                        </button>
                      ))}
                    </div>

                    {/* Visual DNA DNA Informant */}
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-blue-50/50 border-l-2 border-blue-500 p-6 mt-4 space-y-4 relative overflow-hidden rounded-xl"
                    >
                      <div className="absolute top-0 right-0 p-2 opacity-5">
                         <Fingerprint className="w-12 h-12 text-blue-900" />
                      </div>
                      <div className="flex items-center gap-2 text-blue-700">
                        <Activity className="w-4 h-4" />
                        <span className="text-[10px] font-mono uppercase tracking-[0.3em] font-bold">Visual DNA Report</span>
                      </div>
                      <div className="grid grid-cols-3 gap-6">
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono text-gray-400 uppercase block mb-1 font-bold">Style</span>
                          <span className="text-xs font-arabic text-gray-700 block font-semibold">{moods.find(m => m.type === mood)?.dna?.style || "Ink Sketch / Etching"}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono text-gray-400 uppercase block mb-1 font-bold">Canvas</span>
                          <span className="text-xs font-arabic text-gray-700 block font-semibold">{moods.find(m => m.type === mood)?.dna?.paper || "Aged Yellow Paper"}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono text-gray-400 uppercase block mb-1 font-bold">Localization IQ</span>
                          <span className="text-xs font-arabic text-blue-600 block font-bold">نشط (Active)</span>
                        </div>
                      </div>
                      <p className="text-[10px] font-arabic text-gray-500 leading-relaxed border-t border-blue-100/50 pt-4">
                        [!] يتم دمج "البصمة المصرية" أوتوماتيكياً في كل الصور. النظام يحلل العصر ويعدل الملامح والخلفيات لتناسب الهوية العربية دون تدخل يدوي.
                      </p>
                    </motion.div>
                  </div>

                  {/* RADAR SUGGESTIONS - RESULTS FOR STEP 1 */}
                  {suggestedTitles.length > 0 && (
                    <motion.div 
                      key="suggestions"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6 pt-6 border-t border-gray-100"
                    >
                      <div className="flex justify-between items-center px-2">
                        <label className="text-[10px] font-mono text-blue-600 uppercase tracking-widest font-bold flex items-center gap-2">
                          <Activity className="w-4 h-4" /> Radar Targets Found
                        </label>
                        {suggestedTitles.length > 1 && (
                          <button 
                            onClick={handleMergeTitles}
                            className="text-[9px] font-mono text-gray-400 hover:text-blue-600 uppercase flex items-center gap-2 transition-colors font-bold bg-white px-3 py-1 rounded-full border border-gray-100 hover:border-blue-200"
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
                            className="w-full text-right p-6 bg-white border border-gray-100 rounded-2xl hover:border-blue-300 hover:shadow-md transition-all group relative overflow-hidden"
                          >
                            <div className="flex gap-4 items-center flex-row-reverse">
                              <span className="text-xl font-mono text-gray-200 group-hover:text-blue-200 transition-colors font-bold">0{i+1}</span>
                              <div className="flex-1 space-y-1">
                                <h5 className="text-lg font-arabic font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{st.title}</h5>
                                <p className="text-xs font-arabic text-gray-500 leading-relaxed max-w-xl">"{st.hook || st.hook_instruction}"</p>
                              </div>
                              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors -rotate-180" />
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
                   className="absolute inset-0 border-[2px] border-dashed border-gray-300 rounded-full" 
                 />
                 <motion.div 
                   animate={{ rotate: -360 }}
                   transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                   className="absolute inset-6 border-[1px] border-blue-500/50 rounded-full" 
                 />
                 <Activity className="w-8 h-8 text-blue-600 animate-pulse relative z-10" />
               </div>
               
               <div className="text-center space-y-3">
                 <h3 className="text-2xl font-arabic font-bold text-gray-900 tracking-tight">يتم معايرة بوصلة السرد...</h3>
                 <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">Initializing Narrative Core</p>
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
               <div className="bg-white border border-gray-200 rounded-3xl min-h-[600px] p-8 lg:p-12 relative overflow-hidden shadow-sm">
                  {/* Neon scanline for active production */}
                  {isLoading && <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-600/30 shadow-md shadow-blue-500/20 animate-scan z-20" />}
                  
                  {error ? (
                    <div className="flex flex-col items-center justify-center min-h-[500px] space-y-8 animate-in fade-in duration-500">
                      <div className="relative">
                        <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />
                        <AlertTriangle className="w-24 h-24 text-red-500 relative z-10 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                      </div>
                      
                      <div className="text-center space-y-4 max-w-2xl bg-red-950/30 p-10 border border-red-500/30 relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 bg-red-950 border border-red-500/30 text-[10px] font-mono text-red-400 uppercase tracking-[0.4em]">SYSTEM_ERROR</div>
                        <h3 className="text-3xl font-arabic font-black text-gray-900 leading-tight">عطل في غرفة العمليات</h3>
                        <p className="text-red-300/80 font-arabic text-lg leading-relaxed">{error}</p>
                      </div>

                      <button 
                        onClick={() => {
                          setError("");
                          if (researchMap) {
                            handleApproveResearchMap();
                          } else if (selectedAngle) {
                            handleGenerateEpisode(selectedAngle.title, selectedAngle.hook, selectedAngle.title);
                          }
                        }}
                        className="px-12 py-5 bg-red-600/10 border border-red-500/50 text-gray-900 hover:bg-red-500 hover:text-black font-arabic font-bold text-xl uppercase tracking-widest group transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_40px_rgba(239,68,68,0.6)]"
                      >
                        <RefreshCcw className="w-6 h-6 inline ml-3 transition-transform group-hover:rotate-180" />
                        إعادة المحاولة
                      </button>
                    </div>
                  ) : isLoading ? (
                    <div className="flex flex-col items-center justify-center min-h-[500px] space-y-12">
                       <div className="relative w-64 h-64 flex items-center justify-center">
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border-[3px] border-dashed border-blue-500/10 rounded-full" 
                          />
                          <motion.div 
                            animate={{ rotate: -360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-8 border border-gray-200 rounded-full" 
                          />
                          <div className="relative z-10 flex flex-col items-center gap-4">
                            <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
                            <span className="text-[12px] font-mono text-blue-600 font-black">{progress}%</span>
                          </div>
                       </div>

                       <div className="text-center space-y-6 max-w-2xl bg-white shadow-sm p-10 border border-gray-200 relative">
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 bg-white border border-gray-200 text-[9px] font-mono text-gray-500 uppercase tracking-[0.4em]">SYSTEM_LOG</div>
                          <h3 className="text-3xl font-arabic font-black text-gray-900 leading-tight">{status}</h3>
                          <p className="text-gray-600 font-arabic text-lg leading-relaxed italic">"{loadingTip}"</p>
                          
                          <div className="w-full bg-white border-gray-100 shadow-sm h-1.5 mt-8 rounded-full overflow-hidden border border-gray-200 p-[1px]">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              className="h-full bg-blue-600 shadow-md shadow-blue-500/20"
                            />
                          </div>
                          
                          <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 uppercase tracking-widest pt-4">
                            <span>Estimating: ~{estimatedTime}s</span>
                            <span className="animate-pulse">Active_Processing...</span>
                          </div>
                       </div>

                       <button 
                        onClick={handleStopGeneration}
                        className="px-10 py-5 border border-red-500/10 text-red-500/40 hover:text-red-500 hover:bg-red-500/5 transition-all font-mono text-[10px] uppercase tracking-[0.5em] group"
                       >
                         <Skull className="w-4 h-4 inline mr-2 transition-transform group-hover:rotate-12" />
                         Abort_Operation
                        </button>
                     </div>
                  ) : researchMap && !data ? (
                    <div className="space-y-12 animate-in fade-in zoom-in-95 duration-700">
                      <div className="text-center space-y-6">
                        <h2 className="text-4xl lg:text-5xl font-arabic font-extrabold text-gray-900 tracking-tight leading-tight">اعتماد الخريطة البحثية</h2>
                        <p className="text-gray-500 font-arabic text-lg font-semibold">الذكاء الاصطناعي أتم رسم مسار القضية. تفقد الفصول قبل بدء التصنيع.</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {researchMap.chapters?.map((chapter, idx) => (
                          <div key={idx} className="bg-white border border-gray-100 p-6 space-y-4 hover:border-blue-300 transition-colors group rounded-2xl shadow-sm">
                            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                              <span className="text-blue-500 font-mono font-bold text-2xl">0{idx + 1}</span>
                              <h3 className="text-xl font-arabic font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{chapter.chapter_title}</h3>
                            </div>
                            <p className="text-gray-600 font-arabic text-sm leading-relaxed font-semibold">{chapter.core_premise}</p>
                            <div className="mt-4 flex flex-col gap-2">
                              {chapter.key_revelations?.map((rev, revIdx) => (
                                <div key={revIdx} className="flex gap-2 items-start text-xs font-arabic text-gray-400 font-semibold">
                                  <div className="w-1.5 h-1.5 bg-blue-200 rounded-full mt-1.5 shrink-0" />
                                  <span>{rev}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-col lg:flex-row gap-6 justify-center items-center pt-8 border-t border-gray-100">
                        <button
                          onClick={handleApproveResearchMap}
                          className="w-full lg:w-auto px-16 py-6 bg-blue-600 hover:bg-blue-700 text-gray-900 font-arabic font-bold text-2xl uppercase tracking-widest transition-all duration-300 rounded-2xl shadow-md hover:-translate-y-1"
                        >
                          اعتماد وبدء المعالجة
                        </button>
                        
                        <button
                          onClick={() => setPipelineStep(1)}
                          className="w-full lg:w-auto px-10 py-6 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-arabic font-bold items-center justify-center transition-all duration-300 flex rounded-2xl shadow-sm"
                        >
                          تعديل يدوي للمسار
                        </button>
                      </div>
                    </div>
                  ) : data ? (
                    <div className="space-y-16 animate-in fade-in zoom-in-95 duration-700">
                      
                      {/* DASHBOARD HEADER */}
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 pb-12 border-b border-gray-100">
                        <div className="space-y-4 text-right flex-1">
                          <div className="flex items-center justify-end gap-4">
                            <span className="px-3 py-1 bg-blue-50 border border-blue-100 text-blue-600 text-[9px] font-mono uppercase tracking-widest font-bold rounded-full">Operation Complete</span>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)] animate-pulse" />
                          </div>
                          <h1 className="text-5xl lg:text-7xl font-arabic font-extrabold text-gray-900 tracking-tight leading-tight drop-shadow-sm">
                            {data.video_title}
                          </h1>
                        </div>
                        
                        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                          <button
                            onClick={handleExportDocx}
                            disabled={isExportingDocx}
                            className={`flex-1 lg:flex-none px-6 py-4 border border-gray-200 font-mono text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-3 transition-all rounded-xl shadow-sm ${isExportingDocx ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md'}`}
                            title="تصدير النص النهائي للتدوين"
                          >
                            {isExportingDocx ? <Loader2 size={16} className="animate-spin text-gray-400" /> : <FileText size={16} className="text-gray-700" />}
                            {isExportingDocx ? "GENERATING..." : "DOCX"}
                          </button>
                          <button
                            onClick={handleExportXML}
                            className="flex-1 lg:flex-none px-6 py-4 bg-white border border-gray-200 text-gray-700 font-mono text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-3 transition-all rounded-xl shadow-sm hover:bg-gray-50 hover:shadow-md"
                            title="تصدير تايم لاين أدوبي بريمير"
                          >
                            <Scissors size={16} className="text-gray-700" />
                            Premiere XML
                          </button>
                          
                          <button
                            onClick={handleExportZip}
                            disabled={isExportingZip}
                            className={`col-span-full lg:col-auto px-6 py-4 font-mono text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-3 transition-all rounded-xl shadow-sm ${isExportingZip ? 'bg-gray-800 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-gray-900 to-black text-[#f4eee0] hover:shadow-lg hover:brightness-110 active:scale-95'}`}
                            title="تحميل جميع المواد الشاملة (سكريبت، يوتيوب، شورتس، إكس، סشوشيال ميديا)"
                          >
                            {isExportingZip ? <Loader2 size={16} className="animate-spin text-gray-400" /> : <Archive size={16} className="text-[#f4eee0]" />}
                            {isExportingZip ? "ARCHIVING..." : "PRODUCTION OMNI.ZIP"}
                          </button>
                          <button
                            onClick={handleExportIntelligenceDocument}
                            className="flex-1 lg:flex-none px-6 py-4 bg-white border border-gray-200 text-gray-700 font-mono text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all rounded-xl shadow-sm"
                          >
                            <Download size={16} className="text-gray-500" />
                            TXT Intel
                          </button>
                          <button
                            onClick={() => {
                              window.scrollTo({ top: 0, behavior: "smooth" });
                              const currentData = { ...data };
                              setArchive((prev) => [currentData, ...prev]);
                              setIsحفظd(true);
                              notify.classified("تم أرشفة التقرير في السجلات");
                            }}
                            disabled={isحفظd}
                            className={`flex-1 lg:flex-none px-8 py-4 ${isحفظd ? "bg-green-50 text-green-600 border-green-200" : "bg-blue-600 text-gray-900 border-blue-600 hover:bg-blue-700 active:scale-95"} border text-[10px] font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all rounded-xl shadow-sm`}
                          >
                            <Save size={16} />
                            {isحفظd ? "Archived" : "Archive Result"}
                          </button>
                        </div>
                      </div>

                      {/* TABS NAVIGATION */}
                      <div className="flex gap-8 border-b border-gray-100 overflow-x-auto no-scrollbar">
                        {["script", "kit", "shorts", "audit", "echo"].map(tab => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`pb-4 px-6 text-[10px] font-mono uppercase tracking-widest font-bold transition-all relative shrink-0 ${activeTab === tab ? "text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
                          >
                            {activeTab === tab && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600 rounded-t-full shadow-[0_-5px_15px_rgba(37,99,235,0.2)]" />}
                            {tab === "script" ? "01 Script Core" : tab === "kit" ? "02 Visual Identity" : tab === "shorts" ? "03 Social Fragments" : tab === "audit" ? "04 Audit Radar" : "05 Echo Chamber"}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        {/* MAIN TAB CONTENT */}
                        <div className="lg:col-span-8 space-y-12">
                          <AnimatePresence mode="wait">
                            {activeTab === "script" && (
                              <motion.div 
                                key="ts-script"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="space-y-12"
                              >
                                 <div className="bg-white border border-gray-200 p-10 space-y-8 relative overflow-hidden rounded-3xl shadow-sm">
                                    <div className="flex justify-between items-center bg-gray-50 p-4 -mt-10 -mx-10 border-b border-gray-100 mb-8 rounded-t-3xl">
                                       <span className="text-[10px] font-mono text-blue-600 uppercase tracking-widest font-black">Master Vocal Profile</span>
                                       <div className="flex gap-4">
                                          <button onClick={() => setShowTeleprompter(true)} className="w-10 h-10 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-gray-900 transition-colors text-gray-400 bg-white shadow-sm" title="Teleprompter Mode">
                                            <Eye size={16} />
                                          </button>
                                          <button onClick={handlePlayVoice} className="w-10 h-10 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-400 bg-white shadow-sm">
                                            {isPlayingVoice ? <Square size={14} className="fill-current" /> : <Volume2 size={16} />}
                                          </button>
                                          <button onClick={() => copyToClipboard(finalVoiceScript)} className="w-10 h-10 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-400 bg-white shadow-sm">
                                            <Copy size={16} />
                                          </button>
                                       </div>
                                    </div>

                                    <div className="flex gap-4">
                                       <div className="flex-1 relative text-right" dir="rtl">
                                          <div className="tiptap-editor-wrapper text-right">
                                            <EditorContent editor={editor} className="w-full min-h-[600px] bg-transparent text-xl lg:text-3xl font-arabic leading-[2.5] text-gray-800 p-0 outline-none focus:text-gray-900 transition-colors custom-scrollbar border-0" dir="rtl" />
                                          </div>
                                       </div>
                                       
                                       {/* SOURCE MARGIN */}
                                       <div className="w-64 shrink-0 border-r border-gray-200 pr-6 hidden xl:block overflow-hidden relative" dir="ltr">
                                          <div className="sticky top-0 space-y-6">
                                             <h4 className="text-[9px] font-mono text-blue-600 uppercase tracking-widest border-b border-gray-100 pb-2 text-left font-bold">Verified Sources</h4>
                                             <div className="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar">
                                                {data.sources.map((src, i) => {
                                                   const s = typeof src === 'string' ? { title: src, url: '#' } : src;
                                                   return (
                                                      <div key={i} className="space-y-1 group text-left">
                                                         <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest block font-bold">[SOURCE {i+1}]</span>
                                                         <a 
                                                           href={s.url} 
                                                           target="_blank" 
                                                           rel="noopener noreferrer" 
                                                           className="text-[10px] font-arabic text-gray-600 group-hover:text-blue-600 transition-colors leading-relaxed block font-semibold"
                                                         >
                                                           {s.title}
                                                         </a>
                                                      </div>
                                                   )
                                                })}
                                                {data.sources.length === 0 && (
                                                  <span className="text-[9px] font-mono text-gray-400 italic">No citations found.</span>
                                                )}
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                    
                                    <div className="flex gap-10 pt-8 border-t border-gray-100 overflow-hidden">
                                       <div className="space-y-1">
                                          <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest block font-bold">Words Total</span>
                                          <span className="text-xl font-mono text-gray-900 font-bold">{finalVoiceScript.split(/\s+/).length}</span>
                                       </div>
                                       <div className="space-y-1">
                                          <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest block font-bold">Time Est</span>
                                          <span className="text-xl font-mono text-gray-900 font-bold">{Math.ceil(finalVoiceScript.split(/\s+/).length / 140)}m</span>
                                       </div>
                                       <div className="space-y-1">
                                          <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest block font-bold">Auditory Sync</span>
                                          <span className="text-xs font-mono text-green-600 flex items-center gap-2 font-bold uppercase"><CheckCircle2 size={12} /> SECURED</span>
                                       </div>
                                    </div>
                                 </div>

                                 {/* SCENE BLOCKS */}
                                 <div className="space-y-8">
                                    <h3 className="text-sm font-mono text-gray-400 uppercase tracking-widest flex items-center gap-3 font-bold">
                                      <Layers size={16} /> Assembly Instruction Set
                                    </h3>
                                    {renderSceneCards}
                                 </div>
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
                                        <h3 className="text-[10px] font-mono text-blue-600 uppercase tracking-[0.5em] font-black">Unified_Feed_Array</h3>
                                        <button onClick={() => setFragmenterData(null)} className="text-[9px] font-mono text-gray-500 hover:text-red-500 uppercase">Regenerate</button>
                                     </div>
                                     {renderFragmenterUI()}
                                  </div>
                                ) : (
                                  <div className="p-20 bg-white border-gray-100 shadow-sm border border-dashed border-gray-200 flex flex-col items-center justify-center gap-6 text-center">
                                     <Zap size={40} className="text-blue-600 animate-pulse" />
                                     <div className="space-y-2">
                                        <h4 className="text-xl font-arabic font-bold text-gray-900">تحميض السوشيال ميديا</h4>
                                        <p className="text-sm font-arabic text-gray-500 max-w-sm">تحويل المسودة الطويلة إلى ضربات مركزة (Twitter Threads, TikTok Scripts)</p>
                                     </div>
                                     <button 
                                      onClick={async () => {
                                        setIsGeneratingFragments(true);
                                        try {
                                           const script = [data.opening_sketch.voice_over, ...data.scenes.map(s => s.voice_over)].join("\n\n");
                                           const packResult = await generatePackaging(data.video_title, script, mood, data.scenes);
                                           setFragmenterData(packResult.packaging);
                                        } catch (e) {
                                          notify.breach("Fragmentation Failed");
                                        } finally {
                                          setIsGeneratingFragments(false);
                                        }
                                      }}
                                      disabled={isGeneratingFragments}
                                      className="px-10 py-4 bg-white text-black font-mono text-[10px] uppercase font-black hover:bg-blue-600 transition-colors"
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
                           <div className="bg-white shadow-sm border border-gray-200 p-8 space-y-8 ">
                              <div className="flex gap-1 p-1 bg-white border-gray-100 shadow-sm border border-gray-200">
                                 {["audit", "map", "assets"].map(tab => (
                                   <button 
                                    key={tab} 
                                    onClick={() => setIntelTab(tab as any)}
                                    className={`flex-1 py-3 text-[9px] font-mono uppercase tracking-[0.2em] font-black transition-all ${intelTab === tab ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-600"}`}
                                   >
                                     {tab === "audit" ? "Fact_Audit" : tab === "map" ? "Network" : "Vault"}
                                   </button>
                                 ))}
                              </div>

                              <AnimatePresence mode="wait">
                                {intelTab === "audit" && (
                                  <motion.div key="it-audit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                     <div className="p-5 bg-green-500/5 border border-green-500/10 text-right">
                                        <p className="text-xs font-arabic text-green-500/80 leading-relaxed">
                                          {data.audit_report.executive_summary}
                                        </p>
                                     </div>
                                     <div className="space-y-3">
                                        {data.audit_report.issues.map((issue, i) => (
                                          <div key={i} className="flex flex-row-reverse gap-4 p-4 border border-gray-200 bg-white border-gray-100 shadow-sm items-start">
                                            {issue.severity === "high" ? <AlertTriangle size={14} className="text-red-500 shrink-0" /> : <CheckCircle2 size={14} className="text-blue-600 shrink-0" />}
                                            <p className="text-[11px] font-arabic text-gray-600 text-right leading-relaxed">{issue.description}</p>
                                          </div>
                                        ))}
                                     </div>
                                  </motion.div>
                                )}

                                {intelTab === "map" && (
                                  <motion.div key="it-map" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                     {researchMap ? renderIntelGraph(researchMap) : (
                                       <div className="aspect-square bg-white border-gray-100 shadow-sm border border-dashed border-gray-200 flex items-center justify-center">
                                          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                                       </div>
                                     )}
                                     <div className="space-y-3 pt-4 border-t border-gray-200">
                                        <span className="text-[8px] font-mono text-gray-500 uppercase block mb-3">Origin_Sources</span>
                                        {data.sources.slice(0, 5).map((s, i) => (
                                          typeof s !== "string" && s.url ? (
                                            <a key={i} href={s.url} target="_blank" className="flex flex-row-reverse justify-between items-center p-3 bg-white border-gray-100 shadow-sm hover:bg-blue-600/5 transition-colors group">
                                              <span className="text-[10px] font-arabic text-gray-600 group-hover:text-gray-900 truncate max-w-[150px]">{s.title}</span>
                                              <ExternalLink size={10} className="text-gray-500 group-hover:text-blue-600" />
                                            </a>
                                          ) : (
                                            <div key={i} className="flex flex-row-reverse items-center p-3 bg-white border-gray-100 shadow-sm">
                                              <span className="text-[10px] font-arabic text-gray-600 truncate">{typeof s === "string" ? s : s.title}</span>
                                            </div>
                                          )
                                        ))}
                                     </div>
                                  </motion.div>
                                )}

                                {intelTab === "assets" && (
                                  <motion.div key="it-assets" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                     <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-white border-gray-100 shadow-sm border border-gray-200 space-y-1">
                                           <span className="text-[8px] font-mono text-gray-500 uppercase block">Prompts</span>
                                           <span className="text-lg font-mono text-gray-900 font-bold">{data.scenes.length + 1}</span>
                                        </div>
                                        <div className="p-4 bg-white border-gray-100 shadow-sm border border-gray-200 space-y-1">
                                           <span className="text-[8px] font-mono text-gray-500 uppercase block">B-Roll</span>
                                           <span className="text-lg font-mono text-gray-900 font-bold">DETECTED</span>
                                        </div>
                                     </div>
                                     <button 
                                      onClick={handleExportZip}
                                      disabled={isExportingZip}
                                      className={`w-full py-6 font-mono text-[11px] font-black uppercase flex items-center justify-center gap-3 transition-all group ${isExportingZip ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-50'}`}
                                     >
                                       {isExportingZip ? <Loader2 size={16} className="animate-spin text-gray-400" /> : <Download size={16} className="text-gray-900 group-hover:-translate-y-0.5 transition-transform" />}
                                       {isExportingZip ? "ARCHIVING..." : "Deploy_Asset_Package (OMNI.ZIP)"}
                                     </button>
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
                           </AnimatePresence>

                           {/* TENSION / PACING MONITOR */}
                           <div className="bg-white shadow-sm border border-gray-200 p-8 space-y-6  overflow-hidden relative">
                              <div className="absolute top-0 left-0 w-full h-[3px]">
                                {renderTensionHeatmap()}
                              </div>
                              <div className="flex justify-between items-center pt-2">
                                 <span className="text-[9px] font-mono text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2 italic">
                                    <Activity size={12} className="text-red-500 animate-pulse" /> Emotional_Pacing
                                 </span>
                                 <span className="text-[9px] font-mono text-gray-400 uppercase">Live_Analysis</span>
                              </div>
                              
                              <div className="flex items-end gap-[2px] h-20 w-full pt-4">
                                {tensionPoints.map((p, i) => (
                                  <motion.div 
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${p * 100}%` }}
                                    className={`flex-1 ${p > 0.7 ? "bg-red-500" : p > 0.4 ? "bg-blue-600" : "bg-gray-100"}`}
                                  />
                                ))}
                              </div>
                              <div className="flex justify-between text-[8px] font-mono text-gray-400 uppercase">
                                 <span>Intro</span>
                                 <span>Crescendo</span>
                                 <span>Coda</span>
                              </div>
                           </div>
                         </div>

                         {/* DIRECTOR OVERRIDE SIDEBAR (lg:col-span-4) */}
                         <div className="lg:col-span-4 space-y-8">
                           <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm space-y-8 sticky top-12">
                             <div className="flex items-center gap-3 border-b border-gray-100 pb-4 flex-row-reverse">
                               <Sliders className="w-5 h-5 text-blue-600" />
                               <h3 className="text-xl font-arabic font-bold text-gray-900 w-full text-right">قائمة المخرج</h3>
                             </div>

                             <div className="space-y-6">
                               <div className="space-y-3">
                                  <div className="flex justify-between items-center text-right">
                                    <span className="text-sm font-mono text-blue-600 font-bold">{suspenseLevel}/10</span>
                                    <span className="text-xs font-mono text-gray-500 uppercase tracking-widest font-bold">Calibration: Suspense</span>
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
                                     className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600 relative z-10"
                                    />
                                  </div>
                                  <div className="flex justify-between text-[10px] font-arabic font-bold text-gray-400">
                                    <span>هادئ وتحليلي</span>
                                    <span>تشويق وأدرينالين</span>
                                  </div>
                               </div>

                               <div className="space-y-4 pt-4 border-t border-gray-100 flex flex-col text-right">
                                 <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold block w-full text-right">Operational Strategy</label>
                                 <div className="grid grid-cols-2 gap-3">
                                    <button 
                                     onClick={() => setNarrativeStrategy("HCS")}
                                     className={`p-4 text-center border transition-all relative overflow-hidden group rounded-xl ${narrativeStrategy === "HCS" ? "bg-white border-blue-500 shadow-sm" : "bg-gray-50 border-gray-100 hover:border-gray-200"}`}
                                    >
                                       <span className={`text-[9px] font-mono uppercase block mb-1 font-bold ${narrativeStrategy === "HCS" ? "text-blue-600" : "text-gray-400"}`}>Phase 01</span>
                                       <h4 className={`text-sm font-arabic font-bold ${narrativeStrategy === "HCS" ? "text-gray-900" : "text-gray-500"}`}>تحليل الوثائق</h4>
                                    </button>
                                    <button 
                                     onClick={() => setNarrativeStrategy("HAP")}
                                     className={`p-4 text-center border transition-all relative overflow-hidden group rounded-xl ${narrativeStrategy === "HAP" ? "bg-white border-blue-500 shadow-sm" : "bg-gray-50 border-gray-100 hover:border-gray-200"}`}
                                    >
                                       <span className={`text-[9px] font-mono uppercase block mb-1 font-bold ${narrativeStrategy === "HAP" ? "text-blue-600" : "text-gray-400"}`}>Phase 02</span>
                                       <h4 className={`text-sm font-arabic font-bold ${narrativeStrategy === "HAP" ? "text-gray-900" : "text-gray-500"}`}>تشويق درامي</h4>
                                    </button>
                                 </div>
                               </div>

                               <button
                                 onClick={() => {
                                   if(selectedAngle) {
                                      handleGenerateEpisode(selectedAngle.title, selectedAngle.hook, selectedAngle.title);
                                      window.scrollTo({ top: 0, behavior: "smooth" });
                                   }
                                 }}
                                 className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-arabic font-bold text-xl flex items-center justify-center gap-3 flex-row-reverse transition-all shadow-md shadow-blue-500/20 group mt-6 active:scale-95 rounded-xl uppercase tracking-wider"
                               >
                                 <RefreshCcw className="w-5 h-5 group-hover:-rotate-180 transition-transform duration-500" />
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
      <footer className="fixed bottom-0 left-0 w-full z-[150] px-10 py-6 border-t border-gray-200 bg-white/80 backdrop-blur-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-10 flex-row-reverse">
           <div className="flex gap-4 items-center flex-row-reverse">
              <div className="p-2 border border-gray-200 bg-white">
                {moods.find(m => m.type === mood)?.icon && React.createElement(moods.find(m => m.type === mood)!.icon, { size: 14, className: "text-blue-600" })}
              </div>
              <div>
                <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-0.5">Narrative_Vector</p>
                <p className="text-xs font-arabic text-gray-900 font-bold leading-none">{mood}</p>
              </div>
           </div>
           
           <div className="w-[1px] h-8 bg-white border-gray-100 shadow-sm" />
           
           <div className="flex gap-4 items-center flex-row-reverse">
              <div className="p-2 border border-gray-200 bg-white">
                <User size={14} className="text-cyan-400" />
              </div>
              <div>
                <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-0.5">Vocal_DNA</p>
                <p className="text-xs font-arabic text-gray-900 font-bold leading-none">{persona}</p>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-6">
           {pipelineStep > 1 && !isLoading && (
              <button 
                onClick={() => setPipelineStep(prev => (prev - 1) as any)}
                className="group px-8 py-4 border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 font-mono text-[10px] uppercase transition-all flex items-center gap-3 active:scale-95"
              >
                <ChevronLeft size={14} className="transition-transform group-hover:-translate-x-1" />
                Previous_Phase
              </button>
           )}
           
           <div className="flex items-center gap-4 px-6 py-4 bg-white border-gray-100 shadow-sm border border-gray-200 whitespace-nowrap">
              <div className="flex items-center gap-2">
                 <button 
                  onClick={() => setGlobalEngine("gemini")}
                  className={`p-1.5 border transition-all ${globalEngine === "gemini" ? 'border-[#3b82f6] bg-[#3b82f6]/10 text-[#3b82f6]' : 'border-gray-200 text-gray-500 hover:text-gray-600'}`}
                  title="Cloud Engine (Gemini)"
                 >
                   <Zap size={14} />
                 </button>
                 <button 
                  onClick={() => setGlobalEngine("ollama")}
                  className={`p-1.5 border transition-all ${globalEngine === "ollama" ? 'border-[#10B981] bg-[#10B981]/10 text-[#10B981]' : 'border-gray-200 text-gray-500 hover:text-gray-600'}`}
                  title="Local Engine (Ollama)"
                 >
                   <Database size={14} />
                 </button>
              </div>

              <div className="w-[1px] h-4 bg-gray-100 mx-1" />

              <button 
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                title="إعدادات المحرك"
              >
                <Settings size={14} />
                <span className="text-[10px] font-mono uppercase tracking-[0.4em] font-bold">CONFIG</span>
              </button>
              <div className="w-[1px] h-4 bg-gray-100 mx-1" />
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px_currentColor]`} style={{ color: mainAccent, backgroundColor: mainAccent }} />
              <span className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.4em] font-bold">{globalEngine === 'ollama' ? 'LOCAL_ACTIVE' : 'CLOUD_ACTIVE'}</span>
           </div>
        </div>
      </footer>

      {/* MODALS & OVERLAYS */}
      <AnimatePresence>
         <SettingsUI />
         {showTeleprompter && (
            <TeleprompterOverlay 
              script={finalVoiceScript}
              onClose={() => setShowTeleprompter(false)} 
            />
         )}
      </AnimatePresence>
    </div>
  );
}

interface PersonaSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (persona: PersonaType) => void;
  currentPersona: PersonaType;
}

const PersonaSelectionModal: React.FC<PersonaSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentPersona,
}) => {
  if (!isOpen) return null;
  const personas: {
    type: PersonaType;
    icon: any;
    title: string;
    description: string;
  }[] = [
    {
      type: "النبّاش",
      icon: Search,
      title: "المحقق الصحفي",
      description: "محقق حاد يبحث خلف الكواليس ويفكك الأسرار بدقة صحفية.",
    },
    {
      type: "برواز التاريخ",
      icon: BookOpen,
      title: "صانع وثائقيات التاريخ",
      description: "خبير أرشيفي يروي القصص بلمحة ملحمية وربط تاريخي عميق.",
    },
    {
      type: "برواز التكنو",
      icon: Terminal,
      title: "محلل التكنولوجيا",
      description: "محلل مستقبلي يحذر من الوجه المظلم للتقنية بأسلوب رصين.",
    },
    {
      type: "برواز الحكاوي",
      icon: Headphones,
      title: "الراوي القصصي",
      description:
        "راوي قصص غامضة ومثيرة تعتمد على الفولكلور والحكاوي الشعبية.",
    },
  ];

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-gray-50/95 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-gray-50 border border-gray-200 p-8 lg:p-10 shadow-[0_0_100px_rgba(0,0,0,1)] animate-liquid overflow-hidden rounded-sm">
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-600/20" />
        <button
          onClick={onClose}
          className="absolute top-10 right-10 text-gray-500 transition-all duration-300 group hover:text-blue-600"
        >
          <X className="w-10 h-10 transition-transform group-hover:rotate-90" />
        </button>
        <header className="mb-10 text-center border-b border-gray-200 pb-8">
          <h2 className="text-2xl font-arabic font-black text-gray-900 tracking-tighter mb-2">
            اختيار الراوي
          </h2>
          <p className="text-sm font-arabic text-gray-600">
            حدد الشخصية المناسبة لتقديم وسرد هذا الفيديو
          </p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {personas.map((p) => (
            <button
              key={p.type}
              onClick={() => onSelect(p.type)}
              className={`text-right p-6 transition-all duration-300 relative group h-full rounded-sm ${
                currentPersona === p.type
                  ? "bg-blue-600/5 border border-blue-500/40"
                  : "bg-gray-50/60 backdrop-blur-xl border border-gray-200"
              }`}
            >
              <div className="flex items-center justify-end gap-4 mb-8">
                <div
                  className={`w-14 h-14 flex items-center justify-center border rounded-sm ${currentPersona === p.type ? "border-blue-500/40 bg-blue-600/10" : "border-gray-200 bg-gray-50"}`}
                >
                  <p.icon
                    className={`w-7 h-7 ${currentPersona === p.type ? "text-blue-600" : "text-gray-500"}`}
                  />
                </div>
              </div>
              <h4
                className={`text-xl font-arabic font-black mb-4 ${currentPersona === p.type ? "text-blue-600" : "text-gray-900"}`}
              >
                {p.title}
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed font-arabic opacity-80">
                {p.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

interface MoodSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mood: MoodType) => void;
  currentMood: MoodType;
}

const MoodSelectionModal: React.FC<MoodSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentMood,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-gray-50/95 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-gray-50 border border-gray-200 p-8 lg:p-10 shadow-[0_0_100px_rgba(0,0,0,1)] animate-liquid overflow-hidden rounded-sm">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-600/20" />
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/5 blur-[100px] rounded-sm" />

        <button
          onClick={onClose}
          className="absolute top-10 right-10 text-gray-500 transition-all duration-300 group hover:text-blue-600"
        >
          <X className="w-10 h-10 transition-transform group-hover:rotate-90" />
        </button>

        <header className="mb-10 text-center border-b border-gray-200 pb-8">
          <h2 className="text-2xl font-arabic font-black text-gray-900 tracking-tighter mb-2">
            الأسلوب العام للفيديو
          </h2>
          <p className="text-sm font-arabic text-gray-600">
            اختر الروح والجو العام الذي ترغب في أن يظهر به الفيديو
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {moods.map((m) => (
            <button
              key={m.type}
              onClick={() => onSelect(m.type)}
              className={`text-right p-6 transition-all duration-300 relative group h-full rounded-sm ${
                currentMood === m.type
                  ? "bg-blue-600/5 border border-blue-500/40"
                  : "bg-gray-50/60 backdrop-blur-xl border border-gray-200"
              }`}
            >
              <div className="flex items-center justify-end gap-4 mb-8">
                {currentMood === m.type && (
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs font-arabic text-blue-600 font-bold"
                  >
                    محدد حالياً
                  </motion.span>
                )}
                <div
                  className={`w-14 h-14 flex items-center justify-center border rounded-sm ${currentMood === m.type ? "border-blue-500/40 bg-blue-600/10" : "border-gray-200 bg-gray-50"}`}
                >
                  <m.icon
                    className={`w-7 h-7 ${currentMood === m.type ? "text-blue-600" : "text-gray-500"}`}
                  />
                </div>
              </div>
              <h4
                className={`text-xl font-arabic font-black mb-4 ${currentMood === m.type ? "text-blue-600" : "text-gray-900"}`}
              >
                {m.type}
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed font-arabic opacity-80">
                {m.description}
              </p>

              {currentMood === m.type && (
                <div className="absolute bottom-0 right-0 w-16 h-1 bg-blue-600 shadow-[0_0_15px_rgba(240,199,34,0.4)]" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
