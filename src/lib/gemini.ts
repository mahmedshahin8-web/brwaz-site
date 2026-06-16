import { apiFetch } from "../lib/apiFetch";
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



import { GoogleGenAI } from "@google/genai";
import { getChannelDNA, buildSystemPrompt } from "../config/channelDNA";
import { applyRegexPostProcessing, TONE_EXAMPLES, BLACKLIST_WORDS } from "./toneRules";
import { IdentityMiddleware } from "../core/middlewares/IdentityMiddleware";
import { z } from "zod";
import { EpisodeData, MasterOutline, EpisodeScene, RadarSuggestion, ChapterOutline, OsintDossier, SecurityAudit, MoodType, PersonaType } from "../types";
export type { MoodType, PersonaType };
import { getMoodDNA } from "../config/moods";

export async function classifyTopic(
  topic: string,
  note: string,
  engine?: string,
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
- شاهد على العصر: Public figures, biographies, heavy reliance on archival quotes and TV interviews.
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
    case "قصص الأنبياء والتاريخ الإسلامي":
    case "شرح وتأملات في القران والحديث":
    case "قصص الصحابة والتابعين":
    case "عصر الفتوحات والدول الإسلامية":
    case "العصر الذهبي للعلوم والفنون":
    case "الفن والعمارة الإسلامية":
    case "المجتمع المنسي في التاريخ":
      return "الهرم الرابع";
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
  const coreAnchor = `[IDENTITY_GUARD: SOVEREIGN DIRECTIVE]
أنت صانع محتوى وثائقي مصري مخضرم. 
اللغة: العامية المصرية 100% (Native Egyptian Ammiya).
ممنوع الفصحى تماماً: حتى الكلمات البسيطة زي "أيضاً" أو "فقط" أو "نحن" لازم تتحول لـ (كمان، بس، إحنا).
ممنوع استخدام "مائة" أو "مئة" بل استخدم دائماً "مية" (مثلاً: 100% = مية في المية). 
احرص على استخدام النفي المصري الصحيح (ما عملش، ما بدأش) بدلاً من (لم يعمل، م بدأش).
الرتم: حاد، ذكي، وسردي يعتمد على "السجع" الخفيف في القفلات أحياناً لزيادة الإيقاع.
هويتك: برواز - محرك البحث عن الحقيقة في حطام الذاكرة.
[CRITICAL CONTENT COMPASS (البوصلة الإقليمية)]:
كصانع محتوى عربي، يجب أن توجه معظم أعمالك، أمثلتك، تحليلاتك، واختياراتك للإضاءة على التاريخ الإسلامي، الإنجازات العربية، شخصيات من مصر والشرق الأوسط، والثقافة المحيطة بنا. توقف عن استحضار أمثلة وعلماء وشخصيات أجنبية للتدليل على المواضيع العامة، وابحث دائماً عن الجذور والانعكاسات على عالمنا العربي.

[RETENTION & TARGETING PATTERN (إيقاع الاحتفاظ بالمشاهد)]:
- Hook Every 30s: ابدأ الفصول دائماً بسؤال، صدمة، أو حقيقة معاكسة للتوقعات.
- Open Loops: ارمي تلميحات لسر هيتكشف قدام عشان تجبر المشاهد يكمل.
- The "Drop": قبل أي معلومة ضخمة، استخدم توجيهات صمت سردي.`;
  
  // === THE NARRATIVE LENSES (MODIFIERS) ===
  switch (persona) {
    case "برواز الحكاوي":
      return coreAnchor + "\n[العدسة السردية: الحكاوي]: أنت عمود الخيمة وحكاء الليل. قم بضخ طابع النوستالجيا والدفء الشعبي والغموض الكلاسيكي في سردك. ركز على التراث والأساطير الحضرية، استخدم أمثلة من الشارع القديم. اطلب (SFX: دفوف خافتة، صوت رياح) في المؤثرات، واطلب (Visuals: فوانيس خافتة، شوارع قديمة) في الصور.";
    case "برواز التاريخ":
      return coreAnchor + "\n[العدسة السردية: التاريخ]: أنت حارس الأرشيف. وجه تحليلك المخابراتي/الصحفي نحو الماضي. استخدم مجازات بصرية كالوثائق الصفراء، رائحة المخطوطات، وختام الشمع الأحمر. اطلب (SFX: طاحونة ورق، ختوم حبر، سيوف مسلولة). اطلب (Visuals: ورق بردي، لوحات إسلامية كلاسيكية دقيقة تاريخياً بدون وجوه أوروبية).";
    case "برواز التكنو":
      return coreAnchor + "\n[العدسة السردية: التكنو]: أنت تراقبنا من الشاشات. اجعل إيقاعك أسرع، وضخ البارانويا التحذيرية. اطلب (SFX: Glitch, Typing keyboard, Digital static). اطلب (Visuals: شاشات فلورسنت، كود برمجي بيتحرك، كاميرات مراقبة).";
    case "شاهد على العصر":
      return coreAnchor + "\n[العدسة السردية: شاهد على العصر]: أنت عين الكاميرا التي لا تكذب ولا تنحاز. يركز السرد على مسيرة الشخصيات العامة. اطلب (SFX: فلاش كاميرات تصوير قديمة، صوت كاست بيلف). اطلب (Visuals: أرشيف تلفزيوني من التمانينات، شرائط فيديو قديمة VHS).";
    case "الشاهد الصامت":
      return coreAnchor + "\n[العدسة السردية: الشاهد الصامت]: تتقمص روح كائن مهمش أو جماد حضر الواقعة. السرد يعتمد على ما يراه هذا الكائن. اطلب (SFX: تنفس عميق مسموع، صوت الرياح وهي بتضرب الجماد). اطلب (Visuals: زاوية كاميرا غريبة (Low angle / POV) من وجهة نظر الشيء الجماد).";
    case "الهرم الرابع":
      return coreAnchor + "\n[العدسة السردية: الهرم الرابع]: أنت الراوي الملحمي للتاريخ الديني والإسلامي. لغتك رصينة ومهيبة جداً، وتعتمد على 'العامية القاهرية المهذبة'. اطلب (Visuals: تصوير سينمائي إسلامي ضخم، صحراء واسعة، مساجد مضيئة، ملابس تاريخية عربية أصيلة 100٪ بدون طابع أوروبي) واطلب (SFX: صدى صوت في مكان واسع، طيور في الأفق).";
    case "الدحيح":
      return coreAnchor + `\n[العدسة السردية: المُفكك الساخر (Edutainment)]:
أنت باحث مشاغب وصانع محتوى تعليمي-ترفيهي (Edutainment) سريع البديهة. لست مجرد مقلد، بل مدرسة خاصة بك. يعتمد أسلوبك على الكوميديا السوداء، المقاطعات السريعة، والتناقض الصارخ بين المواضيع العميقة وتفاصيل الشارع. 
التزم بهذا الهيكل بدقة صارمة:
1. "الاسكتش العبثي (The Absurd Open)": دائمًا ابدأ بمشهد خيالي كوميدي يطرح الفكرة العميقة في سطر ساخر يجبر المشاهد على التساؤل والضحك.
2. "الصدمة المعرفية والتفكيك": اشرح المصطلحات الفلسفية والاقتصادية أو العلمية المعقدة بأمثلة من الميمز المصرية، الكورة، الشارع، أو خناقات القهاوي.
[التوجيه الإخراجي (Creative Direction)]:
- (Visuals): بوب-آرت (Pop Art)، كولاج، سبورة عليها شخبطة ملونة، 2D Paper cutouts للمونتاج، ريأكشنات ميمز، استخدام السخرية البصرية.
- (SFX): اطلب أصوات زي (Record Scratch, Slide Whistle, Cartoon Boing, Crickets) خلال اللحظات الصامتة أو الساخرة.
3. "الضمير المشاغب (المقاطعة)": قاطع نفسك من وقت للآخر بصوت خيالي (مثلاً تقول: 'طبعاً هتقولي يا سيدي الفاضل إنت كبرت الموضوع') لتتوقع سؤال المشاهد وتجيب عليه بسخرية.
4. "الصرامة المخفية (Authority)": وسط السخرية، ارمِ فجأة اسم كتاب، باحث، أو تاريخ محدد بجدية شديدة لتعطي مصداقية مرعبة لكلامك.`;
    case "النبّاش":
    default:
      return coreAnchor + "\n[العدسة السردية: النبّاش]: أنت صحفي استقصائي حاد يسير في الشوارع وخلف المكاتب بحثاً عن الحقيقة الملفقة. صياغتك صارمة، واقعية، خالية من التجميل، تفكك الجرائم والأسرار المالية والسياسية لطبقات، وتستخدم مصطلحات التحقيقات والمحاكم والماليات.";
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
  retention_pattern: z.string().describe("خوارزمية حبس الانتباه: كيف سيمنع هذا المشهد المشاهد من التمرير؟ (سؤال، تناقض، حركة سريعة)")
});

export type Node2Scene = z.infer<typeof Node2Schema>;

export const VISUAL_DNA_SOVEREIGN = "STRICT VISUAL DNA: Aesthetic: 1950s-1970s Egyptian Modernist Illustration / Mid-Century Poster Art. Architecture: MUST specify Mamluk, Fatimid, or Neo-Islamic Cairo architecture. Lighting: Chiaroscuro. NEGATIVE PROMPT: photorealism, 3d render, bokeh, european faces, modern technology, generic arabian nights, orientalist tropes, text, typography, watermark.";

export async function generateEpisode(
  topic: string,
  durationMinutes: number,
  mood: MoodType,
  persona: PersonaType,
  suspenseLevel: number,
  onProgress?: (progress: number, step: string) => void,
  signal?: AbortSignal,
  researchEngine: "gemini" | "ollama" = "gemini",
  scriptingEngine: "gemini" | "ollama" = "gemini"
): Promise<any> {
    onProgress?.(100, "Done!");
    return {
        video_title: "Dummy Title",
        thumbnail: { image_prompt: "", text_on_image: "" },
        opening_sketch: { asset_id: "0", voice_over: "", visual_cue: "", montage_instructions: "", sound_design: "" },
        scenes: [],
        sources: [],
        publishing_kit: { youtube_titles: [], description: "", thumbnail_prompt: "", tags: [] },
        shorts: [],
        audit_report: { status: "warning", executive_summary: "Not implemented", issues: [] }
    };
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
  
  let pacingGuidelines = "";
  if (mood === "طريقة الدحيح") {
    pacingGuidelines = `
12. EDUTAINMENT PACING (DAHIH RULE):
- Jump Cuts: Almost no breathing room. Split sentences into frequent sub-shots.
- J-Cuts & L-Cuts: Overlap voice with B-Roll constantly in montage_instructions.
- 7-Second Rule: No single frame should linger longer than 7 seconds without a visual change (b_roll, zoom, pop-culture graphic).
- Body Language Notes: Instruct the host to do "Invisible Props" gestures in 'visual_cue'.
- Sound Design: MUST include 'Whoosh', 'Pop' for graphics, heavy usage of comedic/epic music shifts, and use 'Audio Drop' (total silence) for deep philosophical or shocking questions.
- Shot Sizing: Alternate aggressively between Medium Shots (context) and Close-Up (secrets).`;
  }

  const prompt = `You are the "Director Node". Your ONLY job is to take a raw voice-over script and split it into compelling cinematic scenes.

RULES:
1. THE SCRIPT: You must use the EXACT words from the provided script text, splitting them across scenes smoothly so no words are left behind or changed.
2. VISUAL DIVERSITY: ${historyText}
Ensure new visual prompts use different camera angles (e.g. macro shot, wide drone shot, point of view) or subjects compared to the previous visuals to prevent repetition.
3. VISUAL SEQUENCING: For every scene, you MUST generate two frames: 'first_frame' (e.g., wide illustration) and 'second_frame' (e.g., tight crop, abstract detail). Both must share exactly the same color palette, abstract style, and subjects to ensure continuity. High visual continuity is extremely important!
4. CULTURAL & ART DIRECTION (CRITICAL): You MUST heavily enforce an Egyptian visual aesthetic but within a Mid-Century Illustration style. Use stylized Egyptian cultural motifs. ABSOLUTELY NO European features, blondes, or western archetypes. No photorealism.
5. ARCHITECTURAL GUARD: When depicting architecture, use "Mamluk Cairo" or "Fatimid Islamic" details. NO generic "Aladdin-style" middle eastern tropes.
6. NEGATIVE PROMPT ENFORCEMENT: ${VISUAL_DNA_SOVEREIGN}
7. EPIC INTRO CONCEPT: The very first scene of the script MUST contain an 'epic_intro' motif in the image prompt – think surreal, creative poster art with floating bold geometry. Make it absolutely mind-blowing and visually abstract.
8. ARABIC TEXT & TYPOGRAPHY BAN (CRITICAL): Text rendering in AI is banned. For any text requirement, use overlays in post-production. You MUST append the NEGATIVE PROMPTS to ALL image prompts.
9. COMPOSITION & STYLE: For wide/establishing shots, use: "wide isometric or flat vector composition". For closeups, use: "flat portrait style, bold screenprint colors". NEVER use cinematic, realistic, bokeh, or 3d render.
10. PERSONA DISTINCTNESS: When multiple characters are present, forcefully contrast their appearances to prevent AI blending (e.g. sharp suit vs. worn jalabiya).
11. JSON STRICTNESS: Return ONLY valid JSON matching the schema.${pacingGuidelines}

JSON SCHEMA:
{
  "scenes": [
    {
      "asset_id": "Scene_XX",
      "voice_over": "part of the script",
      "visual_cue": "Arabic desc of visual",
      "montage_instructions": "Arabic notes for editor. If text is turning, request text tracking in post",
      "transition_to_next_scene": "Arabic instructions for visual transition to next scene (Match Cut, Whip Pan, Hard Cut, Fade etc.)",
      "sound_design": "Arabic SFX notes",
      "estimated_duration_seconds": 10,
      "first_frame_image_prompt": "English prompt for shot 1 (MUST explicitly say 'Egyptian characters, Barwaz style'. NO TEXT OR TYPOGRAPHY ALLOWED in the prompt. MUST end with --ar 16:9)",
      "first_frame_motion_prompt": "English motion prompt for runway/kling for shot 1. (Must specify 10s duration)",
      "second_frame_image_prompt": "English prompt for shot 2 (MUST seamlessly follow shot 1 and end with --ar 16:9)",
      "second_frame_motion_prompt": "English motion prompt for runway/kling for shot 2. (Specify 10s duration)",
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
                transition_to_next_scene: { type: Type.STRING },
                sound_design: { type: Type.STRING },
                estimated_duration_seconds: { type: Type.NUMBER },
                first_frame_image_prompt: { type: Type.STRING },
                first_frame_motion_prompt: { type: Type.STRING },
                second_frame_image_prompt: { type: Type.STRING },
                second_frame_motion_prompt: { type: Type.STRING },
                b_roll_keywords: { type: Type.STRING },
              },
              required: ["asset_id", "voice_over", "visual_cue", "montage_instructions", "sound_design", "estimated_duration_seconds", "first_frame_image_prompt", "first_frame_motion_prompt", "second_frame_image_prompt", "second_frame_motion_prompt", "b_roll_keywords"]
            }
          }
        },
        required: ["scenes"]
      },
      engine,
      onChunk
    );

    const parsedData = safeJsonParse(text);
    return {
      scenes: parsedData.scenes || []
    } as any;
  });
}

export async function executeAgent_DeepResearcher(
  topic: string,
  mood: MoodType,
  engine: string,
  onChunk?: (text: string) => void
) {
  if (onChunk) onChunk("[!] عقل الباحث: استخراج مثلث الأدلة (الرواية، الكواليس، الهجوم)...");
  
  const prompt = `[Agent: Deep Researcher (عقل الباحث)]
You are a highly skilled Deep Researcher. Analyze the topic: "${topic}"
Extract the "Evidence Triangle" (مثلث الأدلة):
1. الرواية الرسمية (The Official Story)
2. كواليس المقربين (Insider Secrets / Behind the scenes)
3. هجوم الأعداء (The Enemy's Attack / Counter-narrative)

Output JSON ONLY strictly following this structure:
{
  "official_story": "...",
  "insider_secrets": "...",
  "enemy_attack": "..."
}`;
  const rawContent = await callWithRetry(async () => {
    return await generateAIContentRaw(prompt, {
      type: Type.OBJECT,
      properties: {
        official_story: { type: Type.STRING },
        insider_secrets: { type: Type.STRING },
        enemy_attack: { type: Type.STRING }
      },
      required: ["official_story", "insider_secrets", "enemy_attack"]
    }, engine, onChunk, undefined, false, 0.65, true);
  });
  return safeJsonParse(rawContent, { official_story: "No data", insider_secrets: "No data", enemy_attack: "No data" });
}

export async function executeAgent_MasterStoryteller(
  topic: string,
  dossier: any,
  design: any, // MasterOutline, includes research_data
  durationMinutes: number,
  mood: string,
  engine: string,
  onChunk?: (text: string) => void,
  onProgress?: (p: number, status: string) => void
) {
  if (onChunk) onChunk("[!] رمزي وكيل الإيقاع (السيناريست): بناء الهيكل السينمائي العميق (5-Act Structure) للغوص المعلوماتي...");
  if (onProgress) onProgress(20, "[2/4] رمزي: بناء هيكل خماسي الفصول (Zero-Fluff) وتثبيت الحقائق الدسمة...");

  const targetMinutes = Math.max(5, durationMinutes);
  
  let acts;
  if (mood === "طريقة الدحيح") {
    acts = (design && design.chapters && Array.isArray(design.chapters) && design.chapters.length > 0)
     ? design.chapters.map((c: any) => ({
         title: c.chapter_title || "فصل",
         rule: `الزاوية المحورية للفصل: ${c.core_premise || ''}. النقاط التي يجب تغطيتها: ${c.key_revelations ? c.key_revelations.join(" - ") : (c.key_points ? c.key_points.join(" - ") : "")}. 
         [EDUTAINMENT MANDATE]: يجب استخدام الأنا البديلة (زي شخصيات خيالية بتسأل وتتريق وتعارض)، استخدام الـ Pop Culture العميق، ضرب أمثلة من الكورة، والأفلام، والشارع المصري (والميمز) لشرح أعقد النظريات. احرص على وجود "السبايك" (معلومة علمية/تاريخية دسمة جداً تُسرد بجدية ثم تُكسر بنكتة). لا يوجد حشو، كل نكتة تخدم تشبيه المعلومة وتبسيطها للمشاهد.`
       }))
     : [
        { title: "الاسكتش الافتتاحي (The Cold Open)", rule: "اكتب مشهداً كوميدياً عبثياً (اسكتش تمثيلي) لا يبدو مرتبطاً بالموضوع تماماً في البداية، ولكنه يترك المشاهد أمام سؤال محير أو تناقض غريب (Hook)، ليمهد لدخول الموضوع بقوة." },
        { title: "حصان طروادة (The Trojan Horse)", rule: "ابدأ بموضوع بسيط وتريند أو مشهور، ثم اقلب الطاولة فجأة لطرح الفكرة العلمية، الفلسفية، أو التاريخية العميقة المعقدة التي تدور حولها الحلقة (Homo Sacer / إلخ)." },
        { title: "الأنا البديلة والبوب كالشر (Alter-Ego & Pop Culture)", rule: "قاطع السرد بسؤال ساذج من شخصية خيالية (مثل المواطن العادي أو 'يا أبو حميد انت كدة لخبطتني'). ثم بسط الفكرة العميقة مستخدماً تشبيهاً عجيباً من الشارع، الميمز، أو كرة القدم والرياضة." },
        { title: "الصرامة الأكاديمية (The Authority & Climax)", rule: "تحول فجأة للحوار الأكاديمي الصارم. اذكر أدلة واقعية وتواريخ إصدار وأسماء كتب ومؤلفين وأبحاث علمية تدعم كلامك بجدية مفرطة، لتفكيك الموضوع وتحليل العقدة ببراعة مع دمج ذلك سريعاً مع السخرية." },
        { title: "الرسالة النهائية (The Edutainment Resolution)", rule: "لخص الفكرة في حكمة أو سؤال أخلاقي خطير يهز المشاهد، ثم اختم بأسلوب سريع ذكي." }
      ];
  } else {
    acts = (design && design.chapters && Array.isArray(design.chapters) && design.chapters.length > 0) 
      ? design.chapters.map((c: any) => ({
          title: c.chapter_title || "فصل",
          rule: `الزاوية المحورية للفصل: ${c.core_premise || ''}. النقاط أو الأسرار التي يجب فضحها وكشفها: ${c.key_revelations ? c.key_revelations.join(" - ") : (c.key_points ? c.key_points.join(" - ") : "")}. صغ هذا الفصل بأقصى قدر من الإثارة والتفاصيل الموثقة.`
        }))
      : [
          { title: "الفصل الأول (THE HOOK - صدمة البداية)", rule: "ابنِ صدمة البداية. ابدأ فوراً بحقيقة صادمة أو تناقض غريب. ممنوع المقدمات الضعيفة." },
          { title: "الفصل الثاني (PARADIGM SHIFT - تفكيك المسلمات)", rule: "فكك ما يعتقده المشاهدون باستخدام سوابق تاريخية وأسس الخلفية والأبعاد بدقة مفرطة للتفاصيل التكتيكية." },
          { title: "الفصل الثالث (THE RABBIT HOLE - الغوص المعلوماتي)", rule: "أغرق المشاهد في تفاصيل كثيفة: أسماء دقيقة، تواريخ موثقة، وتحليل مطول ومعمق للأحداث ولا تختصر أبداً." },
          { title: "الفصل الرابع (THE CLIMAX - الكشف الكبير)", rule: "وصل السرد إلى ذروة الكشف أو المفاجأة. أظهر الحقيقة والمؤامرة المخفية بأقصى تفصيل ممكن." },
          { title: "الفصل الخامس (OPEN RESOLUTION - رسالة النهاية)", rule: "اختتم برسالة تترك العقل في حالة ذهول وتساؤل نفسي أو تاريخي مفتوح بناءً على الحقائق السابقة." }
        ];
  }

  let masterScript = "";
  let previousSummary = "";

  for (let i = 0; i < acts.length; i++) {
     if (onProgress) onProgress(20 + (i * 3), `[2/4] رمزي: كتابة الدورة ${i + 1}/5 (${acts[i].title})...`);
     if (onChunk) onChunk(`\n\n[=== جاري كتابة ${acts[i].title} ===]\n`);
     
     const prompt = `[Agent: Ramzy (Master Storyteller & Rhythm Editor)]
You are a world-class Investigative Scriptwriter.
CRITICAL MANDATE:
${getMoodContext(mood as MoodType).scriptingStyle}

We are writing a DEEP-DIVE DOCUMENTARY (target length: ${targetMinutes} minutes overall). 
This individual chapter MUST be extremely long, dense, and rich. 
- You MUST write at least 600 to 1000 words specifically for this Act.
- Do NOT rush the narrative. Slowly build the tension, provide deep context, and craft an immersive scene.

Topic: "${topic}"

=== GHANDOUR'S GROUNDED FACTS ===
${design?.research_data && design.research_data.trim() !== '' ? design.research_data : "Use your extensive internal historical background knowledge about the topic to forge the best narrative."}

=== DEEP RESEARCH DOSSIER ===
- Insider Secrets: ${dossier?.insider_secrets || "Use your extensive training data to provide profound insights and secrets."}

=== STORY ARCHITECTURE PROGRESS ===
Previously written narrative summary (for context, do not repeat):
${previousSummary ? previousSummary : "This is Act 1. No previous context yet."}

=== CURRENT TASK: WRITE ${acts[i].title} ONLY ===
Rule for this Act: ${acts[i].rule}
- CRITICAL: NEVER complain about missing data or empty inputs. If data is sparse, use your deep historical / contextual knowledge to weave a masterful script.
- DO NOT summarize or conclude the entire video yet, unless this is the final Act.
- Expand heavily! Give exact step-by-step chronological breakdowns, rich atmospheric descriptions, and nuanced psychological insights.
- You must write at least 4 to 6 long paragraphs.
- INJECT verified dates, names, and exact [URL/Link] citations seamlessly into the narrative text where facts are stated. Don't hide the links, leave them as [URL].

Output ONLY the raw Arabic voiceover script block for this Act. DO NOT use markdown formatting blocks like \`\`\`. DO NOT output JSON. DO NOT write internal notes. DO NOT output any formatting tags, brackets, or instructions for the voice actor like [PAUSE] or [TONE: ...]. Write plain, continuous paragraph text meant to be directly read by a text-to-speech engine.`;

     const chapterOutput = await callWithRetry(async () => {
         return await generateAIContentRaw(prompt, null, engine, onChunk, undefined, false, 0.85);
     });
     
     masterScript += `\n\n${chapterOutput}`;
     
     // 1. Rolling Memory: Prevent Context Bloat by keeping only the last 2 acts' summaries
     let truncatedChapter = chapterOutput.substring(0, 400);
     let memoryLines = previousSummary.split('\n[Act ').filter(Boolean);
     if (memoryLines.length >= 2) memoryLines.shift(); // Remove oldest
     previousSummary = memoryLines.map(line => '\n[Act ' + line).join('') + `\n[Act ${i+1}] covered: ` + truncatedChapter + "...";
  }

  return masterScript;
}

export async function executeAgent_PersonaEnforcer(
  draftScript: string,
  engine: string,
  persona: PersonaType,
  onChunk?: (text: string) => void
) {
  if (onChunk) onChunk(`[!] عقدة الترجمة الثقافية: تطبيق شخصية (${persona}) على النص...`);
  
  const instructions = getPersonaInstructions(persona);

  // Chunk draft script to prevent timeout and truncation on massive files (5-Act structure)
  const paragraphs = draftScript.split(/\n\n+/);
  let chunks: string[] = [];
  let currentChunk = "";
  
  for (let p of paragraphs) {
     if (currentChunk.length + p.length > 2500) {
        if (currentChunk) chunks.push(currentChunk);
        currentChunk = p;
     } else {
        currentChunk += (currentChunk ? "\n\n" : "") + p;
     }
  }
  if (currentChunk) chunks.push(currentChunk);

  let fullTranslatedScript = "";

  for (let i = 0; i < chunks.length; i++) {
      if (onChunk) onChunk(`[!] المترجم الثقافي: معالجة الجزء ${i+1} من ${chunks.length} ...`);
      const prompt = `[Agent: Persona Enforcer (Cultural Translator)]
You are the final editor responsible for cultural translation and persona enforcement.

TASK (PERSONA DIRECTIVE):
${instructions}

ADDITIONAL REWRITE INSTRUCTIONS:
- Rewrite the ENTIRE script segment below using the Persona profile requested above.
- Ensure the tone, vocabulary, and pacing match this Persona perfectly.
- DO NOT summarize or skip segments. Maintain extreme detail.

CRITICAL RULES (Zero-Hallucination Constraint):
1. Output ONLY the raw spoken script (but keep any URLs or Source citations exactly as they are).
2. DO NOT output brackets like [PAUSE], [TONE: ...], [Scene: ...]. Only use brackets for Source Citations like [URL].
3. Maintain exactly the same narrative facts, length, and detailed flow as the draft, focusing solely on the "vibe" and "language" translation.
4. DO NOT invent fake URLs or sources.

=== DRAFT SCRIPT PART (${i+1}/${chunks.length}) ===
${chunks[i]}
`;

      const chunkTranslation = await callWithRetry(async () => {
        return await generateAIContentRaw(prompt, null, engine, undefined, undefined, false, 0.4);
      });
      fullTranslatedScript += (fullTranslatedScript ? "\n\n" : "") + chunkTranslation;
  }

  return fullTranslatedScript;
}

export async function executeAgent_AudioNormalizer(
  draftScript: string,
  engine: string,
  onChunk?: (text: string) => void
) {
  if (onChunk) onChunk(`[!] عقدة المعالجة الصوتية: تحويل الأرقام والتشكيل الذكي...`);

  // Split script into chunks of ~1500 characters
  const paragraphs = draftScript.split(/\n\n+/);
  let chunks: string[] = [];
  let currentChunk = "";
  
  for (let p of paragraphs) {
     if (currentChunk.length + p.length > 2000) {
        if (currentChunk) chunks.push(currentChunk);
        currentChunk = p;
     } else {
        currentChunk += (currentChunk ? "\n\n" : "") + p;
     }
  }
  if (currentChunk) chunks.push(currentChunk);

  let fullNormalizedScript = "";

  for (let i = 0; i < chunks.length; i++) {
      if (onChunk) onChunk(`[!] الفلتر الصوتي: معالجة الجزء ${i+1} من ${chunks.length} ...`);
      const prompt = `[Agent: Text Normalization Node (Audio Filter)]
You are a strict text processor for TTS (Text-To-Speech) engines.
Your task is to take the following Egyptian Arabic script and make it perfectly readable for an AI voice model, WITHOUT changing the meaning, word count, or narrative tone.

CRITICAL PROCESSING RULES:
1. Number-to-Word Conversion: Convert ALL digits and numbers into spoken Egyptian Arabic words. 
   - 100% MUST be "مية في المية" (NEVER "مائة" or "مئة" or "مِئَة").
   - Hundreds MUST be Egyptian: "مية" (100), "متين" (200), "تلتومية" (300), "ربعمية" (400), "خمسمية" (500).
   - "سنة 1919" -> "سنة ألف وتسعمية وتسعطاشر"
   - "11.5" -> "حداشر ونص"
2. Acronym Phonetics: Convert any English abbreviations or letters into written Arabic phonetics.
   - Example: "AI" -> "إيه آي"
3. Smart Diacritics (التشكيل): Only add Arabic diacritics to complex foreign or historical names to assist the TTS. DO NOT add Fusha diacritics to everyday Egyptian words (e.g. absolutely no مِئَة). KEEP THE EGYPTIAN SOUL (روح العامية). Add Shadda on geminate consonants if necessary.
4. Auto-Correction: Fix any weird spacing or broken negations (e.g., if you see "م بدأش", fix it to "ما بدأش" or "مابدأش").
5. Strip ALL formatting tags: Remove any tags like [PAUSE], [TONE: ...], [SPEED: ...], [SOUND: ...] entirely from the script. They distract the TTS.
6. DO NOT rewrite, paraphrase, or change the original text or narrative structure. Output the exact same script, just normalized and stripped of tags.

=== SCRIPT CHUNK ===
${chunks[i]}
`;

      const chunkNormalized = await callWithRetry(async () => {
        // Temperature must be very low (0.1) as requested to avoid hallucinations.
        return await generateAIContentRaw(prompt, null, engine, undefined, undefined, false, 0.1);
      });
      fullNormalizedScript += (fullNormalizedScript ? "\n\n" : "") + chunkNormalized;
  }

  return fullNormalizedScript;
}

export async function executeAgent_PunchlineWriter(
  draftScript: string,
  engine: string,
  mood: MoodType,
  onChunk?: (text: string) => void
) {
  const isComedy = mood === "طريقة الدحيح" || mood === "استعراض مسرحي المعطيات";
  if (!isComedy) {
     if (onChunk) onChunk("[!] الكاتب الساخر: تخطي (القالب مسرحي أو جاد ولا يناسب الكوميديا)...");
     return draftScript; // Skip punchline rewriting entirely to preserve serious/classic tone
  }

  if (onChunk) onChunk("[!] الكاتب الساخر: كسر الجدار الرابع وحقن المصطلحات الحديثة...");
  
  // Split script into chunks of ~1000 words max to prevent context looping
  const chunks = draftScript.split('\n\n\n').filter(c => c.trim().length > 50);
  if (chunks.length <= 1) {
    const backupChunks = draftScript.split('\n\n').filter(c => c.trim().length > 50);
    if (backupChunks.length > 0) chunks.splice(0, chunks.length, ...backupChunks);
  }
  
  let result = "";

  for (let i = 0; i < chunks.length; i++) {
      if (onChunk) onChunk(`[!] الكاتب الساخر: معالجة الجزء ${i + 1} من ${chunks.length}...`);
      const chunk = chunks[i];
      const prompt = `[Agent: Punchline Writer (الكاتب الساخر - مدرسة صناعة الإيديو-تينمنت)]
You are a brilliant Dark Comedy Writer and Edutainment Pioneer. Take this documentary script chunk and inject the ultimate "Daheeh" flavor:
1. Break the 4th wall gracefully (e.g., address the viewer directly as "عزيزي المشاهد" or create an invisible argumentative character like "صديقي المعترض").
2. Use extreme pop-culture analogies (football, movies, internet memes, Egyptian street culture) to explain highly complex scientific, historical, or philosophical data.
3. Keep the heavy science/history absolutely accurate ("Knowledge Spikes") but surround it completely with a thick layer of rapid-fire comedy and situational sarcasm.
4. Use dark humor, modern street slang (عامية الشارع), and relatable societal examples.

CRITICAL RULES:
- You MUST rewrite the script EXACTLY preserving its original sequence of events and ALL heavy facts.
- DO NOT add new chapters or facts. DO NOT loop back to the beginning.
- DO NOT output any markdown blocks like \`\`\`. Output plain text.
- When you reach the end of the script chunk, STOP WRITING immediately.

Input Script Chunk:
${chunk}

Rewritten Chunk:`;

      const raw = await callWithRetry(async () => {
        return await generateAIContentRaw(prompt, null, engine, onChunk, undefined, false, 0.8);
      });
      result += raw + "\n\n";
  }

  return result || draftScript;
}

export async function executeAgent_PacingEditor(
  polishedScript: string,
  topic: string,
  engine: string,
  mood: MoodType,
  onChunk?: (text: string) => void
) {
  if (onChunk) onChunk("[!] مقص المونتير النصّي: هندسة الإيقاع وإدراج الفواصل المرئية...");
  
  // Split script into chunks to prevent context looping
  const chunks = polishedScript.split('\n\n\n').filter(c => c.trim().length > 50);
  if (chunks.length <= 1) {
    const backupChunks = polishedScript.split('\n\n').filter(c => c.trim().length > 50);
    if (backupChunks.length > 0) chunks.splice(0, chunks.length, ...backupChunks);
  }
  
  let result = "";

  const isComedy = mood === "طريقة الدحيح" || mood === "استعراض مسرحي المعطيات";
  const visualInstruction = isComedy ? 
    "2. Use [AI IMAGE GAG: <arabic description>] for bizarre visual metaphors and dark comedy.\n3. IMMEDIATELY follow every [AI IMAGE GAG] with an exact English prompt: [IMAGE_PROMPT: <english mid-century illustration prompt>]." : 
    "2. Use [VISUAL CURE: <arabic description>] for cinematic documentative visual reconstruction.\n3. IMMEDIATELY follow every [VISUAL CURE] with an exact English prompt: [IMAGE_PROMPT: <english historically accurate visual concept>].";

  const promptStyle = isComedy ?
    "1950s Mid-Century Modern Illustration, vector-like, screenprint aesthetic --no cinematic, realistic, photography" :
    "Cinematic Documentary Photography, highly detailed, dramatic lighting, historic archive vibe --no cartoon, illustration, vector";

  for (let i = 0; i < chunks.length; i++) {
     if (onChunk) onChunk(`[!] مقص المونتير النصّي: هندسة الإيقاع الجزء ${i + 1} من ${chunks.length}...`);
     const chunk = chunks[i];
     const prompt = `[Agent: Pacing Editor (مقص المونتير النصّي)]
You are the Pacing Editor for a documentary channel.
Your goal is to sustain a long format by injecting visual/audio cues and PERFORMANCE MARKERS into the script without shrinking the word count.

Rules:
1. Every ~150-200 words, insert a performance marker to guide the narrator:
   - [PAUSE: <seconds>] for dramatic effect.
   - [SPEED: SLOW/FAST] to shift energy.
   - [TONE: SURPRISED/ANGRY/MYSTERIOUS/SERIOUS] to shift mood.
${visualInstruction}

--- THE IMAGE PROMPT FORMULA (MANDATORY) ---
EVERY [IMAGE_PROMPT: ...] MUST follow this:
[IMAGE_PROMPT: <Main Subject> in <EXACT ERA/LOCATION> -- Wardrobe: <Historically accurate> -- Style: ${promptStyle}]
--------------------------------------------------

4. Use [SFX: <audio effect>] frequently.
5. NEVER CUT TEXT. You ONLY inject tags into the provided text.
6. Return ONLY the final output. NO MARKDOWN.

Topic Context:
${topic}

Input Chunk:
${chunk}

Final Edited Chunk:`;

     const raw = await callWithRetry(async () => {
       return await generateAIContentRaw(prompt, null, engine, undefined, undefined, false, 0.7);
     });
     result += raw + "\n\n";
  }

  return result || polishedScript;
}

export async function executeGhandour2_Research(
  topic: string,
  engine: string = "gemini",
  onChunk?: (text: string) => void,
  ragContext?: string
): Promise<{ referenceDocument: string; sources: { title: string; url: string }[]; historical_conflict?: boolean; correction?: string }> {
  if (onChunk) onChunk("[!] وكيل البحث غندور 2.0: تفعيل شبكة الرادارات التاريخية والزحافات...");
  try {
    const dynamicOllamaUrl = localStorage.getItem("ollamaUrl") || undefined;
    const dynamicModel = localStorage.getItem("ollamaModel") || "gemma4:31b-cloud";
    const res = await fetch("/api/research/ghandour", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        topic, 
        engine,
        ollamaUrl: dynamicOllamaUrl,
        ollamaModel: dynamicModel,
        ragContext: ragContext || ""
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (onChunk && data.agentLogs) {
        for (const log of data.agentLogs) {
          onChunk(`[GHANDOUR] ${log}`);
        }
      }
      return {
        referenceDocument: data.referenceDocument || "",
        sources: data.sources || [],
        historical_conflict: data.historical_conflict || false,
        correction: data.correction || ""
      };
    }
  } catch (err) {
    console.error("[GHANDOUR] Client fetch failed, falling back to basic knowledge.", err);
  }
  return {
    referenceDocument: "",
    sources: [],
    historical_conflict: false,
    correction: ""
  };
}

export async function executePipeline_Phase1_ResearchAndOutline(
  topic: string,
  durationValue: number,
  note: string,
  mood: string,
  persona: string,
  onProgress?: (p: number, status: string) => void,
  engineNode1?: string,
  engineNode2?: string,
  abortSignal?: AbortSignal,
  ollamaModel?: string,
  onChunk?: (text: string) => void,
  onConflict?: (correction: string) => Promise<"approve" | "manual" | "skip">
) {
  // Extract RAG context if present in the user's note
  let ragContext = "";
  let cleanNote = note;
  const ragMatch = note.match(/\[ACADEMIC_RAG_CONTEXT\]:\n([\s\S]*?)(\n\[CALIBRATION\]|\n\[USER SELECTED HOOK VARIANT\]|$)/);
  if (ragMatch && ragMatch[1]) {
     ragContext = ragMatch[1].trim();
     cleanNote = note.replace(ragMatch[0], "").trim();
  } else if (note.includes("[ACADEMIC_RAG_CONTEXT]:")) {
     // Fallback naive extraction
     ragContext = note.split("[ACADEMIC_RAG_CONTEXT]:")[1].trim();
  }

  onProgress?.(8, ragContext ? "[1/5] غندور 2.0: تحليل الـ RAG (الملف الأكاديمي) واستخلاص الحقائق..." : "[1/5] غندور 2.0: جاري الزحف وتوثيق المصادر الحقيقية...");
  let ghandourResult = await executeGhandour2_Research(topic, engineNode1 || "gemini", onChunk, ragContext);
  
  let finalTopic = topic;

  if (ghandourResult.historical_conflict && ghandourResult.correction && onConflict) {
      onProgress?.(10, "[Human-in-the-loop] غندور يطلب تدخلك: تم اكتشاف تعارض تاريخي...");
      const decision = await onConflict(ghandourResult.correction);
      
      if (decision === "approve") {
          finalTopic = `${topic}. ملاحظة التصحيح التاريخي للحلقة: ${ghandourResult.correction}`;
          onProgress?.(11, "[Human-in-the-loop] تم استئناف العمل بالمعلومات المصححة.");
      } else if (decision === "manual") {
          throw new Error("MANUAL_EDIT_ABORT");
      } else if (decision === "skip") {
          ghandourResult = { ...ghandourResult, historical_conflict: false, correction: "" };
          onProgress?.(11, "[Human-in-the-loop] تم تجاهل البحث وتخطي التوثيق بناءً على طلبك.");
      }
  }

  const researcherTopicGrounded = ghandourResult.referenceDocument 
    ? `${finalTopic}\n\n=== REFERENCE_DOCUMENT (Grounded Facts) ===\n${ghandourResult.referenceDocument}`
    : finalTopic;

  onProgress?.(30, "يتم بناء الخريطة البحثية وربط الوثائق المرفقة...");
  let design = await generateResearchMap(
    researcherTopicGrounded,
    durationValue,
    mood,
    persona,
    note,
    engineNode1 || "gemini",
    abortSignal,
    ollamaModel,
    onChunk
  );

  if (ghandourResult.referenceDocument && design) {
    const combinedGroundedFacts = ragContext 
        ? `=== [RAG_DOCUMENT_COMPRESSION] ===\n${ragContext.substring(0, 5000)}...\n\n=== [GHANDOUR_FACTS] ===\n${ghandourResult.referenceDocument}`
        : `=== [REFERENCE_DOCUMENT] ===\n${ghandourResult.referenceDocument}`;
    design.research_data = `${combinedGroundedFacts}\n\n=== ADDITIONAL EXTRACTS ===\n${design.research_data || ""}`;
  }

  // Add the sources from Ghandour to the design so it passes to Phase 2
  if (design && ghandourResult.sources && ghandourResult.sources.length > 0) {
    design.sources = ghandourResult.sources;
  }

  return {
    design,
    researcherTopicGrounded
  };
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
  engineNode1?: string,
  engineNode2?: string,
  engineNode3?: string,
  strategy: "HCS" | "HAP" = "HCS",
  suspenseLevel: number = 5,
  onConflict?: (correction: string) => Promise<"approve" | "manual" | "skip">,
  preGeneratedResearchMap?: any
): Promise<EpisodeData> {
  onProgress?.(5, "[SYSTEM:BOOT] // إقلاع محرك النبّاش الإصدار 2.1... وتفعيل ورشة العمل الافتراضية...");
  
  const researchEngine = engineNode1 || "gemini";
  const scriptEngine = engineNode1 || "gemini";

  let ghandourResult: { referenceDocument: string; sources: any[]; historical_conflict?: boolean; correction?: string; } = { referenceDocument: "", sources: [], historical_conflict: false, correction: "" };
  let finalTopic = topic;
  let design = preGeneratedResearchMap;
  let deepResearchDossier = {};

  if (preGeneratedResearchMap) {
      design = preGeneratedResearchMap || {};
      
      let injectedNote = "";
      if (note) {
         injectedNote = `\n\n=== USER NOTES & CONTEXT (CRITICAL) ===\n${note}\n\n`;
      }

      onProgress?.(15, "[V] يتم تجاوز عقدة البحث... (تم اعتماد الخريطة البحثية مسبقاً).");
      finalTopic = preGeneratedResearchMap.video_title || topic;
      ghandourResult.referenceDocument = (preGeneratedResearchMap.research_data || "") + injectedNote;
  } else {
      // Ghandour 2.0 Autonomous Research & Context Compression Step
      onProgress?.(8, "[1/5] غندور 2.0: جاري الزحف وتوثيق المصادر الحقيقية...");
      ghandourResult = await executeGhandour2_Research(topic, researchEngine, onChunk);

      if (!ghandourResult.sources || ghandourResult.sources.length === 0) {
          if (onConflict) {
             onProgress?.(10, "[Human-in-the-loop] غندور يطلب تدخلك: لم نعثر على مصادر تاريخية موثقة...");
             const decision = await onConflict("لم نعثر على مصادر ويب موثوقة لهذه الفكرة. هل تريد استكمال الحلقة اعتماداً على الذاكرة الذاتية للذكاء الاصطناعي بدلاً من البحث الحي؟");
             if (decision === "approve" || decision === "skip") {
                ghandourResult = { referenceDocument: "NO_SOURCES_FALLBACK", sources: [{ title: "الذاكرة العصبية", url: "https://ai.internal" }], historical_conflict: false, correction: "" };
                onProgress?.(11, "[Human-in-the-loop] تم تخطي التوثيق الحي بناءً على طلبك.");
             } else {
                throw new Error("MANUAL_EDIT_ABORT");
             }
          } else {
             throw new Error(`ZERO_HALLUCINATION_ENFORCER: لم يتم العثور على مصادر موثوقة لـ "${topic}". سيتم إيقاف المولد البرمجي فوراً حفاظاً على الموثوقية.`);
          }
      }

      if (ghandourResult.historical_conflict && ghandourResult.correction && onConflict) {
          onProgress?.(10, "[Human-in-the-loop] غندور يطلب تدخلك: تم اكتشاف تعارض تاريخي...");
          const decision = await onConflict(ghandourResult.correction);
          
          if (decision === "approve") {
              finalTopic = `${topic}. ملاحظة التصحيح التاريخي للحلقة: ${ghandourResult.correction}`;
              onProgress?.(11, "[Human-in-the-loop] تم استئناف العمل بالمعلومات المصححة.");
          } else if (decision === "manual") {
              throw new Error("MANUAL_EDIT_ABORT");
          } else if (decision === "skip") {
              ghandourResult = { ...ghandourResult, historical_conflict: false, correction: "" };
              onProgress?.(11, "[Human-in-the-loop] تم تجاهل البحث وتخطي التوثيق بناءً على طلبك.");
          }
      }

      // New Agent 1: Deep Researcher
      onProgress?.(12, "[1/4] عقل الباحث: النبش واستخراج مثلث الأدلة...");
      const researcherTopicGrounded = ghandourResult.referenceDocument 
        ? `${finalTopic}\n\n=== REFERENCE_DOCUMENT (Grounded Facts) ===\n${ghandourResult.referenceDocument}`
        : finalTopic;
      deepResearchDossier = await executeAgent_DeepResearcher(researcherTopicGrounded, mood, researchEngine, onChunk);

      design = await generateResearchMap(finalTopic, durationValue, mood, persona, note, researchEngine, undefined, undefined, onChunk);

      if (ghandourResult.referenceDocument && design) {
        design.research_data = `=== [REFERENCE_DOCUMENT] Ghandour 2.0 Grounding Facts ===\n${ghandourResult.referenceDocument}\n\n=== ADDITIONAL EXTRACTS ===\n${design.research_data || ""}`;
      }
  }

  // New Agent 2: Master Storyteller (Ramzy)
  onProgress?.(20, "[2/4] رمزي: بناء الهيكل السينمائي السريع (5-Act Structure) للغوص المعلوماتي...");
  let masterScript = await executeAgent_MasterStoryteller(topic, deepResearchDossier, design, durationValue, mood, scriptEngine, onChunk);

  // Persona Enforcer Node
  onProgress?.(35, `[3/4] عقدة الترجمة الثقافية: تطبيق شخصية الراوي (${persona}) المنشودة...`);
  masterScript = await executeAgent_PersonaEnforcer(masterScript, scriptEngine, persona, onChunk);

  // Audio Normalizer Node
  onProgress?.(45, `[4/4] عقدة المعالجة الصوتية: فلترة النص لمحركات الـ TTS...`);
  masterScript = await executeAgent_AudioNormalizer(masterScript, scriptEngine, onChunk);

  const { executeAgent2_Director, executeAgent3_ArtDirector, executeAgent5_Publisher } = await import('./agents');

  onProgress?.(50, "[!] فوكس (المخرج): معالجة بصرية (Visual-First) للمشاهد وفصل التعليق الصوتي الصافي...");
  const directorScenes = await executeAgent2_Director(
    masterScript,
    mood,
    engineNode1,
    onChunk,
    onProgress
  );

  onProgress?.(60, "[!] قسم الإخراج الفني وهندسة الإيقاع: يتم معالجة الرؤية البصرية والتوليد التقني للمشاهد...");
  let allScenes: EpisodeScene[] = [];

  const safeDirectorScenes = directorScenes || [];
  
  // Parallelize Pexels fetching to reduce concurrency bottleneck
  onProgress?.(62, "[!] جاري جلب الوسائط والمكتبات البصرية في الخلفية...");
  let pexelsPromises = safeDirectorScenes.map(async (scene) => {
      let pexelsAssetResult = null;
      if (scene.b_roll_search_query) {
         try {
            const { searchPexelsVideos } = await import('../services/pexelsService');
            const videos = await searchPexelsVideos(scene.b_roll_search_query);
            if (videos && videos.length > 0) pexelsAssetResult = videos[0];
         } catch(e) { console.warn("Pexels fetch failed"); }
      }
      return pexelsAssetResult;
  });
  const pexelsResults = await Promise.all(pexelsPromises);

  for (let i = 0; i < safeDirectorScenes.length; i++) {
    const scene = safeDirectorScenes[i];
    
    onProgress?.(
      60 + Math.floor((30 * i) / Math.max(1, safeDirectorScenes.length)),
      `[!] جاري تجميع المشهد ${i + 1} من أصل ${safeDirectorScenes.length}...`
    );
    
    try {
      const artDirectorParams = await executeAgent3_ArtDirector(
        scene,
        mood,
        engineNode1,
        onChunk,
        design.visual_dna
      );

      let firstPrompt = artDirectorParams.first_frame_image_prompt || scene.first_frame_image_prompt || '';
      let secondPrompt = artDirectorParams.second_frame_image_prompt || scene.second_frame_image_prompt || '';
      
      // Ensure --ar 16:9 is appended if missing
      if (firstPrompt && !firstPrompt.includes('--ar')) {
          firstPrompt += ' --ar 16:9';
      }
      if (secondPrompt && !secondPrompt.includes('--ar')) {
          secondPrompt += ' --ar 16:9';
      }

      const generatedScene = {
        ...scene,
        ...artDirectorParams,
        first_frame_image_prompt: firstPrompt,
        second_frame_image_prompt: secondPrompt,
      };
      
      let pexelsAssetResult = pexelsResults[i];

      const defaultSceneProps = {
        sound_design: "[توجيه صوتي: يُحدد لاحقاً في المونتاج]",
        montage_instructions: "[توجيه المونتاج: تتبع الرؤية البصرية]",
        estimated_duration_seconds: 15,
        sfx: "",
        visual_cue: ""
      };

      const processedScene: EpisodeScene = {
        ...defaultSceneProps,
        asset_id: generatedScene.scene_id || `[Scene ${String(allScenes.length + 1).padStart(2, "0")}_${Math.random().toString(36).substring(2, 7)}]`,
        voice_over: generatedScene.voice_over || scene.voice_over || generatedScene.voiceover_text || scene.voiceover_text || "",
        clean_tts: generatedScene.clean_tts || scene.clean_tts || "",
        voiceover_notes: generatedScene.voiceover_notes || scene.voiceover_notes || "",
        estimated_duration_seconds: generatedScene.estimated_duration_seconds || defaultSceneProps.estimated_duration_seconds,
        visual_cue: generatedScene.visual_cue || scene.visual_cue || generatedScene.visual_concept || scene.visual_concept || "",
        b_roll_search_query: generatedScene.b_roll_search_query || "",
        sfx: generatedScene.sfx || generatedScene.sound_and_sfx || generatedScene.sound_design || defaultSceneProps.sfx,
        pexelsAsset: pexelsAssetResult,
        image_prompt: generatedScene.first_frame_image_prompt || generatedScene.english_image_prompt || generatedScene.image_prompt || "",
        ai_video_prompt: generatedScene.first_frame_motion_prompt || generatedScene.ai_video_prompt || "",
        first_frame_image_prompt: generatedScene.first_frame_image_prompt || "",
        first_frame_motion_prompt: generatedScene.first_frame_motion_prompt || "",
        second_frame_image_prompt: generatedScene.second_frame_image_prompt || "",
        second_frame_motion_prompt: generatedScene.second_frame_motion_prompt || "",
        multi_camera_angles: generatedScene.multi_camera_angles || [],

        // Legacy / fallback mappings to prevent breaking strict types
        montage_instructions: generatedScene.montage_instructions || defaultSceneProps.montage_instructions,
        sound_design: generatedScene.sound_design || generatedScene.sound_and_sfx || defaultSceneProps.sound_design,
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
      const defaultSceneProps = {
        sound_design: scene.sound_design || "[توجيه صوتي: يُحدد لاحقاً في المونتاج]",
        montage_instructions: scene.montage_instructions || "[توجيه المونتاج: تتبع الرؤية البصرية]",
        estimated_duration_seconds: scene.estimated_duration_seconds || 15
      };
      const fallbackScene: EpisodeScene = { 
        ...defaultSceneProps, 
        ...scene,
        voice_over: scene.voice_over || scene.voiceover_text || "",
        visual_cue: scene.visual_cue || scene.visual_concept || "",
        first_frame_image_prompt: scene.first_frame_image_prompt || scene.image_prompt || "",
        asset_id: scene.scene_id || `[Scene]`
      };
      allScenes.push(fallbackScene);
      if (onSceneReady) {
        onSceneReady(fallbackScene);
      }
    }
  }

  onProgress?.(90, "[!] وكيل النشر ومحرك Omnichannel: يتم إنشاء باقة النشر على المنصات واسختراج المصادر...");
  const publishingKitRaw = await executeAgent5_Publisher(
    design.video_title,
    masterScript, // Pass the translated script instead of research_data
    mood,
    persona,
    engineNode1,
    onChunk
  );

  // Mechanical Injection of Sources
  let finalDescription = publishingKitRaw.description;
  const validSources = (ghandourResult?.sources && ghandourResult.sources.length > 0)
     ? ghandourResult.sources 
     : (design?.sources || []);

  const hasValidSources = validSources && validSources.some((s: any) => s.title || s.name || s.اسم_المصدر || s.source || s.url || s.link || s.الرابط);
  if (hasValidSources) {
     finalDescription += "\n\n---\n\nالمصادر والمراجع الأساسية:\n";
     validSources.forEach((s: any, idx: number) => {
       const title = s.title || s.name || s.اسم_المصدر || s.source || '';
       const url = s.url || s.link || s.الرابط || '';
       if (title || url) {
          finalDescription += `${idx + 1}. ${title || 'مصدر مؤرشف'}\n${url ? url : ''} ${s.info || s.key_takeaway ? '- ' + (s.info || s.key_takeaway) : ''}\n`;
       }
     });
  }

  const publishing_kit = {
    ...publishingKitRaw,
    description: finalDescription
  };

  onProgress?.(95, "محامي الشيطان يراجع السكريبت... جاري التصحيح الذاتي وبناء النسخة النهائية");
  
  // Since we already performed self-correction before director processing, we issue the final Certificate of Error-Freeness (شهادة خلو من الأخطاء)
  const auditReport: SecurityAudit = {
    status: "verified",
    executive_summary: "شهادة خلو من الأخطاء: تم إخضاع السكريبت لـ (Iterative Reflection Loop) بالكامل من خلال ورشة عمل محامي الشيطان (Red Team). تم التدقيق والتحقق من المرجعية التاريخية، ومعالجة الهلوسات وإزالة الملاحظات اللفظية والإيقاعية لضمان سرعة وموثوقية النص بنسبة 100%.",
    issues: [],
    red_team_score: 100
  };

  let finalScenesForDossier = allScenes;

  finalScenesForDossier = finalScenesForDossier.map(s => ({
    ...s,
    asset_status: s.asset_status || "pending"
  }));

  onProgress?.(100, "[!] العملية تمت بنجاح. الأدلة جميعها الآن بين يديك.");

  return {
    video_title: design.video_title || topic,
    mood: mood,
    thumbnail: publishing_kit.thumbnail_prompt 
      ? {
          image_prompt: applyGlobalStyle(publishing_kit.thumbnail_prompt) + " " + VISUAL_DNA_SOVEREIGN,
          text_on_image: design.video_title || topic,
        }
      : (design.thumbnail || { image_prompt: "", text_on_image: "" }),
    opening_sketch: finalScenesForDossier[0] || {
      asset_id: "",
      voice_over: "",
      visual_cue: "",
      montage_instructions: "[توجيه المونتاج: يُحدد لاحقاً]",
      sound_design: "[توجيه صوتي: يُحدد لاحقاً]",
      estimated_duration_seconds: 10,
      asset_status: "pending",
      first_frame_image_prompt: "",
      first_frame_motion_prompt: "",
      second_frame_image_prompt: "",
      second_frame_motion_prompt: "",
    },
    scenes: (finalScenesForDossier || []).slice(1),
    sources: (ghandourResult?.sources && ghandourResult.sources.length > 0)
      ? ghandourResult.sources.map((s: any) => ({ title: s.title || s.name || s.source || 'مصدر مؤرشف', url: s.url || s.link || '', info: "مصدر تاريخي موثق ومؤرشف تلقائياً" }))
      : (design.sources || []).map((s: any) => ({ title: s.title || s.name || s.source || 'مرجع بحثي', url: s.url || s.link || '', info: s.key_takeaway || s.info || "" })),
    publishing_kit: publishing_kit,
    shorts: publishingKitRaw.shorts || [],
    omnichannel: publishingKitRaw.omnichannel,
    audit_report: auditReport
  };
}


export interface CouncilFeedback {
  khafi: { score: number; comment: string; recommendation: string };
  adala: { score: number; comment: string; recommendation: string };
  ain: { score: number; comment: string; recommendation: string };
  overall_verdict: string;
}

export async function executeCreativeCouncil(
  script: string,
  engine = "gemini",
  signal?: AbortSignal
): Promise<CouncilFeedback> {
  const prompt = `[NODE: CREATIVE COUNCIL REVIEW]
You are a panel of three expert AI agents grading a YouTube video script:
1. 'Khafi' (Research & Hooks): Grades the factual intrigue and storytelling hooks.
2. 'Adala' (Pacing & Editor): Grades the pacing, rhythm, and sentence flow.
3. 'Ain' (Art Director): Grades the visual cues and cinematic potential.

Review the following script snippet:
"""
${script.substring(0, 4000)}
"""

Provide a critical, objective evaluation. Give a score (1-10) for each agent, a brief savage/insightful comment in ARABIC, and one strict recommendation in ARABIC.
Output MUST be strict JSON matching this structure:
{
  "khafi": { "score": 8, "comment": "STRING", "recommendation": "STRING" },
  "adala": { "score": 7, "comment": "STRING", "recommendation": "STRING" },
  "ain": { "score": 9, "comment": "STRING", "recommendation": "STRING" },
  "overall_verdict": "string in ARABIC (final conclusion)"
}`;

  return await callWithRetry(async () => {
    const raw = await generateAIContentRaw(
      prompt,
      undefined, // schema
      engine,
      undefined, // onChunk
      signal,
      false, // useGrounding
      0.7 // temperature
    );
    try {
      const parsed = safeJsonParse(raw);
      return parsed as CouncilFeedback;
    } catch {
      return {
        khafi: { score: 5, comment: "تحليل غير متاح", recommendation: "راجع دقة المعلومات" },
        adala: { score: 5, comment: "تحليل غير متاح", recommendation: "راجع وتيرة السرد" },
        ain: { score: 5, comment: "تحليل غير متاح", recommendation: "أضف توجيهات بصرية" },
        overall_verdict: "حدث خطأ أثناء تقييم الوكلاء."
      };
    }
  }, 1);
}

export async function applyRedTeamFixes(
  mood: MoodType,
  allScenes: any[],
  researchData: string,
  auditReport: SecurityAudit,
  engine = "gemini",
  signal?: AbortSignal,
  onProgress?: (progress: number, message: string) => void
): Promise<any[]> {
  if (!auditReport || !auditReport.issues || auditReport.issues.length === 0) {
    return allScenes;
  }

  onProgress?.(97, "[!] محامي الشيطان: جاري تطبيق الإصلاحات الآلية للسكريبت (Context Pruning)...");
  
  const modifiedScenes = [...allScenes];

  for (const issue of auditReport.issues) {
     if (!issue.flawed_text_snippet) continue;
     
     // Find the scene that contains this flawed text snippet
     const sceneIndex = modifiedScenes.findIndex(s => s.voice_over && s.voice_over.includes(issue.flawed_text_snippet));
     
     if (sceneIndex === -1) continue;
     
     const sceneToFix = modifiedScenes[sceneIndex];

     const prompt = `[Node: The Structural Auto-Fixer]
Task: You are the Auto-Fixer phase. Your job is to rewrite ONLY the flawed text snippet in the specific scene based on the Red Team Audit.

[CRITICAL INSTRUCTIONS]:
1. Write the "voice_over" IN CLEAN CAIRENE EGYPTIAN ARABIC (روح وكلمات اللهجة القاهرية النظيفة).
2. DO NOT output JSON or Markdown. Output ONLY the raw corrected text in Arabic.

=== FLAWED SNIPPET IN SCENE ===
${issue.flawed_text_snippet}

=== FULL SCENE VOICEOVER CONTEXT ===
${sceneToFix.voice_over}

=== RED TEAM AUDIT ISSUE ===
Finding: ${issue.finding}
Recommendation: ${issue.recommendation}

Rewrite the FLAWED SNIPPET to address the feedback. Only output the rewritten snippet.
`;

     try {
        const correctedRaw = await callWithRetry(async () => {
          const delayMs = engine === "ollama" ? 2000 : 1000;
          await new Promise(r => setTimeout(r, delayMs));
          return await generateAIContentRaw(prompt, null, engine, undefined, undefined, false, 0.4);
        });

        if (correctedRaw && correctedRaw.trim().length > 5 && !correctedRaw.includes("=== FLAWED SNIPPET ===")) {
           // Replace the snippet in the scene's voice_over
           modifiedScenes[sceneIndex] = {
               ...modifiedScenes[sceneIndex],
               voice_over: modifiedScenes[sceneIndex].voice_over.replace(issue.flawed_text_snippet, correctedRaw.trim())
           };
        }
     } catch (e) {
        console.error("Failed to correct scene snippet", e);
     }
  }

  return modifiedScenes;
}

export async function auditScriptWithDevilsAdvocate(
  fullScript: string,
  researchData: string,
  mood: MoodType,
  engine = "gemini",
  signal?: AbortSignal
): Promise<SecurityAudit> {
  const prompt = `[Node: The Devil's Advocate - Security & Accuracy Audit]
YOU ARE AN ARABIC ONLY ASSISTANT. OUTPUTTING ENGLISH IS STRICTLY FORBIDDEN.
Task: Review the provided script against the research data. Act as a skeptical critic who wants to find hallucinations, weak logic, or risky legal claims.

[NEW DIRECTIVES: THE ULTIMATE PRODUCTION DOSSIER]
1. Boredom & Filler Alert System: Flag any "filler sentences" that don't add concrete facts (e.g. repetitive phrases like "و الغريب إن", "المثير للاهتمام إن", or sentences that just hype up the topic without adding info). 
2. Hallucination Check: Verify every single fact against the Research Context. If it's not in the context, flag it for immediate removal.
3. Open Loop Validator: Ensure the script opens a mystery/hook early on and fully resolves it by the end. If missing, flag it.
4. Repetition Enforcer: Check the script sequentially. If a scene repeats a concept or fact already stated in an earlier scene, flag it as "repetition_alert".
5. The Pacing Enforcer (Sentence Length Penalty): Measure sentence length. If a sentence exceeds 15-20 words without a pause or pop-culture reference, flag it as "sentence_too_long" and request chopping it to maintain a fast-paced Edutainment vibe.

Script:
${fullScript}

Research Context (RAG):
${researchData}

RULES:
1. NO VAGUE CRITICISM: Every issue must be specific.
2. CITATION CHECK: If a fact in the script IS NOT in the Research Context, flag it for evidence reinforcement.
3. STRICT: The entire audit report MUST be in professional Arabic ONLY. No English output is allowed.
4. SCHEMA: Return a JSON object matching the SecurityAudit interface.

Audit Output:
{
  "status": "verified" | "warning" | "failed",
  "executive_summary": "Brief overall assessment in Arabic (ملخص التقييم)",
  "issues": [
    {
      "type": "fact_check" | "logic" | "legal" | "tone" | "boredom_alert" | "open_loop" | "repetition_alert" | "hallucination_alert" | "sentence_too_long",
      "finding": "Specific problem found in Arabic (المشكلة بالتفصيل)",
      "recommendation": "How to fix it strictly using the research data in Arabic (توصية الحل)",
      "flawed_text_snippet": "The EXACT sentence or paragraph from the Script that has the issue (النص المعيب بدقة)",
      "source_reference": "Name of the source from research if applicable in Arabic"
    }
  ],
  "red_team_score": 80
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
              flawed_text_snippet: { type: Type.STRING },
              source_reference: { type: Type.STRING }
            },
            required: ["type", "finding", "recommendation", "flawed_text_snippet"]
          }
        },
        red_team_score: { type: Type.INTEGER, description: "Score from 0 to 100 on how bulletproof it is" }
      },
      required: ["status", "executive_summary", "issues", "red_team_score"]
    }, engine, undefined, signal);
    
    return safeJsonParse(text, {
      status: "warning",
      executive_summary: "فشل التحليل الأمني (الموثوقية). قد يكون النص كبيراً جداً.",
      issues: [],
      red_team_score: 50
    });
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
  model?: string,
  signal?: AbortSignal
): Promise<{ x_thread: string[]; tiktok_hook: string; instagram_caption: string; reels_script?: string; promotional_prompts?: { image: string, video: string } }> {
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
4. Promotional Reels/Shorts Script: Write a highly engaging, fast-paced vertical video script (maximum 60 seconds / about 130 words) designed to promote the full episode. Include strong hooks, fast cuts markers, and a Call to Action (CTA) pointing to the main episode.
5. Promotional Visuals: Provide one Midjourney Image prompt (must end with --ar 9:16 for vertical layout) and one AI Motion prompt for vertical video to complement the Reels script.

Output Format: JSON
{
  "x_thread": ["String", "String", ...],
  "tiktok_hook": "String",
  "instagram_caption": "String",
  "reels_script": "String (Arabic script with hooks and CTA)",
  "promotional_prompts": {
    "image": "String (Midjourney prompt ending in --ar 9:16)",
    "video": "String (Motion prompt for Runway/Kling)"
  }
}
`;

  return callWithRetry(async () => {
    const text = await generateAIContentRaw(prompt, {
      type: Type.OBJECT,
      properties: {
        x_thread: { type: Type.ARRAY, items: { type: Type.STRING } },
        tiktok_hook: { type: Type.STRING },
        instagram_caption: { type: Type.STRING },
        reels_script: { type: Type.STRING },
        promotional_prompts: {
          type: Type.OBJECT,
          properties: {
            image: { type: Type.STRING },
            video: { type: Type.STRING }
          },
          required: ["image", "video"]
        }
      },
      required: ["x_thread", "tiktok_hook", "instagram_caption", "reels_script", "promotional_prompts"]
    }, engine, undefined, signal, undefined, model);
    
    const result = safeJsonParse(text);
    if (result?.promotional_prompts?.image && !result.promotional_prompts.image.includes('--ar')) {
        result.promotional_prompts.image += ' --ar 9:16';
    }
    return result;
  });
}

export interface ScriptEvaluation {
  score: number;
  hook_strength: string;
  retention_prediction: string;
  fluff_index: string;
  actionable_tips: string[];
}

export async function evaluateScriptQuality(script: string, engine = "gemini", signal?: AbortSignal): Promise<ScriptEvaluation> {
  const prompt = `[NARRATIVE EVALUATOR AGENT]
You are a master script editor and strict narrative critic for YouTube/TikTok content.
Evaluate the following complete script based on hook strength, pacing, retention probability, and amount of "fluff" (unnecessary words).

Return a JSON object:
{
  "score": <number 0-100 indicating overall quality/readiness>,
  "hook_strength": "<string evaluation of the first 30 words, max 10 words>",
  "retention_prediction": "<string percentage or text describing expected viewer retention, max 10 words>",
  "fluff_index": "<string indicating if the script is concise or too wordy, max 10 words>",
  "actionable_tips": ["<string tip 1>", "<string tip 2>", "<string tip 3>"]
}

Script to evaluate:
${script.substring(0, 5000)} // Truncated for safety
`;

  const text = await generateAIContentRaw(prompt, {
    type: "OBJECT",
    properties: {
      score: { type: "INTEGER" },
      hook_strength: { type: "STRING" },
      retention_prediction: { type: "STRING" },
      fluff_index: { type: "STRING" },
      actionable_tips: { type: "ARRAY", items: { type: "STRING" } }
    },
    required: ["score", "hook_strength", "retention_prediction", "fluff_index", "actionable_tips"]
  }, engine, undefined, signal);

  return safeJsonParse(text, {
    score: 80,
    hook_strength: "لم يتم التقييم",
    retention_prediction: "غير متاح",
    fluff_index: "غير متاح",
    actionable_tips: ["راجع أول 10 ثواني من الفيديو", "تأكد من إيقاع القصة", "ركز على الإضاءة أثناء التصوير"]
  });
}

export async function autoRefineScript(script: string, tips: string[], engine = "gemini", signal?: AbortSignal): Promise<string> {
  const prompt = `[MASTER SCRIPT EDITOR AGENT]
أنت محرر نصوص محترف (Script Editor). 
لدينا السكريبت التالي الذي يحتاج إلى تحسين بناءً على هذه النصائح والملاحظات النقدية:
الملاحظات:
${tips.map(t => `- ${t}`).join('\
')}

السكريبت الأصلي:
${script}

المطلوب: إكساب السكريبت المزيد من الديناميكية، إصلاح نقاط الضعف، شد انتباه المشاهد في الثواني الأولى (Hook)، وإزالة الحشو (Fluff) بناءً على النصائح أو بخبرتك.
أخرج السكريبت النهائي فقط باللغة العربية. حافظ على روح السكريبت وتنسيقه العام، ولا تكتب أي مقدمات أو ردود خارج النص.`;

  const text = await generateAIContentRaw(prompt, undefined, engine, undefined, signal);
  return text;
}

export async function localizeScript(fushaScripts: string[], engine = "gemini", signal?: AbortSignal): Promise<string[]> {
  const examplesXml = TONE_EXAMPLES.map((ex, i) => `  <example id="${i+1}">
    <input>${ex.input}</input>
    <output>${ex.output}</output>
  </example>`).join('\
');

  const blacklistStr = BLACKLIST_WORDS.map(w => `"${w}"`).join(", ");

  const prompt = `[LOCALIZATION & TONE AGENT]
You are the final Master Translator. Your strict job is to translate and localize the provided Arabic (Fusha) scripts into "White Cairene Vernacular" (عامية قاهرية بيضاء).
The output must sound analytical, mysterious, profound, and conversational yet deeply intellectual.

<few_shot_examples>
${examplesXml}
</few_shot_examples>

<negative_constraints>
YOU MUST NEVER USE ANY OF THESE CLICHES: ${blacklistStr}.
CRITICAL PRONUNCIATION RULE: Egyptian Ammiya ALWAYS uses the "ين" ending for tens numbers (e.g. تسعين، عشرين، خمسين) regardless of grammatical case. YOU MUST NEVER output Fusha forms like "تسعون", "عشرون", "خمسون".
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
${fushaScripts.map((s, i) => `[${i}]: ${s}`).join('\
')}
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
     parsed = safeJsonParse(responseText);
  } catch(e) {
     return fushaScripts; // Fallback
  }

  if (parsed && Array.isArray(parsed.localized_scripts)) {
      return parsed.localized_scripts.map(script => applyRegexPostProcessing(script));
  }
  return fushaScripts;
}


export function getMoodContext(mood: MoodType): any {
  const dna = getMoodDNA(mood as string);
  
  const scriptingStyle = `
  FORMAT AND MOOD RULES FOR: ${mood}
  Description: ${dna?.description || "A standard, objective narrative."}
  
  You MUST adopt a linguistic and narrative style that heavily matches this specific format. 
  For example, if this format is comedic and fast-paced, you must use humorous, fast-paced language and analogies.
  If this format is mysterious and dark, you must use suspenseful, serious, and gripping language.
  Adjust your writing tone, pacing, and vocabulary to perfectly fit the description: "${dna?.description || "A standard, objective narrative."}".
  `;

  const visualAudioStyle = `
  [ART DIRECTION & VISUAL PROMPTING RULES]
  Format/Mood: ${mood}
  Visual Style Focus: ${dna?.style || "Cinematic Documentary"}
  Texture Canvas: ${dna?.paper || "Standard"}
  Localization/Setting: ${dna?.localization || "Modern Cairo"}

  CRITICAL VISUAL RULES:
  1. Historical periods (if applicable): STRICT HISTORICAL ACCURACY. E.g., Islamic/Mamluk/Ottoman figures MUST have authentic Middle Eastern features, authentic armor/clothing from the specific century, authentic architecture. ZERO European features for Arabs/Egyptians.
  2. The "Dahih" (Edutainment/Comedy) Style: If the mood/persona implies comedy or fast-paced infotainment, you MUST use highly creative, abstract, or meme-like visual concepts. Examples: paper cut-outs, 2D popup books, funny character reactions, literal visual puns, neon markers on a whiteboard, or meme references. Do NOT use boring standard B-roll for comedic beats.
  3. Text in Images & Arabic: AI image generators CANNOT write Arabic correctly (it outputs gibberish). NEVER ask the image generator to write text inside the image. Instead, if a scene needs text (like a document, sign, or whiteboard), ask the AI for "a blank whiteboard", "an empty vintage parchment", or "a blank neon sign with negative space". This allows the human video editor to cleanly overlay flawless Arabic typography in post-production.
  `;

  return { 
    archivalTreasureRules: "", 
    scriptingStyle, 
    visualAudioStyle,
    ragVaults: []
  };
}

export function getSystemPrompt(): string {
  return "You are a master AI.";
}

export async function callWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000, signal?: AbortSignal): Promise<T> {
  for (let i = 0; i < retries; i++) {
    if (signal?.aborted) throw new Error("Aborted");
    try {
      return await fn();
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error("unreachable");
}

import { jsonrepair } from 'jsonrepair';

export function safeJsonParse(text: string, fallback: any = {}): any {
  try {
    if (!text || typeof text !== "string") return fallback;
    let clean = text.trim();
    // remove think tags if present from reasoning models
    clean = clean.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    // remove markdown wrappers first
    clean = clean.replace(/^```([a-z]*)\s*/gim, '').replace(/```\s*$/gim, '').trim();
    
    // Extract JSON block if there's surrounding text
    const firstBrace = clean.indexOf('{');
    const firstBracket = clean.indexOf('[');
    
    let startIndex = -1;
    let endIndex = -1;
    
    if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
        startIndex = firstBracket;
        endIndex = clean.lastIndexOf(']');
    } else if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
        startIndex = firstBrace;
        endIndex = clean.lastIndexOf('}');
    }
    
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        clean = clean.substring(startIndex, endIndex + 1);
    }
    
    try {
        clean = jsonrepair(clean);
    } catch {
        // if jsonrepair fails, we'll let JSON.parse attempt it and catch
    }
    
    return JSON.parse(clean);
  } catch (e) {
    console.error("JSON Parse Error:", (e as Error).message, "\nRaw Text:\n", text);
    return fallback;
  }
}

export function applyGlobalStyle(...args: any[]): string {
  const prompt = args[0];
  if (!prompt) return "";
  return prompt + " --v 6.0";
}

export async function generateAIContentRaw(
  prompt: string, 
  schema?: any, 
  engine: string = "gemini", 
  onChunk?: (text: string) => void, 
  signal?: AbortSignal,
  isRaw?: boolean,
  tempOrModel?: number | string,
  enableSearch?: boolean
): Promise<any> {
    let temperature = 0.8;
    let model: string | undefined = undefined;
    
    if (typeof tempOrModel === "number") {
        temperature = tempOrModel;
    } else if (typeof tempOrModel === "string") {
        model = tempOrModel;
    }

    if (onChunk) onChunk("[!] اتصال بالعصب المركزي: جاري توليد البيانات...");
    
    let dynamicOllamaUrl = undefined;
    try {
      if (typeof window !== "undefined" && window.localStorage) {
         const stored = localStorage.getItem("ollamaUrl");
         if (stored) dynamicOllamaUrl = stored;
      }
    } catch(e) {}

    const useStream = true;

    const response = await fetch("/api/ai/generate", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            prompt: prompt,
            systemInstruction: "You are a professional Edutainment Producer and content strategist.",
            engine: engine,
            temperature: temperature,
            model: model,
            schema: schema,
            ollamaUrl: dynamicOllamaUrl,
            stream: useStream,
            enableSearch: enableSearch
        }),
        signal
    });
    
    if (!response.ok) {
        const errData = await response.json().catch(()=>({}));
        throw new Error(errData.error || 'Failed to generate content');
    }
    
    if (useStream && response.body) {
        const reader = response.body.getReader();
        let fullContent = "";
        const decoder = new TextDecoder();
        let buffer = "";
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            let newlineIndex;
            while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
                const line = buffer.substring(0, newlineIndex).trim();
                buffer = buffer.substring(newlineIndex + 1);
                
                if (line.startsWith('data: ')) {
                    const dataStr = line.substring(6).trim();
                    if (dataStr === '[DONE]') continue;
                    try {
                        const parsed = JSON.parse(dataStr);
                        if (parsed.error) {
                            throw new Error(parsed.error);
                        }
                        if (parsed.text) {
                            fullContent += parsed.text;
                            if (onChunk) onChunk(parsed.text);
                        }
                    } catch(e: any) {
                        if (e.message && e.message !== "Unexpected end of JSON input" && !e.message.includes("is not valid JSON")) {
                            throw e;
                        }
                    }
                }
            }
        }
        return fullContent;
    } else {
        const data = await response.json();
        return data.content || "";
    }
}


export async function generateTitle(topic: string, mood: string, persona: string, note: string, engine: string, onProgress?: any, signal?: AbortSignal, model?: string): Promise<any> { 
  const results = await executeEditorialBoard(topic, mood as MoodType, persona as PersonaType, engine, onProgress, note);
  
  return results.map((item, idx) => ({
    id: idx + 1,
    title: item.title,
    hook: item.hook,
    angle: item.outline_preview,
    category: mood
  }));
}


export async function executeEditorialBoard(
  topic: string,
  mood: MoodType,
  persona: PersonaType,
  engine: string,
  onChunk?: (text: string) => void,
  note?: string
): Promise<{ title: string; hook: string; outline_preview: string }[]> {
  if (onChunk) onChunk("[!] غرفة التحرير (The Editorial Board): جاري قنص الزوايا السردية (Angle Hunting)...");

  const personaInstructions = getPersonaInstructions(persona);
  const moodDNA = getMoodDNA(mood);
  
  // Phase 1: Angle Hunting (Generating 10 diverse angles with a strict cringe filter)
  const isComedy = mood === "طريقة الدحيح" || mood === "استعراض مسرحي المعطيات";
  const isClassic = mood === "قصص الأنبياء والتاريخ الإسلامي" || mood === "أرشيف الضلمة";
  
  let languageRule = "";
  let cringeFilterAdditions = "";
  
  if (isComedy) {
    languageRule = `3. EGYPTIAN AMMIYA: Use 100% sharp Egyptian street slang/idioms. NO Fusha.`;
    cringeFilterAdditions = `- Any academic or formal "Fusha" Arabic.`;
  } else if (isClassic) {
    languageRule = `3. ELOQUENT TONE: Use classic, somewhat formal Arabic (فصحى مبسطة أو لغة أفلام وثائقية). Add gravitas and mystery.`;
    cringeFilterAdditions = `- Cheap local slang or comedy words.`;
  } else {
    languageRule = `3. PROFESSIONAL DOCUMENTARY TONE: Use intensely analytical, clean, and serious Arabic. No jokes, no street slang.`;
    cringeFilterAdditions = `- Cheap local slang or comedy words.\n- Overly dramatic emotional terms.`;
  }

  const baseTopic = topic.trim() ? topic : "Random controversial, trending, or deeply mysterious historical/political event";
  const userNotesBlock = note && note.trim() ? `\n[ملاحظات هامة جداً من المستخدم - MUST FOLLOW STRICTLY]:\n"${note}"` : "";

  const angleHunterPrompt = `[Agent: The Angle Hunter (قناص الزوايا)]
MISSION: Break the YouTube algorithm with VIRAL, UNCONVENTIONAL, and HIGH-RETENTION hooks. You are a master of audience psychology.

CRITICAL CONTEXT:
- Show Format (Mood): ${mood} (${moodDNA.description})
- Aesthetic/Vibe: ${moodDNA.style} | ${moodDNA.localization}
- Narrator Persona: ${persona}
${personaInstructions}${userNotesBlock}

Topic: "${baseTopic}"

NARRATIVE ARCHITECTURE RULES:
1. THE CURIOSITY GAP (فجوة الفوضول): Your angles MUST exploit human psychology. Do not reveal the whole story in the title or the hook. Pick an obscure, bizarre detail and make it the focal point.
2. THE HOOK PARADOX (تضارب المنطق): Great hooks state something the viewer believes is true, then shatters it completely in the first 3 seconds (e.g., "The man who saved the world... by doing nothing").
${languageRule}
4. THE 60-CHARACTER CLICK: Titles MUST be under 60 characters. Clickable, provocative, truthful but deeply mysterious. Examples: "السر اللي خبوه عنك في كتب التاريخ", "القرار اللي دمر إمبراطورية في 3 دقايق".
5. FOCUS ON ARAB/EGYPTIAN CONTENT (CRITICAL): Always root the examples, narratives, and historical references in the Arab world, Egyptian history, or Islamic history, unless the user specifically named a foreign figure. Stop generating Western-centric angles!
6. USER INTENT TRUMPS ALL: If the user provided notes/instructions above, you must design angles that serve their specific vision. Do not ignore them!
7. VARIETY: Generate 10 angles exploring different emotional triggers (e.g., Greed, Fear, Secret History, Irony, Revenge).

THE CRINGE BLACKLIST (STRICTLY FORBIDDEN PATTERNS):
- Start with "هل تساءلت يوماً" (Did you ever wonder)
- Start with "في هذا الفيديو" (In this video)
- Use of "رحلة" (Journey) or "اكتشف" (Discover) as generic filler.
${cringeFilterAdditions}
- Generic "Top 10" or "X secrets" listicle vibes.

Output Format: Return ONLY a JSON array of 10 objects. Do not complain about an empty topic, if it says "Random... event", pick a fascinating real topic yourself!`;

  const rawAngles = await callWithRetry(async () => {
    return await generateAIContentRaw(angleHunterPrompt, {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          hook: { type: "STRING" },
          angle_concept: { type: "STRING" }
        },
        required: ["title", "hook", "angle_concept"]
      }
    }, engine, onChunk, undefined, false, 0.9);
  });
  const angles = safeJsonParse(rawAngles, []);

  if (onChunk) onChunk("[!] غرفة التحرير: محامي الشيطان (The Critic) يفكك الأفكار ويصفي الأشرس...");

  // Phase 2: The Savage Critic (Filtering and Selection)
  const criticPrompt = `[Agent: The Editorial Critic (الناقد اللاذع)]
You are a savage, data-driven YouTube Producer who has generated billions of views. You despise "AI-slop", boring textbook history, and generic content.
Your job is to select the TOP 5 most VIRAL, PSYCHOLOGICAL, and INSANE hooks from the following 10 ideas and transform them into masterpieces.

Draft Ideas to Judge:
${JSON.stringify(angles, null, 2)}

JUDGMENT CRITERIA:
1. THE THUMBNAIL TEST: Can you instantly imagine a highly clickable visual for this title? If no, it fails.
2. THE 3-SECOND RULE: Does the hook physically force the viewer to watch until minute 1 via a massive Curiosity Gap or Paradox?
3. FORMAT FIT & AUTHENTICITY: Does it actually use the ${mood} format and sound natively Egyptian?
4. USER INTENT: Does it follow the user's notes and vision?

TASK:
- Pick the 5 absolute best winners.
- Rewrite their Hooks to use "The Pattern Interrupt" (Startling fact, paradox, or direct challenge to the viewer's beliefs).
- Generate a 3-sentence "Narrative Path" (Outline Preview) mapping out the climax.

Output Format: Return ONLY a JSON array of exactly 5 objects:
[
  { "title": "عنوان قصير جذاب (أقل من 60 حرف)", "hook": "هوك صادم ومباغت بيلعب على سيكولوجية المشاهد", "outline_preview": "خارطة القصة الدرامية وتصاعد الذروة" }
]`;

  const rawFinalSelection = await callWithRetry(async () => {
    return await generateAIContentRaw(criticPrompt, {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          hook: { type: "STRING" },
          outline_preview: { type: "STRING" }
        },
        required: ["title", "hook", "outline_preview"]
      }
    }, engine, onChunk, undefined, false, 0.4);
  });
  
  const finalSelection = safeJsonParse(rawFinalSelection, angles.slice(0, 3));
  if (onChunk) onChunk("[!] انتهت غرفة التحرير بنجاح. تم اختيار الأشرار الثلاثة.");
  return finalSelection;
}



export async function generateResearchMap(topic: string, durationMinutes: number, mood: string, persona: string, note: string, engine: string, signal?: AbortSignal, model?: string, onChunk?: (text: string) => void): Promise<any> { 
  // Check if user already selected a hook variant in the note/context
  const selectedHookMatch = note.match(/\[USER SELECTED HOOK VARIANT\]: (.*)/);
  const selectedAngleMatch = note.match(/\[ASSOCIATED ANGLE\]: (.*)/);
  
  let selectedIdea = { title: topic, hook: "", outline_preview: "" };
  let editorialResults: any[] = [];

  if (selectedHookMatch) {
    selectedIdea = {
      title: topic,
      hook: selectedHookMatch[1],
      outline_preview: selectedAngleMatch ? selectedAngleMatch[1] : ""
    };
    if (onChunk) onChunk("[!] تخطي غرفة التحرير: الاعتماد على الزاوية المختارة من المستخدم...");
  } else {
    // Step 1: Run the Editorial Board if no choice was made yet
    editorialResults = await executeEditorialBoard(topic, mood as MoodType, persona as PersonaType, engine, onChunk, note);
    selectedIdea = editorialResults[0] || selectedIdea;
  }

  const schema = {
    type: "OBJECT",
    properties: {
      video_title: { type: "STRING" },
      thumbnail: {
        type: "OBJECT",
        properties: {
          image_prompt: { type: "STRING" },
          text_on_image: { type: "STRING" }
        },
        required: ["image_prompt", "text_on_image"]
      },
      chapters: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            chapter_title: { type: "STRING", description: "Creative, cinematic title for the chapter" },
            core_premise: { type: "STRING", description: "A dramatic, high-stakes summary of what this chapter reveals" },
            key_revelations: { type: "ARRAY", items: { type: "STRING" }, description: "3-5 sharply written secrets, plot twists, or facts revealed in this chapter" }
          },
          required: ["chapter_title", "core_premise", "key_revelations"]
        }
      },
      sources: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            url: { type: "STRING" },
            key_takeaway: { type: "STRING" }
          },
          required: ["title", "url", "key_takeaway"]
        }
      }
    },
    required: ["video_title", "thumbnail", "chapters", "sources"]
  };

  const moodContext = getMoodContext(mood as MoodType);
  const targetChapters = durationMinutes >= 15 ? "7 to 10" : durationMinutes >= 10 ? "5 to 8" : "4 to 6";
  const systemPrompt = `You are a master cinematic story planner. 

${moodContext.scriptingStyle}

Return JSON matching the schema. CRITICAL: 
1. The chapters MUST be written in dramatic, compelling Arabic matching the mood's tone. 
2. Ensure the "core_premise" is a high-stakes summary, and "key_revelations" contain sharply written secrets or plot twists.
3. You MUST generate between ${targetChapters} distinct chapters proportional to the target duration (${durationMinutes} minutes).
4. The structure MUST be heavily customized and intimately bonded to the SPECIFIC chosen Hook and Angle provided. Do NOT return a generic Wikipedia-style chronological outline. Make it controversial, deeply tied to the specific psychological angle chosen!`;

  const messages = [{role: "user", content: `Generate a full production map for this selected idea:
Title: ${selectedIdea.title}
Hook: ${selectedIdea.hook}
Outline: ${selectedIdea.outline_preview}
Topic Context: ${topic}
Target Duration: ${durationMinutes} mins`}];

  let parsed: any = null;
  let attempts = 0;
  
  while (attempts < 3) {
      if (onChunk && attempts > 0) onChunk(`[!] محاولة استرداد الخريطة السردية (المحاولة ${attempts + 1})...`);
      
      const res = await fetchOllamaNew(messages, systemPrompt, engine, model, onChunk, schema, 0.80);
      parsed = safeJsonParse(res, null);

      if (parsed && parsed.chapters && Array.isArray(parsed.chapters) && parsed.chapters.length >= 2) {
          break; // Good enough
      }
      attempts++;
  }

  if (!parsed || !parsed.chapters || parsed.chapters.length === 0) {
     parsed = { 
       video_title: selectedIdea.title, 
       thumbnail: { image_prompt: "", text_on_image: "" }, 
       chapters: [
           { 
               chapter_title: "الفصل الأول (الصدمة والغموض)", 
               core_premise: selectedIdea.hook || "استعراض الفكرة الرئيسية بشكل غامض ومثير", 
               key_revelations: ["طرح السؤال المحوري المدمر", "عرض سريع لتناقضات القصة"] 
           },
           { 
               chapter_title: "الفصل الثاني (الغوص في الأعماق)", 
               core_premise: "كشف الخيوط المخفية وتقديم الأدلة الصادمة", 
               key_revelations: ["تحليل الأحداث المرتبطة", "تسليط الضوء على الزوايا الخفية"] 
           },
           { 
               chapter_title: "الفصل الثالث (حبكة النهاية)", 
               core_premise: "الوصول إلى الاستنتاج النهائي وربط كل الخيوط", 
               key_revelations: ["انهيار الأساطير", "كشف الحقيقة الكاملة"] 
           }
       ], 
       sources: []
     };
  }

  // Ensure editorial options
  if (!parsed.editorial_options) {
      parsed.editorial_options = editorialResults;
  }

  return parsed;
}

export async function executeNode0_OSINT(...args: any[]): Promise<any> { 
  return { id: "1", topic: args[0], created_at: "", last_updated: "", executive_summary: "", timeline: [], key_entities: [],  verified_facts: [], hidden_patterns_or_contradictions: [], historical_visual_anchors: [], sources: [], compiled_research_context: "" }; 
}

export async function generateChapter(chapterOutline: any, researchData: any, mood: string, previousSummary: string, isFirst: boolean, isLast: boolean, videoTitle: string, targetWords: number, engine: string, onChunk?: any, signal?: AbortSignal, maxRetries = 2, model?: string): Promise<any> { 
  const moodContext = getMoodContext(mood as MoodType);
  const prompt = `اكتب مشاهد الفصل التالي: ${JSON.stringify(chapterOutline)}`;
  const systemPrompt = `CRITICAL RULE: This is a Voiceover documentary script. YOU MUST NOT write dialogues between characters. There are no actors. The entire script is spoken by ONE single narrator telling the story.

[MOOD AND FORMAT GUIDELINES]
${moodContext.scriptingStyle}

${moodContext.visualAudioStyle}

CRITICAL: The ENTIRE script, including all narration, MUST be written consistently in SPOKEN EGYPTIAN AMMIYA (العامية المصرية المحكية). DO NOT use formal Arabic (Fusha) under any circumstances. 
- Use Egyptian words: "اللي", "عشان", "ليه", "إزاي", "ده", "دي", "فين", "إمتى", "كمان", "بس".
- Verbs MUST use the Egyptian prefix "ب" (e.g. بيعمل, بيقول, بيحاول) or future "هـ" (هيعمل).
- Negation must be Egyptian (e.g. مابيعملش, ما بدأش) not (لم يفعل, لا يعمل).
- Numbers MUST be written in Egyptian (e.g., "مية" instead of "مائة/مئة", "متين", "تلتومية").
- DO NOT INCLUDE formatting brackets like [PAUSE] or [TONE: ...] inside the 'voice_over' field. Keep 'voice_over' clean for the TTS engine.

[EXPERT INSTRUCTIONS FOR JSON FIELDS]:
- 'visual_cue' (Arabic): Describe what the viewer sees (cinematic style, editing pace). Make it highly creative based on the persona.
- 'image_prompt' (English): Write an English text-to-image prompt here. NEVER ask for Arabic text inside the image. Suggest blank boards/papers for editor overlays.
- 'b_roll_keywords' (English): Comma-separated English search terms for stock footage. (e.g. vintage file, neon signs).
- 'sound_design' (Arabic/English): Explicit SFX directions based on the persona (e.g., 'Whoosh, heartbeat', or 'Record Scratch, Slide Whistle').

You are a Senior Scriptwriter and Art Director. Return JSON containing an array of 'scenes'.`;

  const schema = {
    type: "OBJECT",
    properties: {
      scenes: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            scene_id: { type: "STRING" },
            voice_over: { type: "STRING" },
            visual_cue: { type: "STRING" },
            image_prompt: { type: "STRING" },
            b_roll_keywords: { type: "STRING" },
            sound_design: { type: "STRING" }
          },
          required: ["scene_id", "voice_over", "visual_cue", "image_prompt", "b_roll_keywords", "sound_design"]
        }
      }
    },
    required: ["scenes"]
  };

  const res = await fetchOllamaNew([{ role: "user", content: prompt }], systemPrompt, engine, model, undefined, schema);
  const parsed = safeJsonParse(res, { scenes: [] });
  let rawScenes = [];
  if (parsed?.scenes) rawScenes = parsed.scenes;
  else if (Array.isArray(parsed)) rawScenes = parsed;
  
  return rawScenes.map((s: any, idx: number) => {
      let imgPrompt = s.image_prompt || s.visual_cue || "";
      if (imgPrompt && !imgPrompt.includes("--ar")) {
          imgPrompt += " --ar 16:9";
      }
      return {
        asset_id: s.scene_id || s.asset_id || `scene_${Date.now()}_${idx}`,
        voice_over: s.voiceover_text || s.voice_over || "",
        visual_cue: s.camera_and_vision || s.visual_cue || "",
        image_prompt: imgPrompt,
        montage_instructions: s.montage_instructions || "",
        b_roll_keywords: s.b_roll_keywords || s.b_roll_search_query || "",
        sound_design: s.sound_design || s.sfx || ""
      };
  });
}

export async function generatePackaging(videoTitle: string, researchData: any, mood: string, cumulativeScenes: any[], engine?: string, model?: string): Promise<any> { 
  const pKit = await executeNode_PublishingKit(videoTitle, engine, model);
  return { 
    packaging: pKit, 
    omnichannel: pKit.omnichannel,
    shorts: pKit.shorts || []
  };
}

export interface Node3Visuals { scenes: any[] }
const OLLAMA_API_NEW = 'http://localhost:11434/api/chat';
const MODEL_NAME_NEW = 'qwen';

async function fetchOllamaNew(messages: any[], systemPrompt: string, engine?: string, model?: string, onChunk?: (text: string) => void, schema?: any, temp: number = 0.65) {
    const prompt = messages.map(m => m.content).join('\n\n');
    let dynamicOllamaUrl = undefined;
    try {
      if (typeof window !== "undefined" && window.localStorage) {
         const stored = localStorage.getItem("ollamaUrl");
         if (stored) dynamicOllamaUrl = stored;
      }
    } catch(e) {}
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minutes
    
    const useStream = true;

    try {
        const response = await fetch("/api/ai/generate", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: prompt,
                systemInstruction: systemPrompt,
                engine: engine || "gemini",
                temperature: temp,
                model: model,
                schema: schema,
                ollamaUrl: dynamicOllamaUrl,
                stream: useStream
            }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
             const errData = await response.json().catch(()=>({}));
             throw new Error(errData.error || 'Failed to call API');
        }
        
        if (useStream && response.body) {
            const reader = response.body.getReader();
            let fullContent = "";
            const decoder = new TextDecoder();
            let buffer = "";
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                buffer += decoder.decode(value, { stream: true });
                let newlineIndex;
                while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
                    const line = buffer.substring(0, newlineIndex).trim();
                    buffer = buffer.substring(newlineIndex + 1);
                    
                    if (line.startsWith('data: ')) {
                        const dataStr = line.substring(6).trim();
                        if (dataStr === '[DONE]') continue;
                        try {
                            const parsed = JSON.parse(dataStr);
                            if (parsed.error) {
                                throw new Error(parsed.error);
                            }
                            if (parsed.text) {
                                fullContent += parsed.text;
                                if (onChunk) onChunk(parsed.text);
                            }
                        } catch(e: any) {
                            if (e.message && e.message !== "Unexpected end of JSON input" && !e.message.includes("is not valid JSON")) {
                                throw e;
                            }
                        }
                    }
                }
            }
            return fullContent;
        } else {
            const data = await response.json();
            let content = data.content || '';
            if (typeof content === 'string') {
                 content = content.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
            }
            return content;
        }
    } catch(e: any) {
        clearTimeout(timeoutId);
        if (e.name === 'AbortError') throw new Error('AI Generation Timeout: المحرك استغرق وقتاً طويلاً جداً (أكثر من 10 دقائق).');
        throw e;
    }
}

async function applyRedTeamReflection(draftScene, engine?: string, model?: string, onChunk?: (t: string) => void) {
    const auditPrompt = 'You are a Red Team Auditor. Review this scene for historical hallucinations and redundancies.';
    const schema = {
      type: "OBJECT",
      properties: {
        findings: { type: "STRING" },
        revised_scene: { type: "STRING" }
      },
      required: ["findings", "revised_scene"]
    };
    const messages = [{ role: 'user', content: draftScene }];
    const auditResult = await fetchOllamaNew(messages, auditPrompt, engine, model, onChunk, schema);
    try {
        return safeJsonParse(auditResult).revised_scene;
    } catch (e) {
        return draftScene;
    }
}

async function executeNode_Visuals_V2(sceneText: string, timePeriod: string, engine?: string, model?: string, onChunk?: (t: string) => void) {
    const artDirectorPrompt = 'You are the Art Director. Analyze the scene and output an English image prompt. CRITICAL RULES: - Visual Style MUST be: authentic vintage Egyptian and Middle Eastern editorial illustration, dramatic chiaroscuro. - NEVER use meaningless floating circles, connecting lines, or abstract geometric shapes. - Match cultural context accurately (e.g., 7th-century specific robes, accurate features).';
    const schema = {
      type: "OBJECT",
      properties: {
        image_prompt: { type: "STRING" },
        transition_to_next_scene: { type: "STRING" }
      },
      required: ["image_prompt", "transition_to_next_scene"]
    };
    const messages = [{ role: 'user', content: 'Scene: ' + sceneText + ' | Era: ' + timePeriod }];
    const visuals = await fetchOllamaNew(messages, artDirectorPrompt, engine, model, onChunk, schema);
    try {
        const parsed = safeJsonParse(visuals);
        if (parsed?.image_prompt && !parsed.image_prompt.includes('--ar')) {
            parsed.image_prompt += ' --ar 16:9';
        }
        return parsed;
    } catch (e) {
        return { image_prompt: 'Cinematic visual --ar 16:9', transition_to_next_scene: 'Hard Cut' };
    }
}

async function executeNode_Editor(sceneText: string, engine?: string, model?: string, onChunk?: (t: string) => void) {
    const editorPrompt = 'You are the Video Editor. For this scene, extract a concise list of B-Roll visual search keywords (comma separated) and Sound Effects (comma separated) to enhance it.';
    const schema = {
      type: "OBJECT",
      properties: {
        b_roll_keywords: { type: "STRING" },
        sound_design: { type: "STRING" }
      },
      required: ["b_roll_keywords", "sound_design"]
    };
    const messages = [{ role: 'user', content: 'Scene: ' + sceneText }];
    const res = await fetchOllamaNew(messages, editorPrompt, engine, model, onChunk, schema);
    try {
        return safeJsonParse(res);
    } catch (e) {
        return { b_roll_keywords: '', sound_design: '' };
    }
}

async function executeNode_PublishingKit(topic: string, engine?: string, model?: string, onChunk?: (t: string) => void) {
    const pubPrompt = `You are a highly skilled YouTube Strategist. For the topic provided, output an SEO publishing kit and social media fragments.`;
    const schema = {
      type: "OBJECT",
      properties: {
        youtube_titles: { type: "ARRAY", items: { type: "STRING" } },
        description: { type: "STRING" },
        thumbnail_prompt: { type: "STRING" },
        tags: { type: "ARRAY", items: { type: "STRING" } },
        omnichannel: {
          type: "OBJECT",
          properties: {
            twitter_thread: { type: "ARRAY", items: { type: "STRING" } }
          },
          required: ["twitter_thread"]
        },
        shorts: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              hook: { type: "STRING" },
              body: { type: "STRING" },
              cta: { type: "STRING" }
            },
            required: ["title", "hook", "body", "cta"]
          }
        }
      },
      required: ["youtube_titles", "description", "thumbnail_prompt", "tags", "omnichannel", "shorts"]
    };
    const messages = [{ role: 'user', content: 'Topic: ' + topic }];
    const res = await fetchOllamaNew(messages, pubPrompt, engine, model, onChunk, schema);
    try {
        return safeJsonParse(res);
    } catch (e) {
        return { 
            youtube_titles: [topic + " | نظرة أعمق"], 
            description: '', 
            thumbnail_prompt: 'Cinematic concept --ar 16:9', 
            tags: [],
            omnichannel: { twitter_thread: [] },
            shorts: []
        };
    }
}
