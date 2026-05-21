export const CLEARANCE_LEVELS = {
  CLASSIFIED: {
    label: '[CLASSIFIED]',
    color: '#10b981', // Emerald/Green
    sound: '/sounds/ui-click-success.mp3'
  },
  TOP_SECRET: {
    label: '[TOP SECRET]',
    color: '#f59e0b', // Amber/Gold
    sound: '/sounds/ui-click-intel.mp3'
  },
  BREACH: {
    label: '[BREACH]',
    color: '#ef4444', // Red
    sound: '/sounds/ui-click-error.mp3'
  },
  SYSTEM_VOICE: {
    label: '[SYSTEM_VOICE]',
    color: '#3b82f6', // Blue
    sound: '/sounds/ui-click-voice.mp3'
  }
};

export const UI_MESSAGES = {
  SAVE_SUCCESS: "المعلومات اتأمنت في الخزنة.. كمل.",
  TREND_FOUND: "النبّاش لقى خيط جديد.. جاري التحليل.",
  GENERIC_ERROR: "في تشويش على الإشارة.. المحرك محتاج إيقاظ.",
  VOICE_GENERATING: "النبّاش بيراجع نبرة صوته.. لحظات.",
  VOICE_SUCCESS: "البصمة الصوتية جاهزة للتنفيذ.",
  FACT_CHECK_START: "جاري المراجعة في غرفة التحقيق (RAG + Web Search)...",
  FACT_CHECK_SUCCESS: "تم التوثيق والتأكد من صحة المعلومات.",
  FACT_CHECK_DISPUTED: "تم رصد تناقضات في المعلومات!",
  SCRIPT_GENERATING: "جاري تحليل المعلومات وكتابة السيناريو...",
  SCRIPT_SUCCESS: "تم كتابة السيناريو بنجاح!",
  COPY_SOURCES: "تم نسخ المصادر (جاهزة لوصف يوتيوب).",
  AUDIO_PROCESSING: "[OPERATION: AUDIO_PROCESS] // جاري تنقية الذبذبات الصوتية...",
  AUDIO_SUCCESS: "تم تحسين جودة الصوت بنجاح!",
  AUDIO_ERROR: "فشلت عملية التحسين الهندسية.. في شوشرة.",
  TITLES_MERGED: "تم دمج الزوايا المطلوبة في سياق موحد.",
  ARCHIVE_RESTORED: "تم استعادة البيانات من خزنتك المحلية.",
  DOWNLOAD_SUCCESS: "تم استخراج السكريبت الصوتي بنجاح.",
};
