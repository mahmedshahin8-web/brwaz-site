import { 
  BookOpen, Ghost, Activity, Fingerprint, Zap, Waypoints, Swords, Lightbulb, 
  ImagePlus, Users, Smile, Archive, Youtube, Database, Search, Library, 
  ShieldAlert, Landmark, FileText, Radar, Skull, TerminalSquare, PenLine, 
  Flame, Layers, Headphones, Hourglass, Video, Microscope, FileSearch, 
  Building2, Network, TrendingDown, TrendingUp, Scale, ImageIcon,
  ServerCrash, Eye
} from "lucide-react";
import { MoodType } from "../types";

export interface MoodDefinition {
  type: MoodType;
  icon: any;
  color: string;
  description: string;
  sector: "shadows" | "power" | "anatomy" | "modern" | "dahih" | "history";
  dna?: {
    style: string;
    paper: string;
    localization: string;
  };
}

export const MOODS: MoodDefinition[] = [
  {
    type: "قصص الأنبياء والتاريخ الإسلامي",
    icon: BookOpen,
    color: "#d4a574",
    description: "استعراض تاريخي ملحمي وموثق لسير الأنبياء",
    sector: "history",
    dna: { style: "Cinematic Historic Visuals", paper: "Golden Age Manuscript", localization: "Classic Islamic Golden Age" }
  },
  {
    type: "شرح وتأملات في القران والحديث",
    icon: BookOpen,
    color: "#d4a574",
    description: "شرح تفصيلي معتمد لأحاديث وقرآن باستخدام المصادر المعتمدة",
    sector: "history",
    dna: { style: "Cinematic Historic Visuals", paper: "Golden Age Manuscript", localization: "Classic Islamic Golden Age" }
  },
  {
    type: "قصص الصحابة والتابعين",
    icon: BookOpen,
    color: "#d4a574",
    description: "استعراض لبطولات ومواقف الصحابة من سير أعلام النبلاء",
    sector: "history",
    dna: { style: "Cinematic Historic Visuals", paper: "Golden Age Manuscript", localization: "Classic Islamic Golden Age" }
  },
  {
    type: "عصر الفتوحات والدول الإسلامية",
    icon: Swords,
    color: "#d4a574",
    description: "الأموية، العباسية والمعارك الاستراتيجية الإسلامية",
    sector: "history",
    dna: { style: "Cinematic Historic Visuals", paper: "Golden Age Manuscript", localization: "Classic Islamic Golden Age" }
  },
  {
    type: "العصر الذهبي للعلوم والفنون",
    icon: Lightbulb,
    color: "#d4a574",
    description: "كيف كان المسلمون رواداً في التكنولوجيا والفلك والعمارة",
    sector: "history",
    dna: { style: "Cinematic Historic Visuals", paper: "Golden Age Manuscript", localization: "Classic Islamic Golden Age" }
  },
  {
    type: "الفن والعمارة الإسلامية",
    icon: ImagePlus,
    color: "#d4a574",
    description: "الفنون الإسلامية، الزخارف، العمارة والخط العربي عبر العصور",
    sector: "history",
    dna: { style: "Cinematic Historic Visuals", paper: "Golden Age Manuscript", localization: "Classic Islamic Golden Age" }
  },
  {
    type: "المجتمع المنسي في التاريخ",
    icon: Users,
    color: "#d4a574",
    description: "الحياة الاجتماعية في بغداد والأندلس، وكيف عاش الناس",
    sector: "history",
    dna: { style: "Cinematic Historic Visuals", paper: "Golden Age Manuscript", localization: "Classic Islamic Golden Age" }
  },
  {
    type: "طريقة الدحيح",
    icon: Smile,
    color: "#facc15",
    description: "تبسيط استعراضي وكوميدي (Edutainment)، يبني فرضية خادعة (Trojan Horse) ثم يشرحها عبر مقاطعات الأنا البديلة.",
    sector: "dahih",
    dna: { style: "Fast-Paced Jump Cuts & Invisible Props", paper: "Studio Space with J-Cuts", localization: "Pop-Culture Analogies" }
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
    dna: { style: "Graphic Collage", paper: "Screen Grain Finish", localization: "Social Media Sphere" }
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
  {
    type: "فَتِّش عن السَّبُّوبَة",
    icon: TrendingUp,
    color: "#f43f5e",
    description: "التفسير الاقتصادي البحت والمادي لأحداث تاريخية وفنية.",
    sector: "dahih",
    dna: { style: "Ledgers and Graphs", paper: "Yellowed Tax Document", localization: "Financial Districts" }
  },
  {
    type: "تأثير الفراشة",
    icon: Waypoints,
    color: "#8B5CF6",
    description: "كيف تسبب حدث تافه جداً في تغيير التاريخ أو صنع كارثة.",
    sector: "dahih",
    dna: { style: "Intricate Webs & Dominoes", paper: "Chaos Theory Notes", localization: "Chronological Timelines" }
  },
  {
    type: "تشريح التريند القديم",
    icon: Activity,
    color: "#10B981",
    description: "تحليل ظواهر وشائعات الماضي كأنها تريند سوشيال ميديا.",
    sector: "dahih",
    dna: { style: "Retro Pop-Cult", paper: "Vintage Magazine Cover", localization: "Virtual Public Squares" }
  },
  {
    type: "المحكمة الموازية",
    icon: Scale,
    color: "#3B82F6",
    description: "إعادة محاكمة شخصيات تاريخية ولعب دور محامي الشيطان.",
    sector: "dahih",
    dna: { style: "Evidence Boards", paper: "Court Summons", localization: "The Jury Box" }
  },
  {
    type: "لعنة الماستر بيس",
    icon: ImageIcon,
    color: "#f59e0b",
    description: "الكوابيس والانهيارات التي سبقت خروج الأعمال الفنية العظيمة.",
    sector: "dahih",
    dna: { style: "Tragic Classical Art", paper: "Torn Canvas", localization: "Haunted Studios" }
  },
  {
    type: "كوميديا العبث التاريخي",
    icon: Smile,
    color: "#facc15",
    description: "تحليل ساخر للأحداث الكبرى التي قامت لأسباب تافهة ومضحكة.",
    sector: "dahih",
    dna: { style: "Caricature & Satire", paper: "Theater Programmes", localization: "Absurdist Theater" }
  },
  {
    type: "حلبة الدسات",
    icon: Swords,
    color: "#ef4444",
    description: "العداوات والنقائض التاريخية والأدبية كأنها معارك راب.",
    sector: "dahih",
    dna: { style: "Aggressive Street Art", paper: "Boxing Match Poster", localization: "Underground Rings" }
  },
  {
    type: "التشريح العلمي للخرافة",
    icon: Microscope,
    color: "#0ea5e9",
    description: "تفنيد الأساطير الشعبية والقصص المبالغ فيها بالعلم الحديث.",
    sector: "dahih",
    dna: { style: "Scientific Blueprints", paper: "Graph Paper", localization: "Laboratory Desks" }
  }
];

export const SECTORS = [
  { id: "all", label: "الكل" },
  { id: "history", label: "التاريخ الديني والأديان" },
  { id: "dahih", label: "كوميديا وترفيه" },
  { id: "shadows", label: "جريمة وغموض" },
  { id: "anatomy", label: "تحقيقات وثقافة" },
  { id: "power", label: "سلطة واقتصاد" },
  { id: "modern", label: "فورمات بصرية حديثة" }
];

export function getMoodDNA(mood: string) {
  const m = MOODS.find(x => x.type === mood);
  return {
    style: m?.dna?.style || "Professional Documentary Visuals",
    paper: m?.dna?.paper || "Standard Archive Paper",
    localization: m?.dna?.localization || "Professional Modern Cairo",
    description: m?.description || "سرد وثائقي موضوعي"
  };
}
