import { 
  BookOpen, Ghost, Activity, Fingerprint, Zap, Waypoints, Swords, Lightbulb, 
  ImagePlus, Users, Smile, Archive, Youtube, Database, Search, Library, 
  ShieldAlert, Landmark, FileText, Radar, Skull, TerminalSquare, PenLine, 
  Flame, Layers, Headphones, Hourglass, Video, Microscope, FileSearch, 
  Building2, Network, TrendingDown, TrendingUp, Scale, ImageIcon,
  ServerCrash, Eye, Briefcase, Brain, TestTube, Coins, Film, Clapperboard,
  UserCheck, Mic2
} from "lucide-react";
import { MoodType } from "../types";

export interface MoodDefinition {
  type: string;
  icon: any;
  color: string;
  description: string;
  sector: "dahih" | "history" | "shadows" | "power" | "anatomy" | "modern" | "cinema" | "biography" | "literature";
  dna?: {
    style: string;
    paper: string;
    localization: string;
  };
}

export const MOODS: MoodDefinition[] = [
  // قطاع: الدحيح (كوميديا وتبسيط)
  {
    type: "حصان طروادة (Trojan Horse)",
    icon: Smile,
    color: "#facc15",
    description: "تبدأ بقصة تافهة أو نكتة، ثم تكتشف أنها تشرح نظرية فيزيائية أو عقدة تاريخية بذكاء.",
    sector: "dahih",
    dna: { style: "Fast-Paced Jump Cuts & Invisible Props", paper: "Studio Space with J-Cuts", localization: "Pop-Culture Analogies" }
  },
  {
    type: "ماذا لو؟ (Thought Experiment)",
    icon: Brain,
    color: "#0ea5e9",
    description: "أخذ تجربة فكرية مجنونة (ماذا لو اختفت الحشرات؟) وشرح كل العواقب العلمية.",
    sector: "dahih",
    dna: { style: "Scientific Blueprints", paper: "Graph Paper", localization: "Laboratory Desks" }
  },
  {
    type: "حرب العقول (Mind Wars)",
    icon: Layers,
    color: "#a855f7",
    description: "علم النفس، الانحيازات المعرفية، وكيف يضحك علينا عقلنا كل يوم.",
    sector: "dahih",
    dna: { style: "Abstract UI", paper: "Psychological Profiles", localization: "Data Grids" }
  },
  
  // قطاع: التاريخ (ورا الكواليس)
  {
    type: "انهيار الإمبراطوريات",
    icon: Landmark,
    color: "#d4a574",
    description: "كيف أسقطت قرارات غبية من ملوك أو جنرالات دولاً عظمى، بأسلوب ساخر ودرامي.",
    sector: "history",
    dna: { style: "Cinematic Historic Visuals", paper: "Golden Age Manuscript", localization: "Epic Fall" }
  },
  {
    type: "الصراع على السلطة",
    icon: Swords,
    color: "#ef4444",
    description: "لعبة العروش في التاريخ الإسلامي والغربي. المكائد السياسية والخيانات.",
    sector: "history",
    dna: { style: "Aggressive Street Art", paper: "Boxing Match Poster", localization: "Underground Rings" }
  },
  {
    type: "محاكمة التاريخ",
    icon: Scale,
    color: "#f59e0b",
    description: "إعادة تقييم شخصيات تاريخية شريرة أو مظلومة بمنظور معاصر.",
    sector: "history",
    dna: { style: "Caricature & Satire", paper: "Theater Programmes", localization: "Absurdist Theater" }
  },

  // قطاع: السينما والفن (جديد)
  {
    type: "تحليل سينمائي (Cinematic Review)",
    icon: Film,
    color: "#8b5cf6",
    description: "تشريح الأفلام ودلالاتها النفسية والفلسفية، وما وراء الكاميرا والإخراج.",
    sector: "cinema",
    dna: { style: "Film Noir & High Contrast", paper: "Storyboards", localization: "Cinema Projection Room" }
  },
  {
    type: "كواليس الفن (Behind the Scenes)",
    icon: Clapperboard,
    color: "#ec4899",
    description: "الصراعات الخفية بين الممثلين والمخرجين، وكيف تم صناعة روائع السينما.",
    sector: "cinema",
    dna: { style: "Vintage Hollywood Glamour", paper: "Script Pages", localization: "Director's Chair" }
  },

  // قطاع: السيرة والبورتريه (جديد)
  {
    type: "وثائقي السيرة (Biopic Profile)",
    icon: UserCheck,
    color: "#3b82f6",
    description: "توثيق احترافي عميق لحياة شخصية مشهورة، كشف الجوانب النفسية والقرارات المصيرية.",
    sector: "biography",
    dna: { style: "Premium Portrait Photography", paper: "Archival Documents", localization: "Executive Office" }
  },
  {
    type: "صوت من الماضي (Voices from the Past)",
    icon: Mic2,
    color: "#6366f1",
    description: "استعراض حكاية شخصية غيرت التاريخ بناءً على مقابلاتها وخطاباتها النادرة.",
    sector: "biography",
    dna: { style: "Retro Broadcasting Vibe", paper: "Press Releases", localization: "Radio Studio" }
  },

  // قطاع: الأدب والرواية (جديد)
  {
    type: "كواليس الأدب (Literary Secrets)",
    icon: BookOpen,
    color: "#d946ef",
    description: "حكايات الكُتاب، الصراعات الأدبية، وما وراء كتابة أعظم الروايات والقصائد.",
    sector: "literature",
    dna: { style: "Classic Typewriter Text", paper: "Aged Parchment", localization: "Old Library" }
  },
  {
    type: "رحلة رواية (Novel Journey)",
    icon: Library,
    color: "#f43f5e",
    description: "تحليل سيكولوجي واجتماعي للروايات الخالدة وتأثيرها على الواقع.",
    sector: "literature",
    dna: { style: "Abstract Watercolor", paper: "Handwritten Notes", localization: "Bohemian Cafe" }
  },

  // قطاع: الاقتصاد (لعبة الأرقام)
  {
    type: "بيزنس ساخن (Corporate Drama)",
    icon: Briefcase,
    color: "#22c55e",
    description: "قصة صعود أو هبوط شركة كبرى، أو كيف خدعت شركة العالم كله.",
    sector: "power",
    dna: { style: "Corporate Dashboards", paper: "Financial Reports", localization: "Stock Market Board" }
  },
  {
    type: "اقتصاد الشارع",
    icon: Coins,
    color: "#f97316",
    description: "الأسواق السوداء، تجارة الوهم، وكيف تتحرك الفلوس من تحت الترابيزة.",
    sector: "power",
    dna: { style: "Street Neon", paper: "Crumpled Banknotes", localization: "Night Markets" }
  },

  // قطاع: العلوم (صائد الخرافات)
  {
    type: "تشريح الخرافة (Mythbusting)",
    icon: TestTube,
    color: "#14b8a6",
    description: "نسف الخرافات الطبية والتاريخية الشائعة وتحطيمها بالعلم والأرقام.",
    sector: "anatomy",
    dna: { style: "Microscopic Views", paper: "Lab Reports", localization: "Sterile Cleanroom" }
  },
  {
    type: "تكنولوجيا مرعبة",
    icon: ServerCrash,
    color: "#ef4444",
    description: "الوجه الأسود للثورة التقنية وتأثير الذكاء الاصطناعي على مستقبلنا.",
    sector: "modern",
    dna: { style: "Distorted Glitches", paper: "Terminal Screens", localization: "Cyberpunk Alley" }
  },

  // قطاع: الغموض (أرشيف الضلمة)
  {
    type: "شريط ملعون (Found Footage)",
    icon: Video,
    color: "#6b7280",
    description: "توثيق مرعب بأسلوب أشرطة الفيديو القديمة لقصة غريبة ومجهولة.",
    sector: "shadows",
    dna: { style: "VHS Static", paper: "Dusty Archives", localization: "Abandoned Facilities" }
  },
  {
    type: "رحلة في عقل مجرم",
    icon: Fingerprint,
    color: "#dc2626",
    description: "تحليل سيكولوجي لدوافع أشهر الجرائم والقتلة المتسلسلين.",
    sector: "shadows",
    dna: { style: "Evidence Board", paper: "Police Files", localization: "Crime Scene Tape" }
  }
];

export const SECTORS = [
  { id: "all", label: "الكل (الدريسة)" },
  { id: "dahih", label: "لعب وتكتيك (Showmanship)" },
  { id: "history", label: "ورا الكواليس (تاريخ)" },
  { id: "cinema", label: "الفن السابع (سينما)" },
  { id: "biography", label: "بورتريه (شخصيات)" },
  { id: "literature", label: "أدب ورواية (Literature)" },
  { id: "power", label: "لعبة الفلوس (اقتصاد)" },
  { id: "anatomy", label: "صائد الخرافات (علوم)" },
  { id: "shadows", label: "أرشيف الضلمة (غموض)" },
  { id: "modern", label: "ديستوبيا المستقبل" }
];

export function getMoodDNA(mood: string) {
  const m = MOODS.find(x => x.type === mood);
  return {
    style: m?.dna?.style || "Professional Documentary Visuals",
    paper: m?.dna?.paper || "Standard Archive Paper",
    localization: m?.dna?.localization || "Professional Modern Cairo",
    description: m?.description || "سرد واستقصاء موضوعي"
  };
}
