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
import { z } from "zod";
import {
  EpisodeData,
  MasterOutline,
  EpisodeScene,
  RadarSuggestion,
  ChapterOutline,
  OsintDossier,
  PersonaType
} from "../types";

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
  switch (persona) {
    case "برواز الحكاوي":
      return "You are 'برواز الحكاوي', a nostalgic storyteller of folklore and traditional myths. Focus on nostalgia, warm storytelling, urban legends, spooky classical vibes, mysterious shadows, and childhood memories. The tone is mysterious, warm, slightly spooky, and deeply nostalgic.";
    case "برواز التاريخ":
      return "You are 'برواز التاريخ', a historical narrator. Focus heavily on ancient myths, lost empires, old-world style, classical architecture, handwritten manuscripts, sepia tones, and dramatic historical conflicts. The tone is epic, ancient, and scholarly.";
    case "برواز التكنو":
      return "You are 'برواز التكنو', a futuristic tech analyst. Focus on artificial intelligence, dystopian cyberpunk futures, neon aesthetics, circuitry, digital shadows, hacking, and logic puzzles. The tone is fast-paced, analytical, slightly paranoid, and highly modern.";
    case "النبّاش":
    default:
      return "You are 'النبّاش', an investigative journalist digging up buried truths. Focus on secret documents, hidden files, urban grit, detective boards, harsh shadows, and exposing what is hidden. The tone is sharp, skeptical, and grounded in raw facts.";
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
  sound_and_sfx: z.string().describe("المؤثرات الصوتية المحيطية بدقة"),
  asmr_soundscape: z.string().describe("صوت ASMR خشن يعزز الواقعية ليحل محل غياب الوجوه (مثال: احتكاك ورق، خطوات، غليان)"),
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
  | "مسافر عبر الزمن";

export function getMoodContext(mood: MoodType): {
  researchAngle: string;
  scriptingStyle: string;
  visualAudioStyle: string;
  archivalTreasureRules: string;
} {
  if (mood === "أرشيف الضلمة") {
    return {
      researchAngle: "أحداث تاريخية منسية، جرائم غامضة من أرشيف المحاكم المصرية، مذكرات شخصيات مجهولة، وتاريخ محلي مرعب.",
      scriptingStyle: "Dark, archival, and deeply investigartive. سرد استقصائي كئيب يعتمد على التشويق واستخراج الأسرار.",
      visualAudioStyle: "Deep shadows, dusty film grain, echoes of the past.",
      archivalTreasureRules: "يجب استخراج المصادر من: قصاصات جرائد الأهرام والأخبار في فترة ما قبل الخمسينات، تقارير البوليس السياسي القديمة، حواديات مجلة اللطائف المصورة، وسجلات الجنايات النادرة.",
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
  }
  return { researchAngle: "بحث موضوعي", scriptingStyle: "سرد تقليدي", visualAudioStyle: "مرئي عام", archivalTreasureRules: "ابحث في الموسوعات العامة" };
}

export function getSystemPrompt(): string {
  const currentDNA = getChannelDNA("barwaz_classic");
  return buildSystemPrompt(currentDNA);
}

const GLOBAL_IMAGE_STYLE = "Cinematic lighting, 8k resolution, highly detailed, masterpieces style, hyper-realistic textures, ultra photorealistic";
const GLOBAL_NEGATIVE_PROMPT = "people, humans, faces, characters, text, letters, typography, Arabic, words, watermarks, signatures, clones, duplicates, mutants, low quality, blurry, distorted";

export function applyGlobalStyle(prompt: string): string {
  if (!prompt || prompt.trim() === "") return prompt;

  let finalPrompt = prompt;
  // Ensure we don't duplicate global styling
  if (!finalPrompt.includes("Cinematic lighting")) {
    finalPrompt = `${finalPrompt}, ${GLOBAL_IMAGE_STYLE}`;
  }
  if (!finalPrompt.includes(GLOBAL_NEGATIVE_PROMPT)) {
    finalPrompt = `${finalPrompt} --no ${GLOBAL_NEGATIVE_PROMPT}`;
  }
  if (!finalPrompt.includes("--ar 16:9")) {
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
  engine = "gemini",
  onChunk?: (text: string) => void,
  signal?: AbortSignal,
  useGrounding?: boolean
): Promise<string> {
  const engineSystemInstruction = `أنت "محرك النبّاش"، نظام ذكاء اصطناعي متقدم مخصص حصرياً لإنتاج نصوص وثائقية استقصائية احترافية لصالح منصة "برواز". مهمتك صياغة تحقيقات بصرية دقيقة، عميقة، ومكتوبة باحترافية شديدة. يجب عليك تنفيذ المخرجات فوراً وبشكل مباشر دون أي مقدمات، أو تحيات، أو خاتمات حوارية.

يجب الالتزام الصارم والخوارزمي بالقواعد التالية (أي كسر لهذه القواعد يعتبر فشلاً للنظام):

1. قاعدة الدرع البصري (Identity Guard - CRITICAL):
- يُمنع منعاً باتاً تعيين، أو ظهور، أو تجسيد الوجوه البشرية أو الملامح المباشرة في أي توجيه بصري أو أوامر توليد الصور (Prompts).
- استخدم "الاستعارة المادية" فقط (مثل: التركيز على حركة الأيدي، الظلال، أدوات العمل، الكراتين، النقود، البنية التحتية، أو الزوايا الواسعة للمكان). 
- في أوامر الـ Prompts، يُمنع إضافة أي وصف لوجه أو شخصية بشرية واضحة.

2. قاعدة مكافحة الكليشيهات والنبرة (Anti-Cliché & Tone Rule):
- يُمنع تماماً استخدام العبارات المستهلكة (مثل: "يا عزيزي"، "دعني أخبرك"، "هل تساءلت يوماً"، أو النبرة الحماسية المبالغ فيها).
- النبرة يجب أن تكون واقعية، رصينة، وتدخل في صلب الموضوع مباشرة.
- التعليق الصوتي يجب أن يُكتب باللهجة المصرية العامية (القاهرية) بأسلوب الشارع وسرد القهاوي. يُمنع منعاً باتاً استخدام اللغة العربية الفصحى أو اللهجة البيضاء. استخدم صياغات كلاسيكية مصرية مثل "علشان، كدة، إزاي، ياترى، بجد، اللي، تخيل معايا".
- تحذير هام: رغم استخدام اللهجة المصرية الدارجة، اكتب الكلمات بحروفها القياسية لتسهيل قراءة الذكاء الاصطناعي الصوتي لها (مثال: اكتب "القهوة" أو "قهوة" بالقاف وليس "الأهوة"، ولكن التراكيب والكلمات مصرية أصيلة).

3. قاعدة حماية النصوص البصرية (Visual Text Lock):
- أي نصوص مطلوبة للظهور داخل التصميمات أو الرؤية البصرية يجب أن تظل EXACTLY كما هي باللغة العربية. 
- يُمنع منعاً باتاً ترجمة أو استبدال أي نص عربي إلى الإنجليزية داخل الـ Prompts أو توجيهات الشاشة.

4. قاعدة السرد التصاعدي (Progressive Narrative Lock):
- يُمنع تماماً السرد الدائري أو تكرار الأفكار. بمجرد الانتهاء من شرح نقطة أو مشهد، يُمنع العودة إليها لاحقاً.
- كل مشهد يجب أن يكون خطوة جديدة للأمام تبني على ما سبق لضمان إيقاع سريع ومكثف.

5. قاعدة الإخراج الصوتي والوقفات الدرامية (Audio & Pacing):
- استخدم علامة \`[صمت درامي لمدة ٣ ثواني - تأثير بصري/صوتي فقط]\` بعد المعلومات الصادمة أو الأسئلة المحورية.
- خصص قسم فرعي لكل مشهد بعنوان "🔊 الهندسة الصوتية (Sound & SFX)" لوصف المؤثرات المحيطية بدقة.

6. قاعدة التنوع البصري (Visual Diversity & Infographics):
- عند شرح عمليات معقدة، ادمج مشاهد تعتمد على الجرافيكس (مثل: خرائط مضيئة، Wireframes) واكتب الـ Prompts الخاصة بها بأسلوب تجريدي.`;

  try {
    const useOllama = localStorage.getItem("useOllama") === "true";
    const storedUrl = localStorage.getItem("ollamaUrl");
    const ollamaUrl = (storedUrl && storedUrl !== "http://127.0.0.1:11434") ? storedUrl : "http://localhost:11434";
    const ollamaModel = localStorage.getItem("ollamaModel") || "gemini-3-flash-preview";

    let fetchUrl = "/api/generate";
    let requestBody: any = {
      model: "gemini-3-flash-preview",
      messages: [
        { role: "system", content: engineSystemInstruction },
        { role: "user", content: prompt }
      ],
      stream: true,
      options: {
        temperature: 0.5,
        top_k: 40
      },
      useGrounding: !!useGrounding,
      ...(schema ? { format: "json" } : {})
    };

    if (useOllama) {
      fetchUrl = `${ollamaUrl.replace(/\/$/, '')}/api/chat`;
      requestBody.model = ollamaModel;
      requestBody.format = "json"; // Ollama works best with strict "json" when prompt has template
      requestBody.options = { 
        temperature: 0.8,
        repeat_penalty: 1.15,
        top_k: 40,
        top_p: 0.9,
        num_ctx: 32768, // Ensure enough context limit for long generations
        num_predict: -1 // Unlimited predicting
      }; // Ollama specific format
    }

    const response = await fetch(fetchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: signal,
    });

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("text/html")) {
      const errText = await response.text();
      if (errText.includes("<title>Starting Server...</title>")) {
         throw new Error("السيرفر الداخلي قيد التشغيل حالياً، يرجى الانتظار بضع ثوانٍ والمحاولة مرة أخرى.");
      }
      throw new Error(`تعذر الوصول! استقبلنا صفحة HTML بدلاً من JSON. يرجى التأكد من عمل الخادم بنجاح.`);
    }

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Generation Error: ${response.status} - ${errText}`);
    }

    let content = "";
    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");
    
    if (reader) {
      let done = false;
      let buffer = "";
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (line.trim()) {
               try {
                   const parsed = JSON.parse(line);
                   if (parsed.error) {
                     throw new Error(parsed.error);
                   }
                   if (parsed._proxy_error) {
                     throw new Error(`Proxy Error: ${parsed.status} - ${parsed.error}`);
                   }
                   if (parsed.message?.content) {
                       content += parsed.message.content;
                       if (onChunk) onChunk(content);
                   }
               } catch (e: any) {
                   if (e instanceof Error && (e.message.includes("Proxy Error") || e.message.includes("فشل كلا") || e.message.includes("استنفاد") || e.message.includes("المفتاح"))) {
                       throw e;
                   }
                   if (e instanceof Error && !e.message.includes("Unexpected token") && !e.message.includes("JSON")) {
                       throw e;
                   }
                   console.error("Failed to parse chunk", line, e);
               }
            }
          }
        }
      }
      if (buffer.trim()) {
         try {
             const parsed = JSON.parse(buffer);
             if (parsed._proxy_error) {
                 throw new Error(`Proxy Error: ${parsed.status} - ${parsed.error}`);
             }
             if (parsed.message?.content) {
                 content += parsed.message.content;
                 if (onChunk) onChunk(content);
             }
         } catch(e) {
             if (e instanceof Error && e.message.includes("Proxy Error")) {
                 throw e;
             }
         }
      }
    }

    return content;
  } catch (err: any) {
     const msg = err?.message || "";
     const useOllama = localStorage.getItem("useOllama") === "true";
     
     if (useOllama && err.name === "TypeError" && msg.includes("fetch")) {
         const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
         const isHttpTarget = typeof window !== "undefined" && (localStorage.getItem("ollamaUrl")?.startsWith("http://") || !localStorage.getItem("ollamaUrl"));
         
         if (isHttps && isHttpTarget) {
             throw new Error("فشل الاتصال بسيرفر Ollama. أنت تستخدم الموقع بنظام (HTTPS) وتتصل بـ (HTTP). المتصفح يمنع ذلك (Mixed Content). يرجى الرجوع للإعدادات لمعرفة كيفية استخدام ngrok لعمل رابط HTTPS.");
         } else {
             throw new Error("فشل الاتصال بسيرفر Ollama المحلي. المتصفح يمنع الاتصال، يرجى مراجعة إعدادات Ollama في التطبيق للتأكد من تفعيل CORS (OLLAMA_ORIGINS=\"*\").");
         }
     }

     // If the error comes from the backend proxy natively via our fallback system, it will have a detailed message.
     // Let's only inject the manual key warning if it's explicitly an invalid manual key, NOT when it's just 'not configured' fallback text.
     if (!msg.includes("عذراً، تشغيل المزود فشل:") && (msg.includes("API key not valid") || msg.includes("API_KEY_INVALID"))) {
         throw new Error("يبدو أنك قمت بإضافة مفتاح غير صالح يدوياً في الإعدادات. ليعمل التطبيق طبيعياً وبدون أي مفاتيح، يرجى فتح الإعدادات (Settings) ومسح المفتاح بالكامل (GEMINI_API_KEY) وسيعمل النظام تلقائياً.");
     }
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
      console.error("API Error during callWithRetry:", error);
      
      if (error.name === "AbortError") throw error;
      
      // Known unrecoverable proxy errors
      const isStartingServerError = errorMessage.includes("السيرفر الداخلي") || errorMessage.includes("starting server");
      const isMissingApiKeys = errorMessage.includes("فشل كلا المزودين") || errorMessage.includes("المفتاح غير صالح");
      const isOllamaCorsError = errorMessage.includes("ollama");
      
      if (!isStartingServerError && (isOllamaCorsError || isMissingApiKeys || errorMessage.includes("403") || errorMessage.includes("400") || errorMessage.includes("invalid url") || errorMessage.includes("html"))) {
         console.error("Unrecoverable error encountered, aborting retries:", error);
         throw error;
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
  if (mood === "حكاوي الأجداد" && (!topic || topic.trim() === "")) {
    specificRules = `\nCRITICAL OVERRIDE FOR THIS MOOD (NO TOPIC PROVIDED): You MUST generate these exact or very closely related concepts: 
1. "القصة الحقيقية وراء اختراع السلعوة" (The real story behind the Silawea myth in the 90s)
2. "النداهة: رعب ليالي الدلتا" (El Naddaha: Horrors of the Delta nights)
3. "أمنا الغولة وأبو رجل مسلوخة" (The origin of childhood bogeymen).`;
  }

  const prompt = `[Agent: Editor in Chief - Archive Desk]
${getSystemPrompt()}
Task: Generate exactly 3 highly creative, deeply researched, and culturally significant YouTube video ideas based on raw archival logic for an Egyptian audience.
Topic/Seed: ${topic || "Random fascinating, buried subject based on the mood"}
Selected Journalistic Mood: ${mood}
${specificRules}

=== RESEARCH ANGLES & RULES FOR THIS MOOD ===
Research Angle Focus: ${moodContext.researchAngle}
Scripting Style Focus: ${moodContext.scriptingStyle}
MUST PULL TREASURES FROM (ARCHIVAL SOURCES RULE): ${moodContext.archivalTreasureRules}
Additional User Notes: ${note}

CRITICAL REQUIREMENTS:
1. OVERALL TONE: The ideas and hooks MUST be written in an Egyptian Journalist tone (مصرية صحفية دارجة، أسلوب الدحيح). NEVER use rigid, translated, or formal Arabic (لا تكتب الفصحى الجامدة). Do NOT use fake documentary meta-words (e.g. don't write "ثعبانية الشوارع" or "مانشيتات عاجلة"). The title should sound like a viral, high-quality YouTube video (e.g., "السر اللي خفوه في أرشيف الأهرام", "إزاي كتاب قديم غير تاريخ الشارع").
2. THE FORBIDDEN ARCHIVE: The ideas must sound like they were dug out of a dusty cabinet. You MUST incorporate specific (real or highly plausible historical) Arabic sources seamlessly into the hook narrative.
3. NO CLICHÉS: Stop generating standard AI titles. Think like a real human Egyptian investigative journalist.
4. EXACT COUNT: You MUST return exactly 3 ideas.

Output format: A JSON OBJECT.
{
  "suggestions": [
    {
      "id": 1,
      "title": "Headline 1 (Catchy, Viral, Egyptian storytelling Context without clichés)",
      "hook": "Full context paragraph in engaging Egyptian slang (عامية مصرية) explaining the story, why it's a treasure, and naming the archaic/rare sources naturally.",
      "angle": "Brief strategy on how the script will be executed."
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
                title: { type: Type.STRING },
                hook: { type: Type.STRING },
                angle: { type: Type.STRING },
              },
              required: ["id", "title", "hook", "angle"],
            },
          },
        },
        required: ["suggestions"],
      },
      engine,
      onChunk,
      signal
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
  allScenes: EpisodeScene[],
  engine = "gemini",
  onChunk?: (text: string) => void,
  signal?: AbortSignal
): Promise<{ packaging: any; shorts: any[] }> {
  const prompt = `[Agent: Final Packaging & Shorts]
${getSystemPrompt()}
العنوان: ${videoTitle}
صمم حزمة النشر في يوتيوب (SEO & Thumbnail) و3 أفكار للشورتس.
RULES:
1. Anti-Cliché Rule (CRITICAL): The description and shorts must NEVER use clichés like 'يا عزيزي', 'كوباية الشاي', 'صدق أو لا تصدق', or 'دعني أخبرك'. The tone must be professional, factual, and deeply engaging without cheap tricks.
2. NATIVE YOUTUBE STYLE: The description should tease the mystery and hook the viewer immediately using strong, direct Egyptian hooks.

[CRITICAL]: Your response must be PURE JSON matching the schema.
{
  "packaging": { "youtube_titles": ["string"], "thumbnail_concept": "string", "thumbnail_midjourney_prompt": "string (AI Image prompt)", "description_al_daheeh_style": "string", "tags": ["string"] },
  "shorts": [ { "title": "string", "hook": "string", "body": "string", "cta": "string", "visual_instructions": "string (how to edit it)" } ]
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
              youtube_titles: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              thumbnail_concept: { type: Type.STRING },
              thumbnail_midjourney_prompt: { type: Type.STRING },
              description_al_daheeh_style: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: [
              "youtube_titles",
              "thumbnail_concept",
              "thumbnail_midjourney_prompt",
              "description_al_daheeh_style",
              "tags",
            ],
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
        },
        required: ["packaging", "shorts"],
      },
      engine,
      onChunk,
      signal
    );
    return safeJsonParse(text, { packaging: {}, shorts: [] });
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
  const prompt = `[Long-form Research Map]
${getSystemPrompt()}
Video Title: ${title}
Target Duration: ${durationValue} minutes.
User Note / Context: ${note}
Selected Journalistic Mood: ${mood}

=== MOOD & STYLE CONSTRAINTS ===
Research Angle Focus: ${moodContext.researchAngle}
Scripting Style Focus: ${moodContext.scriptingStyle}
MUST PULL TREASURES FROM: ${moodContext.archivalTreasureRules}

Task: Gather mind-blowing, deeply researched, factual, and fascinating data for this topic. Break the video down into exactly ${numChapters} chapters that flow perfectly from one to the next, adhering to the "Research Angle" of the specified mood. The content MUST be dense, highly educational, yet presented with the narrative hooks of a master storyteller (like "Al Daheeh").

CRITICAL INSTRUCTIONS FOR CHAPTERS & RESEARCH:
1. YOU MUST NEVER REPEAT CHAPTER TITLES OR DESCRIPTIONS. EACH CHAPTER MUST BE 100% UNIQUE.
2. EXTREME DETAIL: Do not use generic summaries. Each chapter must explore a SPECIFIC, DISTINCT, and UNIQUE sub-topic, event, scientific phenomenon, or dimension of the story. 
3. Include fascinating historical anecdotes, weird statistics, or crazy facts that nobody knows. We want the audience to feel like they learned something incredibly valuable and niche.
4. If chapters represent chronologies, ensure they move forward logically. If they represent themes, ensure NO overlap.
5. Provide a strong hook or conflict for every single chapter in its description.
6. The "research_data" MUST be an extensive, highly informative essay-like compilation of facts, dates, names, theories, and analogies. It must serve as a rich encyclopedia for the scriptwriter later. DO NOT skim.

CRITICAL INSTRUCTION FOR SOURCES: You MUST prioritize authentic, high-quality ARABIC sources (e.g., historical documents, academic papers, books, encyclopedias, trusted journalism). Ensure that the citations are real, highly relevant, and impressive.

[CRITICAL]: Response MUST be PURE JSON.
{
  "research_data": "string (A massive consolidated block of all the factual research, historical data, or deep insights about the topic. This acts as the brain for the entire script.)",
  "sources": [ { "title": "string", "url": "string (Real looking URLs if possible)", "info": "string" } ],
  "video_title": "string (A catchy title based on the mood)",
  "chapters": [ { "chapter_number": number, "chapter_title": "string (UNIQUE)", "chapter_description": "string (Detailed explanation of what this unique chapter covers)", "key_points": ["string", "string"] } ],
  "thumbnail": { "image_prompt": "string", "text_on_image": "string" }
}`;

  return callWithRetry(async () => {
    const text = await generateAIContentRaw(
      prompt,
      {
        type: Type.OBJECT,
        properties: {
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
              },
              required: [
                "chapter_number",
                "chapter_title",
                "chapter_description",
                "key_points",
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
          "research_data",
          "sources",
          "video_title",
          "chapters",
          "thumbnail",
        ],
      },
      engine,
      onChunk,
      signal
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
  const prompt = `[Scriptwriter - Chapter Expansion]
${getSystemPrompt()}

Video Title: ${videoTitle}
Overall Series Mood: ${mood} (${moodContext.visualAudioStyle})

Chapter ${chapter.chapter_number}: ${chapter.chapter_title}
Context: ${chapter.chapter_description}
Target Words for this chapter: ${targetWords}

[Master Research Document]:
Use the following facts to write this chapter. NEVER invent dates, names, or events. Only use the info provided here or common knowledge that is 100% historically/scientifically accurate.
${researchData}

${previousSummary ? `Previous Chapter Summary (DO NOT REPEAT information from here, just flow naturally out of it):
${previousSummary}
` : ""}

[CRITICAL INSTRUCTIONS - "AL DAHEEH" MASTERCLASS METHOD]:
1. THE VOICE & TONE (عامية مصرية دايركت): 
   - The "voice_over" MUST ALWAYS be written in 100% Egyptian slang/dialect (عامية مصرية دارجة), conversational, dynamic, and highly engaging.
   - It MUST sound exactly like popular YouTube science/history storytellers (e.g., Al-Daheeh - الدحيح). Use humor, sarcasm, sudden energy shifts, and talk directly to the viewer ("بص يا سيدي", "تخيل معايا كده", "الموضوع مش زي ما إنت فاكر").
2. STORYTELLING & STRUCTURE:
   - Use Analogies: Explain complex or dry topics by comparing them to everyday Egyptian situations (e.g., riding a microbus, buying a shawarma, dealing with your landlord).
   - Show, Don't Tell: Drive the narrative through specific stories of people, exact dates, and funny incidents, not just dry facts.
   - Pace & Retention: Change the pacing. Ask rhetorical questions. Introduce a mystery, then solve it with an academic or historical fact.
3. REPETITION BAN: Never repeat generic transitional phrases. Speak naturally and deliver NEW, mind-blowing facts in every single sentence. Do not re-use sentences or concepts from previous scenes. 
4. FORMAT FOR VOICE ACTOR: Write the script exactly as it should be read. Spell out numbers as words (e.g., "خمسة آلاف"). Use punctuation (..., !, ؟) clearly to indicate pauses and tone changes. Include acting notes in brackets inside the voice over if needed, e.g. "(بصوت درامي)" or "(بسرعة)".
5. SCRIPT LENGTH AND DENSITY (CRITICAL):
   - You MUST write approximately ${targetWords} words of voice_over content for this chapter in total across the generated scenes.
   - Fill the runtime with DENSE INFORMATION. Do not fluff it up. The viewer must learn something profound. If you run out of things to say, dive deeper into the microscopic details of the 'Research Data'.
6. FLOW: This is just ONE segment of a larger continuous video. 
   - ${isFirst ? "This is the FIRST chapter. You MUST include a massive, attention-grabbing HOOK in the first 10 seconds. Shock the viewer." : "This is a MIDDLE chapter. DO NOT include a welcome, just dive straight into the next mind-blowing detail."}
   - ${isLast ? "This is the FINAL chapter. Provide a memorable philosophical conclusion, summarize the moral of the story, and deliver a classic memorable outro." : 'This is a MIDDLE chapter. DO NOT conclude the video or say "استنونا". Give a cliffhanger at the end of this chapter leading to the next.'}
7. ASSET ID & VISUALS: Set "asset_id" sequentially (Scene_01, Scene_02). Visual cues must be wildly creative, complementing the comedy or the drama (e.g., "Meme of someone crying in front of a spreadsheet" or "Dramatic old footage of a sinking ship").
8. SOURCES & CITATIONS: Naturally mention sources in the script when citing crazy facts (e.g., "زي ما بيقول كتاب كذا...", "دراسة في جامعة كذا سنة كذا اكتشفت إن...").

Output format: A JSON OBJECT containing a single property "timeline" which is an array of scene objects:
{
  "timeline": [
    {
      "asset_id": "Scene_01",
      "voice_over": "string (Egyptian Dialect)",
      "visual_cue": "string (Arabic description of the visual scene)",
      "montage_instructions": "string (Arabic notes for editing/cuts)",
      "sound_design": "string (Arabic SFX notes)",
      "image_prompt_nano_banana": "string (Detailed English prompt for Nano Banana. Add Arabic text quotes if needed)",
      "ai_video_prompt": "string (Detailed English prompt for Runway/Luma describing camera motion and lighting)",
      "b_roll_keywords": "string (Search terms for stock footage, e.g. 'vintage clock ticking 4k')",
      "sources": []
    }
  ]
}`;

  return callWithRetry(async () => {
    const text = await generateAIContentRaw(
      prompt,
      {
        type: Type.OBJECT,
        properties: {
          timeline: {
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
                sources: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: [
                "asset_id",
                "voice_over",
                "visual_cue",
                "montage_instructions",
                "sound_design",
                "image_prompt_nano_banana",
                "ai_video_prompt",
                "b_roll_keywords",
                "sources",
              ],
            },
          },
        },
        required: ["timeline"],
      },
      engine,
      onChunk,
      signal
    );
    const parsed = safeJsonParse(text, { timeline: [] });
    if (parsed && Array.isArray(parsed.timeline)) {
      return parsed.timeline;
    }
    if (Array.isArray(parsed)) {
      return parsed; // Fallback
    }
    return [];
  }, 3, 2000, signal);
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
  onProgress?.(10, "المرحلة الأولى: جاري هيكلة البحث...");
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
      `جاري كتابة الفصل ${i + 1}...`,
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

    // Create a summarized context of the last chapter to feed into the next
    const lastChapterScript = scenes.map((s) => s.voice_over).join(" ");
    previousSummary = `In the previous chapter (${chapter.chapter_title}), the script ended with: "${lastChapterScript.substring(Math.max(0, lastChapterScript.length - 200))}"`;

    if (i < chapters.length - 1) {
      onProgress?.(
        30 + Math.floor((40 * (i + 1)) / chapters.length),
        `Waiting for 4 seconds to prevent API Rate Limits...`,
      );
      await sleep(4000);
    }
  }

  onProgress?.(80, "المرحلة الأخيرة: جاري التجهيز...");
  const packaging = await generatePackaging(
    design.video_title,
    design.research_data,
    allScenes,
    engine,
    onChunk,
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
    scenes: processedScenes.slice(1),
    sources: design.sources || [],
    publishing_kit: packaging.packaging,
    shorts: processedShorts,
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

  const prompt = `[Node 0: OSINT & RAG Engine - The Archive Room]
${getSystemPrompt()}

You are the "OSINT & RAG Engine" (Node 0) of the Production Engine. Your ONLY job is to perform a deep investigation on the provided topic using WEB SEARCH if available, and output a strictly verified 'Dossier' in JSON format.
  
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
      true // Enable Google Search Grounding for OSINT
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
1. **THE ALDAHEEH / DOCUMENTARY STANDARD**: Your script must be breathtaking. Do NOT just rattle off facts. You must build suspense, ask philosophical questions, give brilliant analogies (like comparing quantum mechanics to a Cairo microbus, or a geopolitical war to a game of dominoes on a sidewalk).
2. **THE PERSONA SHIFT (Object Personification)**: Do not limit voiceover strictly to the human narrator. When contextually appropriate, let places or objects speak (e.g., Imbaba bridge talking about its history). Also, provide deep sociological analysis (Why people act like this in the shadow economy) instead of just stating facts. It must be philosophical and deep.
3. **VOICEOVER PROTOCOL**: 
   - Language: MUST strictly adhere to the dialect rules: 100% Egyptian slang/dialect (عامية مصرية قاهرية صميمة in the style of Al Daheeh). DO NOT use formal Arabic (لا تستخدم الفصحى أبداً). Use classic Egyptian filler words like "علشان، كدة، إزاي، ياترى، بجد، اللي، تخيل معايا". However, KEEP standard spelling for pronunciation (e.g., write "المقاهي" not "المأاهي", use "ق" and "ذ").
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
  engineNode3 = "gemini"
): Promise<EpisodeData> {
  onProgress?.(5, "[!] رئيس التحرير: يتم الآن فتح ملف القضية والبحث في الأرشيف المنسي...");
  const dossier = await executeNode0_OSINT(topic, mood, persona, engineNode1, onChunk);

  onProgress?.(10, "[!] قسم الأبحاث: جاري فحص الوثائق وبناء الخريطة البحثية المعمقة...");
  const design = await generateResearchMap(
    topic,
    durationValue,
    mood,
    note,
    engineNode1,
    onChunk
  );

  onProgress?.(15, "[!] الكاتب الصحفي: يتم كتابة النص الكامل بناءً على المعطيات... (يُرجى الانتظار، السرد يتشكل)");
  const { executeAgent1_Scriptwriter, executeAgent2_Director, executeAgent3_ArtDirector } = await import('./agents');
  
  const masterScript = await executeAgent1_Scriptwriter(
    topic,
    dossier.compiled_research_context,
    durationValue,
    mood,
    persona,
    engineNode1,
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

  const BATCH_SIZE = 3;
  const safeDirectorScenes = directorScenes || [];
  for (let i = 0; i < safeDirectorScenes.length; i += BATCH_SIZE) {
    const batch = safeDirectorScenes.slice(i, i + BATCH_SIZE);
    
    onProgress?.(
      45 + Math.floor((45 * i) / Math.max(1, safeDirectorScenes.length)),
      `[!] المخرج الفني يحقن بصمته: المشاهد من ${i + 1} إلى ${Math.min(i + BATCH_SIZE, safeDirectorScenes.length)} من أصل ${safeDirectorScenes.length}...`
    );
    
    // We will run the Art Director agent for each scene in the batch in parallel
    const enhancedScenes = await Promise.all(batch.map(async (scene: any) => {
      try {
        const artResponse = await executeAgent3_ArtDirector(scene, mood, engineNode2, onChunk);
        return {
          ...scene,
          ...artResponse
        };
      } catch (err) {
        console.warn("Art Director failed for a scene, returning original scene", err);
        return scene;
      }
    }));

    for (const generatedScene of enhancedScenes) {
      const processedScene: EpisodeScene = {
        asset_id: generatedScene.scene_id || `[Scene ${String(allScenes.length + 1).padStart(2, "0")}]`,
        voice_over: generatedScene.voiceover_text,
        voiceover_notes: generatedScene.voiceover_notes,
        estimated_duration_seconds: generatedScene.estimated_duration_seconds,
        visual_cue: generatedScene.camera_and_vision,
        visual_motif: generatedScene.visual_motif,
        cinematic_movement: generatedScene.cinematic_movement,
        montage_instructions: generatedScene.montage_instructions,
        sound_design: generatedScene.sound_and_sfx,
        asmr_soundscape: generatedScene.asmr_soundscape,
        image_prompt_nano_banana: applyGlobalStyle(generatedScene.image_prompt_nano_banana || ""),
        ai_video_prompt: generatedScene.ai_video_prompt || "",
        b_roll_keywords: generatedScene.b_roll_keywords || ""
      };
      
      allScenes.push(processedScene);
      if (onSceneReady) {
        onSceneReady(processedScene);
      }
    }
    
    if (i + BATCH_SIZE < safeDirectorScenes.length) {
      onProgress?.(
        45 + Math.floor((45 * i) / Math.max(1, safeDirectorScenes.length)),
        `[!] تمويه تكتيكي لمدة بضع ثوان (تجنب الإرهاق للمحرك المحلي)...`
      );
      await sleep(2000);
    }
  }

  onProgress?.(90, "[!] غرفة التحميض المظلمة: يتم تغليف الملف واسترجاع أدلة مسربة (Shorts)...");
  const packaging = await generatePackaging(
    design.video_title,
    design.research_data,
    allScenes,
    engineNode1,
    onChunk
  );

  const processedShorts = (packaging.shorts || []).map((s: any) => ({
    ...s,
    visual_instructions: applyGlobalStyle(s.visual_instructions || ""),
  }));

  onProgress?.(100, "[!] العملية تمت بنجاح. الأدلة جميعها الآن بين يديك.");

  return {
    video_title: design.video_title || topic,
    thumbnail: design.thumbnail
      ? {
          ...design.thumbnail,
          image_prompt: applyGlobalStyle(design.thumbnail.image_prompt),
        }
      : undefined,
    opening_sketch: allScenes[0] || {
      asset_id: "",
      voice_over: "",
      visual_cue: "",
      montage_instructions: "",
      sound_design: "",
      image_prompt_nano_banana: "",
      ai_video_prompt: "",
    },
    scenes: allScenes.slice(1),
    sources: dossier.sources.map((s) => ({ title: s.title, url: s.url, info: s.key_takeaway })),
    publishing_kit: packaging.packaging,
    shorts: processedShorts,
  };
}
