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
  dramatic_pause_seconds: z.number().describe("مدة الصمت المطلوب إن وجدت"),
  camera_and_vision: z.string().describe("الرؤية البصرية: وصف كادر الكاميرا والظلال (فقط استعارة مادية، بدون بشر)"),
  cinematic_movement: z.string().describe("حركة الكاميرا السينمائية للـ B-Roll (مثال: Slow Dolly in, Dutch angle, Parallax effect)"),
  visual_motif: z.string().describe("الموتيف البصري (مثال: تأثير الميكروفيلم، مستندات مسربة، ورق أصفر، أختام باهتة)"),
  visual_color_grading: z.string().describe("توزيع باليتة برواز (Navy #1F2A44, Gold #B89B6A, Ivory #F5F1E8) في هذا المشهد"),
  montage_instructions: z.string().describe("توجيهات المونتاج: تعليمات تقنية للمونتير البشري حول سرعة التقطيع، نوع الانتقالات، وكثافة الجرافيكس"),
  english_image_prompt: z.string().describe("Prompt for AI generation (NO HUMAN FACES). MUST explicitly mention Color palette (Navy blue, muted gold, warm ivory)."),
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
} {
  if (mood === "أرشيف الضلمة") {
    return {
      researchAngle:
        "Bizarre historical events, Jahiliyyah rap battles, forgotten local history within Egypt and Arab world.",
      scriptingStyle: "Dark, archival, and deeply investigartive.",
      visualAudioStyle: "Deep shadows, dusty film grain, echoes of the past.",
    };
  } else if (mood === "كلاكيت وتزوير") {
    return {
      researchAngle:
        "Media, art, and pop-culture secrets/propaganda in the Arab world.",
      scriptingStyle:
        "Cynical media analysis, exposing the fake behind the screen.",
      visualAudioStyle: "Glitchy TV effects, high contrast studio lighting.",
    };
  } else if (mood === "ملفات متقفلش") {
    return {
      researchAngle:
        "Massive local scams, unsolved mysteries, or historical cons in the region.",
      scriptingStyle:
        "Hard-boiled investigator style, connecting the dots of corruption.",
      visualAudioStyle: "Interrogation light, neon noir, fast cuts.",
    };
  } else if (mood === "خرافات شعبية") {
    return {
      researchAngle:
        "Debunking Egyptian/Arab myths with cynical science and history.",
      scriptingStyle: "Skeptical, debunking, logic-driven yet mocking.",
      visualAudioStyle:
        "Macro shots of talismans being destroyed, clean white lab light.",
    };
  } else if (mood === "سبوبة ولا ابتكار") {
    return {
      researchAngle:
        "Bizarre local business stories or fake inventions in Egypt/Arab world.",
      scriptingStyle: "Business-cynical, exposing the 'hustle' culture.",
      visualAudioStyle: "Shiny cheap surfaces, fast-paced 'salesman' energy.",
    };
  } else if (mood === "حواديت شوارع") {
    return {
      researchAngle:
        "Raw, documentary style about people, street culture, and urban legends in Egypt.",
      scriptingStyle:
        "Gritty, authentic, street-smart vernacular, deeply connected to common people.",
      visualAudioStyle:
        "Handheld camera feel, raw local sounds, bustling street aesthetics.",
    };
  } else if (mood === "صراع العروش العربي") {
    return {
      researchAngle:
        "Political intrigue, epic betrayals, and massive power shifts in Arab/Islamic history.",
      scriptingStyle:
        "Epic, dramatic, highlighting betrayal and ambition, Machiavellian tone.",
      visualAudioStyle:
        "Grand orchestral background, maps with moving pieces, dark dramatic lighting.",
    };
  } else if (mood === "تكنولوجيا مرعبة") {
    return {
      researchAngle:
        "Dystopian tech, cyber threats, deep fakes, and how technology is used to manipulate locally.",
      scriptingStyle:
        "Paranoid, cautionary, exposing the terrifying realities of the digital age.",
      visualAudioStyle:
        "Cyberpunk neon greens, glitching text, terrifying sterile tech environments.",
    };
  } else if (mood === "اقتصاد الشارع") {
    return {
      researchAngle:
        "Black markets, weird financial hustles, economic crashes, and shadow money.",
      scriptingStyle:
        "Fast-talking financial cynic, breaking down complex scams into street terms.",
      visualAudioStyle:
        "Counting money machines, red stock market charts crashing, dim warehouse lighting.",
    };
  } else if (mood === "ملفات مخابراتية") {
    return {
      researchAngle:
        "Spies, cold war Middle East, covert operations, and double agents.",
      scriptingStyle:
        "Secretive, whispering, highly tactical and classified tone.",
      visualAudioStyle:
        "Redacted files, red string conspiracy boards, typewriter sounds, surveillance camera angles.",
    };
  } else if (mood === "طريقة الدحيح") {
    return {
      researchAngle:
        "Biographies of historical figures, inventors, and scientists, alongside behavioral economics, psychology, and complex scientific/historical phenomena. All simplified into everyday Egyptian stories using pop-culture analogies and myth-busting.",
      scriptingStyle:
        "Sarcastic, highly energetic, relatable Egyptian analogies, talking directly to the camera.",
      visualAudioStyle:
        "Fast-paced montage, comedic visual overlays, animated cutouts.",
    };
  } else if (mood === "خرائط دموية (Faceless)") {
    return {
      researchAngle:
        "Historical/Geographical conflicts explained entirely using abstract maps and moving borders. Focus on strategy and geopolitics.",
      scriptingStyle:
        "Analytical, strategic, referencing geographical movements and troop formations.",
      visualAudioStyle:
        "Animated maps, glowing borders, parchment textures, military drum rolls.",
    };
  } else if (mood === "سبورة بيضاء (Whiteboard)") {
    return {
      researchAngle:
        "Simplifying complex scientific, economic, or behavioral ideas using drawn illustrations. Focus on analogies.",
      scriptingStyle:
        "Friendly, educational, using a teacher-like persona talking to a layman.",
      visualAudioStyle:
        "Hand-drawn sketches forming on a whiteboard, marker squeak sounds, clean white background.",
    };
  } else if (mood === "ميمز ومقاطع (Faceless)") {
    return {
      researchAngle:
        "Pop-culture, internet drama, or weird trends explained using viral memes and B-roll.",
      scriptingStyle:
        "Extremely fast-paced Gen-Z slang, cynical, highly internet-aware.",
      visualAudioStyle:
        "Rapid cuts of popular memes, viral video clips, aggressive swoosh transitions.",
    };
  } else if (mood === "رحلة في عقل مجرم") {
    return {
      researchAngle:
        "Deep psychological breakdown of infamous crimes, analyzing the 'why' behind the crime.",
      scriptingStyle:
        "Suspenseful, psychological, speaking in a low, intense tone.",
      visualAudioStyle:
        "Muted colors, forensic analysis graphics, slow zoom-ins, heartbeat sound effects.",
    };
  } else if (mood === "المستقبل الديسطوبي") {
    return {
      researchAngle:
        "Tech predictions, AI dangers, and worst-case scenarios for humanity's future.",
      scriptingStyle:
        "Ominous, sci-fi focused, using technical terms with a tone of impending doom.",
      visualAudioStyle:
        "Glitch effects, neon cyberpunk aesthetics, synth-wave dark ambient music.",
    };
  } else if (mood === "محاكمة التاريخ") {
    return {
      researchAngle:
        "Re-evaluating historical figures or events, playing the role of a modern prosecutor or defense attorney.",
      scriptingStyle:
        "Argumentative, legal, using 'objections', dramatic reveals, and evidence presentation.",
      visualAudioStyle:
        "Gavel sounds, dramatic lighting, split-screen 'for' and 'against' visuals, paper stamping effects.",
    };
  } else if (mood === "اقتصاد البقاء") {
    return {
      researchAngle:
        "Extreme real-world economics, how regular people survive crises, black markets, and hyperinflation.",
      scriptingStyle:
        "Urgent, gritty, explaining money through the lens of street-level survival.",
      visualAudioStyle:
        "Shaky cam feel, street-level b-roll, ticking clocks, harsh realism.",
    };
  } else if (mood === "جبل الجليد (Iceberg)") {
    return {
      researchAngle:
        "Structuring facts into levels from mainstream knowledge down to obscure conspiracy theories and disturbing secrets.",
      scriptingStyle:
        "Gradually lowering the tone, becoming more mysterious and paranoid as we go deeper into the iceberg.",
      visualAudioStyle:
        "Iceberg graphic transitions, water depth sounds, increasingly distorted and eerie music at the bottom levels.",
    };
  } else if (mood === "همس الحكايات (Dark ASMR)") {
    return {
      researchAngle:
        "Focusing on highly sensory and terrifying descriptive details, immersing the listener in the environment.",
      scriptingStyle:
        "Soft-spoken, long pauses, whispered secrets, creating extreme psychological intimacy and tension.",
      visualAudioStyle:
        "Pure ASMR format, binaural sound effects (3D audio), pitch-black or very minimal visuals (e.g., a single flickering candle).",
    };
  } else if (mood === "شريط ملعون (Found Footage)") {
    return {
      researchAngle:
        "Uncovering a sequence of events presented as lost media, classified police tapes, or leaked footage.",
      scriptingStyle:
        "Fragmented, panicked, interrupted by static, reading 'classified' logs or 'last known recordings'.",
      visualAudioStyle:
        "VHS scanlines, date/time overlays, shaky cam, sudden audio cutouts, visual glitches.",
    };
  } else if (mood === "مسافر عبر الزمن") {
    return {
      researchAngle:
        "Explaining current or historical events from the perspective of someone from the distant future or past.",
      scriptingStyle:
        "Nostalgic, detached, warning the viewer about 'what happened next', treating modern tech as ancient history.",
      visualAudioStyle:
        "Futuristic HUDs or ancient parchment framing, static glitches, distorted voice transmission.",
    };
  }
  return { researchAngle: "", scriptingStyle: "", visualAudioStyle: "" };
}

const MASTER_PERSONA = `[Person Lock: برنامج برواز - Barwaz]
الهوية: أنت كاتب سيناريو وصانع محتوى وفني إخراج لبرنامج يوتيوب شهير اسمه "برواز". البرنامج "Faceless" يعتمد بالكامل على السرد الصوتي مع مواد بصرية (صور مصممة بالذكاء الاصطناعي، أرشيف، ومونتاج سريع).
الأسلوب الأساسي: سرد القصص المعقدة (سواء تاريخية، اقتصادية، رعب، إلخ) بأسلوب القصة المشوقة. الإيقاع سريع جداً ولا يعطي المشاهد فرصة للملل.
القاعدة الذهبية: أنت لست شخصية وهمية (مثل النباش أو المفتش)، لا تستخدم أبداً جمل مثل "هات الممحاة" أو "في غرفتي المظلمة" أو "أنا النباش" أو غيرها من الكليشيهات في السكريبت. أنت تحكي القصة أو الموضوع مباشرة بحماس وانسيابية.

[MANDATORY RULE FOR ALL OUTPUTS]:
لغة التعليق الصوتي (Voice Over) أو السرد MUST ALWAYS AND ONLY BE IN EGYPTIAN DIALECT (عامية مصرية دارجة) in the style of "Al-Daheedh" (humorous, conversational, engaging, street-smart). Never use Modern Standard Arabic (فصحى) for the spoken script, regardless of the chosen mood or topic.

[CRITICAL INSTRUCTION FOR ALL IMAGE PROMPTS]:
في هيكلة الـ JSON الخاصة بالـ Pipeline، اعزل (وصف المشهد والأحداث) عن (وصف الاستايل الفني). اكتب وصف المشهد فقط (Subjects & Actions) في حقل الـ image_prompt في الإنجليزية.
إذا كان المشهد يحتاج لظهور نص عربي داخل الصورة (مثل عنوان جريدة أو يافطة)، فاكتب النص العربي صراحة للذكاء الاصطناعي (Nano Banana) داخل البرومبت هكذا: The large Arabic text 'كلمتك هنا' is printed on...`;

const MASTER_STYLE = `[Visual Style: Barwaz Core]
Style: High-end documentary, dynamic composition, cinematic framing.
Lighting: Professional studio lighting or cinematic natural light depending on the scene.`;

const GLOBAL_IMAGE_STYLE =
  "Cinematic lighting, 8k resolution, highly detailed, masterpieces style, hyper-realistic textures, no faces";
const GLOBAL_NEGATIVE_PROMPT = "low quality, blurry, distorted";

export function applyGlobalStyle(prompt: string): string {
  if (!prompt || prompt.trim() === "") return prompt;

  let finalPrompt = prompt;
  // Ensure we don't duplicate global styling
  if (!finalPrompt.includes(GLOBAL_IMAGE_STYLE)) {
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

async function generateAIContentRaw(
  prompt: string,
  schema?: any,
  engine = "gemini",
  onChunk?: (text: string) => void,
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const engineSystemInstruction = `أنت "محرك النبّاش"، نظام ذكاء اصطناعي متقدم مخصص حصرياً لإنتاج نصوص وثائقية استقصائية احترافية لصالح منصة "برواز". مهمتك صياغة تحقيقات بصرية دقيقة، عميقة، ومكتوبة باحترافية شديدة. يجب عليك تنفيذ المخرجات فوراً وبشكل مباشر دون أي مقدمات، أو تحيات، أو خاتمات حوارية.

يجب الالتزام الصارم والخوارزمي بالقواعد التالية (أي كسر لهذه القواعد يعتبر فشلاً للنظام):

1. قاعدة الدرع البصري (Identity Guard - CRITICAL):
- يُمنع منعاً باتاً تعيين، أو ظهور، أو تجسيد الوجوه البشرية أو الملامح المباشرة في أي توجيه بصري أو أوامر توليد الصور (Prompts).
- استخدم "الاستعارة المادية" فقط (مثل: التركيز على حركة الأيدي، الظلال، أدوات العمل، الكراتين، النقود، البنية التحتية، أو الزوايا الواسعة للمكان). 
- في أوامر الـ Prompts، يُمنع إضافة أي وصف لوجه أو شخصية بشرية واضحة.

2. قاعدة مكافحة الكليشيهات والنبرة (Anti-Cliché & Tone Rule):
- يُمنع تماماً استخدام العبارات المستهلكة (مثل: "يا عزيزي"، "دعني أخبرك"، "هل تساءلت يوماً"، أو النبرة الحماسية المبالغ فيها).
- النبرة يجب أن تكون واقعية، رصينة، وتدخل في صلب الموضوع مباشرة.
- التعليق الصوتي يجب أن يُكتب باللهجة القاهرية النظيفة (Clean Cairene) أو اللهجة البيضاء لتناسب السرد الاحترافي.

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
    const response = await ai.models.generateContentStream({
        model: "gemini-2.5-flash", // The currently recommended model
        contents: prompt,
        config: {
            systemInstruction: engineSystemInstruction,
            responseMimeType: schema ? "application/json" : "text/plain",
            temperature: 0.5,
            topK: 40
        }
    });
    
    let content = "";
    for await (const chunk of response) {
        if (chunk.text) {
            content += chunk.text;
            if (onChunk) onChunk(content);
        }
    }
    return content;
  } catch (geminiErr: any) {
     if (geminiErr.message?.includes("API_KEY_INVALID") || geminiErr.message?.includes("API key not valid")) {
         throw new Error("مفتاح API غير صالح. يرجى التأكد من أنك قمت بنسخ مفتاح Gemini بشكل صحيح في الإعدادات.");
     }
     throw geminiErr;
  }
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function callWithRetry(
  fn: () => Promise<any>,
  retries = 7,  // Increased to 7 to give it a better chance if quota is exhausted
  baseDelay = 3000,
): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (i === retries - 1) {
        console.error("CRITICAL API FAILURE after max retries:", error);
        throw error; // Let the caller handle the final error
      }
      
      const errorMessage = error?.message?.toLowerCase() || "";
      const isQuotaError = errorMessage.includes("quota") || errorMessage.includes("429") || errorMessage.includes("resource_exhausted");
      
      let waitTime = baseDelay * Math.pow(2, i);
      
      if (isQuotaError) {
        waitTime = 62000; // Enforce a 62 seconds wait for rate limit to reset
        console.warn(`Quota or Rate Limit reached. Waiting ${waitTime / 1000}s... (Attempt ${i + 1} of ${retries})`);
      } else {
        console.warn(`API call failed (Not Quota). Retrying in ${waitTime}ms... (Attempt ${i + 1} of ${retries})`, error?.message);
      }

      await sleep(waitTime);
    }
  }
}

function safeJsonParse(text: string, fallback: any = null) {
  if (!text || typeof text !== "string") return fallback;
  try {
    // Attempt 1: Standard parse
    return JSON.parse(text);
  } catch (e) {
    try {
      // Attempt 2: Extract JSON block
      const exactMatch = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
      if (exactMatch && exactMatch[0]) {
        return JSON.parse(exactMatch[0]);
      }
    } catch (e2) {}
    console.error("❌ Barwaz: JSON Parse Failed. Text was:", text);
    throw new Error("JSON Parse Failed: " + text.substring(0, 500));
  }
}

export async function generateTitle(
  topic: string,
  mood: MoodType,
  note: string,
  engine = "gemini",
  onChunk?: (text: string) => void,
): Promise<RadarSuggestion[]> {
  const moodContext = getMoodContext(mood);
  const prompt = `[Agent: Creative Director]
${MASTER_PERSONA}
Task: Generate exactly 3 deeply researched and professional YouTube video ideas/titles.
Topic: ${topic || "Random fascinating subject based on the mood"}
Mood: ${mood}
Research Angle focus: ${moodContext.researchAngle}
Scripting Style focus: ${moodContext.scriptingStyle}
Additional User Notes: ${note}

Instructions:
1. Ensure the "hook" is a complete and engaging paragraph in Egyptian Arabic.
2. The "title" must be catchy, mysterious, or highly clickable, but never clickbait without substance.
3. The "angle" should briefly explain the strategy of how this video will be structured.

Output format: A JSON Array of 3 objects:
[
  {
    "id": 1,
    "title": "Headline",
    "hook": "Full context paragraph in Egyptian Arabic",
    "angle": "Brief strategy"
  }
]
STRICTLY return the JSON array only. No markdown. No introductory text.`;

  return callWithRetry(async () => {
    const text = await generateAIContentRaw(
      prompt,
      {
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
      engine,
      onChunk,
    );

    const parsed = safeJsonParse(text, []);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }

    // If we got something but it's not an array of 3, maybe it's just one object?
    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed) &&
      (parsed as any).title
    ) {
      return [parsed as any];
    }

    return [];
  });
}

export async function generatePackaging(
  videoTitle: string,
  researchData: string,
  allScenes: EpisodeScene[],
  engine = "gemini",
  onChunk?: (text: string) => void,
): Promise<{ packaging: any; shorts: any[] }> {
  const prompt = `[Agent: Final Packaging & Shorts]
${MASTER_PERSONA}
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
    );
    return safeJsonParse(text, { packaging: {}, shorts: [] });
  });
}

export async function generateResearchMap(
  title: string,
  durationValue: number,
  mood: MoodType,
  note: string,
  engine = "gemini",
  onChunk?: (text: string) => void,
): Promise<MasterOutline & { sources: any[]; research_data: string }> {
  const numChapters =
    durationValue >= 60 ? 12 : Math.max(3, Math.round(durationValue / 5));
  const moodContext = getMoodContext(mood);
  const prompt = `[Long-form Research Map]
${MASTER_PERSONA}
Video Title: ${title}
Target Duration: ${durationValue} minutes.
Mood: ${mood}
Research Angle Focus: ${moodContext.researchAngle}

Task: Gather deep, factual, and fascinating research data for this topic. Break the video down into exactly ${numChapters} chapters that flow perfectly from one to the next, adhering to the "Research Angle" of the specified mood.

[CRITICAL]: Response MUST be PURE JSON.
{
  "research_data": "string (A massive consolidated block of all the factual research, historical data, or deep insights about the topic. This acts as the brain for the entire script.)",
  "sources": [ { "title": "string", "url": "string (Real looking URLs if possible)", "info": "string" } ],
  "video_title": "string",
  "chapters": [ { "chapter_number": number, "chapter_title": "string", "chapter_description": "string (Detailed explanation of what this chapter covers)", "key_points": ["string"] } ],
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
    );
    const parsed = safeJsonParse(text);
    if (!parsed || !parsed.chapters)
      throw new Error("فشل في استخراج الخريطة البحثية");
    return parsed;
  });
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
): Promise<EpisodeScene[]> {
  const moodContext = getMoodContext(mood);
  const prompt = `[Scriptwriter - Chapter Expansion]
${MASTER_PERSONA}

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

[CRITICAL INSTRUCTIONS]:
1. DIALECT & READABILITY: 
   - The "voice_over" MUST ALWAYS be written in 100% Egyptian slang/dialect (عامية مصرية دارجة), conversational, and highly engaging.
   - FORMAT FOR VOICE ACTOR: Write the script exactly as it should be read. Spell out numbers as words (e.g., "خمسة آلاف" instead of "5000"). Use punctuation (..., !, ؟) clearly to indicate pauses and tone changes. 
   - No formal Arabic.
2. FLOW: This is just ONE segment of a larger continuous video. 
   - ${isFirst ? "This is the FIRST chapter. You MUST include a strong hook directly into the subject." : "This is a MIDDLE chapter. DO NOT include a welcome, just start immediately where the last chapter left off."}
   - ${isLast ? "This is the FINAL chapter. Provide a conclusion to the whole video and an outro." : 'This is a MIDDLE chapter. DO NOT conclude the video or say "استنونا في الحلقات الجاية".'}
3. ASSET ID: Set "asset_id" sequentially like "Scene_XX" (e.g., Scene_01, Scene_02). Do NOT use generic terms like "first_frame".
4. JSON SAFETY: NEVER use raw double quotes (\") inside any JSON string value. If you need to quote something inside a string, use SINGLE QUOTES (').
5. VISUAL FRAMING (Faceless Barwaz Style): The creator DOES NOT show their face. Visuals rely entirely on contextual layouts matching the mood (e.g., mysterious maps, old newspapers, 3D whiteboards, abstract concepts).
6. IMAGE & VIDEO PROMPTS: 
   - For "image_prompt_nano_banana", if the scene requires Arabic text (like headlines, signs, documents), explicitly include the Arabic phrase in single quotes (e.g., The large Arabic text 'سقوط الإمبراطورية' is printed on the wall...). Keep the prompt descriptive in English.
   - For "ai_video_prompt", write a professional prompt suitable for Runway/Luma/Kling. Describe the clear camera movement (e.g., 'Slow pan left', 'Fast zoom in'), the lighting, and the subject's strict motion. Keep it highly cinematic and English only.
7. FORMAT: Response MUST be a PURE JSON Array of scene objects.

[
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
]`;

  return callWithRetry(async () => {
    const text = await generateAIContentRaw(
      prompt,
      {
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
      engine,
      onChunk,
    );
    return safeJsonParse(text, []);
  });
}

export async function generateEpisode(
  title: string,
  durationValue: number,
  note: string,
  mood: MoodType,
  onProgress?: (p: number, status: string) => void,
  engine = "gemini",
  onChunk?: (text: string) => void,
): Promise<EpisodeData> {
  onProgress?.(10, "المرحلة الأولى: جاري هيكلة البحث...");
  const design = await generateResearchMap(
    title,
    durationValue,
    mood,
    note,
    engine,
    onChunk,
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
  persona: PersonaType,
  engine = "gemini",
  onChunk?: (text: string) => void
): Promise<OsintDossier> {
  const cached = await getCachedDossier(topic);
  if (cached) {
    if (onChunk) onChunk("[CACHE HIT] Loaded OSINT Dossier from local storage.");
    return cached;
  }

  const personaContext = getPersonaInstructions(persona);

  const prompt = `You are the "OSINT & RAG Engine" (Node 0) of the Nabash Production Engine. Your ONLY job is to perform a deep mock-investigation on the provided topic and output a strictly verified 'Dossier' in JSON format.
  
PERSONA CONTEXT: ${personaContext}

RULES:
1. DEPTH: Find the core conflict, mystery, or controversial elements.
2. HIDDEN PATTERNS: Read between the lines. Identify contradictions or secrets not commonly known.
3. VISUAL ANCHORS: Provide vivid, real-world historical or contextual visual details (e.g., "1940s Fedora", "Brutalist architecture").
4. OUTPUT: You MUST return ONLY a valid JSON object matching the exact schema below. No markdown, no preambles.

JSON SCHEMA:
{
  "id": "hash_or_slug",
  "topic": "${topic}",
  "created_at": "ISO date string",
  "last_updated": "ISO date string",
  "executive_summary": "Comprehensive overview",
  "timeline": [{"date_or_period": "...", "event_description": "...", "impact": "..."}],
  "key_entities": [{"name": "...", "role_or_type": "Person" | "Organization" | "Location" | "Concept" | "Other", "description": "...", "key_connections": ["..."]}],
  "core_conflict_or_mystery": "The dramatic core",
  "verified_facts": ["fact 1", "fact 2"],
  "hidden_patterns_or_contradictions": ["pattern 1", "contradiction 2"],
  "historical_visual_anchors": ["visual 1", "visual 2"],
  "sources": [{"title": "...", "url": "...", "credibility_score": 9, "key_takeaway": "..."}],
  "compiled_research_context": "A compressed string summarizing all the above for the next LLM node"
}

Topic to Investigate: ${topic}
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
      onChunk
    );

    const parsedData = safeJsonParse(text);
    const dossierResult = parsedData as OsintDossier;
    await saveCachedDossier(topic, dossierResult);
    return dossierResult;
  });
}

export async function executeNode1_Structure(
  topic: string,
  dossier: OsintDossier,
  targetDurationMinutes: number,
  persona: PersonaType,
  engine = "gemini",
  onChunk?: (text: string) => void
): Promise<Node1Structure> {
  const cached = await getCachedStructure(topic);
  if (cached && (Date.now() % 2 !== 0)) { // Just bypass caching for now
  }
  
  if (cached) {
    if (onChunk) onChunk("[CACHE HIT] Loaded Architect Structure from local storage.");
    return cached;
  }
  
  const personaContext = getPersonaInstructions(persona);
  const totalWords = targetDurationMinutes * 140;
  const minScenes = Math.max(Math.ceil(targetDurationMinutes / 1.25), targetDurationMinutes > 15 ? 30 : Math.round(targetDurationMinutes * 2));
  
  let dynamicBranchingRule = "";
  if (targetDurationMinutes > 15) {
    dynamicBranchingRule = `\nDYNAMIC BRANCHING (LONG-FORM): This is a long episode (${targetDurationMinutes} minutes). Do NOT just stretch out the core scenes or rely on fluff.\nInstead, expand the topic horizontally:\n- Introduce new, deep sub-topics related to the core theme (e.g., historical roots, economic effects, geopolitical relationships, fictional/hypothetical interview angles).\n- Build the outline with logical, ascending transitions where each new block opens a whole new dimension of the topic.`;
  }

  const prompt = `You are the "Architect Node" (Node 1) of the Nabash Production Engine. Your ONLY job is to take an OSINT Dossier and output a strict JSON outline for a narrative video episode.

PERSONA CONTEXT: ${personaContext}

RULES:
1. SCENE COUNT AND PACING: 
   - Target duration is ${targetDurationMinutes} minutes.
   - Target Word Count: Approximately ${totalWords} words total for the episode's voiceover.
   - Scene Constraint: Each scene must represent 1 to 1.5 minutes max (around 150-200 words).
   - Therefore, you MUST generate NO LESS THAN ${minScenes} independent but sequentially connected scenes.
2. NARRATIVE ARC: Each scene must push the story forward with documented facts. No inventing facts. No endless loops.${dynamicBranchingRule}
3. ANTI-CLICHÉ: The narrative format must be smart, sober, and read between the lines.
4. IDENTITY GUARD: Visual concepts must NEVER describe human faces or embody people directly. Use physical metaphors (hands, shadows, tools, objects, wide angles).
5. VISUAL TEXT LOCK: No texts or watermarks overlaying the visual concept descriptions.
6. COLOR PALETTE: You MUST incorporate these colors in every visual concept: (Deep Navy #1F2A44, Warm Ivory #F5F1E8, Muted Gold #B89B6A).
7. OUTPUT: You MUST return ONLY a valid JSON object matching the exact schema below.

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
  ]
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
      await saveCachedStructure(topic, validatedData);
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
  
  const prompt = `You are the "Scripting Node" (Node 2) of the Nabash Production Engine. Your task is to write the voiceover script and visual prompts for a batch of consecutive scenes based on the OSINT chapter structure.

PERSONA CONTEXT: ${personaContext}

RULES (BRAND CONSTITUTION):
1. THE PERSONA SHIFT (Object Personification): Do not limit voiceover strictly to the human narrator. When contextually appropriate, let places or objects speak (e.g., Imbaba bridge talking about its history). Also, provide deep sociological analysis (Why people act like this in the shadow economy) instead of just stating facts. It must be philosophical and deep.
2. VISUAL COLOR PALETTE & MOTIFS: All visual concepts and image prompts MUST explicitly incorporate these colors: Deep Navy (#1F2A44), Warm Ivory (#F5F1E8), Muted Gold (#B89B6A). Never use default AI colors. Use "The Microfilm Effect" (leaked documents, yellowed paper, faded stamps, overlapping texts) when presenting shocking information.
3. ART DIRECTION (IDENTITY GUARD): The english_image_prompt MUST NOT contain descriptions of human faces or specific people. IT IS STRICTLY FORBIDDEN. Use Macro shots, physical metaphors, focus on hands, ancient tools, scattered documents, traces left behind, dramatic shadows.
4. VOICEOVER PROTOCOL: 
   - Language: Clean Cairene (لهجة قاهرية نظيفة) merging seriousness with street realism. Make it dense, thrilling, and full of psychological tension. Introduce cognitive dissonance - break the viewer's expectations.
   - Filter Cliches: NEVER use "يا عزيزي", "صديقي", "طمني عليك", "في البداية", "خلينا نتفق". The tone must be calm, deep, and investigative without cheap emotional hooks.
   - Breathing Space: You MUST insert dramatic pauses explicitly using "[صمت درامي]" and include ambient sound markers using "🔊" to help the sound editor.
5. ASMR SOUND LAYERING: Provide "rough", hyper-realistic ASMR soundscapes for Lyria 3 (e.g., paper sliding, footsteps on asphalt, coffee boiling). The ASMR sound is the "hero" compensating for the lack of human faces.
6. EDITOR'S ROADMAP & PRODUCTION METADATA: Be mathematically precise. Specify camera movements for VEO 2/Runway (e.g., "Slow Dolly-In", "Macro Pan right"), exact music BPM (e.g., Cello solo 60 BPM), graphic overlays, and separate structural JSON fields.
7. SCRIPTING STYLE: ${moodContext.scriptingStyle}

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
      "dramatic_pause_seconds": number,
      "camera_and_vision": "string (abstract metaphors, macro shots only)",
      "cinematic_movement": "string (exact camera commands like Slow Dolly-In, Pan, Tilt, Tracking)",
      "visual_motif": "string (Microfilm effect, leaked documents, conceptual framing)",
      "visual_color_grading": "string (How Navy, Gold, Ivory are distributed here)",
      "montage_instructions": "string (cut speed, transitions, graphic overlays)",
      "english_image_prompt": "string (NO HUMAN FACES. Mention Navy, Ivory, Gold)",
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
                dramatic_pause_seconds: { type: Type.NUMBER },
                camera_and_vision: { type: Type.STRING },
                cinematic_movement: { type: Type.STRING },
                visual_motif: { type: Type.STRING },
                visual_color_grading: { type: Type.STRING },
                montage_instructions: { type: Type.STRING },
                english_image_prompt: { type: Type.STRING },
                sound_and_sfx: { type: Type.STRING },
                asmr_soundscape: { type: Type.STRING },
                music_prompt: { type: Type.STRING },
                music_bpm: { type: Type.NUMBER },
                sfx_prompt: { type: Type.STRING },
              },
              required: ["scene_id", "voiceover_text", "voiceover_notes", "dramatic_pause_seconds", "camera_and_vision", "cinematic_movement", "visual_motif", "visual_color_grading", "montage_instructions", "english_image_prompt", "sound_and_sfx", "asmr_soundscape", "music_prompt", "music_bpm", "sfx_prompt"]
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
      "ai_video_prompt": "English motion prompt for runway/kling"
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
              },
              required: ["asset_id", "voice_over", "visual_cue", "montage_instructions", "sound_design", "image_prompt_nano_banana", "ai_video_prompt"]
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
  onProgress?.(5, "Node 0: OSINT & RAG Engine Working...");
  const dossier = await executeNode0_OSINT(topic, persona, engineNode1, onChunk);

  onProgress?.(10, "Node 1: Gathering Research Map (Legacy)...");
  const design = await generateResearchMap(
    topic,
    durationValue,
    mood,
    note,
    engineNode1,
    onChunk
  );

  onProgress?.(15, "Node 1: Architecting Structure...");
  const structure = await executeNode1_Structure(topic, dossier, durationValue, persona, engineNode1, onChunk);

  onProgress?.(25, "Node 2: Prompt Chaining Pipeline Started...");
  let allScenes: EpisodeScene[] = [];
  let previousScript = "";

  const BATCH_SIZE = 2;
  for (let i = 0; i < structure.scenes_outline.length; i += BATCH_SIZE) {
    const batchOutline = structure.scenes_outline.slice(i, i + BATCH_SIZE);
    
    onProgress?.(
      25 + Math.floor((60 * i) / structure.scenes_outline.length),
      `Node 2: Writing & Directing Scenes ${i + 1} to ${Math.min(i + BATCH_SIZE, structure.scenes_outline.length)} / ${structure.scenes_outline.length}...`
    );
    const generatedBatch = await executeNode2_Batch(
      batchOutline,
      topic,
      mood,
      persona,
      previousScript,
      dossier.compiled_research_context,
      engineNode2,
      onChunk
    );

    for (let j = 0; j < generatedBatch.length; j++) {
      const generatedScene = generatedBatch[j];
      const sceneIndex = i + j;
      const processedScene: EpisodeScene = {
        asset_id: generatedScene.scene_id || `[Scene ${String(sceneIndex + 1).padStart(2, "0")}]`,
        voice_over: generatedScene.voiceover_text,
        voiceover_notes: generatedScene.voiceover_notes,
        visual_cue: generatedScene.camera_and_vision,
        visual_motif: generatedScene.visual_motif,
        cinematic_movement: generatedScene.cinematic_movement + (generatedScene.visual_color_grading ? `\n\n🎨 التدرج اللوني: ${generatedScene.visual_color_grading}` : ""),
        montage_instructions: generatedScene.montage_instructions,
        sound_design: generatedScene.sound_and_sfx,
        asmr_soundscape: generatedScene.asmr_soundscape,
        music_prompt: generatedScene.music_prompt + (generatedScene.music_bpm ? `\n⏱️ BPM: ${generatedScene.music_bpm}` : ""),
        sfx_prompt: generatedScene.sfx_prompt,
        image_prompt_nano_banana: applyGlobalStyle(generatedScene.english_image_prompt || ""),
        ai_video_prompt: ""
      };
      
      allScenes.push(processedScene);
      
      // Trigger SSE callback if provided
      if (onSceneReady) {
        onSceneReady(processedScene);
      }
      
      // Maintain last 2000 characters of the script for deep semantic context
      previousScript += "\\n\\n" + processedScene.voice_over;
      if (previousScript.length > 2000) {
        previousScript = previousScript.substring(previousScript.length - 2000);
      }
    }
    
    // Add 4-second delay between batches to prevent API rate limits (Timeout protection)
    if (i + BATCH_SIZE < structure.scenes_outline.length) {
      onProgress?.(
        25 + Math.floor((60 * i) / structure.scenes_outline.length),
        `Waiting for 4 seconds to prevent API Rate Limits...`
      );
      await sleep(4000);
    }
  }

  onProgress?.(90, "Finalizing Packaging & Shorts...");
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

  onProgress?.(100, "Pipeline Completed Successfully!");

  return {
    video_title: structure.episode_theme || design.video_title || topic,
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
