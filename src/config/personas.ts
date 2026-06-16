import { PersonaType } from "../types";

export interface PersonaDefinition {
  id: PersonaType;
  label: string;
  desc: string;
  defaultCompatibility: number;
  quote?: string;
  dna?: string[];
}

export const getPersonaCompatibility = (personaId: PersonaType, mood: string): { score: number; isRecommended: boolean } => {
  const persona = PERSONAS.find(p => p.id === personaId);
  if (!persona) return { score: 0, isRecommended: false };

  let score = persona.defaultCompatibility;
  let isRecommended = false;

  // Historic / Religious Clusters
  const historyMoods = [
    "قصص الأنبياء والتاريخ الإسلامي", 
    "شرح وتأملات في القران والحديث", 
    "قصص الصحابة والتابعين", 
    "عصر الفتوحات والدول الإسلامية", 
    "العصر الذهبي للعلوم والفنون", 
    "الفن والعمارة الإسلامية", 
    "المجتمع المنسي في التاريخ"
  ];

  // Investigative / Noir Clusters
  const investigativeMoods = [
    "أرشيف الضلمة", 
    "ملفات متقفلش", 
    "سبوبة ولا ابتكار", 
    "التحليل الاستقصائي", 
    "الصندوق الأسود", 
    "لوغاريتمات السلطة"
  ];

  // Dahih / Infotainment Clusters
  const dahihMoods = [
    "طريقة الدحيح", 
    "فَتِّش عن السَّبُّوبَة", 
    "تأثير الفراشة", 
    "تشريح التريند القديم", 
    "المحكمة الموازية", 
    "كوميديا العبث التاريخي", 
    "حلبة الدسات", 
    "التشريح العلمي للخرافة"
  ];

  // Initially lower all default scores if the mood belongs to a specific cluster so non-matches are filtered
  if (historyMoods.includes(mood) || investigativeMoods.includes(mood) || dahihMoods.includes(mood)) {
    score = 20; 
  }

  if (historyMoods.includes(mood)) {
    if (personaId === "الهرم الرابع") { score = 99; isRecommended = true; }
    if (personaId === "برواز التاريخ") { score = 95; isRecommended = true; }
    if (personaId === "الشاهد الصامت") { score = 85; isRecommended = true; }
    if (personaId === "برواز الحكاوي") { score = 80; isRecommended = true; }
  }

  if (investigativeMoods.includes(mood)) {
    if (personaId === "النبّاش") { score = 98; isRecommended = true; }
    if (personaId === "شاهد على العصر") { score = 94; isRecommended = true; }
    if (personaId === "الشاهد الصامت") { score = 85; isRecommended = true; }
  }

  if (dahihMoods.includes(mood)) {
    if (personaId === "الدحيح") { score = 99; isRecommended = true; }
    if (personaId === "برواز التكنو") { score = 95; isRecommended = true; }
    if (personaId === "برواز الحكاوي") { score = 92; isRecommended = true; }
    if (personaId === "النبّاش") { score = 88; isRecommended = true; }
  }

  // Generic allowed ones across the board if not caught by specific clusters
  if (score < 30 && (personaId === "برواز الحكاوي" || personaId === "شاهد على العصر" || personaId === "النبّاش" || personaId === "الدحيح")) {
      score = 40; 
  }

  return { score, isRecommended };
};
export const PERSONAS: PersonaDefinition[] = [
  { id: "الهرم الرابع", label: "الرأسخ (الهرم الرابع)", desc: "سرد مهيب، رصين، يعطي وزناً للتاريخ الإسلامي والبطولات البشرية بإيقاع ملحمي.", defaultCompatibility: 65, quote: "«التاريخ ليس أرقاماً.. التاريخ دماء سُطرت لتكون عِبرة لمن يعتبر...»", dna: ["مُوقر", "ملحمي", "مؤثر"] },
  { id: "النبّاش", label: "المحقق (النبّاش)", desc: "صحفي استقصائي حاد يسير خلف الكواليس والأرقام بحثاً عن الحقيقة الملفقة.", defaultCompatibility: 60, quote: "«وراء كل واجهة زجاجية لامعة... جريمة إدارية متقنة الصنع.»", dna: ["بارانويا", "تحليلي", "مشوق"] },
  { id: "برواز التاريخ", label: "خادم الأرشيف (برواز التاريخ)", desc: "سرد أثري وكلاسيكي، ينفض الغبار عن الوثائق القديمة والقصص المنسية.", defaultCompatibility: 55, quote: "«بين شقوق هذه الصخور، هُمست أسرار غيّرت مجرى الممالك...»", dna: ["كلاسيكي", "درامي", "تاريخي"] },
  { id: "برواز التكنو", label: "المراقب (التكنو-ديستوبيا)", desc: "إيقاع سريع وخوارزمي، يتحدث عن المستقبل والتقنية وكأننا نعيش في نهاية العالم.", defaultCompatibility: 50, quote: "«نحن لا نعيش في العالم الحقيقي، نحن مجرد بيانات في خوادمهم...»", dna: ["مستقبلي", "لاهث", "سايبربانك"] },
  { id: "برواز الحكاوي", label: "قهوة الماضي (الحكواتي)", desc: "سرد شعبي ودافئ جداً، يعتمد على قوة النوستالجيا والحنين وحكاوي الشوارع القديمة.", defaultCompatibility: 58, quote: "«عروستين ورا الباب، وكوباية شاي، وحكاية ما اتحكتش في الكتب...»", dna: ["نوستالجيا", "شعبي", "دافئ"] },
  { id: "شاهد على العصر", label: "شاهد على العصر", desc: "سرد يتجنب التحيز ويعتمد بكثافة على الاقتباسات والشهادات المسجلة لشخصيات عامة.", defaultCompatibility: 62, quote: "«أنا لم أسمع، أنا كنت هناك يوم سقطت الأقنعة وظهرت الوجوه الحقيقية...»", dna: ["أرشيفي", "محايد", "مُوثق"] },
  { id: "الشاهد الصامت", label: "الشاهد الصامت", desc: "سرد ذاتي من منظور غير بشري (جماد أو حيوان أو مكان) حضر أحداثاً عظيمة.", defaultCompatibility: 45, quote: "«لقد مَرّوا من أمامي جميعاً، ولم يعلموا أن الجدران لها ذاكرة...»", dna: ["غير تقليدي", "شاعري", "ذاتي"] },
  { id: "الدحيح", label: "المُفكك الساخر (Edutainment)", desc: "أسلوب تعليمي-ترفيهي (Edutainment) سريع وخفيف، يربط المعقد جداً بالكوميديا والميمز والبوب كالشر.", defaultCompatibility: 60, quote: "«علمياً الكلام ده معقد جداً.. بس خليني أفهمهالك وأنت بتشرب كوباية الشاي...»", dna: ["ساخر ذكي", "سريع لاهث", "بوب كالشر"] }
];
