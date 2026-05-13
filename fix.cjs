const fs = require('fs');
let code = fs.readFileSync('src/lib/gemini.ts', 'utf-8');

const marker1 = '  } else if (mood === "محاكمة التاريخ") {';
const index1 = code.indexOf(marker1);

const marker2 = 'export function applyGlobalStyle(prompt: string): string {';
// finding the second marker after index1
const index2 = code.indexOf(marker2, index1);

const replacement = `  } else if (mood === "محاكمة التاريخ") {
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

export function getSystemPrompt(): string {
  const currentDNA = getChannelDNA("barwaz_classic");
  return buildSystemPrompt(currentDNA);
}

const GLOBAL_IMAGE_STYLE =
  "Cinematic lighting, 8k resolution, highly detailed, masterpieces style, hyper-realistic textures, ultra photorealistic";
const GLOBAL_NEGATIVE_PROMPT = "no people, no humans, no faces, no characters, no text, no letters, no typography, no Arabic, no words, no clones, no duplicates, low quality, blurry, distorted";

`;

if (index1 !== -1 && index2 !== -1) {
  code = code.substring(0, index1) + replacement + code.substring(index2);
  fs.writeFileSync('src/lib/gemini.ts', code);
  console.log("Fixed!");
} else {
  console.log("Markers not found");
  console.log(index1, index2);
}
