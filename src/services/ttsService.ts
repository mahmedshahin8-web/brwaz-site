export interface TTSConfig {
  engine: "browser" | "openai" | "xtts";
  apiUrl: string;
  voiceId?: string;
  speed?: number;
}

export const defaultTTSConfig: TTSConfig = {
  engine: "browser",
  apiUrl: "http://localhost:8080/v1/audio/speech",
  voiceId: "alloy", // For OpenAI compatible
  speed: 1.0,
};

export function getTTSConfig(): TTSConfig {
  const stored = localStorage.getItem("barwaz_tts_config");
  if (stored) {
    try {
      return { ...defaultTTSConfig, ...JSON.parse(stored) };
    } catch (e) { }
  }
  return defaultTTSConfig;
}

export function saveTTSConfig(config: TTSConfig) {
  localStorage.setItem("barwaz_tts_config", JSON.stringify(config));
}

// Map HTMLAudioElement so we can stop it globally if needed
let currentAudio: HTMLAudioElement | null = null;

export async function stopTTS() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
}

export async function generateTTSBlob(text: string): Promise<Blob | null> {
  const config = getTTSConfig();

  if (config.engine === "browser") {
    return null; // Browser speech synthesis doesn't produce a blob.
  }

  if (config.engine === "openai") {
    try {
      const res = await fetch(config.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "tts-1",
          input: text,
          voice: config.voiceId || "alloy",
          speed: config.speed || 1.0,
        }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.blob();
    } catch (e) {
      console.error("OpenAI TTS fetch failed:", e);
      throw e;
    }
  }

  if (config.engine === "xtts") {
    try {
      const url = new URL(config.apiUrl);
      url.searchParams.append("text", text);
      url.searchParams.append("language", "ar");
      if (config.voiceId) {
         url.searchParams.append("speaker_wav", config.voiceId);
      }

      const res = await fetch(url.toString(), {
        method: "GET",
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.blob();
    } catch (e) {
      console.error("XTTS fetch failed:", e);
      throw e;
    }
  }

  return null;
}

export async function generateAndPlayTTS(text: string, onEnd?: () => void): Promise<void> {
  const config = getTTSConfig();
  await stopTTS();

  if (config.engine === "browser") {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ar-EG";
      utterance.rate = config.speed || 1.0;
      utterance.onend = () => {
        if (onEnd) onEnd();
        resolve();
      };
      window.speechSynthesis.speak(utterance);
    });
  }

  const blob = await generateTTSBlob(text);
  if (blob) {
    return playAudioBlob(blob, onEnd);
  } else {
    if (onEnd) onEnd();
  }
}

function playAudioBlob(blob: Blob, onEnd?: () => void): Promise<void> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    currentAudio = audio;
    
    audio.onended = () => {
      URL.revokeObjectURL(url);
      currentAudio = null;
      if (onEnd) onEnd();
      resolve();
    };
    
    audio.onerror = (e) => {
      console.error("Playback error", e);
      URL.revokeObjectURL(url);
      currentAudio = null;
      if (onEnd) onEnd();
      resolve();
    };

    audio.play().catch(e => {
        console.error("Play failed", e);
        if (onEnd) onEnd();
        resolve();
    });
  });
}
