import { ollamaQueue } from "./queue";
import { cleanToEgyptianArabic } from '../core/identity/identityGuard';
export enum Type {
  STRING = "STRING",
  NUMBER = "NUMBER",
  INTEGER = "INTEGER",
  BOOLEAN = "BOOLEAN",
  ARRAY = "ARRAY",
  OBJECT = "OBJECT",
}

function checkEnv() {
  console.log("Browser GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "defined" : "undefined", process.env.GEMINI_API_KEY);
}
checkEnv();

import { GoogleGenAI } from "@google/genai";
import { getChannelDNA, buildSystemPrompt } from "../config/channelDNA";
import { applyRegexPostProcessing, TONE_EXAMPLES, BLACKLIST_WORDS } from "./toneRules";
import { IdentityMiddleware } from "../core/middlewares/IdentityMiddleware";
import { z } from "zod";
import {
  EpisodeData,
  MasterOutline,
  EpisodeScene,
  RadarSuggestion,
  ChapterOutline,
  OsintDossier,
  PersonaType,
  SecurityAudit
} from "../types";

export async function classifyTopic(
  topic: string,
  note: string,
  engine = "gemini",
  signal?: AbortSignal
): Promise<{ mood: MoodType; persona: PersonaType }> {
  const prompt = `[Autonomous Classifier Agent]
Task: Analyze the provided topic and user notes to determine the BEST matching documentary mood and persona.

Topic: ${topic}
Additional Notes: ${note}

Return ONLY a JSON object with the following schema:
{
  "mood": "Choose one from the MoodType list",
  "persona": "Choose one: برواز الحكاوي, برواز التاريخ, برواز التكنو, النبّاش"
}

Available Moods:
- أرشيف الضلمة (Forgotten history/Crime)
- كلاكيت وتزوير (Media analysis)
- خرافات شعبية (Folklore/Myths)
- سبوبة ولا ابتكار (Business/Cynical)
- صراع العروش العربي (Epic politics)
- تكنولوجيا مرعبة (Horror tech)
- اقتصاد الشارع (Finance/Street survival)
- ملفات مخابراتية (Spies/Tactical)
- طريقة الدحيح (Pop-science/Humor)
- التفكيك التاريخي (Deep history)
- التحليل الاستقصائي (Classic Investigation)
- الغموض الفلسفي (Existential/Deep mystery)
- الصندوق الأسود (Forensic/Judicial)
- النبش المعماري (Architecture/Urban history)
- لوغاريتمات السلطة (Politics/Data/Power)
- أطلس الانهيار (Economic/Societal collapse)

 Persona Selection Logic:
- برواز الحكاوي: Warm, nostalgic, folklore.
- برواز التاريخ: Epic, ancient, academic past.
- برواز التكنو: Futuristic, paranoid, cyber.
- النبّاش: Harsh investigator, urban reality, exposing truths.

Output JSON only.`;

  return callWithRetry(async () => {
    const text = await generateAIContentRaw(prompt, {
      type: Type.OBJECT,
      properties: {
        mood: { type: Type.STRING },
        persona: { type: Type.STRING }
      },
      required: ["mood", "persona"]
    }, engine, undefined, signal);
    
    const parsed = safeJsonParse(text);
    return {
      mood: (parsed?.mood as MoodType) || "التحليل الاستقصائي",
      persona: (parsed?.persona as PersonaType) || "النبّاش"
    };
  }, 2, 1000, signal);
}

export function getPersonaForMood(mood: MoodType): PersonaType {
  switch (mood) {
    case "حكاوي الأجداد":
      return "برواز الحكاوي";
    case "كلاكيت وتزوير":
    case "خرافات شعبية":
    case "صراع العروش العربي":
    case "محاكمة التاريخ":
    case "مسافر عبر الزمن":
    case "خرائط دموية (Faceless)":
      return "برواز التاريخ";
    case "سبوبة ولا ابتكار":
    case "تكنولوجيا مرعبة":
    case "المستقبل الديسطوبي":
      return "برواز التكنو";
    default:
      return "النبّاش";
  }
}

export function getPersonaInstructions(persona: PersonaType): string {
  // === THE IDENTITY ANCHOR (NEVER OVERWRITTEN) ===
  const coreAnchor = "أنت صانع محتوى وثائقي مصري محترف. هويتك الثابتة: تتحدث بـ 'العامية القاهرية البيضاء الفصيحة' (مصرية رصينة، مثقفة، وعميقة). أسلوبك دائماً تحليلي، غامض، موضوعي، ويبحث ما وراء السطور. لا تستخدم الفصحى الجامدة المختلقة ولا العامية المبتذلة.";
  
  // === THE NARRATIVE LENSES (MODIFIERS) ===
  switch (persona) {
    case "برواز الحكاوي":
      return coreAnchor + "\n[العدسة السردية: الحكاوي]: قم بضخ طابع النوستالجيا والغموض الكلاسيكي في سردك. ركز على التراث والأساطير الحضرية، لكن احتفظ بصرامتك التحليلية ولا تتحول لراوي أطفال.";
    case "برواز التاريخ":
      return coreAnchor + "\n[العدسة السردية: التاريخ]: وجه تحليلك المخابراتي/الصحفي نحو الماضي. استخدم مجازات بصرية كالوثائق الصفراء والمخطوطات، واجعل نبرتك ملحمية وتاريخية دون التخلي عن العامية القاهرية الرصينة.";
    case "برواز التكنو":
      return coreAnchor + "\n[العدسة السردية: التكنو]: اجعل إيقاعك أسرع قليلاً، وضخ البارانويا التحذيرية والخيال العلمي والسايبرسكيورتي في تحليلك. أنت محقق يعيش في المستقبل الديسطوبي.";
    case "النبّاش":
    default:
      return coreAnchor + "\n[العدسة السردية: النبّاش]: أنت صحفي استقصائي حاد يسير في الشوارع وخلف المكاتب بحثاً عن الحقيقة الملفقة. صياغتك صارمة، واقعية، تفكك الجرائم والأسرار المالية والسياسية.";
  }
}

export const Node1Schema = z.object({
  episode_theme: z.string().describe("الفكرة الرئيسية للحلقة"),
  scenes_outline: z.array(z.object({
    scene_number: z.number(),
    core_fact: z.string().describe("المعلومة الحقيقية الموثقة التي يعتمد عليها المشهد - ممنوع التأليف"),
    visual_concept: z.string().describe("وصف بصري يلتزم بقاعدة (Identity Guard) وبالألوان المحددة وبدون نصوص"),
  }))
});

export type Node1Structure = z.infer<typeof Node1Schema>;

export const Node2Schema = z.object({
  scene_id: z.string(),
  voiceover_text: z.string().describe("النص بالتعليق الصوتي. يجب دمج علامات [صمت درامي] في المساحات الصامتة، و 🔊 للإشارة لمؤثر صوتي بشكل صريح"),
  voiceover_notes: z.string().describe("إرشادات للمعلق الصوتي البشري (نبرة، سرعة، إحساس)"),
  estimated_duration_seconds: z.number().describe("المدة الزمنية التقريبية للمشهد بالثواني بناءً على طول النص الصوتي"),
  dramatic_pause_seconds: z.number().describe("مدة الصمت المطلوب إن وجدت"),
  camera_and_vision: z.string().describe("الرؤية البصرية: وصف كادر الكاميرا والظلال (فقط استعارة مادية، بدون بشر)"),
  cinematic_movement: z.string().describe("حركة الكاميرا السينمائية للـ B-Roll (مثال: Slow Dolly in, Dutch angle, Parallax effect)"),
  visual_motif: z.string().describe("الموتيف البصري (مثال: تأثير الميكروفيلم، مستندات مسربة، ورق أصفر، أختام باهتة)"),
  visual_color_grading: z.string().describe("توزيع باليتة برواز (Navy #1F2A44, Gold #B89B6A, Ivory #F5F1E8) في هذا المشهد"),
  montage_instructions: z.string().describe("توجيهات المونتاج: تعليمات تقنية للمونتير البشري حول سرعة التقطيع، نوع الانتقالات، وكثافة الجرافيكس"),
  english_image_prompt: z.string().describe("Prompt for AI generation (NO HUMAN FACES). MUST explicitly mention Color palette (Navy blue, muted gold, warm ivory)."),
  ai_video_prompt: z.string().describe("Motion prompt for Runway/Kling based on the camera and vision (English)."),
  b_roll_keywords: z.string().describe("Comma separated English keywords for stock footage search (e.g. vintage newspaper, crowded street silhouette)."),
  archive_search_queries: z.array(z.string()).describe("Strict, standardized English search queries for professional archives like Internet Archive or Getty (e.g., 'Cairo 1920s street archival footage'). NO URLs."),
  sound_and_sfx: z.string().describe("المؤثرات الصوتية المحيطية بدقة"),
  asmr_soundscape: z.string().describe("صوت ASMR خشن يعزز الواقعية ليحل محل غياب الوجوه (مثال: احتكاك ورق، خطوات، غليان)"),
  retention_pattern: z.string().describe("خوارزمية حبس الانتباه (مثال: Pattern Interrupt, Fast Cut Formula, The 7-Second Rule)"),
  psychoacoustic_guidance: z.string().describe("توجيهات صوتية نفسية (مثال: Binaural Beats 4Hz, Deep Brown Noise, Pulsing Silence)"),
  music_prompt: z.string().describe("Music prompt for Lyria 3 based on mood, including recommended instruments and pacing state"),
  music_bpm: z.number().describe("Recommended Beats Per Minute (BPM) for this scene's tension level"),
  sfx_prompt: z.string().describe("Targeted SFX prompt for Lyria 3"),
});

export type Node2Narrative = z.infer<typeof Node2Schema>;

export const Node3Schema = z.object({
  scenes: z.array(z.object({
    asset_id: z.string(),
    voice_over: z.string(),
    visual_cue: z.string(),
    montage_instructions: z.string(),
    sound_design: z.string(),
    image_prompt_nano_banana: z.string(),
    ai_video_prompt: z.string(),
    b_roll_keywords: z.string().optional()
  }))
});

export type Node3Visuals = z.infer<typeof Node3Schema>;

export type MoodType =
  | "أرشيف الضلمة"
  | "كلاكيت وتزوير"
  | "ملفات متقفلش"
  | "خرافات شعبية"
  | "حكاوي الأجداد"
  | "سبوبة ولا ابتكار"
  | "حواديت شوارع"
  | "صراع العروش العربي"
  | "تكنولوجيا مرعبة"
  | "اقتصاد الشارع"
  | "ملفات مخابراتية"
  | "طريقة الدحيح"
  | "خرائط دموية (Faceless)"
  | "سبورة بيضاء (Whiteboard)"
  | "ميمز ومقاطع (Faceless)"
  | "رحلة في عقل مجرم"
  | "المستقبل الديسطوبي"
  | "محاكمة التاريخ"
  | "اقتصاد البقاء"
  | "جبل الجليد (Iceberg)"
  | "همس الحكايات (Dark ASMR)"
  | "شريط ملعون (Found Footage)"
  | "مسافر عبر الزمن"
  | "تشريح الحكايات"
  | "فلوق استقصائي (Vlog)"
  | "بودكاست كرسي الاعتراف"
  | "القصة وراء التريند"
  | "التفكيك التاريخي"
  | "التحليل الاستقصائي"
  | "الدراما السوداء"
  | "الغموض الفلسفي"
  | "الصندوق الأسود"
  | "النبش المعماري"
  | "لوغاريتمات السلطة"
  | "أطلس الانهيار";

export function getMoodContext(mood: MoodType): {
  researchAngle: string;
  scriptingStyle: string;
  visualAudioStyle: string;
  archivalTreasureRules: string;
  ragVaults?: string[];
} {
  if (mood === "أرشيف الضلمة") {
    return {
      researchAngle: "أحداث تاريخية منسية، جرائم غامضة من أرشيف المحاكم المصرية، مذكرات شخصيات مجهولة، وتاريخ محلي مرعب.",
      scriptingStyle: "Dark, archival, and deeply investigartive. سرد استقصائي كئيب يعتمد على التشويق واستخراج الأسرار.",
      visualAudioStyle: "Deep shadows, dusty film grain, echoes of the past.",
      archivalTreasureRules: "يجب استخراج المصادر من: قصاصات جرائد الأهرام والأخبار في فترة ما قبل الخمسينات، تقارير البوليس السياسي القديمة، حواديات مجلة اللطائف المصورة، وسجلات الجنايات النادرة.",
      ragVaults: ["أرشيف جرائد الأهرام والأخبار", "مجلة اللطائف المصورة", "مطبوعات دار الهلال القديمة"],
    };
  } else if (mood === "الصندوق الأسود") {
    return {
      researchAngle: "تحليل جنائي معمق، فك شفرات الجرائم الغامضة من واقع محاضر النيابة وتقارير الطب الشرعي المنسية.",
      scriptingStyle: "Cold, clinical, and precise. سرد حيادي وجاد يعامل القصة كملف تحقيق جنائي متكامل.",
      visualAudioStyle: "Hospital lights, close-up of evidence tags, rhythmic metronome sound.",
      archivalTreasureRules: "يجب استخراج المصادر من: تقارير مصلحة الطب الشرعي، سجلات مصلحة السجون القديمة، اعترافات المتهمين المسجلة، وكتب القانون الجنائي.",
      ragVaults: ["سجلات الطب الشرعي المصري", "أرشيف مصلحة السجون", "مجموعة القوانين الجنائية (الوقائع المصرية)"],
    };
  } else if (mood === "النبش المعماري") {
    return {
      researchAngle: "تاريخ المباني المنسية، أنفاق القاهرة السرية، كيف تحكي الجدران قصص البشر الذين سكنوها، وتحليل الفراغ العمراني كشاهد على التاريخ.",
      scriptingStyle: "Spatial and reflective. سرد يعتمد على وصف المكان والزوايا المعمارية وتأثير الحجر على البشر.",
      visualAudioStyle: "Blueprint overlays, crumbling concrete textures, echoes of empty halls.",
      archivalTreasureRules: "يجب استخراج المصادر من: خرائط هيئة التنظيم والادارة، وثائق الأوقاف، سجلات المهندسين المعماريين التاريخيين (مثل نعوم شبيب)، وصور الأقمار الصناعية القديمة.",
      ragVaults: ["أرشيف هيئة التخطيط العمراني", "دفاتر الأوقاف المصرية", "مجلدات سيرة العمارة الإسلامية"],
    };
  } else if (mood === "لوغاريتمات السلطة") {
    return {
      researchAngle: "خرائط النفوذ، كيف يتم التحكم في الجماهير عبر البيانات، مراكز القوى الخفية، والعلاقة بين السياسة والتقنية.",
      scriptingStyle: "Technical, fast, and cynical. سرد يفكك شفرات السلطة باستخدام البيانات والتحليل الرقمي.",
      visualAudioStyle: "Abstract neural networks, glowing data points, hum of a server room.",
      archivalTreasureRules: "يجب استخراج المصادر من: تسريبات التقارير الاستخباراتية الدولية، دراسات مراكز التفكير (Think Tanks)، تحليل الشبكات الاجتماعية، ووثائق صياغة السياسات.",
      ragVaults: ["تقارير مراكز الدراسات الإستراتيجية", "قواعد بيانات الشفافية الدولية", "أرشيف ويكيليكس (الشرق الأوسط)"],
    };
  } else if (mood === "أطلس الانهيار") {
    return {
      researchAngle: "رصد لحظات التحول الكبرى وسقوط الأنظمة أو الاقتصاديات، دراسة الفوضى كنمط رياضي وتاريخي.",
      scriptingStyle: "Urgent and catastrophic. سرد يركز على الانهيار وتداعياته على الإنسان البسيط بقالب تحليلي جاد.",
      visualAudioStyle: "Slow-motion destruction, dusty landscapes, high-tension string music.",
      archivalTreasureRules: "يجب استخراج المصادر من: تاريخ 'الشدات' (مثل الشدة المستنصرية)، تقارير البنك الدولي للأزمات، مذكرات شهود العيان على الثورات والانهيارات الكبرى.",
      ragVaults: ["سجلات الأزمات الاقتصادية (البنك المركزي)", "مخطوطات المقريزي", "يوميات الحروب والاضطرابات"],
    };
  } else if (mood === "تشريح الحكايات") {
    return {
      researchAngle: "تحليل أدبي ونقدي مفصل لأهم الروايات والقصص العربية (لطه حسين، نجيب محفوظ، أحمد خالد توفيق وغيرهم). تفكيك الشفرات الرمزية، فحص أبعاد الشخصيات والدلالات المخفية.",
      scriptingStyle: "Literary, analytical, and profound. سرد نقدي وتشريحي يسلط الضوء على المعاني الخفية والماورائيات وما بين السطور (سم في العسل). يعتمد على المقارنات الأدبية والتاريخية.",
      visualAudioStyle: "Old yellowish paper overlays, vintage typewriter sounds, cinematic archival film reels, film clapperboard sounds.",
      archivalTreasureRules: "يجب التركيز على المراجعات النقدية القديمة، لقاءات الكُتّاب النادرة، المسودات الأولى للروايات، والمقارنات الصارمة بين الرواية واقتباساتها السينمائية (Versus Mode).",
      ragVaults: ["مكتبة الإسكندرية الرقمية", "أرشيف مجلة الهلال الثقافية", "مخطوطات ومسودات الروائيين", "أرشيف السينما المصرية"],
    };
  } else if (mood === "كلاكيت وتزوير") {
    return {
      researchAngle: "أسرار الصناعة الإعلامية والسينمائية العربية، بروباجندا فترة الستينات، خدع بصرية تاريخية.",
      scriptingStyle: "Cynical media analysis. تحليل إعلامي ساخر يكشف الوهم، سرد تفكيكي.",
      visualAudioStyle: "Glitchy TV effects, high contrast studio lighting.",
      archivalTreasureRules: "يجب استخراج المصادر من: مجلة الكواكب، الموعد، حوارات تليفزيونية نادرة على ماسبيرو زمان، ومذكرات المخرجين والمنتجين العرب.",
    };
  } else if (mood === "ملفات متقفلش") {
    return {
      researchAngle: "قضايا نصب كبرى (ريان، أشرف مروان)، ألغاز لم تحل، اختفاء شخصيات عامة في ظروف غامضة.",
      scriptingStyle: "Hard-boiled investigator. محقق صحفي عنيد يربط الخيوط ببعضها ويكتب بأسلوب تقرير المباحث.",
      visualAudioStyle: "Interrogation light, neon noir, fast cuts.",
      archivalTreasureRules: "يجب استخراج المصادر من: تحقيقات النيابة المنسية، مانشيتات الحوادث في جريدة الجمهورية والمساء، التقارير الرقابية المسربة.",
    };
  } else if (mood === "خرافات شعبية") {
    return {
      researchAngle: "تفكيك الخرافات والأساطير المصرية والعربية (صيادين النداهة، السحر السفلي) باستخدام المنهج العلمي والتاريخي.",
      scriptingStyle: "Skeptical, logic-driven yet mocking. ساخر مبني على المنطق.",
      visualAudioStyle: "Macro shots of talismans being destroyed, clean white lab light.",
      archivalTreasureRules: "يجب استخراج المصادر من: كتب التراث مثل (البداية والنهاية)، مخطوطات السحر القديمة (شمس المعارف) ومقارنتها بالدراسات الأنثروبولوجية الحديثة لمجلة المقتطف.",
    };
  } else if (mood === "حكاوي الأجداد") {
    return {
      researchAngle: "سرد أصول قصص الرعب التراثية والأساطير المصرية والعربية بطريقة مشوقة، مع ربطها بالأحداث التي جعلت الناس تؤمن بها زمان (مثل توقيت ظهور أسطورة السلعوة في التسعينات).",
      scriptingStyle: "أسلوب الحكّاء الغامض، الغني بالنوستالجيا، والذي يترك مساحة صغيرة للشك والخوف، لكي يجذب انتباه الجيل الأصغر.",
      visualAudioStyle: "إيحاءات الرعب الكلاسيكية (إضاءة خافتة، ظلال، زوايا كاميرا واسعة للقرى أو الحارات القديمة).",
      archivalTreasureRules: "الاعتماد على حكايات الرواة الشفهية المطلية بالطابع الرسمي (مثل أخبار الحوادث الغريبة في الجرائد القديمة، ومقالات الفلكلور الشعبي في المجلات القديمة).",
    };
  } else if (mood === "سبوبة ولا ابتكار") {
    return {
      researchAngle: "أغرب قصص البيزنس والشركات الوهمية في مصر والشرق الأوسط، اختراعات الفنكوش.",
      scriptingStyle: "Business-cynical. سرد ساخر من ثقافة 'الفهلوة' والبيزنس.",
      visualAudioStyle: "Shiny cheap surfaces, fast-paced 'salesman' energy.",
      archivalTreasureRules: "يجب استخراج المصادر من: صفحات الاقتصاد في الأهرام بالثمانينات، إعلانات الشركات الوهمية في الصحف الصفراء، ومحاضر النصب والاحتيال المالي.",
    };
  } else if (mood === "حواديت شوارع") {
    return {
      researchAngle: "تاريخ الشارع المصري، حكايات المقاهي، القهاوي الثقافية، وتاريخ الفتوات والعصابات المحلية.",
      scriptingStyle: "Gritty, authentic, street-smart vernacular. لغة شارع واقعية خام بتوثيق تاريخي.",
      visualAudioStyle: "Handheld camera feel, raw local sounds, bustling street aesthetics.",
      archivalTreasureRules: "يجب استخراج المصادر من: مذكرات نجيب محفوظ، مجلة المصور، أرشيف التصوير الفوتوغرافي لفان ليو، وكتب التراث الشعبي لخيري شلبي.",
    };
  } else if (mood === "صراع العروش العربي") {
    return {
      researchAngle: "مكائد سياسية، انقلابات، ودماء في البلاط الملكي أو فترات الخلافة الإسلامية.",
      scriptingStyle: "Epic, dramatic, Machiavellian. سرد درامي ملحمي يركز على الخيانة والسلطة.",
      visualAudioStyle: "Grand orchestral background, maps with moving pieces, dark dramatic lighting.",
      archivalTreasureRules: "يجب استخراج المصادر من: تاريخ الطبري، مسالك الأبصار، وثائق الإمبراطورية العثمانية المترجمة، خطابات الملوك والرؤساء السريّة.",
    };
  } else if (mood === "تكنولوجيا مرعبة") {
    return {
      researchAngle: "استخدامات مرعبة للتكنولوجيا في الرقابة والمراقبة، الاختراقات السيبرانية في العالم العربي.",
      scriptingStyle: "Paranoid, cautionary. بارانويا تقنية، سرد تحذيري ومرعب من المستقبل.",
      visualAudioStyle: "Cyberpunk neon greens, glitching text, terrifying sterile tech environments.",
      archivalTreasureRules: "يجب استخراج المصادر من: تقارير السايبرسكيورتي (Kaspersky, Citizen Lab) المرتبطة بالشرق الأوسط، تسريبات ويكيليكس، والمنتديات التقنية المظلمة (Darweb).",
    };
  } else if (mood === "اقتصاد الشارع") {
    return {
      researchAngle: "أسواق سوداء، اقتصاد الظل، تسعير الدولار، كيف تنجو الطبقات الكادحة ميكرو-اقتصادياً.",
      scriptingStyle: "Fast-talking financial. تحليل اقتصادي شعبي وسريع.",
      visualAudioStyle: "Counting money machines, red stock market charts crashing, dim warehouse lighting.",
      archivalTreasureRules: "يجب استخراج المصادر من: أرقام الجهاز المركزي للتعبئة والإحصاء القديمة جداً، تقارير البنك الدولي، مانشيتات مجلة रोज اليوسف عن الأزمات التموينية.",
    };
  } else if (mood === "ملفات مخابراتية") {
    return {
      researchAngle: "جواسيس، عمليات سرية في الشرق الأوسط، حروب الجيل الرابع، وكواليس الحروب.",
      scriptingStyle: "Secretive, whispering, highly tactical. سرد تكتيكي همسي وسري.",
      visualAudioStyle: "Redacted files, red string conspiracy boards, typewriter sounds.",
      archivalTreasureRules: "يجب استخراج المصادر من: مذكرات قادة ورجال المخابرات العامة (مثل مذكرات أمين هويدي)، الوثائق البريطانية والأمريكية المفرج عنها (Declassified FOIA)، وأرشيف حرب أكتوبر.",
    };
  } else if (mood === "طريقة الدحيح") {
    return {
      researchAngle: "دمج الظواهر العلمية والاقتصادية والتاريخية المعقدة بأمثلة شعبية مصرية مبسطة (Pop-Science).",
      scriptingStyle: "Sarcastic, highly energetic, relatable Egyptian analogies. استعراضي، كوميدي، يستخدم استعارات مصرية من الحياة اليومية.",
      visualAudioStyle: "Fast-paced montage, comedic visual overlays, animated cutouts.",
      archivalTreasureRules: "يجب استخراج المصادر من: أوراق بحثية من Nature أو Science أو هارفارد بيزنس ريفيو، ومزجها فجأة مع أمثلة من أفلام عادل إمام أو مواقف الميكروباص.",
    };
  } else if (mood === "خرائط دموية (Faceless)") {
    return {
      researchAngle: "شرح التحركات العسكرية، الجغرافيا السياسية، والنزاعات الحدودية بأسلوب الخرائط.",
      scriptingStyle: "Analytical, strategic. سرد تحليلي يعتمد على المكان والزمان.",
      visualAudioStyle: "Animated maps, glowing borders, parchment textures.",
      archivalTreasureRules: "يجب استخراج المصادر من: خرائط هيئة المساحة أيام الملكية، أطالس تاريخية لمركز دراسات الوحدة العربية، ووثائق المعاهدات الحدودية.",
    };
  } else if (mood === "سبورة بيضاء (Whiteboard)") {
    return {
      researchAngle: "تبسيط النظريات السلوكية أو الاقتصادية باستخدام رسوم بيانية بسيطة وتشابيه.",
      scriptingStyle: "Friendly, educational. أستاذ يشرح لتلميذه بصبر وود.",
      visualAudioStyle: "Hand-drawn sketches forming on a whiteboard, marker squeak sounds.",
      archivalTreasureRules: "يجب استخراج المصادر من: الكتب التعليمية المبسطة، تجارب اقتصاد السلوك، والأوراق الأكاديمية التأسيسية للمفاهيم.",
    };
  } else if (mood === "محاكمة التاريخ") {
    return {
      researchAngle: "إعادة تقييم شخصيات تاريخية (مثل: هل كان الحجاج مجرماً أم منقذاً؟ هل الخديوي إسماعيل باني أم مخرب؟).",
      scriptingStyle: "Argumentative, legal. مرافعة محكمة، استعراض الأدلة، اعتراض، دحض.",
      visualAudioStyle: "Gavel sounds, split-screen 'for' and 'against' visuals, paper stamping effects.",
      archivalTreasureRules: "يجب استخراج المصادر من: محاضر الجلسات الرسمية، خطابات الدفاع التاريخية، ومقارنة بين كتابات المؤرخين المتعاطفين والمعادين (مثال: الجبرتي ضد الفرنسيين).",
    };
  } else if (mood === "اقتصاد البقاء") {
    return {
      researchAngle: "التضخم الجامح، انهيار العملات تاريخياً، مجاعات سابقة، وكيف يتصرف الناس وقت الكارثة.",
      scriptingStyle: "Urgent, gritty. سرد محموم يبحث عن النجاة.",
      visualAudioStyle: "Shaky cam feel, street-level b-roll, ticking clocks.",
      archivalTreasureRules: "يجب استخراج المصادر من: تقارير عن 'الشدة المستنصرية' للمقريزي، بيانات الفقر من الأمم المتحدة، يوميات البقاء في فترات الحصار بالدول العربية.",
    };
  } else if (mood === "جبل الجليد (Iceberg)") {
    return {
      researchAngle: "رحلة من الحقائق المعروفة للجميعنزولاً إلى النظريات المظلمة والأسرار المرعبة التي لا يعرفها أحد.",
      scriptingStyle: "Gradually darkening. سرد يبدأ طبيعياً وينتهي ببارانويا ورعب.",
      visualAudioStyle: "Iceberg graphic transitions, increasingly distorted music.",
      archivalTreasureRules: "يجب استخراج المصادر من: الأخبار السائدة للقمة، ثم الغوص في منتديات الديب ويب، تسريبات 4chan، وأبحاث هامشية لم يتم أخذها بجدية.",
    };
  } else if (mood === "همس الحكايات (Dark ASMR)") {
    return {
      researchAngle: "حكايات رعب حقيقية أو جرائم موثقة لكن موصوفة بحواس شديدة الدقة والقرب.",
      scriptingStyle: "Soft-spoken, deeply sensory. سرد هامس، بطيء، يركز على الأصوات والروائح.",
      visualAudioStyle: "Pure ASMR format, minimal visuals.",
      archivalTreasureRules: "يجب استخراج المصادر من: يوميات القتلة المتسلسلين (مثل ريا وسكينة من محاضر التحقيق الرسمية)، ووصف تفصيلي من تقارير الطب الشرعي القديمة جداً.",
    };
  } else if (mood === "شريط ملعون (Found Footage)") {
    return {
      researchAngle: "قضايا اختفاء غامضة، رحلات استكشافية فشلت، أو مقاطع فيديو غريبة تم تحليلها.",
      scriptingStyle: "Fragmented, panicked. سرد مبني على تقطيع الأحداث واستعراض التسجيلات.",
      visualAudioStyle: "VHS scanlines, date/time overlays, visual glitches.",
      archivalTreasureRules: "يجب استخراج المصادر من: أرشيف الراديو القديم (هنا القاهرة أيام الغارات)، ملفات تحقيقات الطيران الغامضة، وقصاصات يوميات مفقودة.",
    };
  } else if (mood === "مسافر عبر الزمن") {
    return {
      researchAngle: "شرح أحداث بديهية لنا كأنها خيال علمي من الماضي، أو شرح الماضي بنظرة مستهزئة من المستقبل.",
      scriptingStyle: "Nostalgic, detached. راوي ينظر من مسافة زمنية بعيدة.",
      visualAudioStyle: "Futuristic HUDs or ancient parchment framing.",
      archivalTreasureRules: "يجب استخراج المصادر من: رسومات مستقبلية لمدينة القاهرة تعود للسبعينات، روايات خيال علمي عربية قديمة (نهاد شريف)، ومقالات 'كيف سيبدو عام 2000' المنشورة في الخمسينات.",
    };
  } else if (mood === "فلوق استقصائي (Vlog)") {
    return {
      researchAngle: "النزول للشارع، استعراض الأماكن الحقيقية، والبحث الميداني العشوائي الذي يقود لحقائق صادمة.",
      scriptingStyle: "Spontaneous, energetic, street-level. استخدام مصطلحات مثل: 'نزلت بنفسي، سألت الناس، اكتشفت كارثة'.",
      visualAudioStyle: "Shaky handheld camera style, jump cuts, ambient street noise.",
      archivalTreasureRules: "استخدم تصريحات سكان محليين، صور حقيقية للكافيهات والحواري، وثائق متداولة بين الناس وليس في الكتب.",
    };
  } else if (mood === "بودكاست كرسي الاعتراف") {
    return {
      researchAngle: "تجسيد شخصية مثيرة للجدل أو تحليل لقاءات وحوارات كشفت أسراراً خطيرة، مع التركيز على لغة الجسد.",
      scriptingStyle: "Conversational, interrogative. سؤال وجواب، تركيز على التناقضات.",
      visualAudioStyle: "Dark studio lighting, slow zooms on faces, tension building music.",
      archivalTreasureRules: "حلل لقاءات قديمة من التلفزيون المصري، مذكرات شخصية بخط اليد، وتصريحات صحفية تم التراجع عنها.",
    };
  } else if (mood === "القصة وراء التريند") {
    return {
      researchAngle: "تأجيج القصص السريعة من السوشيال ميديا وتفكيك أصلها التاريخي والاجتماعي العميق.",
      scriptingStyle: "Fast-paced, hook-heavy. سرد يبدأ بفيديو تريند ثم يغوص في التاريخ.",
      visualAudioStyle: "Fast cut memes transitioning into serious historical footage, energetic beats.",
      archivalTreasureRules: "اربط بين نكت الميمز الحالية وبين قفشات الجرائد الفكاهية القديمة وحوادث مشابهة انشغل بها الرأي العام قديماً.",
    };
  } else if (mood === "التفكيك التاريخي") {
    return {
      researchAngle: "تفكيك السرديات التاريخية السائدة، ربط الأحداث القديمة بالواقع المعاصر، استخراج الوثائق المخفية.",
      scriptingStyle: "Analytical, profound, objective yet mysterious. سرد تحليلي عميق يبحث ما وراء السطور.",
      visualAudioStyle: "Slow pan over ancient texts, minimal cinematic ambient music, precise chronological transitions.",
      archivalTreasureRules: "الاعتماد على أرشيف الوثائق الرسمية، المذكرات غير المنشورة، وأمهات الكتب التاريخية التي لم يتم تداولها.",
      ragVaults: ["مكتبة الإسكندرية (المخطوطات)", "أرشيف الأهرام التاريخي", "مذكرات السياسيين المصريين", "دار الوثائق القومية المصرية"],
    };
  } else if (mood === "التحليل الاستقصائي") {
    return {
      researchAngle: "النبش في الفساد، تتبع الأموال، فك شفرات الجريمة المنظمة، وتتبع مسار الأحداث المجهولة.",
      scriptingStyle: "Journalistic, sharp, revealing. سرد صحفي استقصائي، يقدم أدلة قاطعة ولا يعتمد على التخمين.",
      visualAudioStyle: "Red string connections, macro shots of documents, uneasy pulse music.",
      archivalTreasureRules: "استهداف التقارير المسربة، أوراق النيابة العامة، تصريحات شهود العيان النادرة، وتقارير الشفافية الدولية.",
      ragVaults: ["سجلات المحاكم الجنائية", "سجلات الرقابة الإدارية", "تقارير الصحافة الاستقصائية العربية", "أرشيف الجرائم الغامضة (الحوادث)"],
    };
  } else if (mood === "الدراما السوداء") {
    return {
      researchAngle: "رصد الجوانب المظلمة للنفس البشرية، الجرائم النفسية الدقيقة، والدوافع المروعة.",
      scriptingStyle: "Dark, narrative-driven, psychological. سرد درامي كئيب، يغوص في الدوافع النفسية للمجتمع والأفراد.",
      visualAudioStyle: "High contrast lighting, desaturated colors, eerie silences punctuated by tense strings.",
      archivalTreasureRules: "تحليل الجرائم غير المبررة، تقارير الطب الشرعي والطب النفسي، وملاحظات المحققين.",
      ragVaults: ["كتب علم النفس الجنائي بالعربية", "تقارير مستشفى العباسية للأمراض النفسية", "ملفات الطب الشرعي المصري"],
    };
  } else if (mood === "الغموض الفلسفي") {
    return {
      researchAngle: "طرح أسئلة وجودية حول الظواهر، التشكيك في البديهيات والمفاهيم العميقة التي تحرك الجماهير.",
      scriptingStyle: "Philosophical, questioning, vast. توجيه أسئلة بلا إجابة، سرد ميتافيزيقي يجعل المشاهد يعيد التفكير في واقعه.",
      visualAudioStyle: "Vast landscapes, cosmic or miniature scale visuals, slow ethereal music.",
      archivalTreasureRules: "ربط الأحداث بالمدارس الفلسفية القديمة، تحليل الظاهراتية، مقولات الفلاسفة وانعكاسها على الحوادث المجتمعية المستحدثة.",
      ragVaults: ["كتب الفلسفة الإسلامية والعربية", "أمهات الكتب في علم الاجتماع (ابن خلدون)", "مقالات زكي نجيب محمود ومصطفى محمود"],
    };
  }
  return { researchAngle: "بحث موضوعي", scriptingStyle: "سرد تقليدي", visualAudioStyle: "مرئي عام", archivalTreasureRules: "ابحث في الموسوعات العامة" };
}

export function getSystemPrompt(): string {
  const currentDNA = getChannelDNA("barwaz_classic");
  const basePrompt = buildSystemPrompt(currentDNA);
  
  // Read Conflict Bias from localStorage to inject into systemic logic
  let conflictBias = "50";
  try {
    conflictBias = localStorage.getItem("conflictBias") || "50";
  } catch (e) {
    // ignore
  }

  const conflictInstructions = `
[SYSTEM OVERRIDE: CONFLICT BIAS V3]
Conflict Bias Ratio: ${conflictBias}% (100% means extreme investigative scrutiny, seeking contradictions, and attacking official narratives).
CRITICAL DIRECTIVE: You MUST adjust the level of conflict, contradiction highlighting, and skeptical 'نبش' (digging) to match this percentage. If it's above 70%, heavily emphasize narrative gaps and conflicting archival documents.
`;

  return basePrompt + "\n" + conflictInstructions;
}

const GLOBAL_IMAGE_STYLE = "Hand-drawn Ink Sketch, deep black ink, etching style, high contrast, fine line work, masterpiece, highly detailed, expressive strokes";
const GLOBAL_NEGATIVE_PROMPT = "Western features, European people, blue eyes, blonde hair, 3d render, cartoon, plastic, typography, text, letters, watermarks, signatures, blurry, low resolution, multiple people";

export function applyGlobalStyle(prompt: string, mood?: MoodType): string {
  if (!prompt || prompt.trim() === "") return prompt;

  let finalPrompt = prompt;
  
  // Add base DNA
  if (!finalPrompt.toLowerCase().includes("ink sketch")) {
    finalPrompt = `${finalPrompt}, ${GLOBAL_IMAGE_STYLE}`;
  }

  // Add Paper Texture DNA
  if (!finalPrompt.toLowerCase().includes("paper")) {
    finalPrompt = `${finalPrompt}, on aged vintage yellowed paper with coffee stains and ink splatters, rough paper texture`;
  }

  // Add Marginalia DNA
  if (!finalPrompt.toLowerCase().includes("margin")) {
    finalPrompt = `${finalPrompt}, messy handwritten Arabic calligraphy scribbles in the side margins as annotations`;
  }

  // Add Egyptian Soul DNA (Anti-Euro bias)
  finalPrompt = `${finalPrompt}, authentic Egyptian features, dark hair, olive skin, Cairene soul`;

  // Add Negative Prompt
  if (!finalPrompt.includes(GLOBAL_NEGATIVE_PROMPT)) {
    finalPrompt = `${finalPrompt} --no ${GLOBAL_NEGATIVE_PROMPT}`;
  }

  // Add Aspect Ratio
  if (!finalPrompt.includes("--ar")) {
    finalPrompt = `${finalPrompt} --ar 16:9`;
  }

  return finalPrompt;
}

function cleanUrl(url: string): string {
  if (!url) return "";
  const match = url.match(/https:\/\/[^\s]+/);
  if (match) {
    return match[0].replace(/\/$/, "");
  }
  return url.trim().replace(/\/$/, "");
}

export async function generateAIContentRaw(
  prompt: string,
  schema?: any,
  engine?: string,
  onChunk?: (text: string) => void,
  signal?: AbortSignal,
  useGrounding?: boolean,
  temperature: number = 0.8
): Promise<string> {
  const engineSystemInstruction = `أنت "محرك النبّاش"، نظام ذكاء اصطناعي متقدم مخصص حصرياً لإنتاج نصوص وثائقية استقصائية احترافية لصالح منصة "برواز". 

يجب الالتزام الصارم والخوارزمي بالقواعد التالية (أي كسر لهذه القواعد يعتبر فشلاً للنظام):

1. الهوية والنبّاش (Persona Identity - CRITICAL):
- النبرة دايماً تحليلية، استقصائية، وغامضة. أنت "النبّاش" الذي يبحث خلف السطور.
- يُمنع منعاً باتاً استخدام كليشيهات اليوتيوب المعتادة نهائياً (ممنوع تماماً استخدام عبارات مثل "يا عزيزي"، "بص يا سيدي"، وما شابهها).
- السرد يجب أن يكون بـ "العامية القاهرية البيضاء" الراقية والموزونة، مع الالتزام التام بالقواعد النحوية السليمة. لا تخاطب المشاهد بشكل مباشر مبتذل، ادخل في عمق القصة والتحليل فوراً.

2. المصفاة اللغوية (The Blacklist - CRITICAL):
- يُمنع تماماً استخدام أي من هذه الكليشيهات: (${BLACKLIST_WORDS.join('، ')}).
- لا تخاطب المشاهد بشكل مباشر مبتذل، ادخل في عمق القصة والتحليل فوراً.

3. قاعدة الدرع البصري (Identity Guard):
- يُمنع منعاً باتاً تجسيد الوجوه البشرية أو الملامح المباشرة في أوامر توليد الصور. استخدم الاستعارة المادية فقط (أيدي، ظلال، أوراق، أماكن).

4. قاعدة الإخراج الصوتي (Audio & Pacing):
- استخدم علامة [صمت درامي لمدة ٣ ثواني] بعد المعلومات الصادمة. اكتب الكلمات بحروفها القياسية (اكتب "القهوة" وليس "الأهوة").

5. قاعدة حماية النصوص البصرية (Visual Text Lock):
- النص المطلوب داخل التصميمات يكتب EXACTLY كما هو بالعربية. لا لترجمة النصوص داخل التصميم.

6. بروتوكول Narrative DNA v2.1:
- الالتزام الصارم بقواعد (HCS/HAP) في الافتتاحية.
- إدارة دوائر الفضول (Open Loops) عبر علامات O و C.
- إنهاء الفيديو بأسلوب (Guillotine Ending) الصادم دون خاتمة تقليدية.`;

  try {
    const globalEngine = typeof window !== "undefined" ? localStorage.getItem("globalEngine") || "gemini" : "gemini";
    const quotaShield = typeof window !== "undefined" ? localStorage.getItem("isQuotaShield") !== "false" : true;
    
    // Use engine if explicitly provided, else use globalEngine
    const targetEngine = engine || globalEngine;

    const performFetch = async () => {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          systemInstruction: engineSystemInstruction,
          engine: targetEngine,
          schema,
          temperature,
          quotaShield
        }),
        signal
      });

      if (!response.ok) {
         const textResp = await response.text();
         let errStr = "خطأ في الاتصال بالخادم";
         try {
             const errObj = JSON.parse(textResp);
             errStr = errObj.error || errStr;
         } catch (e) {
             if (textResp.includes("502") || textResp.includes("504")) {
                 errStr = "الخادم لا يستجيب حالياً (ضغط أو انقطاع)";
             }
         }
         throw new Error(errStr);
      }
      
      const data = await response.json();
      return cleanToEgyptianArabic(data.content);
    };

    if (targetEngine === "ollama") {
      return await ollamaQueue.add(performFetch, signal);
    } else {
      return await performFetch();
    }
  } catch (err: any) {
    if (err.name === 'AbortError') throw err;
    throw err;
  }
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function callWithRetry(
  fn: () => Promise<any>,
  retries = 3,
  baseDelay = 2000,
  signal?: AbortSignal
): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
      return await fn();
    } catch (error: any) {
      if (signal?.aborted) {
        console.log("Client cancelled the operation");
        throw new DOMException("Aborted", "AbortError");
      }
      if (i === retries - 1) {
        console.error("CRITICAL API FAILURE after max retries:", error);
        throw error; // Let the caller handle the final error
      }
      
      const errorMessage = error?.message?.toLowerCase() || "";
      
      if (error.name === "AbortError") throw error;
      
      // Known unrecoverable proxy errors or clear connectivity instructions
      const isStartingServerError = errorMessage.includes("السيرفر الداخلي") || errorMessage.includes("starting server");
      const isMissingApiKeys = errorMessage.includes("فشل كلا المزودين") || errorMessage.includes("المفتاح غير صالح");
      const isOllamaConnectivityError = errorMessage.includes("ollama") || errorMessage.includes("failed to fetch");
      const isSyntaxErrorProxyHtml = errorMessage.includes("unexpected token < in json");
      const isAllKeysSuspended = errorMessage.includes("429_all_keys_suspended");
      
      const isUnrecoverable = isAllKeysSuspended || isOllamaConnectivityError || isMissingApiKeys || errorMessage.includes("403") || errorMessage.includes("400") || errorMessage.includes("invalid url") || errorMessage.includes("html") || isSyntaxErrorProxyHtml;

      if (!isStartingServerError && isUnrecoverable) {
         // Quietly throw the clear error message to the UI without double logging
         throw error;
      }
      
      // Only log transient errors during retry attempts
      if (!isUnrecoverable) {
        console.warn(`Transient API error (Attempt ${i + 1}/${retries}):`, errorMessage);
      }
      
      const isQuotaError = errorMessage.includes("quota") || errorMessage.includes("429") || errorMessage.includes("resource_exhausted") || errorMessage.includes("too many requests") || errorMessage.includes("proxy error");
      
      let waitTime = baseDelay * Math.pow(2, i);
      
      if (isQuotaError) {
        waitTime = 3000; // Wait 3 seconds for quota or transient proxy errors (since backend handles 1st fallback)
      }
      
      await sleep(waitTime);
    }
  }
}

export function safeJsonParse(text: string, fallback: any = null) {
  if (!text || typeof text !== "string") return fallback;
  
  // Clean markdown backticks common in LLM outputs
  let cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();

  // If there's text before the first [ or {, strip it out
  const firstBrace = cleanedText.indexOf('{');
  const firstBracket = cleanedText.indexOf('[');
  
  let startIndex = -1;
  if (firstBrace !== -1 && firstBracket !== -1) {
    startIndex = Math.min(firstBrace, firstBracket);
  } else if (firstBrace !== -1) {
    startIndex = firstBrace;
  } else if (firstBracket !== -1) {
    startIndex = firstBracket;
  }
  
  if (startIndex !== -1) {
    const lastBrace = cleanedText.lastIndexOf('}');
    const lastBracket = cleanedText.lastIndexOf(']');
    let endIndex = Math.max(lastBrace, lastBracket);
    
    if (endIndex !== -1 && endIndex > startIndex) {
        cleanedText = cleanedText.substring(startIndex, endIndex + 1);
    } else {
        cleanedText = cleanedText.substring(startIndex);
    }
  }

  try {
    return JSON.parse(cleanedText);
  } catch (e) {
    try {
      if (cleanedText.startsWith('{') && !cleanedText.endsWith('}')) {
          return JSON.parse(cleanedText + '}');
      }
      if (cleanedText.startsWith('[') && !cleanedText.endsWith(']')) {
          return JSON.parse(cleanedText + ']');
      }
    } catch(e3) {}

    console.error("❌ Barwaz: JSON Parse Failed. Text was:", cleanedText);
    throw new Error("JSON Parse Failed: " + cleanedText.substring(0, 500));
  }
}

export async function generateTitle(
  topic: string,
  mood: MoodType,
  note: string,
  engine = "gemini",
  onChunk?: (text: string) => void,
  signal?: AbortSignal
): Promise<RadarSuggestion[]> {
  const moodContext = getMoodContext(mood);
  let specificRules = "";

  // Ideation Engine V2: Dynamic Seed Matrices for Randomness
  const eras = [
    "مصر في القرن التاسع عشر", "حقبة المماليك", "أوائل القرن العشرين",
    "فترة الستينيات الباردة", "عصر النهضة العمرانية القديمة", "الحرب العالمية في مصر"
  ];
  const domains = [
    "الطب الشعبي والتشريح", "الهندسة المعمارية الغامضة", "الجاسوسية والوثائق السرية",
    "جرائم غير محلولة بعبقرية", "مخطوطات اختفت فجأة", "انهيار اقتصادي تاريخي منسي",
    "صراعات فكرية أدت لجرائم"
  ];
  const angles = [
    "الخيانة من أٌقرب الناس", "الجشع الذي دمر مدينة", "الفرصة الذهبية التي تحولت للعنة",
    "الصدفة التي غيرت التاريخ", "الغرور الذي أعمى البصيرة", "العبقرية المجنونة"
  ];

  const randomEra = eras[Math.floor(Math.random() * eras.length)];
  const randomDomain = domains[Math.floor(Math.random() * domains.length)];
  const randomAngle = angles[Math.floor(Math.random() * angles.length)];

  const isRandomSeed = !topic || topic.trim() === "";
  const effectiveTopic = isRandomSeed 
      ? `[Dynamic Seed]: فكرة عشوائية وتاريخية تدور حول (${randomDomain}) في (${randomEra}) مع تركيز درامي على (${randomAngle}).` 
      : topic;

  if (mood === "حكاوي الأجداد" && isRandomSeed) {
    specificRules = `\nCRITICAL OVERRIDE FOR THIS MOOD (NO TOPIC PROVIDED): You MUST generate these exact or very closely related concepts: 
1. "القصة الحقيقية وراء اختراع السلعوة" (The real story behind the Silawea myth in the 90s)
2. "النداهة: رعب ليالي الدلتا" (El Naddaha: Horrors of the Delta nights)
3. "أمنا الغولة وأبو رجل مسلوخة" (The origin of childhood bogeymen).`;
  }

  const prompt = `[Agent: Editor in Chief - Archive Desk]
${getSystemPrompt()}
Task: Generate exactly 3 highly creative, deeply researched, and culturally significant YouTube video ideas based on raw archival logic for an Egyptian audience.
You MUST provide 3 distinct types of angles:
1. "الزاوية المنطقية" (Logical/Documentary): A grounded, fact-heavy approach focusing on historical evidence.
2. "زاوية صراع العقول" (Controversial/Conspiracy): A debate-heavy or mysterious angle that explores controversy, hidden truths, or conflicting theories.
3. "زاوية السرد الأرشيفي" (Deep Archival): A nostalgic or archive-focused approach that treats the story like a found document or a buried secret.

Topic/Seed: ${effectiveTopic}
Selected Journalistic Mood: ${mood}
${specificRules}

=== RESEARCH ANGLES & RULES FOR THIS MOOD ===
Research Angle Focus: ${moodContext.researchAngle}
Scripting Style Focus: ${moodContext.scriptingStyle}
MUST PULL TREASURES FROM (ARCHIVAL SOURCES RULE): ${moodContext.archivalTreasureRules}
Additional User Notes: ${note}

CRITICAL REQUIREMENTS:
1. OVERALL TONE & ORTHOGRAPHY (Few-Shot Prompting):
   You MUST write the hook in Clean Cairene Egyptian Arabic. Do NOT use literal phonetic spelling for words that have standard Arabic roots.
   - ❌ BAD: "تخيل إن الأهوة اللي بتشربها كل يوم كانت في يوم من الأيام سبب في حريقة كبيرة في أزأة القاهرة." (Phonetic spelling)
   - ✅ GOOD: "تخيل إن القهوة اللي بتشربها كل يوم، كانت في يوم من الأيام سبب في حريقة بطول القاهرة، حريقة بدأت من أزقة مجهولة لحد ما التهمت نص البلد." (Clean spelling, authentic flow)
   - ❌ BAD: "الراجل ده كان محفوض في التاريخ، بس فجأة اختفى."
   - ✅ GOOD: "الراجل ده كان محفوظ في سجلات التاريخ، لحد ما اسمه اتمسح بجرة قلم."
2. THE FORBIDDEN ARCHIVE: The ideas must sound like they were dug out of a dusty cabinet. You MUST incorporate specific (real or highly plausible historical) Arabic sources seamlessly into the hook narrative.
3. NO CLICHÉS: Stop generating standard AI titles. Think like a real human Egyptian investigative journalist. NEVER repeat themes across requests.
4. EXACT COUNT AND CATEGORY: You MUST return exactly 3 ideas, one for each category mentioned above. Indicate the 'category' in the response.
5. NO REPETITION. Create completely unique, fresh angles distinct from common knowledge.

Output format: A JSON OBJECT.
{
  "suggestions": [
    {
      "id": 1,
      "category": "الزاوية المنطقية",
      "title": "Headline 1",
      "hook": "engaging Egyptian slang paragraph",
      "angle": "Brief strategy",
      "suspense_level": 8,
      "narrative_strategy": "HCS"
    }
  ]
}
STRICTLY return the JSON Object only. No markdown. No introductory text.`;

  return callWithRetry(async () => {
    const text = await generateAIContentRaw(
      prompt,
      {
        type: Type.OBJECT,
        properties: {
          suggestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.NUMBER },
                category: { type: Type.STRING },
                title: { type: Type.STRING },
                hook: { type: Type.STRING },
                angle: { type: Type.STRING },
                suspense_level: { type: Type.NUMBER, description: "Scale from 1 to 10" },
                narrative_strategy: { type: Type.STRING, description: "Either HCS or HAP" }
              },
              required: ["id", "title", "hook", "angle", "suspense_level", "narrative_strategy"],
            },
          },
        },
        required: ["suggestions"],
      },
      engine,
      onChunk,
      signal,
      false,
      0.96
    );

    const parsed = safeJsonParse(text, { suggestions: [] });
    let validSuggestions: RadarSuggestion[] = [];

    if (parsed && Array.isArray(parsed.suggestions)) {
      validSuggestions = parsed.suggestions;
    } else if (Array.isArray(parsed)) {
      validSuggestions = parsed;
    } else if (parsed && typeof parsed === "object" && (parsed as any).title) {
      validSuggestions = [parsed as any];
    }

    validSuggestions = validSuggestions.filter(s => s && s.title && s.title.trim() !== "" && s.hook && s.hook.trim() !== "");

    if (validSuggestions.length > 0) {
      return validSuggestions;
    }

    throw new Error("No valid ideas parsed from text: " + text.substring(0, 150));
  }, 3, 2000, signal);
}

export async function generatePackaging(
  videoTitle: string,
  researchData: string,
  mood: MoodType,
  allScenes: EpisodeScene[],
  engine = "gemini",
  onChunk?: (text: string) => void,
  signal?: AbortSignal
): Promise<{ packaging: any; shorts: any[]; omnichannel: any }> {
  const moodContext = getMoodContext(mood);
  const prompt = `[Agent: Omnichannel Packaging & Social Media]
${getSystemPrompt()}
العنوان: ${videoTitle}
المود (Mode Inheritance): ${moodContext.scriptingStyle} - You MUST adopt this exact tone for all generated material.

قم بتصميم حزمة نشر متكاملة (YouTube SEO, Shorts, Twitter Threads, Social Posts) مبنية على السكريبت التالي.
استخدم الـ (Mode Inheritance) لضمان أن لهجة المنشورات والوصف وكل المخرجات متوافقة تماماً مع الـ Mood.

RULES:
1. Anti-Cliché Rule (CRITICAL): The description and shorts must NEVER use clichés like 'يا عزيزي', 'كوباية الشاي', 'صدق أو لا تصدق'. The tone must be professional, factual, and deeply engaging.
2. NATIVE YOUTUBE STYLE: The description should tease the mystery and hook the viewer immediately using strong, direct Egyptian hooks.
3. OMNICHANNEL RECYCLING: You must generate an engaging 3-part Thread for Twitter/X and 2 posts for Facebook/LinkedIn.

[CRITICAL]: Your response must be PURE JSON matching the schema.
{
  "packaging": { "youtube_titles": ["string"], "thumbnail_concept": "string", "thumbnail_midjourney_prompt": "string", "description_al_daheeh_style": "string", "tags": ["string"] },
  "shorts": [ { "title": "string", "hook": "string", "body": "string", "cta": "string", "visual_instructions": "string" } ],
  "omnichannel": {
    "twitter_thread": ["string", "string", "string"],
    "social_posts": [
      { "platform": "Facebook/LinkedIn", "content": "string" },
      { "platform": "Instagram", "content": "string" }
    ]
  }
}`;

  return callWithRetry(async () => {
    const text = await generateAIContentRaw(
      prompt,
      {
        type: Type.OBJECT,
        properties: {
          packaging: {
            type: Type.OBJECT,
            properties: {
              youtube_titles: { type: Type.ARRAY, items: { type: Type.STRING } },
              thumbnail_concept: { type: Type.STRING },
              thumbnail_midjourney_prompt: { type: Type.STRING },
              description_al_daheeh_style: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["youtube_titles", "thumbnail_concept", "thumbnail_midjourney_prompt", "description_al_daheeh_style", "tags"],
          },
          shorts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                hook: { type: Type.STRING },
                body: { type: Type.STRING },
                cta: { type: Type.STRING },
                visual_instructions: { type: Type.STRING },
              },
              required: ["title", "hook", "body", "cta", "visual_instructions"],
            },
          },
          omnichannel: {
            type: Type.OBJECT,
            properties: {
              twitter_thread: { type: Type.ARRAY, items: { type: Type.STRING } },
              social_posts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    platform: { type: Type.STRING },
                    content: { type: Type.STRING }
                  },
                  required: ["platform", "content"]
                }
              }
            },
            required: ["twitter_thread", "social_posts"]
          }
        },
        required: ["packaging", "shorts", "omnichannel"],
      },
      engine,
      onChunk,
      signal
    );
    return safeJsonParse(text, { packaging: {}, shorts: [], omnichannel: { twitter_thread: [], social_posts: [] } });
  }, 3, 2000, signal);
}

export async function generateResearchMap(
  title: string,
  durationValue: number,
  mood: MoodType,
  note: string,
  engine = "gemini",
  onChunk?: (text: string) => void,
  signal?: AbortSignal
): Promise<MasterOutline & { sources: any[]; research_data: string }> {
  const numChapters =
    durationValue >= 60 ? 12 : Math.max(3, Math.round(durationValue / 5));
  const moodContext = getMoodContext(mood);
  let selectiveRag = "true";
  try { selectiveRag = localStorage.getItem("selectiveRag") || "true"; } catch (e) {}

  const ragDirective = selectiveRag === "true" 
    ? `\n[SELECTIVE RAG ACTIVATED]: Dynamically load only vaults matching the exact timeline and subject of the current chapter. Bypass irrelevant vaults to save VRAM and increase precision.` 
    : `\n[SELECTIVE RAG: OFF]: Querying all available vaults simultaneously.`;

  const prompt = `[LOCAL OLLAMA RAG EXTRACTION PIPELINE]
${getSystemPrompt()}
Video Title: ${title}
Target Duration: ${durationValue} minutes.
User Note / Context: ${note}
Selected Journalistic Mood: ${mood}

=== LOCAL RAG VAULTS INJECTION ===
Active Vaults: ${moodContext.ragVaults ? moodContext.ragVaults.join(' | ') : 'General Knowledge'}${ragDirective}
*SYSTEM DIRECTIVE*: You are operating as the Local Filter Agent. Synthesize heavy factual data primarily mimicking extraction from the "Active Vaults" listed above. Ensure the pipeline extracts facts, figures, and historical data strictly aligned with these vaults to prevent hallucination.

=== MOOD & STYLE CONSTRAINTS ===
Research Angle Focus: ${moodContext.researchAngle}
Scripting Style Focus: ${moodContext.scriptingStyle}
MUST PULL TREASURES FROM: ${moodContext.archivalTreasureRules}

Task: Gather mind-blowing, deeply researched, factual, and fascinating data for this topic. Break the video down into exactly ${numChapters} chapters that flow perfectly from one to the next, adhering to the "Research Angle" of the specified mood. The content MUST be dense, highly educational, yet presented with the narrative hooks of a master storyteller.

CRITICAL INSTRUCTIONS FOR CHAPTERS & RESEARCH:
1. YOU MUST NEVER REPEAT CHAPTER TITLES OR DESCRIPTIONS. EACH CHAPTER MUST BE 100% UNIQUE.
2. EXTREME DETAIL: Do not use generic summaries. Each chapter must explore a SPECIFIC, DISTINCT, and UNIQUE sub-topic, event, scientific phenomenon, or dimension of the story. 
3. Include fascinating historical anecdotes, weird statistics, or crazy facts that nobody knows. We want the audience to feel like they learned something incredibly valuable and niche.
4. If chapters represent chronologies, ensure they move forward logically. If they represent themes, ensure NO overlap.
5. Provide a strong hook or conflict for every single chapter in its description.
6. The "research_data" MUST be an extremely comprehensive, exhaustive, and heavily detailed encyclopedia of facts, dates, theories, and counter-arguments. You must not leave ANY important detail about the topic unmentioned. Cover the history, the scientific/logical explanation, the social/economic impacts, and the ultimate conclusion. Make the viewer feel they have received the definitive, ultimate summary of this topic. DO NOT SKIM.

CRITICAL INSTRUCTION FOR SOURCES & RAG CITATIONS: 
- You MUST prioritize authentic, high-quality ARABIC sources (e.g., historical documents, academic papers, books, encyclopedias, trusted journalism) that correspond to the Active RAG Vaults.
- Ensure that the citations are real, highly relevant, and impressive.
- Cite specific Arab authors, scientists, and historical figures relevant to the mood (e.g., Al-Khaldun, Zaki Naguib Mahmoud, Moustafa Mahmoud, etc.).

[CRITICAL]: Response MUST be PURE JSON.
{
  "global_visual_condition": "string (A unified visual identity/theme that MUST be respected by all b-roll and image prompts throughout the video. Examples: '1940s Noir, high contrast shadows, microfilm textures' or 'Cyberpunk data nodes, green vectors, glitch art')",
  "research_data": "string (A massive consolidated block of all the factual research, historical data, or deep insights about the topic. This acts as the brain for the entire script.)",
  "sources": [ { "title": "string", "url": "string", "info": "string" } ],
  "video_title": "string (A catchy title based on the mood)",
  "chapters": [ { "chapter_number": number, "chapter_title": "string (UNIQUE)", "chapter_description": "string", "key_points": ["string", "string"], "confidence_score": 95 } ],
  "thumbnail": { "image_prompt": "string", "text_on_image": "string" }
}`;

  return callWithRetry(async () => {
    const text = await generateAIContentRaw(
      prompt,
      {
        type: Type.OBJECT,
        properties: {
          global_visual_condition: { type: Type.STRING },
          research_data: { type: Type.STRING },
          sources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                url: { type: Type.STRING },
                info: { type: Type.STRING },
              },
              required: ["title", "url", "info"],
            },
          },
          video_title: { type: Type.STRING },
          chapters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                chapter_number: { type: Type.INTEGER },
                chapter_title: { type: Type.STRING },
                chapter_description: { type: Type.STRING },
                key_points: { type: Type.ARRAY, items: { type: Type.STRING } },
                confidence_score: { type: Type.INTEGER, description: "Score 0-100 indicating hard fact vs theory" },
              },
              required: [
                "chapter_number",
                "chapter_title",
                "chapter_description",
                "key_points",
                "confidence_score"
              ],
            },
          },
          thumbnail: {
            type: Type.OBJECT,
            properties: {
              image_prompt: { type: Type.STRING },
              text_on_image: { type: Type.STRING },
            },
            required: ["image_prompt", "text_on_image"],
          },
        },
        required: [
          "global_visual_condition",
          "research_data",
          "sources",
          "video_title",
          "chapters",
          "thumbnail",
        ],
      },
      engine,
      onChunk,
      signal,
      false,
      0.2
    );
    const parsed = safeJsonParse(text);
    if (!parsed || !parsed.chapters)
      throw new Error("فشل في استخراج الخريطة البحثية");
    return parsed;
  }, 3, 2000, signal);
}

export async function generateChapter(
  chapter: ChapterOutline,
  researchData: string,
  mood: MoodType,
  previousSummary: string,
  isFirst: boolean,
  isLast: boolean,
  videoTitle: string,
  targetWords: number,
  engine = "gemini",
  onChunk?: (text: string) => void,
  signal?: AbortSignal
): Promise<EpisodeScene[]> {
  const moodContext = getMoodContext(mood);

  // STAGE 1: BEAT SHEET PIPELINE
  const beatPrompt = `[Chapter Beat Sheet Extraction]
${getSystemPrompt()}

Video Title: ${videoTitle}
Chapter: ${chapter.chapter_title}
Context: ${chapter.chapter_description}

[Master Research Document]:
${researchData}

[CRITICAL INSTRUCTIONS]:
Extract a logical sequence of 3 to 5 narrative beats (sub-topics) to cover in this chapter based ONLY on the Research Document.
Each beat should be a specific point to discuss. 
Output format MUST be a pure JSON array of strings.
Example: { "beats": ["The origin of X", "The incident in 1999", "The aftermath and legacy"] }`;

  const beatText = await callWithRetry(async () => {
    return await generateAIContentRaw(
      beatPrompt,
      { type: Type.OBJECT, properties: { beats: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["beats"] },
      engine,
      undefined,
      signal
    );
  }, 3, 2000, signal);

  const beatParsed = safeJsonParse(beatText, { beats: [chapter.chapter_title] });
  let beats = beatParsed.beats;
  if (!Array.isArray(beats) || beats.length === 0) {
    beats = [chapter.chapter_title];
  }

  // STAGE 2: DRAFTING
  const allScenes: EpisodeScene[] = [];
  let sceneIndex = 1;
  let runningContext = previousSummary ? `PREVIOUS CHAPTER TRANSITION: ${previousSummary}\n\n` : "";

  for (let bIndex = 0; bIndex < beats.length; bIndex++) {
    const beat = beats[bIndex];
    if (signal?.aborted) throw new Error("Aborted");

    const scenePrompt = `[Scriptwriter - Scene Drafting]
${getSystemPrompt()}

Video Title: ${videoTitle}
Chapter: ${chapter.chapter_title}
Current Narrative Beat: ${beat}

[Master Research Document (Source of Truth)]:
${researchData}

[PREVIOUS CONTEXT TO AVOID REPETITION]:
${runningContext}

[CRITICAL INSTRUCTIONS - CLEAN CAIRENE ORTHOGRAPHY & ANTI-LOOPING]:
1. Write the "voice_over" for this specific beat IN CLEAN CAIRENE EGYPTIAN ARABIC (روح وكلمات اللهجة القاهرية النظيفة).
2. ORTHOGRAPHY (NEGATIVE CONSTRAINT): يُمنع منعاً باتاً استبدال حرف القاف (ق) بالألف (أ)، أو الظاء (ظ) بالضاد (ض)، أو الثاء (ث) بالتاء (ت). اكتب المفردات القاهرية بحروف عربية قياسية صحيحة إملائياً. 
3. ANTI-LOOPING: DO NOT repeat any information from the [PREVIOUS CONTEXT]. Focus strictly on new facts related to the current beat: "${beat}". يُمنع تكرار أي معلومة ذُكرت سابقاً.
4. NO OVER-TAGGING IN VOICEOVER: Do NOT insert directorial tags or brackets like [صمت درامي لمدة ٣ تواني] inside the "voice_over" string under any circumstances! Put all visual/audio cues ONLY in the "visual_cue" or "sfx" fields.
5. DENSITY (CRITICAL): Provide DENSE, highly detailed, and fascinating information. Expand this beat extensively! You MUST generate a robust chunk of narrative (target 300-400 words) to ensure the 30-minute duration is actually met. Do not summarize or skim.

Output format: A JSON OBJECT containing a single property "scenes" which is an array of 2 to 4 scene objects for this beat:
{
  "scenes": [
    {
      "voice_over": "string (Clean Cairene Arabic Script - NO BRACKET TAGS, very dense and factual)",
      "visual_cue": "string (Arabic description of the visual scene, put dramatic pauses and cues here)",
      "b_roll_search_query": "string (Precise English keywords to search on Pexels for a matching video/image. Be extremely specific, e.g., 'vintage typewriter working close up')",
      "sfx": "string (Arabic description of required sound effects, e.g., 'صوت رياح قوية')"
    }
  ]
}`;

    const sceneText = await callWithRetry(async () => {
      return await generateAIContentRaw(
        scenePrompt,
        {
          type: Type.OBJECT,
          properties: {
             scenes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    voice_over: { type: Type.STRING },
                    visual_cue: { type: Type.STRING },
                    b_roll_search_query: { type: Type.STRING },
                    sfx: { type: Type.STRING },
                  },
                  required: ["voice_over", "visual_cue", "b_roll_search_query", "sfx"]
                }
             }
          },
          required: ["scenes"]
        },
        engine,
        onChunk,
        signal,
        false, // useGrounding
        0.6 // temperature (lower down for factualness and fewer hallucinations)
      );
    }, 3, 2000, signal);

    const parsedScene = safeJsonParse(sceneText, { scenes: [] });
    if (parsedScene && Array.isArray(parsedScene.scenes)) {
      for (const s of parsedScene.scenes) {
         s.asset_id = `Scene_${String(sceneIndex).padStart(2, '0')}`;
         allScenes.push(s);
         sceneIndex++;
         // Add to running context to prevent looping
         runningContext += s.voice_over + " ";
      }
    }

    // Protect Local Hardware (Sequential Delay)
    if (bIndex < beats.length - 1) {
       await new Promise(r => setTimeout(r, 2000));
    }
  }

  // ISOLATED CLIMAX NODE (if this is the last chapter)
  if (isLast) {
    if (onChunk) onChunk("[!] توليد الخاتمة الفلسفية (Climax Node)...");
    const climaxPrompt = `[Climax & Synthesis Node]
${getSystemPrompt()}

You are the final node of the script. The entire narrative has been built. 
Now, you must deliver a "Guillotine Ending". A profound, philosophical, or chilling conclusion that ties everything together and leaves the audience stunned.
NO CLICHES like "وفي النهاية". Start immediately with the philosophical punch.

[Research Document]:
${researchData}

Output format: A JSON OBJECT containing a single "scene" object.
{
  "scene": {
    "voice_over": "string (Clean Cairene Arabic Script - NO BRACKET TAGS, the profound ending)",
    "visual_cue": "string (Arabic description of the final visual, fading to black)",
    "b_roll_search_query": "string (Precise English keywords)",
    "sfx": "string (Arabic description, ending with silence)"
  }
}`;
    
    const climaxText = await callWithRetry(async () => {
      return await generateAIContentRaw(
        climaxPrompt,
        {
          type: Type.OBJECT,
          properties: {
             scene: {
                type: Type.OBJECT,
                properties: {
                  voice_over: { type: Type.STRING },
                  visual_cue: { type: Type.STRING },
                  b_roll_search_query: { type: Type.STRING },
                  sfx: { type: Type.STRING },
                },
                required: ["voice_over", "visual_cue", "b_roll_search_query", "sfx"]
             }
          },
          required: ["scene"]
        },
        engine,
        undefined,
        signal,
        false,
        0.7
      );
    }, 3, 2000, signal);

    const parsedClimax = safeJsonParse(climaxText);
    if (parsedClimax && parsedClimax.scene) {
       parsedClimax.scene.asset_id = `Scene_Climax`;
       allScenes.push(parsedClimax.scene);
    }
  }

  return allScenes;
}

export async function generateEpisode(
  title: string,
  durationValue: number,
  note: string,
  mood: MoodType,
  onProgress?: (p: number, status: string) => void,
  engine = "gemini",
  onChunk?: (text: string) => void,
  signal?: AbortSignal
): Promise<EpisodeData> {
  onProgress?.(10, "[PHASE_1] // اختراق قواعد البيانات وبناء الهيكل...");
  const design = await generateResearchMap(
    title,
    durationValue,
    mood,
    note,
    engine,
    onChunk,
    signal
  );

  onProgress?.(30, "المرحلة الثانية: بناء المشاهد...");
  let allScenes: EpisodeScene[] = [];
  let previousSummary = "";
  const chapters = design.chapters || [];
  const targetWordsPerChapter = Math.round(
    (durationValue * 130) / Math.max(1, chapters.length),
  );

  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    onProgress?.(
      30 + Math.floor((40 * (i + 1)) / chapters.length),
      `[WRITING] // صياغة الملف التوثيقي - قسم ${i + 1}...`,
    );
    const scenes = await generateChapter(
      chapter,
      design.research_data,
      mood,
      previousSummary,
      i === 0,
      i === chapters.length - 1,
      design.video_title,
      targetWordsPerChapter,
      engine,
      onChunk,
      signal
    );
    allScenes = allScenes.concat(scenes);

    // Rolling Summarization: Create a clean summary from the end of the last chapter
    const lastChapterScript = scenes.map((s) => s.voice_over).join(" ");
    const trailingSentences = lastChapterScript.split(/[.!?]+/).filter(Boolean).slice(-3).join(". ") + ".";
    previousSummary = `In the previous chapter (${chapter.chapter_title}), the script ended discussing: "${trailingSentences}"`;

    if (i < chapters.length - 1) {
      onProgress?.(
        30 + Math.floor((40 * (i + 1)) / chapters.length),
        `Waiting for server cooldown (Dynamic Throttling)...`,
      );
      // Dynamic throttling based on engine (Ollama needs more rest between chapters)
      const delayMs = engine === "ollama" ? 8000 : 4000;
      await sleep(delayMs);
    }
  }

  onProgress?.(80, "المرحلة الرابعة: مراجعة محامي الشيطان (Security Audit)...");
  const fullScript = allScenes.map(s => s.voice_over).join("\n");
  const auditReport = await auditScriptWithDevilsAdvocate(
    fullScript,
    design.research_data,
    mood,
    engine,
    signal
  );

  onProgress?.(90, "[PHASE_X] // التجميع النهائي والاستعداد للحفظ...");
  const packaging = await generatePackaging(
    design.video_title,
    design.research_data,
    mood,
    allScenes,
    engine,
    undefined,
    signal
  );

  const processedScenes = allScenes.map((s, idx) => ({
    ...s,
    asset_id: `[Scene ${String(idx + 1).padStart(2, "0")}]`,
    image_prompt_nano_banana: applyGlobalStyle(
      s.image_prompt_nano_banana || "",
    ),
  }));
  const processedShorts = (packaging.shorts || []).map((s: any) => ({
    ...s,
    visual_instructions: applyGlobalStyle(s.visual_instructions || ""),
  }));

  return {
    video_title: design.video_title,
    thumbnail: design.thumbnail
      ? {
          ...design.thumbnail,
          image_prompt: applyGlobalStyle(design.thumbnail.image_prompt),
        }
      : undefined,
    opening_sketch: processedScenes[0] || {
      asset_id: "",
      voice_over: "",
      visual_cue: "",
      montage_instructions: "",
      sound_design: "",
      image_prompt_nano_banana: "",
      ai_video_prompt: "",
    },
    scenes: (processedScenes || []).slice(1),
    sources: design.sources || [],
    publishing_kit: packaging.packaging,
    shorts: processedShorts,
    audit_report: auditReport
  };
}

import {
  getCachedDossier,
  saveCachedDossier,
  getCachedStructure,
  saveCachedStructure
} from "./cache";

export async function rewriteScript(
  originalText: string,
  instruction: string,
  engine = "gemini"
): Promise<string> {
  const prompt = `You are an expert script editor. Rewrite the following text according to this instruction: "${instruction}"
  
Original Text:
${originalText}

Output ONLY the revised text. Ensure it remains in the same language and tone unless specified otherwise. Do not explain.`;

  return generateAIContentRaw(
    prompt,
    {
      type: Type.OBJECT,
      properties: {
        revised_text: { type: Type.STRING }
      },
      required: ["revised_text"]
    },
    engine
  ).then(text => {
    const parsed = safeJsonParse(text);
    return parsed?.revised_text || originalText;
  });
}

export async function executeNode0_OSINT(
  topic: string,
  mood: MoodType,
  persona: PersonaType,
  engine = "gemini",
  onChunk?: (text: string) => void
): Promise<OsintDossier> {
  const cached = await getCachedDossier(topic, mood);
  if (cached) {
    if (onChunk) onChunk("[CACHE HIT] Loaded OSINT Dossier from local storage.");
    return cached;
  }

  const personaContext = getPersonaInstructions(persona);
  const moodContext = getMoodContext(mood);

  const prompt = `[Agent: "راصد" Central OSINT & RAG Engine]
${getSystemPrompt()}

You are "راصد", the OSINT & RAG Engine of the Production Engine. Your ONLY job is to perform a deep investigation on the provided topic using WEB SEARCH if available, and output a strictly verified 'Dossier' in JSON format.
  
RULES:
1. NO HALLUCINATIONS: You must base your findings on verifiable facts. Ground your response using real dates, names, and historical events.
2. DEPTH: Find the core conflict, mystery, or controversial elements.
3. HIDDEN PATTERNS: Read between the lines. Identify contradictions or secrets not commonly known.
4. VISUAL ANCHORS: Provide vivid, real-world historical or contextual visual details (e.g., "1940s Fedora", "Brutalist architecture").
5. ARCHIVAL TREASURES (CRITICAL): You MUST prioritize authentic, high-quality ARABIC sources that fit the current journalistic mood. 
   MOOD ARCHIVE RULES: ${moodContext.archivalTreasureRules}
   Citations MUST feel like they were pulled from old Egyptian/Arab newspapers, declassified physical files, rare memoirs, or deep-web forums depending on the mood.
6. OUTPUT: You MUST return ONLY a valid JSON object matching the exact schema below. No markdown, no preambles.

JSON SCHEMA:
{
  "id": "hash_or_slug",
  "topic": "${topic}",
  "created_at": "ISO date string",
  "last_updated": "ISO date string",
  "executive_summary": "Comprehensive overview blending verified facts with the archival mood.",
  "timeline": [{"date_or_period": "...", "event_description": "...", "impact": "..."}],
  "key_entities": [{"name": "...", "role_or_type": "Person" | "Organization" | "Location" | "Concept" | "Other", "description": "...", "key_connections": ["..."]}],
  "core_conflict_or_mystery": "The dramatic core",
  "verified_facts": ["fact 1", "fact 2"],
  "hidden_patterns_or_contradictions": ["pattern 1", "contradiction 2"],
  "historical_visual_anchors": ["visual 1", "visual 2"],
  "sources": [{"title": "Name of the archaic newspaper/book/report", "url": "URL or Physical Location (e.g., دار الكتب)", "credibility_score": 9, "key_takeaway": "..."}],
  "compiled_research_context": "A compressed string summarizing all the above for the next LLM node"
}

Topic to Investigate: ${topic}
Mood: ${mood}
`;

  return callWithRetry(async () => {
    const text = await generateAIContentRaw(
      prompt,
      {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING },
            topic: { type: Type.STRING },
            created_at: { type: Type.STRING },
            last_updated: { type: Type.STRING },
            executive_summary: { type: Type.STRING },
            timeline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date_or_period: { type: Type.STRING },
                  event_description: { type: Type.STRING },
                  impact: { type: Type.STRING }
                },
                required: ["date_or_period", "event_description", "impact"]
              }
            },
            key_entities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  role_or_type: { type: Type.STRING },
                  description: { type: Type.STRING },
                  key_connections: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["name", "role_or_type", "description"]
              }
            },
            core_conflict_or_mystery: { type: Type.STRING },
            verified_facts: { type: Type.ARRAY, items: { type: Type.STRING } },
            hidden_patterns_or_contradictions: { type: Type.ARRAY, items: { type: Type.STRING } },
            historical_visual_anchors: { type: Type.ARRAY, items: { type: Type.STRING } },
            sources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  url: { type: Type.STRING },
                  credibility_score: { type: Type.NUMBER },
                  key_takeaway: { type: Type.STRING }
                },
                required: ["title", "url", "key_takeaway"]
              }
            },
            compiled_research_context: { type: Type.STRING }
        },
        required: ["id", "topic", "created_at", "last_updated", "executive_summary", "timeline", "key_entities", "core_conflict_or_mystery", "verified_facts", "hidden_patterns_or_contradictions", "historical_visual_anchors", "sources", "compiled_research_context"]
      },
      engine,
      onChunk,
      undefined,
      true, // Enable Google Search Grounding for OSINT
      0.2
    );

    const parsedData = safeJsonParse(text);
    const dossierResult = parsedData as OsintDossier;
    await saveCachedDossier(topic, mood, dossierResult);
    return dossierResult;
  });
}

export async function executeNode1_Structure(
  topic: string,
  dossier: OsintDossier,
  targetDurationMinutes: number,
  mood: MoodType,
  persona: PersonaType,
  engine = "gemini",
  onChunk?: (text: string) => void
): Promise<Node1Structure> {
  const cached = await getCachedStructure(topic, mood);
  if (cached && (Date.now() % 2 !== 0)) { // Just bypass caching for now
  }
  
  if (cached) {
    if (onChunk) onChunk("[CACHE HIT] Loaded Architect Structure from local storage.");
    return cached;
  }
  
  const personaContext = getPersonaInstructions(persona);
  const moodContext = getMoodContext(mood);
  const totalWords = targetDurationMinutes * 140;
  const targetScenes = Math.max(Math.ceil(targetDurationMinutes / 1.5), targetDurationMinutes > 15 ? 20 : Math.round(targetDurationMinutes * 1.5));
  
  let dynamicBranchingRule = "";
  if (targetDurationMinutes > 15) {
    dynamicBranchingRule = `\nDYNAMIC BRANCHING (LONG-FORM): This is a long episode (${targetDurationMinutes} minutes). Do NOT just stretch out the core scenes or rely on fluff.\nInstead, expand the topic horizontally:\n- Introduce new, deep sub-topics related to the core theme (e.g., historical roots, economic effects, geopolitical relationships, fictional/hypothetical interview angles).\n- Build the outline with logical, ascending transitions where each new block opens a whole new dimension of the topic.`;
  }

  const prompt = `[Node 1: Story Architect - Editor's Desk]
${getSystemPrompt()}

You are the "Architect Node" (Node 1) of the Production Engine. Your ONLY job is to take an OSINT Dossier and output a strict JSON outline for a narrative video episode.

MOOD & STYLE CONSTRAINTS:
Research/Story Angle Focus: ${moodContext.researchAngle}
Scripting Style Focus: ${moodContext.scriptingStyle}
Archival Rules Focus: ${moodContext.archivalTreasureRules}

RULES:
1. SCENE COUNT AND PACING: 
   - Target duration is ${targetDurationMinutes} minutes.
   - Target Word Count: Approximately ${totalWords} words total for the episode's voiceover.
   - Scene Constraint: Each scene must represent 1 to 1.5 minutes max (around 150-200 words).
   - Therefore, you MUST generate EXACTLY ${targetScenes} independent but sequentially connected scenes. DO NOT get lazy. If you generate fewer than ${targetScenes} items in the array, the entire system will fail. You must fulfill the quota.
2. NARRATIVE ARC: Each scene must push the story forward with documented facts. No inventing facts. No endless loops.${dynamicBranchingRule}
3. ANTI-CLICHÉ: The narrative format must be smart, sober, and read between the lines.
4. IDENTITY GUARD: Visual concepts must NEVER describe human faces or embody people directly. Use physical metaphors (hands, shadows, tools, objects, wide angles).
5. VISUAL TEXT LOCK: No texts or watermarks overlaying the visual concept descriptions.
6. OUTPUT: You MUST return ONLY a valid JSON object matching the exact schema below.

DOSSIER DATA:
- Core Conflict: ${dossier.core_conflict_or_mystery}
- Hidden Patterns/Contradictions: ${dossier.hidden_patterns_or_contradictions?.join(" | ") || "None"}
- Verified Facts: ${dossier.verified_facts?.join(" | ") || "None"}

JSON SCHEMA:
{
  "episode_theme": "الفكرة الرئيسية",
  "scenes_outline": [
    {
      "scene_number": 1,
      "core_fact": "المعلومة الحقيقية الموثقة التي يعتمد عليها المشهد بالتفصيل",
      "visual_concept": "وصف بصري يلتزم بقاعدة (Identity Guard) وبالألوان المحددة وبدون نصوص"
    }
  ] // MUST CONTAIN EXACTLY ${targetScenes} ITEMS
}


Topic: ${topic}
`;

  return callWithRetry(async () => {
    const text = await generateAIContentRaw(
      prompt,
      {
        type: Type.OBJECT,
        properties: {
          episode_theme: { type: Type.STRING },
          scenes_outline: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                scene_number: { type: Type.NUMBER },
                core_fact: { type: Type.STRING },
                visual_concept: { type: Type.STRING },
              },
              required: ["scene_number", "core_fact", "visual_concept"],
            },
          },
        },
        required: ["episode_theme", "scenes_outline"],
      },
      engine,
      onChunk
    );

    const parsedData = safeJsonParse(text);
    try {
      const validatedData = Node1Schema.parse(parsedData);
      await saveCachedStructure(topic, mood, validatedData);
      return validatedData;
    } catch (e) {
      console.error("Zod Validation Error:", e);
      throw new Error("Validation Failed on Node 1 output");
    }
  });
}

export const Node2BatchSchema = z.object({
  scenes: z.array(Node2Schema)
});

export async function executeNode2_Batch(
  scenes: Node1Structure["scenes_outline"],
  topic: string,
  mood: MoodType,
  persona: PersonaType,
  previousScript: string,
  researchData: string,
  engine = "gemini",
  onChunk?: (text: string) => void
): Promise<z.infer<typeof Node2Schema>[]> {
  const moodContext = getMoodContext(mood);
  const personaContext = getPersonaInstructions(persona);
  
  const prompt = `[Node 2: Master Scriptwriter & Director - The Storytelling Genius]
${getSystemPrompt()}

You are the "Scripting Node" (Node 2) of the Production Engine. Your task is to write the voiceover script and visual prompts for a batch of consecutive scenes based on the OSINT chapter structure.

RULES FOR WORLD-CLASS STORYTELLING (BEATING THE BEST):
1. **THE ALDAHEEH / DOCUMENTARY STANDARD**: Your script must be breathtaking and deeper than popular YouTube channels. Do NOT just rattle off facts. You must build suspense, ask philosophical questions, and use profound intellectual framing.
2. **THE PERSONA SHIFT (Object Personification)**: Do not limit voiceover strictly to the human narrator. When contextually appropriate, let places or objects speak (e.g., Imbaba bridge talking about its history). Also, provide deep sociological analysis instead of just stating facts. It must be mysterious and deep.
3. **VOICEOVER PROTOCOL**: 
   - Language: MUST strictly adhere to the dialect rules: Analytical "White Cairene Vernacular" (عامية قاهرية بيضاء فصيحة - Analytical, Mysterious, Intellectual). DO NOT use cheap clichés like "يا عزيزي" or "بص يا سيدي". KEEP standard spelling for pronunciation (e.g., write "المقاهي" not "المأاهي").
   - Word Count Constraint (CRITICAL): Each scene's "voiceover_text" MUST be long and detailed, containing between 100 to 200 words per scene to ensure the final ${topic} episode hits the correct duration. Short fragments will break the pacing.
   - Masterful Pacing: End scenes with cliffhangers or profound thoughts that force the user to pay attention.
   - Breathing Space: You MUST insert dramatic pauses explicitly using "[صمت درامي]" and include ambient sound markers using "🔊" to help the sound editor.
4. **ART DIRECTION & VISUALS**: All visual prompts for image generation and video sequences MUST be written strictly in ENGLISH. The english_image_prompt MUST respect the Global Style defined in the Channel DNA and MUST contain absolutely NO HUMAN FACES.
5. **ASMR SOUND LAYERING**: Provide "rough", hyper-realistic ASMR soundscapes. 
6. MOOD ARCHIVE RULES: ${moodContext.archivalTreasureRules}
   Scripting Style: ${moodContext.scriptingStyle}

PREVIOUS SCRIPT CONTEXT (Continue seamlessly from this):
"${previousScript}"

SCENES TO WRITE IN THIS BATCH:
${scenes.map((s, idx) => `[${idx + 1}] Core Fact: ${s.core_fact} | Visual Concept: ${s.visual_concept}`).join('\n')}

Topic: ${topic}

OUTPUT FORMAT:
You MUST return ONLY a valid JSON object with the following structure:
{
  "scenes": [
    {
      "scene_id": "string",
      "voiceover_text": "string (with [صمت درامي] and 🔊)",
      "voiceover_notes": "string (notes for human VO artist, tone, pacing)",
      "estimated_duration_seconds": number,
      "dramatic_pause_seconds": number,
      "camera_and_vision": "string (abstract metaphors, macro shots only)",
      "cinematic_movement": "string (exact camera commands like Slow Dolly-In, Pan, Tilt, Tracking)",
      "visual_motif": "string (Microfilm effect, leaked documents, conceptual framing)",
      "visual_color_grading": "string (How Navy, Gold, Ivory are distributed here)",
      "montage_instructions": "string (cut speed, transitions, graphic overlays)",
      "english_image_prompt": "string (NO HUMAN FACES. Mention Navy, Ivory, Gold)",
      "ai_video_prompt": "string (Motion prompt for Runway/Kling based on the camera and vision, in English)",
      "b_roll_keywords": "string (Comma separated English keywords for stock footage search)",
      "sound_and_sfx": "string",
      "asmr_soundscape": "string (ASMR elements like paper rustling, footsteps)",
      "music_prompt": "string (instruments, genre for Lyria 3)",
      "music_bpm": number,
      "sfx_prompt": "string"
    }
  ]
}
STRICTLY return the JSON object only. No markdown. No introductory text.
`;

  return callWithRetry(async () => {
    const text = await generateAIContentRaw(
      prompt,
      {
        type: Type.OBJECT,
        properties: {
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                scene_id: { type: Type.STRING },
                voiceover_text: { type: Type.STRING },
                voiceover_notes: { type: Type.STRING },
                estimated_duration_seconds: { type: Type.NUMBER },
                dramatic_pause_seconds: { type: Type.NUMBER },
                camera_and_vision: { type: Type.STRING },
                cinematic_movement: { type: Type.STRING },
                visual_motif: { type: Type.STRING },
                visual_color_grading: { type: Type.STRING },
                montage_instructions: { type: Type.STRING },
                english_image_prompt: { type: Type.STRING },
                ai_video_prompt: { type: Type.STRING },
                b_roll_keywords: { type: Type.STRING },
                archive_search_queries: { type: Type.ARRAY, items: { type: Type.STRING } },
                sound_and_sfx: { type: Type.STRING },
                asmr_soundscape: { type: Type.STRING },
                music_prompt: { type: Type.STRING },
                music_bpm: { type: Type.NUMBER },
                sfx_prompt: { type: Type.STRING },
              },
              required: ["scene_id", "voiceover_text", "voiceover_notes", "dramatic_pause_seconds", "camera_and_vision", "cinematic_movement", "visual_motif", "visual_color_grading", "montage_instructions", "english_image_prompt", "ai_video_prompt", "b_roll_keywords", "sound_and_sfx", "asmr_soundscape", "music_prompt", "music_bpm", "sfx_prompt"]
            }
          }
        },
        required: ["scenes"]
      },
      engine,
      onChunk
    );

    const parsedData = safeJsonParse(text);
    return Node2BatchSchema.parse(parsedData).scenes;
  });
}

export async function executeNode3_Visuals(
  actId: number,
  scriptText: string,
  mood: MoodType,
  visualHistory: string[],
  engine = "gemini",
  onChunk?: (text: string) => void
): Promise<Node3Visuals> {
  const moodContext = getMoodContext(mood);
  const historyText = visualHistory.length > 0 ? `
PREVIOUS VISUALS (DO NOT REPEAT THESE ANGLES):
${visualHistory.join('\
')}` : '';
  
  const prompt = `You are the "Director Node". Your ONLY job is to take a raw voice-over script and split it into compelling cinematic scenes.

RULES:
1. THE SCRIPT: You must use the EXACT words from the provided script text, splitting them across scenes smoothly so no words are left behind or changed.
2. VISUAL DIVERSITY: ${historyText}
Ensure new visual prompts use different camera angles (e.g. macro shot, wide drone shot, point of view) or subjects compared to the previous visuals to prevent repetition.
3. NEGATIVE PROMPTS: We must enforce high quality. Assume the system injects 'no text, no watermark, no clutter' automatically, but your 'image_prompt_nano_banana' must focus strictly on Subject + Action + Lighting. 
4. ARABIC TEXT: If a scene specifically needs Arabic text visible (like a newspaper), wrap it in single quotes: 'النص هنا' in the prompt.
5. JSON STRICTNESS: Return ONLY valid JSON matching the schema.

JSON SCHEMA:
{
  "scenes": [
    {
      "asset_id": "Scene_XX",
      "voice_over": "part of the script",
      "visual_cue": "Arabic desc of visual",
      "montage_instructions": "Arabic notes",
      "sound_design": "Arabic SFX notes",
      "image_prompt_nano_banana": "English image prompt",
      "ai_video_prompt": "English motion prompt for runway/kling",
      "b_roll_keywords": "comma separated english keywords for stock footage search"
    }
  ]
}

Mood: ${mood} (${moodContext.visualAudioStyle})
Act ${actId} Script: 
${scriptText}
`;

  return callWithRetry(async () => {
    const text = await generateAIContentRaw(
      prompt,
      {
        type: Type.OBJECT,
        properties: {
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                asset_id: { type: Type.STRING },
                voice_over: { type: Type.STRING },
                visual_cue: { type: Type.STRING },
                montage_instructions: { type: Type.STRING },
                sound_design: { type: Type.STRING },
                image_prompt_nano_banana: { type: Type.STRING },
                ai_video_prompt: { type: Type.STRING },
                b_roll_keywords: { type: Type.STRING },
              },
              required: ["asset_id", "voice_over", "visual_cue", "montage_instructions", "sound_design", "image_prompt_nano_banana", "ai_video_prompt", "b_roll_keywords"]
            }
          }
        },
        required: ["scenes"]
      },
      engine,
      onChunk
    );

    const parsedData = safeJsonParse(text);
    return Node3Schema.parse({
      scenes: parsedData.scenes || []
    });
  });
}

export async function executePipeline_Orchestrator(
  topic: string,
  durationValue: number,
  note: string,
  mood: MoodType,
  persona: PersonaType,
  onProgress?: (p: number, status: string) => void,
  onSceneReady?: (scene: EpisodeScene) => void,
  onChunk?: (text: string) => void,
  engineNode1 = "gemini",
  engineNode2 = "gemini",
  engineNode3 = "gemini",
  strategy: "HCS" | "HAP" = "HCS",
  suspenseLevel: number = 5
): Promise<EpisodeData> {
  onProgress?.(5, "[SYSTEM:BOOT] // إقلاع محرك النبّاش الإصدار 2.1... (بروتوكول Narrative DNA نشط)");
  
  // Tag-Team Logic: Research & Intelligence (Logic Heavy) -> Usually Gemini
  // Scriptwriting & Review (Dialect/Tone Heavy) -> Usually Ollama
  const isTagTeam = typeof window !== "undefined" ? localStorage.getItem("isTagTeam") === "true" : false;
  
  const researchEngine = isTagTeam ? "gemini" : engineNode1;
  const scriptEngine = isTagTeam ? "ollama" : engineNode1;

  const dossier = await executeNode0_OSINT(topic, mood, persona, researchEngine, onChunk);

  onProgress?.(10, "[RESEARCH_MOD] // فحص الوثائق وبناء الخريطة البحثية المعمقة...");
  const design = await generateResearchMap(
    topic,
    durationValue,
    mood,
    note,
    researchEngine,
    onChunk
  );

  onProgress?.(15, "[!] الكاتب الصحفي: يتم كتابة النص الكامل بناءً على المعطيات... (يُرجى الانتظار، السرد يتشكل)");
  const { executeAgent1_Scriptwriter, executeAgent_Editor, executeAgent2_Director, executeAgent3_ArtDirector, executeAgent4_Reviewer, executeAgent5_Publisher } = await import('./agents');
  
  let masterScript = await executeAgent1_Scriptwriter(
    topic,
    design,
    durationValue,
    mood,
    persona,
    scriptEngine,
    onChunk,
    strategy,
    suspenseLevel
  );

  onProgress?.(25, "[EDITOR:AUDIT] المحرر الموثق: مراجعة النص وتنقيته من الكليشيهات (المصفاة الذهبية)...");
  masterScript = await executeAgent4_Reviewer(
    masterScript,
    mood,
    persona,
    scriptEngine,
    onChunk
  );

  onProgress?.(30, "[EDITOR:CUT] مقص: إزالة الحشو البصري واللغوي لزيادة مستوى الـ Pacing...");
  masterScript = await executeAgent_Editor(
    masterScript,
    mood,
    scriptEngine,
    onChunk
  );

  onProgress?.(35, "[!] المخرج: يتم تفكيك النص وتوزيعه إلى مشاهد، وحساب المدة الزمنية التقديرية...");
  const directorScenes = await executeAgent2_Director(
    masterScript,
    engineNode1,
    onChunk
  );

  onProgress?.(45, "[!] قسم الإخراج الفني: يتم معالجة الرؤية البصرية والتوليد التقني للمشاهد...");
  let allScenes: EpisodeScene[] = [];

  const safeDirectorScenes = directorScenes || [];
  for (let i = 0; i < safeDirectorScenes.length; i++) {
    const scene = safeDirectorScenes[i];
    
    onProgress?.(
      45 + Math.floor((45 * i) / Math.max(1, safeDirectorScenes.length)),
      `[!] المخرج الفني يحقن بصمته: المشهد ${i + 1} من أصل ${safeDirectorScenes.length}...`
    );
    
    // We will run the Art Director agent sequentially to avoid IP Blocks (429)
    try {
      const artResponse = await executeAgent3_ArtDirector(scene, mood, engineNode2, onChunk, (design as any).global_visual_condition);
      const generatedScene = {
        ...scene,
        ...artResponse
      };
      
      let pexelsAssetResult = null;
      if (generatedScene.b_roll_search_query) {
         try {
            const { searchPexelsVideos } = await import('../services/pexelsService');
            const videos = await searchPexelsVideos(generatedScene.b_roll_search_query);
            if (videos && videos.length > 0) {
               pexelsAssetResult = videos[0]; // Take the first result
            }
         } catch(e) {
            console.warn("Pexels fetch failed:", e);
         }
      }

      const processedScene: EpisodeScene = {
        asset_id: generatedScene.scene_id || `[Scene ${String(allScenes.length + 1).padStart(2, "0")}]`,
        voice_over: generatedScene.voiceover_text,
        voiceover_notes: generatedScene.voiceover_notes,
        estimated_duration_seconds: generatedScene.estimated_duration_seconds,
        visual_cue: generatedScene.visual_cue || generatedScene.camera_and_vision || "",
        b_roll_search_query: generatedScene.b_roll_search_query || "",
        sfx: generatedScene.sfx || generatedScene.sound_and_sfx || generatedScene.sound_design || "",
        pexelsAsset: pexelsAssetResult,

        // Legacy / fallback mappings to prevent breaking strict types
        montage_instructions: generatedScene.montage_instructions || "",
        sound_design: generatedScene.sound_and_sfx || "",
        image_prompt_nano_banana: "",
        ai_video_prompt: "",
        b_roll_keywords: generatedScene.b_roll_search_query || "",
        loop_type: generatedScene.loop_type || null,
        loop_id: generatedScene.loop_id || null,
        visual_treatment: generatedScene.visual_treatment || "",
        narrative_strategy: strategy
      };
      
      allScenes.push(processedScene);
      if (onSceneReady) {
        onSceneReady(processedScene);
      }
      
      // Delay to respect API constraints
      await new Promise(r => setTimeout(r, 1500));
    } catch (err) {
      console.warn("Art Director failed for a scene, returning original scene", err);
      // Fallback
      allScenes.push(scene);
      if (onSceneReady) {
        onSceneReady(scene);
      }
    }
  }

  onProgress?.(90, "[!] وكيل النشر ومحرك Omnichannel: يتم إنشاء باقة النشر على المنصات واستخراج المصادر...");
  const publishingKitRaw = await executeAgent5_Publisher(
    design.video_title,
    design.research_data,
    mood,
    persona,
    engineNode1,
    onChunk
  );

  // Mechanical Injection of Sources
  let finalDescription = publishingKitRaw.description + "\n\n---\n\nالمصادر والمراجع الأساسية:\n";
  dossier.sources.forEach((s, idx) => {
    finalDescription += `${idx + 1}. ${s.title}\n${s.url} - ${s.key_takeaway}\n`;
  });

  const publishing_kit = {
    ...publishingKitRaw,
    description: finalDescription
  };

  onProgress?.(95, "[!] محامي الشيطان: يتم الآن فحص المحتوى بحثاً عن أي ثغرات أو هلوسة...");
  const scriptText = allScenes.map(s => s.voice_over).join("\n");
  const auditReport = await auditScriptWithDevilsAdvocate(
    scriptText,
    design.research_data,
    mood,
    engineNode1,
    undefined  // signal
  );

  onProgress?.(100, "[!] العملية تمت بنجاح. الأدلة جميعها الآن بين يديك.");

  return {
    video_title: design.video_title || topic,
    thumbnail: design.thumbnail
      ? {
          ...design.thumbnail,
          image_prompt: applyGlobalStyle(design.thumbnail.image_prompt),
          text_on_image: design.thumbnail.text_on_image,
        }
      : { image_prompt: "", text_on_image: "" },
    opening_sketch: allScenes[0] || {
      asset_id: "",
      voice_over: "",
      visual_cue: "",
      montage_instructions: "",
      sound_design: "",
      image_prompt_nano_banana: "",
      ai_video_prompt: "",
    },
    scenes: (allScenes || []).slice(1),
    sources: dossier.sources.map((s) => ({ title: s.title, url: s.url, info: s.key_takeaway })),
    publishing_kit: publishing_kit,
    shorts: publishingKitRaw.shorts || [],
    omnichannel: publishingKitRaw.omnichannel,
    audit_report: auditReport
  };
}


export async function auditScriptWithDevilsAdvocate(
  fullScript: string,
  researchData: string,
  mood: MoodType,
  engine = "gemini",
  signal?: AbortSignal
): Promise<SecurityAudit> {
  const prompt = `[Node: The Devil's Advocate - Security & Accuracy Audit]
Task: Review the provided script against the research data. Act as a skeptical critic who wants to find hallucinations, weak logic, or risky legal claims.

Script:
${fullScript}

Research Context (RAG):
${researchData}

RULES:
1. NO VAGUE CRITICISM: Every issue must be specific.
2. CITATION CHECK: If a fact in the script IS NOT in the Research Context, flag it for evidence reinforcement.
3. SCHEMA: Return a JSON object matching the SecurityAudit interface.

Audit Output:
{
  "status": "verified" | "warning" | "failed",
  "executive_summary": "Brief overall assessment",
  "issues": [
    {
      "type": "fact_check" | "logic" | "legal" | "tone",
      "finding": "Specific problem found",
      "recommendation": "How to fix it strictly using the research data",
      "source_reference": "Name of the source from research if applicable"
    }
  ]
}
`;

  return callWithRetry(async () => {
    const text = await generateAIContentRaw(prompt, {
      type: Type.OBJECT,
      properties: {
        status: { type: Type.STRING },
        executive_summary: { type: Type.STRING },
        issues: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              finding: { type: Type.STRING },
              recommendation: { type: Type.STRING },
              source_reference: { type: Type.STRING }
            },
            required: ["type", "finding", "recommendation"]
          }
        }
      },
      required: ["status", "executive_summary", "issues"]
    }, engine, undefined, signal);
    
    return safeJsonParse(text);
  }, 2, 1000, signal);
}

export async function surgicalEdit(
  originalText: string,
  instruction: string,
  context: string = "",
  engine = "gemini",
  signal?: AbortSignal
): Promise<string> {
  const prompt = `[Node: Surgical Editor]
Task: Edit the provided text snippet based on the specific instruction. 
Ensure the tone remains clinical and professional. 
The edit must be precise.

Context: ${context}
Original Block: "${originalText}"
Instruction: "${instruction}"

Return ONLY the new Arabic text.`;

  return callWithRetry(async () => {
    return await generateAIContentRaw(prompt, { type: Type.STRING }, engine, undefined, signal);
  }, 2, 1000, signal);
}

export async function generateFragmenterContent(
  topic: string,
  mood: MoodType,
  fullScript: string,
  engine = "gemini",
  signal?: AbortSignal
): Promise<{ x_thread: string[]; tiktok_hook: string; instagram_caption: string }> {
  const prompt = `[Node: The Fragmenter - Social Media Distribution]
Task: Break down the main story into high-impact social media fragments.
Topic: ${topic}
Mood: ${mood}
Full Script Context:
${fullScript.substring(0, 3000)}...

RULES:
1. X (Twitter) Thread: Create a 5-7 post thread. Start with a massive hook fact. Use Egyptian slang (Conversational/Mysterious).
2. TikTok Hook: Write a 15-second opening script for a short video that stops the scroll immediately.
3. Instagram Caption: Deep, philosophical caption with hashtags.

Output Format: JSON
{
  "x_thread": ["String", "String", ...],
  "tiktok_hook": "String",
  "instagram_caption": "String"
}
`;

  return callWithRetry(async () => {
    const text = await generateAIContentRaw(prompt, {
      type: Type.OBJECT,
      properties: {
        x_thread: { type: Type.ARRAY, items: { type: Type.STRING } },
        tiktok_hook: { type: Type.STRING },
        instagram_caption: { type: Type.STRING }
      },
      required: ["x_thread", "tiktok_hook", "instagram_caption"]
    }, engine, undefined, signal);
    
    return safeJsonParse(text);
  });
}

export async function localizeScript(fushaScripts: string[], engine = "gemini", signal?: AbortSignal): Promise<string[]> {
  const examplesXml = TONE_EXAMPLES.map((ex, i) => `  <example id="${i+1}">
    <input>${ex.input}</input>
    <output>${ex.output}</output>
  </example>`).join('\n');

  const blacklistStr = BLACKLIST_WORDS.map(w => `"${w}"`).join(", ");

  const prompt = `[LOCALIZATION & TONE AGENT]
You are the final Master Translator. Your strict job is to translate and localize the provided Arabic (Fusha) scripts into "White Cairene Vernacular" (عامية قاهرية بيضاء).
The output must sound analytical, mysterious, profound, and conversational yet deeply intellectual.

<few_shot_examples>
${examplesXml}
</few_shot_examples>

<negative_constraints>
YOU MUST NEVER USE ANY OF THESE CLICHES: ${blacklistStr}.
</negative_constraints>

Task: Translate the following ${fushaScripts.length} paragraphs. 
Output MUST be a JSON array of strings in the exact same order.
{
  "localized_scripts": [
    "translated paragraph 1",
    "translated paragraph 2"
  ]
}

<input_scripts>
${fushaScripts.map((s, i) => `[${i}]: ${s}`).join('\n')}
</input_scripts>`;

  // We set hyper-parameters roughly by modifying the generateAIContentRaw call if needed, but we'll stick to standard for now.
  const responseText = await generateAIContentRaw(prompt, {
    type: "OBJECT",
    properties: {
       localized_scripts: { type: "ARRAY", items: { type: "STRING" } }
    },
    required: ["localized_scripts"]
  }, engine, undefined, signal);

  let parsed: any;
  try {
     parsed = JSON.parse(responseText);
  } catch(e) {
     return fushaScripts; // Fallback
  }

  if (parsed && Array.isArray(parsed.localized_scripts)) {
      return parsed.localized_scripts.map(script => applyRegexPostProcessing(script));
  }
  return fushaScripts;
}
