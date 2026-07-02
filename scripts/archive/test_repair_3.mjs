import { jsonrepair } from 'jsonrepair';

const str = `{
  "scenes": [
    {
      "clean_tts": "عشان أرسمها سينمائياً صح.",
      "voiceover_text": "[TONE: CONFIDENT] عشان أرسمها سين
      "image_prompt": "Extreme close-up, high angle, 1950s cinematic director's desk",
      "estimated_duration_seconds": 2
    }
  ]
}`;

try {
  console.log(jsonrepair(str));
} catch (e) {
  console.error("FAILED", e);
}
