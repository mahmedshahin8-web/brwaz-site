const fetch = require('node-fetch');

(async () => {
    try {
        const response = await fetch("http://localhost:3000/api/ai/generate", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: `[Agent: رئيس فريق إعداد برنامج (الدحيح)]
أنت صانع أفكار عبقري ومعد برامج يوتيوب (تحديداً بطريقة أحمد الغندور "الدحيح").
الفلسفة الأساسية لبرنامج الدحيح هي: "تبسيط العلوم والتاريخ والاقتصاد في قالب كوميدي، يبدأ من شيء تافه أو يومي جداً، وينتهي بتفسير علمي عميق يغير نظرتك للكون".

المطلوب:
1. ابتكر 4 تصنيفات (Categories) مجنونة وذكية.
2. تحت كل تصنيف، ابتكر 4 أفكار حلقات (بإجمالي 16 فكرة).

Format your response as a JSON ARRAY OF OBJECTS, exactly like this structure:
[
  {
    "category": "اسم",
    "ideas": [
       {
         "title": "عنوان",
         "hook": "دخلة",
         "description": "شرح"
       }
    ]
  }
]
Return ONLY the JSON array. NO MARKDOWN, NO OTHER TEXT.`,
                systemInstruction: "You are a professional Edutainment Producer and content strategist.",
                engine: "gemini",
                stream: true,
                enableSearch: true
            })
        });
        
        console.log("Status:", response.status);
        const body = await response.text();
        console.log("Body length:", body.length);
        console.log("Body snippet:", body.substring(0, 500));
        
    } catch (e) {
        console.error("Caught error:", e);
    }
})();
