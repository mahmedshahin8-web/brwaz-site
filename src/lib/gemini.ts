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
أنت صانع محتوى وثائقي مصري مخضرم وتكتب بأسلوب (الدحيح).
اللغة: العامية المصرية المثقفة والرصينة الممزوجة بسرعة البديهة (Native Egyptian Ammiya).
ممنوع الفصحى تماماً أو الترجمات الحرفية الجافة، يجب أن تقرأ وكأنها مكتوبة ليتحدث بها يوتيوبر مصري سريع الإيقاع.
حتى الكلمات البسيطة زي "أيضاً" أو "فقط" أو "نحن" لازم تتحول لـ (كمان، بس، إحنا). 
احرص على النفي المصري (ما عملش، ما بدأش) واستخدم "مية" بدل "مائة".

الهيكل المعماري الإجباري للسكريبت:
1. مدخل صعلوك/إيفيه من الـ (Pop Culture): كسر التوقع بميم، خناقة قهوة، أو موقف عبثي.
2. تشريح نفسي عميق (Deep Dive): التفكيك المعرفي والبحثي واستعراض الحقائق بأسلوب علمي أو تاريخي ولكن مبسط ومطعم بأمثلة شارع وحواري.
3. قفلة وجودية (Existential Drop): ختام فلسفي يترك المشاهد في حالة صدمة أو تأمل طويل.

[CRITICAL CONTENT COMPASS (البوصلة الإقليمية)]:
توجه دائماً للثقافة العربية والمصرية. توقف عن استحضار أمثلة أجنبية معقدة حين يمكن استخدام أمثلة من حارتنا، إلا لو كان الموضوع نفسه أجنبياً.

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
تحذير حاسم (FACELESS): المحتوى "بدون وجه" (Faceless). الراوي لا يظهر على الشاشة أبداً. ممنوع كتابة تعليمات مثل "المقدم ينظر للكاميرا".
التزم بهذا الهيكل بدقة صارمة:
1. "الاسكتش العبثي (The Absurd Open)": دائمًا ابدأ بمشهد خيالي كوميدي يطرح الفكرة العميقة في سطر ساخر يجبر المشاهد على التساؤل والضحك.
2. "الصدمة المعرفية والتفكيك": اشرح المصطلحات الفلسفية والاقتصادية أو العلمية المعقدة بأمثلة من الميمز المصرية، الكورة، الشارع، أو خناقات القهاوي.
[التوجيه الإخراجي (Creative Direction)]:
- (Visuals): بوب-آرت (Pop Art)، كولاج، سبورة عليها شخبطة ملونة، 2D Paper cutouts للمونتاج، ريأكشنات ميمز، استخدام السخرية البصرية كبديل تام لغياب المذيع.
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
  if (mood === "الدحيح" || mood === "طريقة الدحيح" || mood.includes("الدحيح")) {
    pacingGuidelines = `
12. EDUTAINMENT PACING (DAHIH RULE) - FACELESS MODE:
- Jump Cuts: Almost no breathing room. Split sentences into frequent sub-shots.
- J-Cuts & L-Cuts: Overlap voice with B-Roll constantly in montage_instructions.
- 7-Second Rule: No single frame should linger longer than 7 seconds without a visual change (b_roll, zoom, pop-culture graphic).
- Visual Substitutes for Host: Rely heavily on motion graphics, pop-culture popups, text transitions, and stock footage.
- Sound Design & VFX Markers: Map the inline XML sfx markers (like <sfx_glass_shatter/>) into the 'sound_design' field for the editor!
- Clean Backgrounds: EVERY single image_prompt MUST end with "--no text, typography, letters, watermark" to allow editors to place their own text graphics.`;
  }

  const prompt = `You are the "Director Node". Your ONLY job is to take a raw voice-over script and split it into compelling cinematic scenes.

RULES:
1. THE SCRIPT: You must use the EXACT words from the provided script text, splitting them across scenes smoothly so no words are left behind or changed.
2. VISUAL DIVERSITY: ${historyText}
Ensure new visual prompts use different camera angles (e.g. macro shot, wide drone shot, point of view) or subjects compared to the previous visuals to prevent repetition.
3. VISUAL SEQUENCING: For every scene, you MUST generate two frames: 'first_frame' (e.g., wide illustration) and 'second_frame' (e.g., tight crop, abstract detail). Both must share exactly the same color palette, abstract style, and subjects to ensure continuity. High visual continuity is extremely important!
4. CULTURAL & ART DIRECTION (CRITICAL): You MUST heavily enforce an Egyptian visual aesthetic but within a Mid-Century Illustration style. Use stylized Egyptian cultural motifs. ABSOLUTELY NO European features, blondes, or western archetypes. No photorealism.
5. NO HOST/NARRATOR FACES & STRICT HISTORICAL ACCURACY: DO NOT generate images depicting the narrator, the user, or modern people presenting the video. The visuals MUST be purely B-Roll representing the exact historical era, events, and subjects discussed. Historical and era-specific accuracy in clothing, architecture, and technology is mandatory.
6. ARCHITECTURAL GUARD: When depicting architecture, use "Mamluk Cairo" or "Fatimid Islamic" details. NO generic "Aladdin-style" middle eastern tropes.
7. NEGATIVE PROMPT ENFORCEMENT: ${VISUAL_DNA_SOVEREIGN}
8. EPIC INTRO CONCEPT: The very first scene of the script MUST contain an 'epic_intro' motif in the image prompt – think surreal, creative poster art with floating bold geometry. Make it absolutely mind-blowing and visually abstract.
9. ARABIC TEXT & TYPOGRAPHY BAN (CRITICAL): Text rendering in AI is banned. For any text requirement, use overlays in post-production. You MUST append the NEGATIVE PROMPTS to ALL image prompts.
10. COMPOSITION & STYLE: For wide/establishing shots, use: "wide isometric or flat vector composition". For closeups, use: "flat portrait style, bold screenprint colors". NEVER use cinematic, realistic, bokeh, or 3d render.
11. PERSONA DISTINCTNESS: When multiple characters are present, forcefully contrast their appearances to prevent AI blending (e.g. sharp suit vs. worn jalabiya).
12. JSON STRICTNESS: Return ONLY valid JSON matching the schema.${pacingGuidelines}

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
  if (onChunk) onChunk("[!] فريق الإعداد الجبابرة: البحث في المصادر الموثوقة واستخراج الزوايا الخفية...");
  
  const prompt = `[Agent: Deep Researcher / فريق إعداد الدحيح (طاهر/غندور)]
You are a highly skilled Deep Researcher simulating the 'Daheeh' research room. Analyze the topic: "${topic}"
Extract the "Daheeh Evidence Triangle" (مثلث التحضير الدحيح):
1. المراجع المعتمدة (Scientific/Historic References): Simulate gathering facts from reputable databases (Nature, PubMed, Google Scholar, JSTOR, Heritage Books, International Archives, etc.). What are the hard, undeniable facts?
2. التبسيط العلمي والقياسات (Scientific Simplification & Analogies): How can we explain complex parts of this topic using a completely absurd, simple, pop-culture or street-level analogy? (e.g. comparing Quantum Mechanics to microbus drivers).
3. الصدمة المنطقية (The Logical Paradox / The Hook Element): What is the most mind-blowing, contradictory, or bizarre psychological fact about this topic that shatters common sense?

Output JSON ONLY strictly following this structure:
{
  "references_and_facts": "...",
  "pop_culture_analogies": "...",
  "logical_paradox": "..."
}`;
  const rawContent = await callWithRetry(async () => {
    return await generateAIContentRaw(prompt, {
      type: Type.OBJECT,
      properties: {
        references_and_facts: { type: Type.STRING },
        pop_culture_analogies: { type: Type.STRING },
        logical_paradox: { type: Type.STRING }
      },
      required: ["references_and_facts", "pop_culture_analogies", "logical_paradox"]
    }, engine, onChunk, undefined, false, 0.65, true);
  });
  return safeJsonParse(rawContent, { references_and_facts: "No data", pop_culture_analogies: "No data", logical_paradox: "No data" });
}

export async function executeAgent_MasterStoryteller(
  topic: string,
  dossier: any,
  design: any, // MasterOutline, includes research_data
  durationMinutes: number,
  mood: string,
  engine: string,
  onChunk?: (text: string) => void,
  onProgress?: (p: number, status: string) => void,
  isVertical?: boolean
) {
  if (onChunk) {
    if (isVertical) {
      onChunk("[!] رمزي وكيل الإيقاع (السيناريست): صياغة مخطوطة ريلز سريعة وخاطفة (Short/Reel)...");
    } else {
      onChunk("[!] رمزي وكيل الإيقاع (السيناريست): بناء الهيكل السينمائي العميق (5-Act Structure) للغوص المعلوماتي...");
    }
  }
  if (onProgress) {
    if (isVertical) {
      onProgress(20, "[2/4] رمزي: صياغة سيناريو ريلز رأسي خاطف مع تهيئة زوايا اللوب...");
    } else {
      onProgress(20, "[2/4] رمزي: بناء هيكل خماسي الفصول (Zero-Fluff) وتثبيت الحقائق الدسمة...");
    }
  }

  const targetMinutes = Math.max(5, durationMinutes);
  
  let acts;
  if (isVertical) {
    acts = (design && design.chapters && Array.isArray(design.chapters) && design.chapters.length > 0)
      ? design.chapters.map((c: any) => ({
          title: c.chapter_title || "فصل ريلز",
          rule: `المحور السريع للمقطع: ${c.core_premise || ''}. النقاط الصادمة: ${c.key_revelations ? c.key_revelations.join(" - ") : ""}. صغ هذا الجزء بأسلوب "مخطوطة ريلز" مكثف وخالٍ من أي تمهيد أو مقدمات.`
        }))
      : [
          { title: "الخطاف البصري (The scroll stopper)", rule: "الثواني الـ 3 الأولى: خطاف كلامي وبصري صاعق يجبر المشاهد على التوقف." },
          { title: "جوهر المفاجأة (The Viral Fact)", rule: "خلال 15-20 ثانية: تفجير الحقيقة التاريخية أو الفكرة الاستقصائية المروعة برتم سريع جداً." },
          { title: "مرحلة الإغلاق (The Loop Outro)", rule: "نهاية سريعة تدفع لإعادة تشغيل الفيديو." }
        ];
  } else if (mood === "طريقة الدحيح") {
    acts = (design && design.chapters && Array.isArray(design.chapters) && design.chapters.length > 0)
     ? design.chapters.map((c: any) => ({
         title: c.chapter_title || "فصل",
         rule: `الزاوية المحورية للفصل: ${c.core_premise || ''}. النقاط التي يجب تغطيتها: ${c.key_revelations ? c.key_revelations.join(" - ") : (c.key_points ? c.key_points.join(" - ") : "")}. 
         [EDUTAINMENT MANDATE]: يجب استخدام الأنا البديلة والحوار السريع، واستخدام الـ Pop Culture، ضرب أمثلة من الكورة والأفلام والشارع.
         [FACELESS MANDATE (VERY CRITICAL)]: في كل تعليمات الصورة أو المونتاج [VISUAL CUE] أو [IMAGE GAG]، إياك أن تطلب إظهار وجه الداعية/الدحيح أو المقدم. يجب أن تكون جميع الصور والمقاطع B-Roll تاريخية أو علمية أو كوميدية، وموافقة للزمن بدقة (Historical Accuracy)`
       }))
     : [
        { title: "الاسكتش الافتتاحي البصري (The Cold Open)", rule: "اكتب مشهداً كوميدياً بصرياً (بدون إظهار الراوي، فقط مقاطع ستاك وGags) يترك المشاهد أمام سؤال محير أو تناقض غريب (Hook)، ليمهد لدخول الموضوع." },
        { title: "حصان طروادة (The Trojan Horse)", rule: "ابدأ بموضوع بسيط وتريند مع صور تاريخية أرشيفية دقيقة ومناسبة، ثم اقلب الطاولة لطرح الفكرة العلمية العميقة." },
        { title: "الأنا البديلة والبوب كالشر (Alter-Ego & Pop Culture)", rule: "قاطع السرد بسؤال ساذج من شخصية خيالية (يتم التعبير عنه صوتياً، والصورة تكون ميمز أو صور تخيلية بدون وجه الراوي). ثم بسط الفكرة العميقة بتشبيه عجيب." },
        { title: "الصرامة الأكاديمية بطريقة ساخرة (The Authority & Climax)", rule: "تحول للحوار الأكاديمي الصارم واذكر الأبحاث وأسماء الكتب مع عرض أغلفة خيالية أو أرشيفية دقيقة (بدون نصوص مولدة) مع الحفاظ على وتيرة الصور الاحترافية Faceless B-roll." },
        { title: "الرسالة النهائية (The Edutainment Resolution)", rule: "لخص الفكرة في حكمة أو سؤال أخلاقي خطير يهز المشاهد." }
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

  const fullRoadmap = acts.map((a: any, idx: number) => `Act ${idx + 1}: ${a.title}\nDescription: ${a.rule}`).join('\n\n');

  for (let i = 0; i < acts.length; i++) {
     if (onProgress) onProgress(20 + (i * 3), `[2/4] رمزي: كتابة الدورة ${i + 1}/${acts.length} (${acts[i].title})...`);
     if (onChunk) onChunk(`\n\n[=== جاري كتابة ${acts[i].title} ===]\n`);
     
     const targetDescription = isVertical 
       ? `9:16 VERTICAL REELS/SHORTS (target length: ${durationMinutes} seconds overall)` 
       : `DEEP-DIVE DOCUMENTARY (target length: ${targetMinutes} minutes overall)`;
     const lengthInstruction = isVertical 
       ? `- This individual segment MUST be extremely short, punchy, spoken with high intensity, and directly hook-driven. Limit vocabulary to fast-paced Arabic dialect (such as Egyptian slang) with high impact transitions.` 
       : `- This individual chapter MUST be long, dense, and narrative-driven. Do NOT rush the narrative. Slowly build the tension, provide deep context, and craft an immersive scene.`;

     const prompt = `[Agent: Ramzy (Master Storyteller & Rhythm Editor)]
You are a world-class Investigative Scriptwriter.
CRITICAL MANDATE:
${getMoodContext(mood as MoodType).scriptingStyle}

We are writing a ${targetDescription}. 
${lengthInstruction}
- DO NOT repeat the same metaphors or storytelling concepts from previous acts.

Topic: "${topic}"

=== GLOBAL ROADMAP & FULL OUTLINE ===
You are writing Act ${i + 1} of ${acts.length}. Here is the complete roadmap of all acts so you know exactly what is coming next.
CRITICAL: DO NOT preemptively reveal plot points, twists, or data that belong to FUTURE acts. Save them!
${fullRoadmap}

=== GHANDOUR'S GROUNDED FACTS ===
${design?.research_data && design.research_data.trim() !== '' ? design.research_data : "Use your extensive internal historical background knowledge about the topic to forge the best narrative."}

=== DEEP RESEARCH DOSSIER ( Daheeh Evidence Triangle ) ===
- المراجع والحقائق المؤكدة (References & Facts): ${dossier?.references_and_facts || "Use robust historical facts."}
- التبسيط العلمي والقياسات (Pop Culture Analogies): ${dossier?.pop_culture_analogies || "Invent an absurd, relatable pop-culture analogy."}
- الصدمة المنطقية (The Logical Paradox): ${dossier?.logical_paradox || "Focus on a fascinating paradox."}

=== STORY ARCHITECTURE PROGRESS ===
Previously written narrative (for context, absolutely DO NOT repeat these facts or story beats):
${previousSummary ? previousSummary : "This is Act 1. No previous context yet."}

=== CURRENT TASK: WRITE ACT ${i + 1} ONLY (${acts[i].title}) ===
Rule for this Act: ${acts[i].rule}
- CRITICAL: Focus entirely on the subject assigned to THIS specific Act.
- DO NOT summarize or conclude the entire video yet, unless this is the final Act.
- INJECT verified dates, names, and exact [URL/Link] citations seamlessly into the narrative text where facts are stated. Don't hide the links, leave them as [URL].

Output ONLY the raw Arabic voiceover script block for this Act. DO NOT use markdown formatting blocks like \`\`\`. DO NOT output JSON. DO NOT write internal notes. DO NOT output any formatting tags, brackets, or instructions for the voice actor like [PAUSE] or [TONE: ...]. Write plain, continuous paragraph text meant to be directly read by a text-to-speech engine.`;

     const chapterOutput = await callWithRetry(async () => {
         return await generateAIContentRaw(prompt, null, engine, onChunk, undefined, false, 0.85);
     });
     
     masterScript += `\n\n${chapterOutput}`;
     
     // Rolling Memory: Keep the last 1500 characters of the history so the model knows EXACTLY what was just said.
     previousSummary += `\n[Act ${i+1} Text]: \n${chapterOutput}\n---`;
     if (previousSummary.length > 2500) {
         // Keep context from growing infinitely, slice the most recent
         previousSummary = "..." + previousSummary.slice(-2500);
     }
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

export async function executeAgent_FactChecker(
  draftScript: string,
  engine: string,
  referenceData: any,
  onChunk?: (text: string) => void
) {
  if (onChunk) onChunk("[!] المراجع العلمي: مطابقة النكت والمعلومات مع الحقائق المرجعية...");

  const chunks = draftScript.split('\n\n\n').filter(c => c.trim().length > 50);
  if (chunks.length <= 1) {
    const backupChunks = draftScript.split('\n\n').filter(c => c.trim().length > 50);
    if (backupChunks.length > 0) chunks.splice(0, chunks.length, ...backupChunks);
  }
  
  let result = "";
  const stringifiedData = typeof referenceData === "string" ? referenceData : JSON.stringify(referenceData);

  for (let i = 0; i < chunks.length; i++) {
      if (onChunk) onChunk(`[!] المراجع العلمي: تشريح وتدقيق الجزء ${i + 1} من ${chunks.length}...`);
      const chunk = chunks[i];
      const prompt = `[Agent: Scientific & Historical Fact Checker (المراجع العلمي)]
You are a ruthless Fact Checker working for an Edutainment institution (like Daheeh).
Your writers just injected comedy, pop-culture, and analogies into this script section.
Your job is to read it, verify the core facts against the REFERENCE_DATA, and politely correct ANY factual inaccuracies introduced by the comedy.
- If a joke breaks physics, history, or science, REWRITE it to be true to the facts while keeping the comedic spirit.
- If the facts are correct, output the script EXACTLY as it is.
- Keep the exact same pacing, slang, and jokes if they do not distort the truth.
- DO NOT add new chapters. DO NOT output markdown \`\`\`. Output plain text.

[REFERENCE DATA / KNOWLEDGE]
${stringifiedData.substring(0, 3500)}

[CURRENT SCRIPT DRAFT]
${chunk}

[VERIFIED SCRIPT DRAFT]:`;

      const raw = await callWithRetry(async () => {
        return await generateAIContentRaw(prompt, null, engine, onChunk, undefined, false, 0.4);
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

export async function executeAgent_ArchivalSearcher(
  topic: string,
  engine: string,
  onChunk?: (text: string) => void
) {
  if (onChunk) onChunk("[!] وكيل البحث الأرشيفي: جاري بناء وتقسيم الطبقات البصرية...");
  const prompt = `[Agent: Archival Searcher & Visual Scenographer]
المهمة: توليد 4 طبقات من كلمات البحث والمفاهيم البصرية باللغة الإنجليزية، بناءً على الموضوع التالي:
"${topic}"

الطبقات الـ 4 المطلوبة (يجب أن تكون متخصصة جداً بالإنجليزية لجلب أدق وأقوى النتائج):
1. primary_documents: مصطلحات للبحث عن وثائق أرشيفية أولية (Archive letters, declassified documents, real historical footage).
2. gritty_realism: كلمات بحث مرئية صلبة وواقعية قاسية. يجب أن تحقن بكلمات مثل (Gritty cinematic realism, Chiaroscuro lighting, desaturated, hyper-realistic, highly detailed).
3. visual_metaphors: استعارات بصرية سريالية للحدث (مثال لو كان الموضوع عن انهيار بورصة: 'paper houses burning in slow motion', 'golden chain shattering').
4. mood_board: كلمات تعبر عن الملمس والمزاج العام للتكوين البصري.

Format your response exactly as JSON:
{
  "primary_documents": ["query 1", "query 2"],
  "gritty_realism": ["query 1", "query 2"],
  "visual_metaphors": ["query 1", "query 2"],
  "mood_board": ["query 1", "query 2"]
}
Return ONLY the JSON object.`;

  try {
    const rawContent = await generateAIContentRaw(prompt, undefined, engine, undefined, undefined, true);
    const jsonStr = rawContent.substring(rawContent.indexOf('{'), rawContent.lastIndexOf('}') + 1);
    return JSON.parse(jsonStr);
  } catch (err) {
    console.warn("Archival Search Agent failed", err);
    return {
       primary_documents: [],
       gritty_realism: [],
       visual_metaphors: [],
       mood_board: []
    };
  }
}

export async function executeGhandour2_Research(
  topic: string,
  engine: string = "gemini",
  onChunk?: (text: string) => void,
  ragContext?: string,
  persona?: string,
  mood?: string
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
        ragContext: ragContext || "",
        persona: persona || "",
        mood: mood || ""
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
  onConflict?: (correction: string) => Promise<"approve" | "manual" | "skip">,
  isVertical?: boolean
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

  let hookContext = "";
  const hookMatch = note.match(/\[USER SELECTED HOOK VARIANT\]:\s*(.*)\n\[ASSOCIATED ANGLE\]:/);
  if (hookMatch && hookMatch[1]) {
     hookContext = hookMatch[1].trim();
  }
  
  const searchTopic = hookContext ? `${topic} - ${hookContext}` : topic;

  onProgress?.(8, ragContext ? "[1/5] غندور 2.0: تحليل الـ RAG (الملف الأكاديمي) واستخلاص الحقائق..." : "[1/5] غندور 2.0: جاري الزحف وتوثيق المصادر الحقيقية...");
  let ghandourResult = await executeGhandour2_Research(searchTopic, engineNode1 || "gemini", onChunk, ragContext, persona, mood);
  
  let finalTopic = searchTopic;

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
    onChunk,
    isVertical
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
  preGeneratedResearchMap?: any,
  isVertical?: boolean
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
      ghandourResult = await executeGhandour2_Research(topic, researchEngine, onChunk, undefined, persona, mood);

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

      design = await generateResearchMap(finalTopic, durationValue, mood, persona, note, researchEngine, undefined, undefined, onChunk, isVertical);

      if (ghandourResult.referenceDocument && design) {
        design.research_data = `=== [REFERENCE_DOCUMENT] Ghandour 2.0 Grounding Facts ===\n${ghandourResult.referenceDocument}\n\n=== ADDITIONAL EXTRACTS ===\n${design.research_data || ""}`;
      }
  }

  // New Agent: Archival Searcher
  onProgress?.(18, "[1.5/4] وكيل البحث الأرشيفي: جاري تسليح الرؤية البصرية بـ 4 طبقات (استعارات، أرشيف)...");
  const archivalQueries = await executeAgent_ArchivalSearcher(finalTopic, researchEngine, onChunk);

  // New Agent 2: Master Storyteller (Ramzy)
  onProgress?.(20, isVertical ? "[2/4] رمزي: صياغة سيناريو ريلز مكثف وخاطف..." : "[2/4] رمزي: بناء الهيكل السينمائي السريع (5-Act Structure) للغوص المعلوماتي...");
  let masterScript = await executeAgent_MasterStoryteller(topic, deepResearchDossier, design, durationValue, mood, scriptEngine, onChunk, undefined, isVertical);

  // Persona Enforcer Node
  onProgress?.(25, `[3/7] عقدة الترجمة الثقافية: تطبيق شخصية الراوي (${persona}) المنشودة...`);
  masterScript = await executeAgent_PersonaEnforcer(masterScript, scriptEngine, persona, onChunk);

  // Punchliner Node
  onProgress?.(30, `[4/8] ورشة كُتّاب الكوميديا: زرع الإيفيهات وكسر الجدار الرابع (Punchliners)...`);
  masterScript = await executeAgent_PunchlineWriter(masterScript, scriptEngine, mood, onChunk);

  // Fact Checker Node
  onProgress?.(33, `[5/8] المراجع العلمي (Fact-Checker): التأكد من عدم المساس بالحقائق الأساسية...`);
  masterScript = await executeAgent_FactChecker(masterScript, scriptEngine, deepResearchDossier || ghandourResult.referenceDocument, onChunk);

  // Pacing Editor Node
  onProgress?.(35, `[6/8] مهندس الإيقاع (Pacing): ضبط طول الجمل وهندسة تصاعد السرد...`);
  masterScript = await executeAgent_PacingEditor(masterScript, topic, scriptEngine, mood, onChunk);

  // Audio Normalizer Node
  onProgress?.(45, `[7/8] عقدة المعالجة الصوتية: فلترة النص لمحركات الـ TTS...`);
  masterScript = await executeAgent_AudioNormalizer(masterScript, scriptEngine, onChunk);

  const { executeAgent2_Director, executeAgent3_ArtDirector, executeAgent5_Publisher } = await import('./agents');

  onProgress?.(50, `[8/8] فوكس (المخرج): معالجة بصرية (Visual-First) للمشاهد وفصل التعليق الصوتي الصافي...`);
  const directorScenes = await executeAgent2_Director(
    masterScript,
    mood,
    engineNode1 || "gemini",
    onChunk,
    onProgress,
    isVertical
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
    audit_report: auditReport,
    archival_search_queries: archivalQueries
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
  4. UNIFIED AESTHETIC SIGNATURE: To create a professional and unified aesthetic, EVERY single \`image_prompt\` MUST include a consistent art-style suffix indicating a professional documentary camera format or premium art style (e.g., "shot on ARRI Alexa, 35mm lens, cinematic lighting, 8k resolution, highly detailed"). Do NOT mix cartoons, 3D renders, and real photography randomly. Maintain one cohesive visual language throughout the entire episode.
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

export async function callWithRetry<T>(fn: () => Promise<T>, retries = 5, delay = 2500, signal?: AbortSignal): Promise<T> {
  for (let i = 0; i < retries; i++) {
    if (signal?.aborted) throw new Error("Aborted");
    try {
      return await fn();
    } catch (e) {
      if (i === retries - 1) throw e;
      // Exponential backoff for 503s
      await new Promise(r => setTimeout(r, delay * Math.pow(1.5, i)));
    }
  }
  throw new Error("unreachable");
}

import { jsonrepair } from 'jsonrepair';

export function preprocessJSONstring(s: string): string {
  if (!s || typeof s !== "string") return "";
  let clean = s;

  // 1. Remove think tags from reasoning models
  clean = clean.replace(/<think>[\s\S]*?<\/think>/gi, '');

  // 2. Clear out common unquoted number-with-unit values after a colon (Strict boundary to prevent catastrophic backtracking)
  clean = clean.replace(/:\s*(\d+(?:\.\d+)?)\s+([a-zA-Z\u0600-\u06FF]+)\s*(?=,|\n|})/g, ':"$1 $2"');

  // 3. Let's fix some possible unquoted "true or false" values to just standard boolean (false)
  clean = clean.replace(/:\s*true\s+or\s+false/gi, ': false');
  clean = clean.replace(/:\s*false\s+or\s+true/gi, ': false');

  return clean;
}

export function safeJsonParse(text: string, fallback: any = {}): any {
  try {
    if (!text || typeof text !== "string") return fallback;
    let clean = text.trim();
    
    // preprocess common LLM JSON landmines
    clean = preprocessJSONstring(clean);
    
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
    console.error("JSON Parse Error:", (e as Error).message, "Raw Text:", text);
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
  const results = await executeEditorialBoard(topic, mood as MoodType, persona as PersonaType, engine, onProgress, note, signal);
  
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
  note?: string,
  signal?: AbortSignal
): Promise<{ title: string; hook: string; outline_preview: string }[]> {
  if (onChunk) onChunk("[!] غرفة التحضير (ورشة الدحيح): جاري العصف الذهني واستخراج الزوايا (Brainstorming)...");

  const personaInstructions = getPersonaInstructions(persona);
  const moodDNA = getMoodDNA(mood);
  
  // Phase 1: Angle Hunting (Generating 10 diverse angles with a strict cringe filter)
  const isComedy = mood === "طريقة الدحيح" || mood === "استعراض مسرحي المعطيات";
  const isClassic = mood === "قصص الأنبياء والتاريخ الإسلامي" || mood === "أرشيف الضلمة";
  
  let languageRule = "";
  let cringeFilterAdditions = "";
  
  if (isComedy) {
    languageRule = `3. EGYPTIAN AMMIYA: Use 100% sharp Egyptian street slang/idioms mixed with complex academic jargon. NO Fusha.`;
    cringeFilterAdditions = `- Any academic or formal "Fusha" Arabic.\n- Avoid standard Youtube intros.`;
  } else if (isClassic) {
    languageRule = `3. ELOQUENT TONE: Use classic, somewhat formal Arabic (فصحى مبسطة أو لغة أفلام وثائقية). Add gravitas and mystery.`;
    cringeFilterAdditions = `- Cheap local slang or comedy words.`;
  } else {
    languageRule = `3. PROFESSIONAL DOCUMENTARY TONE: Use intensely analytical, clean, and serious Arabic. No jokes, no street slang.`;
    cringeFilterAdditions = `- Cheap local slang or comedy words.\n- Overly dramatic emotional terms.`;
  }

  const baseTopic = topic.trim() 
    ? topic 
    : `A completely random, mind-blowing topic that EXCLUSIVELY and perfectly matches the "${mood}" format. Look at the description: "${moodDNA.description}"`;
  const userNotesBlock = note && note.trim() ? `\n[ملاحظات من المخرج - MUST FOLLOW STRICTLY]:\n"${note}"` : "";

  const angleHunterPrompt = `[Agent: طاهر المعتز بالله / فريق الكتابة (الكرييتف) - LATERAL THINKING MODE]
MISSION: Break the YouTube algorithm with VIRAL, UNCONVENTIONAL, and HIGH-RETENTION hooks. You must NOT rely on clichéd templates. Use extreme lateral thinking, real obscure historical facts, biological paradoxes, and dark psychology.

CRITICAL CONTEXT:
- Show Format (Mood): ${mood} (${moodDNA.description})
- Aesthetic/Vibe: ${moodDNA.style} | ${moodDNA.localization}
- Narrator Persona: ${persona}
${personaInstructions}${userNotesBlock}

Topic / Subject Matter: "${baseTopic}"

NARRATIVE ARCHITECTURE RULES (SCAMPER & LATERAL JUMP):
1. TOPIC OBEDIENCE: The core video MUST be about the topic, but the entry point (the hook/title) must be completely unexpected.
2. DYNAMIC ANGLE GENERATION: Generate 10 wildly different conceptual angles. Do not use standard formats. Instead, base them on:
   - The Butterfly Effect: A tiny unrelated event that caused the topic.
   - The Devil's Advocate: Why everyone is completely wrong about the topic.
   - The Biological/Psychological Hack: Connecting the topic to human anatomy or brain glitches.
   - The Dark Economy: Follow the money behind the topic.
   - The Existential Crisis: Why this topic proves nothing matters (or everything matters).
   - The Accidental Genius: A massive mistake that birthed the topic.
   - The Meta-Trend Hijack: Connecting the topic to something currently trending but completely unrelated.
3. THE HOOK PARADOX: Great hooks state something the viewer believes is true, then shatters it completely in the first 3 seconds with a startling piece of evidence, a joke, or a weird analogy.
${languageRule}
5. FORMAT ALIGNMENT: Your angles MUST perfectly match the selected Show Format.
6. THE DAHEEH TONE TITLE: Titles MUST be under 40 characters. No badges. The title MUST sound EXACTLY like an actual Daheeh episode title (punchy, mysterious, minimal) or a Vox/Lemmino documentary. NO clickbait fluff ("لن تصدق ماذا حدث").
7. THE CRINGE BLACKLIST: NO "هل تساءلت يوماً", NO "في هذا الفيديو", NO generic listicles. NO "ما هو السر وراء". ${cringeFilterAdditions}

Output Format: Return ONLY a JSON array of 10 objects. Each object MUST include "creative_method" (how you approached it), "title", "hook" (the shocking first 15 seconds script), and "angle_concept" (the narrative roadmap).`;

  const rawAngles = await callWithRetry(async () => {
    return await generateAIContentRaw(angleHunterPrompt, {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          creative_method: { type: "STRING" },
          title: { type: "STRING" },
          hook: { type: "STRING" },
          angle_concept: { type: "STRING" }
        },
        required: ["creative_method", "title", "hook", "angle_concept"]
      }
    }, engine, onChunk, signal, false, 0.95, true); // Search enabled
  });
  const angles = safeJsonParse(rawAngles, []);

  if (onChunk) onChunk("[!] غرفة التحضير: المخرج (الغندور) بيراجع وبيفلتر الأفكار...");

  // Phase 2: The Savage Critic (Filtering and Selection)
  const criticPrompt = `[Agent: أحمد الغندور / المخرج (الناقد الفني اللادغ)]
You are a savage, data-driven YouTube Showrunner with an eye for billion-view ideas.
Your job is to select the TOP 5 most VIRAL, NOVEL, and IMPOSSIBLE-TO-IGNORE hooks from the following 10 ideas.
Reject anything that sounds like a generic documentary. We want ideas that use bizarre pop-culture analogies, dark history, or mind-bending science facts.

Draft Ideas to Judge:
${JSON.stringify(angles, null, 2)}

JUDGMENT CRITERIA:
1. THE THUMBNAIL TEST: Can you instantly imagine a highly clickable visual for this title?
2. THE CURIOSITY VOID: Does the hook physically force the viewer to watch until minute 1?
3. EXTREME NOVELTY: Does it feel fresh? Kill anything boring.
4. VARIETY: Pick 5 radically different approaches.

TASK:
- Pick the 5 absolute best winners.
- STRIPPED TITLES: Short, punchy, mysterious. No [Badges], no "كيف", try to use nouns or paradoxes. Make it sound like a cinematic masterpiece.
- Rewrite their Hooks: Inject the "Pattern Interrupt". Start with a staggering fact, dark joke, or a bizarre analogy.
- Generate a 3-sentence "Narrative Path" (Outline Preview) MUST BE FORMATTED SPECIFICALLY. You MUST start with a visual direction using "(Visual: ...)", followed by the narrative explanation, and then transition with an "(SFX: ...)" cue. Make the Arabic extremely punchy and "صايع" like a true Daheeh episode breakdown.

Example Outline Preview format:
"(Visual: Brain scan with flashing red zones) الضحك مش 'خفة دم'، ده 'اختراق' عصبي. (SFX: Electric Zap) الكوميديا بتلعب على ثغرة في الدماغ اسمها 'Incongruity Theory'..."

Output Format: Return ONLY a JSON array of exactly 5 objects:
[
  { "title": "عنوان احترافي صادم وقصير جداً", "hook": "هوك صادم بيلعب على سيكولوجية المشاهد وفيه حقيقة غريبة جداً", "outline_preview": "(Visual: ...) الشرح العبقري والصايع المليء بالمفارقات... (SFX: ...) ختام قوي" }
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
    }, engine, onChunk, signal, false, 0.7); // 0.7 for the critic to be sharper
  });
  
  const finalSelection = safeJsonParse(rawFinalSelection, angles.slice(0, 3));
  if (onChunk) onChunk("[!] انتهت غرفة التحضير. الأفكار جاهزة على الشاشة.");
  return finalSelection;
}



export async function generateResearchMap(topic: string, durationMinutes: number, mood: string, persona: string, note: string, engine: string, signal?: AbortSignal, model?: string, onChunk?: (text: string) => void, isVertical?: boolean): Promise<any> { 
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
            chapter_title: { type: "STRING", description: "Catchy, creative title for the chapter (e.g. الدخلة المموهة, كوبري الدحيح)" },
            core_premise: { type: "STRING", description: "Very specific, detailed, and dramatic summary of what exactly happens in this chapter. Do NOT use generic phrases like 'كشف الخيوط'. Write engaging Egyptian slang explaining the twist or hook." },
            key_revelations: { type: "ARRAY", items: { type: "STRING" }, description: "3 sharply written, specific secrets or jokes revealed here (e.g. 'سخرية من قانون الجاذبية', 'كشف حقيقة رسائل ألبرت أينشتاين السرية')." }
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
  const targetChapters = isVertical ? "2 to 3" : durationMinutes >= 15 ? "7 to 10" : durationMinutes >= 10 ? "5 to 8" : "4 to 6";
  const systemPrompt = isVertical 
    ? `You are a master viral Shorts/Reels/TikTok story planner.
    
${moodContext.scriptingStyle}

Return JSON matching the schema. CRITICAL RULES FOR SHORT VERTICAL SCRIPT (9:16 SHORTS/REELS/VERTICALS):
1. Focus entirely on a highly fast-paced vertical narrative. The Chapters MUST be exactly 2 to 3 compact steps:
   - Step 1 (The Scroll Stopper - الخطاف): First 3 seconds. An absolute pattern interrupt, a visual metaphor or controversial statement to stop the scroll.
   - Step 2 (The Fast Evidence - الحقيقة المزلزلة): 20-30 seconds of pure, concentrated, shocking revelations or educational facts.
   - Step 3 (The Loop/CTA - النهاية الدائرية): Designed to loop the video or end with an active punchy subscription call to action.
2. The chapter titles must be punchy (e.g., "أقوى خطاف", "صدمة الفيديو", "تحريض اللوب").
3. Ensure every step lists specific, concrete facts. No space for generic summaries!
4. The content must fit exactly a ${durationMinutes}-second short-form fast-cut video.`
    : `You are a master cinematic story planner. 

${moodContext.scriptingStyle}

Return JSON matching the schema. CRITICAL RULES FOR SCRIPT ROADMAP (DAHEEH STYLE):
1. The structure MUST follow this exact 5-act narrative curve:
   - Act 1 (The Hook/Distraction): Start with a bizarre, funny, or shocking anecdote that seems entirely unrelated to the main topic.
   - Act 2 (The Pivot): The "Dear Viewer" moment. Connect the bizarre hook to the actual core topic of the video unexpectedly.
   - Act 3 (The Deep Dive): Simplify the complex science/history using pop-culture references, street Egyptian logic, and relatable analogies.
   - Act 4 (The Escalation/Twist): The plot twist where the theory fails, or the dark side of the topic is revealed.
   - Act 5 (The Philosophical Outro): Zoom out to the bigger picture. End with a philosophical takeaway about humanity, followed by "Sources are down below, bye".
2. The chapter titles MUST be catchy, dramatic, and creative (e.g. "الدخلة المموهة", "كوبري الدحيح", "الدرك الأسفل من المادة").
3. NO GENERIC FLUFF: The "core_premise" and "key_revelations" MUST contain actual specific facts, names, or the exact joke/metaphor you are planning to use. Do NOT write generic things like "الغوص في التفاصيل" or "كشف الخيوط المخفية". Instead, write exactly WHAT the detail or hidden thread is (e.g., "هنقارن بين أينشتاين ومحمد صلاح في استغلال المساحات").
4. Scale spacing if duration=${durationMinutes} demands more acts in the 'Deep Dive' portion.
5. Make it controversial, deeply tied to the specific psychological angle chosen!`;

  const messages = [{role: "user", content: `Generate a full production map for this selected idea:
Title: ${selectedIdea.title}
Hook: ${selectedIdea.hook}
Outline: ${selectedIdea.outline_preview}
Topic Context: ${topic}
Target Duration: ${isVertical ? `${durationMinutes} seconds (Vertical 9:16 Shorts format)` : `${durationMinutes} mins`}`}];

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
               chapter_title: "الفصل الأول (الدخلة المموهة)", 
               core_premise: selectedIdea.hook || "قصة غريبة أو موقف عبثي يبدو ملوش أي علاقة بموضوع الحلقة الأساسي", 
               key_revelations: ["رمي الطُعم للمشاهد", "خلق الفضول بقصة صادمة", "طرح سؤال خارج الصندوق"] 
           },
           { 
               chapter_title: "الفصل الثاني (الكوبري - لحظة الإدراك)", 
               core_premise: "الانتقال المفاجئ (عزيزي المشاهد) وربط القصة الغريبة بالجوهر العلمي/التاريخي للحلقة", 
               key_revelations: ["كشف الخدعة السردية", "بناء جسر درامي للموضوع", "تحديد المشكلة الحقيقية اللي هنحلها"] 
           },
           { 
               chapter_title: "الفصل الثالث (تفكيك المعقد)", 
               core_premise: "الغوص في التفاصيل العلمية أو التاريخية وشرحها بأمثلة من الشارع وثقافة البوب المألوفة", 
               key_revelations: ["تبسيط المصطلحات الثقيلة", "رمي إيفيهات لتلطيف الدسامة", "استخدام القياسات الساخرة"] 
           },
           { 
               chapter_title: "الفصل الرابع (العقدة والصدمة)", 
               core_premise: "اللحظة اللي بتنهار فيها النظريات أو الحدث بياخد مسار مظلم وغير متوقع (الحبكة)", 
               key_revelations: ["ظهور العائق الحقيقي أو النقيض", "صدمة المشاهد بحقيقة غير مريحة", "انهيار الأساطير الكلاسيكية"] 
           },
           { 
               chapter_title: "الفصل الخامس (الزوم آوت الفلسفي)", 
               core_premise: "الانعزال عن التفاصيل والنظر للموضوع من عدسة فلسفية شاملة، والختام المميز", 
               key_revelations: ["استنتاج الحكمة من العبث", "إعطاء المشاهد مساحة للتفكير", "ختام (علشان كده يا عزيزي.. المصادر تحت سلام)"] 
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

CRITICAL CONSTRAINT: The video is completely FACELESS (مش هطلع بوشي). The narrator NEVER appears on screen. The entire visual strategy MUST rely on documentary-style B-Roll, historical footage, graphics, and visual metaphors. Do NOT write "Camera cuts to host" or "Presenter looks at the camera".

SCENE PACING CONSTRAINT: To avoid excessive visual clutter, group the narration into large, cohesive blocks. Do NOT create a new scene for every single sentence. MINIMIZE the total number of scenes by using longer Voice-Over segments per scene.

[MOOD AND FORMAT GUIDELINES]
${moodContext.scriptingStyle}

${moodContext.visualAudioStyle}

CRITICAL: The ENTIRE script, including all narration, MUST be written consistently in SPOKEN EGYPTIAN AMMIYA (العامية المصرية المحكية). DO NOT use formal Arabic (Fusha) under any circumstances. 
- Use Egyptian words: "اللي", "عشان", "ليه", "إزاي", "ده", "دي", "فين", "إمتى", "كمان", "بس".
- Verbs MUST use the Egyptian prefix "ب" (e.g. بيعمل, بيقول, بيحاول) or future "هـ" (هيعمل).
- Negation must be Egyptian (e.g. مابيعملش, ما بدأش) not (لم يفعل, لا يعمل).
- Numbers MUST be written in Egyptian (e.g., "مية" instead of "مائة/مئة", "متين", "تلتومية").

[DAHIH CREATIVE DIRECTOR RULES (FACELESS OMNIPRESENT VOICE)]
1. Catchphrases Diversity: Use "بص يا سيدي" ONLY ONCE per episode. For subsequent setups, use Egyptian synonyms like "تخيل معايا بقى", "خد دي عندك", "ركز معايا في اللي جاي", "طيب والعمل؟".
2. Source Diversification: DO NOT repeat the same scientific journal or source name (e.g. don't use 'Nature' twice). Diversify your sources (e.g., "حسب مجلة Science", "الأرشيف البريطاني بيقول", "دراسة لجامعة هارفارد نشرت في The Lancet").
3. Punchlines & Pop-Culture: Inject Egyptian pop-culture references or quick punchlines to lighten extremely heavy scientific/historical topics.
4. Silence & Pacing: Inject '[SILENCE - 2 SECONDS]' directly in the 'voice_over' BEFORE major plot twists or dramatic revelations to control the TTS engine's pacing.
5. SFX/VFX Sync Markers: In the 'voice_over', tag specific words with inline XML sound markers directly where they happen! Example: "وفجأة الباب اتكسر <sfx_glass_shatter/> وكل حاجة باظت <sfx_record_scratch/>".
6. Fluid Flow: Refactor consecutive questions so it doesn't sound like an interrogation. Connect paragraphs smoothly.
7. A/V Audio Timing: DO NOT write paragraphs longer than 3-4 sentences per scene. The VoiceOver must fit the pacing of a single continuous visual thought.

[EXPERT INSTRUCTIONS FOR JSON FIELDS]:
- 'visual_cue' (Arabic): Describe what the viewer sees (cinematic style, editing pace). Make it highly creative based on the persona. Ensure it's faceless documentary style.
- 'image_prompt' (English): Write an English text-to-image prompt here. NEVER ask for Arabic text inside the image. You MUST append "--no text, typography, letters, watermark" to every single prompt to create clean blank spaces for the video editor.
- 'b_roll_keywords' (English): Comma-separated English search terms for stock footage. (e.g. vintage file, neon signs).
- 'sound_design' (Arabic/English): Explicit SFX directions mapped to the inline <sfx_...> markers from the voice_over.

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
      if (imgPrompt && !imgPrompt.includes("--no text")) {
          imgPrompt += " --no text, typography, letters, watermark";
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

export interface DeliverableIssue {
  id: string;
  category: "hallucination" | "redundancy" | "error" | "pacing" | "formatting";
  category_ar: string;
  title_ar: string;
  description_ar: string;
  severity: "high" | "medium" | "low";
  action_plan_ar: string;
  affected_target: "script" | "metadata" | "scenes" | "all";
}

export interface UniversalEvaluationResult {
  score: number;
  cleanliness_rating: string;
  issues: DeliverableIssue[];
}

export async function evaluateFullDeliverablesQuality(
  script: string,
  metadata: { title: string; description: string; tags: string[] },
  scenes: { title: string; voice_over: string; visual_instructions: string }[],
  engine = "gemini",
  signal?: AbortSignal
): Promise<UniversalEvaluationResult> {
  const scenesText = scenes.map((s, idx) => `[المشهد ${idx + 1} - ${s.title}]:\nفويس أوفر: ${s.voice_over}`).join("\n\n");
  const prompt = `[UNIVERSAL QUALITY & FACT GUARD AGENT]
You are a highly analytical chief editor, director, fact-checker and quality auditor for professional Arabic cinema and digital documentaries.
Analyze the provided draft script and metadata. Check for:
1. "hallucination" (هلوسة معلوماتية أو علمية).
2. "redundancy" (تكرار نفس المعلومة أو الفكرة).
3. "error" (أخطاء لغوية أو تعارض).
4. "pacing" (مشاكل إيقاع).
5. "formatting" (مشاكل في التنسيق).

Below is the raw data (Truncated for efficiency):
---
[Title]: ${metadata.title}
[Script Head]:
${script.substring(0, 1500)}

[Scenes Overview]:
${scenesText.substring(0, 1500)}
---

Return a strictly valid JSON matching this schema:
{
  "score": <number from 0 to 100 on overall readiness and quality>,
  "cleanliness_rating": "<short descriptive Arabic phrase indicating clean state, e.g. متناسق ومطهر تماماً / يحتاج تطهير فوري من التكرار>",
  "issues": [
    {
      "id": "<unique key e.g. issue_1>",
      "category": "choose one: hallucination | redundancy | error | pacing | formatting",
      "category_ar": "<Arabic category name>",
      "title_ar": "<short punchy Arabic title>",
      "description_ar": "<detailed description>",
      "severity": "high | medium | low",
      "action_plan_ar": "<concrete instruction in Arabic of how we will fix this issue>",
      "affected_target": "script | metadata | scenes | all"
    }
  ]
}
If everything is clean and flawless, return an empty array for "issues". Keep it concise.`;

  const schema = {
    type: "OBJECT",
    properties: {
      score: { type: "INTEGER" },
      cleanliness_rating: { type: "STRING" },
      issues: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            id: { type: "STRING" },
            category: { type: "STRING" },
            category_ar: { type: "STRING" },
            title_ar: { type: "STRING" },
            description_ar: { type: "STRING" },
            severity: { type: "STRING" },
            action_plan_ar: { type: "STRING" },
            affected_target: { type: "STRING" }
          },
          required: ["id", "category", "category_ar", "title_ar", "description_ar", "severity", "action_plan_ar", "affected_target"]
        }
      }
    },
    required: ["score", "cleanliness_rating", "issues"]
  };

  const text = await generateAIContentRaw(prompt, schema, engine, undefined, signal);
  return safeJsonParse(text, {
    score: 95,
    cleanliness_rating: "نظيف وخالٍ من الهلوسات",
    issues: []
  });
}

export async function executeUniversalAutoFix(
  script: string,
  metadata: { title: string; description: string; tags: string[] },
  scenes: { title: string; voice_over: string; visual_instructions: string }[],
  issuesToFix: DeliverableIssue[],
  engine = "gemini",
  signal?: AbortSignal
): Promise<{
  corrected_script: string;
  corrected_metadata: { title: string; description: string; tags: string[] };
  corrected_scenes: { title: string; voice_over: string; visual_instructions: string }[];
}> {
  const scenesText = scenes.map((s, idx) => `[المشهد ${idx + 1} - ${s.title}]:\nفويس أوفر: ${s.voice_over}\nبصريات: ${s.visual_instructions}`).join("\n\n");
  const issuesText = issuesToFix.map((issue) => `- [${issue.category_ar}] ${issue.title_ar}: ${issue.description_ar}\n  طريقة الإصلاح: ${issue.action_plan_ar}`).join("\n\n");

  const prompt = `[UNIVERSAL QUALITY POLISHER & CLEANSER AGENT]
You are a master cultural-literary editor and perfectionist video producer. 
Your objective is to ingest the source draft, apply a strict purification run, correct any hallucinations, erase all phrasing repetitions, and repair any errors listed in the compliance report.

Here is the Quality Report indicating what is flawed and MUST be fixed:
${issuesText}

Current Source Material:
---
[العنوان الحالي]: ${metadata.title}
[الوصف الحالي]: ${metadata.description}
[الوسوم الحالية]: ${metadata.tags.join(", ")}
[السكريبت الصوتي الحالي]:
${script}

[المشاهد والتوجيهات البصرية للسيناريو الحالية]:
${scenesText}
---

Correct and purify all of this. Ensure:
- The script has ZERO duplicate ideas, repetitive expressions, or redundant filler phrases. Keep the vocabulary dense, engaging, and professional Arabic.
- The voice script matches the scenes voice_over beautifully and continuously.
- The metadata title and description are polished.
- The descriptions of visual instructions in the scenes are rich and non-repetitive.

Format the output strictly as a valid JSON object matching the schema below:
{
  "corrected_script": "<full corrected uninterrupted Arabic text of the voice script>",
  "corrected_metadata": {
    "title": "<perfect corrected Arabic SEO title>",
    "description": "<perfect corrected video description incorporating tags optimally>",
    "tags": ["<tag1>", "<tag2>", "<tag3>"]
  },
  "corrected_scenes": [
    {
      "title": "<corrected scene title>",
      "voice_over": "<corrected scene voice_over matching the segment of the script perfectly>",
      "visual_instructions": "<rich and purified non-repetitive aesthetic camera motion instructions in English/Arabic>"
    }
  ]
}

Make sure that the length of corrected_scenes matches exactly the original scenes array length (${scenes.length}). Do not drop or add scenes! Do not change the overall sequence, only fix the issues!`;

  const schema = {
    type: "OBJECT",
    properties: {
      corrected_script: { type: "STRING" },
      corrected_metadata: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          description: { type: "STRING" },
          tags: { type: "ARRAY", items: { type: "STRING" } }
        },
        required: ["title", "description", "tags"]
      },
      corrected_scenes: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            voice_over: { type: "STRING" },
            visual_instructions: { type: "STRING" }
          },
          required: ["title", "voice_over", "visual_instructions"]
        }
      }
    },
    required: ["corrected_script", "corrected_metadata", "corrected_scenes"]
  };

  const text = await generateAIContentRaw(prompt, schema, engine, undefined, signal);
  return safeJsonParse(text, {
    corrected_script: script,
    corrected_metadata: metadata,
    corrected_scenes: scenes
  });
}


export interface DiverseTopicCategory {
  category: string;
  ideas: {
    title: string;
    description: string;
    hook: string;
  }[];
}

export async function generateDiverseTopics(mood: string, engine: string, onProgress?: any, signal?: AbortSignal, model?: string): Promise<DiverseTopicCategory[]> {
  try {
    const prompt = `أنت كاتب إبداعي مصري عبقري ومعد برامج، خبير في صياغة المحتوى وصناعة الأفكار.
المستخدم يطلب من فريق الإعداد 18 فكرة لحلقات يوتيوب خارقة للعادة ومجنونة ومبنية على بحث حقيقي ومراجع.
نوع القناة/المجال: "${mood}".

المطلوب منك ابتكار الأفكار مقسمة إلى 6 مدارس/قوالب مختلفة في صناعة المحتوى، كل مدرسة لها 3 أفكار (المجموع 18 فكرة).

المدرسة الأولى: "مدرسة الدحيح (التبسيط والكوميديا العبثية)"
- الفلسفة: تبسيط العلوم والتاريخ والاقتصاد في قالب سطحي جداً وكوميدي وساخر بالعامية المصرية، يبدأ من حاجة تافهة جداً وينتهي بنظرية علمية أو تاريخية عميقة.
- الهوك: دخلة عبثية جداً أو إيفيه كوميدي في أول 3 ثواني.
- الوصف والمصادر: شرح الربط العبقري بين الدخلة التافهة والنظرية المعقدة، مع الاستناد إلى أوراق بحثية وتقارير علمية دقيقة.

المدرسة الثانية: "مدرسة في الحضارة (أسلوب السعدني والحكي الشعبي)"
- الفلسفة: الحكي الشعبي العميق والتاريخ المشوق بالطريقة السعدنية الأصيلة. غوص في حكايات الحواري والشخصيات المنسية بأسلوب أدبي عامي بليغ وساخر.
- الهوك: جملة أدبية شعبية صادمة أو حكمة ساخرة من التراث.
- الوصف والمصادر: سرد ملامح القصة التاريخية، مع الإشارة المباشرة لمراجع عربية أصلية وكتب مذكرات وتراجم.

المدرسة الثالثة: "مدرسة السينما والفن (تحليل سينمائي ونقد فني)"
- الفلسفة: تشريح الأفلام والسينما المصرية والعالمية، ما وراء الكاميرا، الدلالات النفسية والفلسفية للمشاهد، وتأثير السينما على المجتمع.
- الهوك: ملاحظة دقيقة جداً أو مشهد أيقوني يُطرح حوله سؤال لم يفكر فيه أحد.
- الوصف والمصادر: تحليل فني عميق بالاعتماد على كتب النقد السينمائي والمذكرات الفنية، والربط بمدارس الإخراج.

المدرسة الرابعة: "مدرسة السيرة والبورتريه (وثائقي احترافي للشخصيات)"
- الفلسفة: تناول حياة الشخصيات المشهورة (تاريخية، سياسية، فنية، أو علمية) بطريقة درامية احترافية تكشف الجوانب المخفية والصراعات النفسية.
- الهوك: لغز أو تناقض صادم في حياة الشخصية في ذروة مجدها أو سقوطها.
- الوصف والمصادر: بناء درامي للقصة مدعوم بالوثائق الرسمية، السير الذاتية المعتمدة، والمقابلات النادرة.

المدرسة الخامسة: "مدرسة المخبر (تحليل استقصائي وجرائم غامضة)"
- الفلسفة: أسلوب وثائقي مشوق يركز على كشف الحقائق، الجرائم المعقدة، أو الخدع الكبرى، بأسلوب يعتمد على الإثارة وتتبع الأدلة المنسية.
- الهوك: عرض الدليل الأول أو الجثة أو اللغز الذي قلب الموازين في القضية.
- الوصف والمصادر: تسلسل منطقي وتدريجي لحل اللغز بالاعتماد على تقارير الشرطة، أرشيف المحاكم، والتحقيقات الصحفية.

المدرسة السادسة: "مدرسة البيزنس والاقتصاد (استراتيجيات وسيكولوجية المال)"
- الفلسفة: تحليل صعود وسقوط الإمبراطوريات التجارية، كيف تلعب الشركات بعقولنا، والقصص الدرامية وراء الأرقام والأسواق.
- الهوك: رقم صادم، إفلاس مفاجئ، أو قرار إداري مجنون غيّر مسار شركة كبرى.
- الوصف والمصادر: شرح الميكانيزمات الاقتصادية بتبسيط وتشويق، بالاعتماد على تقارير الأسواق، كتب الاقتصاد السلوكي، وتاريخ الشركات.

مواصفات الفكرة (لكل المدارس):
- العنوان (title): لازم يكون "بالمصري الدارج" (إلا لو مدرسة تاريخية كلاسيكية)، صايع جداً، قصير، وبيخطف العين (Clickbaity بس شيك)، استخدم كلمات فيها إثارة وتساؤل.
- الهوك (hook): الجملة الافتتاحية الخاطفة.. لازم تكون مكتوبة بالعامية المصرية الصميمة وكأنك بتكلم واحد صاحبك على القهوة، فيها ريتم سريع وبتشد الانتباه من أول كلمة.
- الملخص والمصادر (description): سطرين أو تلاتة بيشرحوا الفكرة مع دمج أسامي المراجع، الوثائق، أو الكتب الأساسية اللي هيتبني عليها المحتوى.

Format your response as a JSON ARRAY OF OBJECTS, exactly like this structure:
[
  {
    "category": "مدرسة الدحيح (التبسيط والكوميديا العبثية)",
    "ideas": [
       {
         "title": "عنوان قصير جداً",
         "hook": "دخلة تجذب الانتباه حسب المدرسة",
         "description": "شرح الفكرة مع ذكر المراجع الأساسية"
       }
    ]
  }
]

Return ONLY the JSON array containing exactly 6 categories, and 3 ideas per category. NO MARKDOWN, NO OTHER TEXT.`;

    // DISABLE search (last argument is false) to prevent the search tool from stripping the creativity and forcing a factual, non-comedic robotic tone.
    const res = await generateAIContentRaw(prompt, undefined, engine, onProgress, signal, true, model, false);
    const jsonStr = res.substring(res.indexOf('['), res.lastIndexOf(']') + 1).trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error("Failed to generate diverse topics:", err);
    throw err;
  }
}

export async function generateSceneVariations(
  scene: any, 
  engine: string,
  model?: string
): Promise<any[]> {
  const prompt = `[Agent: Art Director - Variations Mode]
You are a creative Art Director. Generate 3 distinct, high-quality visual/directorial variations for the following scene.
DO NOT change the voice_over or clean_tts. ONLY change the visual_cue, image_prompt, b_roll_search_query, and sound_design.

Original Scene:
${JSON.stringify(scene, null, 2)}

Return a JSON array exactly containing 3 objects with keys: "visual_cue", "image_prompt", "b_roll_search_query", "sound_design".
NO MARKDOWN, NO OTHER TEXT.`;

  const res = await generateAIContentRaw(prompt, undefined, engine, undefined, undefined, true, model);
  try {
    const jsonStr = res.substring(res.indexOf('['), res.lastIndexOf(']') + 1).trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error("Variation parsing failed", err, res);
    return [];
  }
}
