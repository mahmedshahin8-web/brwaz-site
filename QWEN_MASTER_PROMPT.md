# MASTER PROMPT FOR QWEN 3.5: "BARWAZ" CONTENT STUDIO REBUILD

أنت الآن مهندس برمجيات متقدم (Senior Full-Stack AI Engineer) بمستوى رفيع. مهمتك هي إعادة بناء تطبيق الويب "برواز" (Barwaz) من الصفر باستخدام (React + TypeScript + Vite + Tailwind CSS).
هذا التطبيق ليس مجرد واجهة عادية، بل هو "محرك إنتاج محتوى استقصائي وثائقي" يستخدم الذكاء الاصطناعي لتوليد حلقات يوتيوب كاملة (سكريبت، مونتاج، بحث جنائي، برومبتات صور) باللهجة المصرية الراقية (بأسلوب برنامج الدحيح).

يجب عليك قراءة هذا الدليل الهندسي بالكامل قبل كتابة أي كود واستيعاب كافة القواعد، الهياكل، واللوجيك.

---

## 1. التكنولوجيا المستخدمة (Tech Stack)
- **Frontend:** React 18, TypeScript, Vite.
- **Styling:** Tailwind CSS (بألوان مخصصة للأرشيف والمخابرات).
- **Icons & Animation:** `lucide-react`, `framer-motion`.
- **AI SDK:** `@google/genai` (Gemini API) مع التركيز على التعامل مع `structured output` و `JSON parsing` الآمن.
- **State Management:** React hooks (`useState`, `useReducer` أو `Zustand` إن تطلب الأمر للملفات الكبيرة).

---

## 2. هندسة النظام والبيانات (System Architecture & Types)
التطبيق يعمل بنظام "الأنابيب" (Pipeline/Nodes). المخرجات من كل عقدة (Node) تُسلم للتي تليها.
إليك النماذج البيانية التي يجب أن تبنيها `src/types.ts`:

```typescript
// 1. هيكل البحث (Dossier)
export interface OsintDossier {
  topic: string;
  executive_summary: string;
  timeline: { date_or_period: string; event_description: string; impact: string }[];
  key_entities: { name: string; role: string; background: string }[];
  core_conflict_or_mystery: string;
  verified_facts: string[];
  hidden_patterns_or_contradictions: string[];
  historical_visual_anchors: string[]; // عناصر بصرية يمكن استخدامها لتوليد الصور
  sources: { title: string; url: string; credibility_score?: number; key_takeaway: string }[];
}

// 2. الهيكل الدرامي والمشاهد (Scenes)
export interface EpisodeScene {
  asset_id: string; // e.g. Scene_01
  voice_over: string; // السرد باللهجة المصرية
  visual_cue: string; // ماذا نرى على الشاشة
  montage_instructions: string; // إيقاع المونتاج (سريع، بطيء، الخ)
  sound_design: string; // المؤثرات الصوتية المطلوبة
  image_prompt_nano_banana: string; // Prompt انجليزي لميدجورني (بدون وجوه)
  ai_video_prompt: string; // Prompt انجليزي لرانواي أو سورا
  b_roll_keywords?: string;
  estimated_duration_seconds?: number;
}

// 3. التغليف والنشر (Packaging)
export interface Node3Packaging {
  youtube_metadata: {
    seo_title: string;
    clickbait_title: string;
    description_daheeh_style: string;
    tags: string[];
  };
  shorts_ideas: {
    hook: string;
    core_message: string;
    cta: string;
  }[];
}
```

---

## 3. محرك الجيل والتسلسل (The Orchestrator Nodes)
يجب بناء ملف `src/lib/gemini.ts` بدوال منفصلة تتعامل مع الـ API بنمط (Retry Mechanism + Fallback) للتأكد من سلامة الـ JSON:

- **Node 0 (OSINT):** تبحث الموديل عن مصادر حقيقية، أرقام، تواريخ وتحللها. تستخرج التناقضات وتولد `OsintDossier`. (إذا كانت الموديل تدعم Google Search Grounding، نستخدمها).
- **Node 1 (Story Architect):** تأخذ الـ Dossier والمدة المطلوبة وتولد هيكل الحلقة (كم مشهد، وكل مشهد دقيقة، ما هي فكرته الرئيسية).
- **Node 2 (Master Scriptwriter):** (التحدي الأكبر) تأخذ الهيكل، وتكتب السرد **بالعامية المصرية**. يجب استدعاء محرك حماية الهوية (Identity Guard) لتنظيف النص من كليشيهات الـ AI. يكتب توجيهات إخراج وبرومبتات إنجليزية.
- **Node 3 (Packaging):** يولد العناوين والأفكار للمقاطع القصيرة.

---

## 4. نظام حماية الهوية والأسلوب (Identity Guard & Core) **[حرج جداً]**
هذا ما يميز التطبيق عن أي GPT عادي. الذكاء الاصطناعي يميل للتحدث كروبوت فصحى ("لقد لاحظنا"، "في الختام").
يجب إنشاء `src/core/identity/identityGuard.ts`:

- **المحظورات (Forbidden Phrases):** يجب منع (أو استبدال عبر Regex): "في الختام", "نستنتج أن", "أود التأكيد", "نتيجة لذلك", "من المهم أن نلاحظ", "في النهاية".
- **البدائل (Replacements):** تستبدل بـ: "خلاصة القصة دي", "علشان كده نقدر نقول", "تخيل كده", "طب إزاي", "خليني أقولك".
- **قواعد الـ Prompts المرسلة للموديل:** يجب أن يكون هناك System Prompt صارم يهدد الموديل بعدم استخدام الفصحى الركيكة، ويأمره باستخدام مصطلحات (يا باشا، تخيل، بص يا سيدي، إيه الحكاية).

---

## 5. الحماية البصرية (Faceless Rule)
تم بناء قاعدة قوية لمنع تشوه الـ AI عند رسم البشر. في تعليمات الـ Node 2، يجب أن تنص بوضوح:
*"ممنوع منعاً باتاً ظهور أي وجوه بشرية، أيدي، أو شخصيات حقيقية في الـ Image Prompts. استخدم دائماً تعبيرات سينمائية غير مباشرة: خيال (Silhouette)، أوراق متناثرة، دخان كثيف، خرائط قديمة، دماء مسكوبة على مكتب، شاشات كمبيوتر بها أكواد، إضاءة نيون خلفية. يجب أن تبدأ دائماً بكلمات مثل Cinematic, Macro shot."*

---

## 6. الـ 23 تصنيفًا للمزاج والأسلوب (Moods & DNA)
يجب بناء ملف `src/core/config/dna.ts` يحتوي على مصفوفة للمودات، ولكل مود `Research Angle` و `Visual Style` خاص يمرر للـ Prompt:
1. أرشيف الضلمة 2. كلاكيت وتزوير 3. ملفات متقفلش 4. خرافات شعبية 5. حكاوي الأجداد 6. سبوبة ولا ابتكار 7. حواديت شوارع 8. صراع العروش العربي 9. تكنولوجيا مرعبة 10. اقتصاد الشارع 11. ملفات مخابراتية 12. طريقة الدحيح 13. خرائط دموية (Faceless) 14. سبورة بيضاء (Whiteboard) 15. ميمز ومقاطع (Faceless) 16. رحلة في عقل مجرم 17. المستقبل الديسطوبي 18. محاكمة التاريخ 19. اقتصاد البقاء 20. جبل الجليد (Iceberg) 21. همس الحكايات (Dark ASMR) 22. شريط ملعون (Found Footage) 23. مسافر عبر الزمن.

---

## 7. واجهة المستخدم وتجربة المستخدم (UI/UX)
- **الألوان:** 
  - خلفية داكنة (Dark/Charcoal).
  - لون رئيسي (Burgundy/Crimson Red) للمسة التحقيقات والإثارة.
  - لون النصوص الثانوية (Vintage Paper/Off-white).
- **الصفحة الرئيسية (`ContentCreationPage.tsx`):**
  يجب أن تُقسم إلى Stepper أو مسار (Pipeline UI):
  1. **غرفة الأخبار:** إدخال الفكرة، اختيار الـ Mood، والمدة (1 - 30 دقيقة).
  2. **بناء الملف السري (Dossier Loading & View):** عرض الـ loader بشكل مثير ("يتم التنقيب في الأرشيف...", "يتم البحث عن التناقضات...")، ثم عرض الـ Timeline والـ Entities في كروت.
  3. **استوديو الإنتاج (Script & Scenes):** عرض المشاهد المتولدة بشكل كروت (كل كرت يحتوي على السرد الصوتي، البرومبتات البصرية مع زر لنسخها للحافظة، ووصف المونتاج).
  4. **العرض النهائي (Export):** تفريغ المعلومات وتجهز زر لتحميل الكل في ملف ZIP واحد أو بصيغة Text.

---

## 8. خريطة التنفيذ لـ Qwen (Execution Plan)
عندما تبدأ في كتابة الكود، أرجو اتباع هذا الترتيب الاستراتيجي خطوة بخطوة (لا تحاول كتابة كل شيء في ملف واحد):

**الخطوة الأولى:** إعداد الـ Types والـ Configuration.
(كتابة `types.ts`, `dna.ts`, `identityGuard.ts`).

**الخطوة الثانية:** هندسة خدمات الـ AI (The Brain).
(كتابة دوال الاتصال في `gemini.ts` أو `agents.ts` مع وضع الـ System Prompts المعقدة وتطبيق الـ JSON Parsing السليم واستدعاء الـ IdentityGuard).

**الخطوة الثالثة:** مكونات الواجهة (Reusable Components).
(بناء كارد المشهد العتيق، كارد الملف السري، والـ Loaders الأنيقة بـ Tailwind و Framer Motion).

**الخطوة الرابعة:** الصفحة الرئيسية (The Orchestrator View).
(بناء مسار العمل، إدارة الـ State المعقدة للـ `isGenerating` لكل Node على حدة، وعرض النتائج بالتسلسل).

---
**رسالة أخيرة للنموذج (Qwen):**
التفاصيل تصنع الفارق. لا تتهاون في حماية اللهجة في السكريبت، ولا تتهاون في شكل الواجهة. أريد تصميماً احترافياً، وكوداً نظيفاً (Clean Code) يمكن توسعته مستقبلاً لمئات المودات الأخرى. ابدأ العمل كمهندس معماري وضع الأساسات أولاً!
