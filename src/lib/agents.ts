import { callWithRetry, generateAIContentRaw, safeJsonParse, getMoodContext, getPersonaInstructions, getSystemPrompt, MoodType } from './gemini';
import { PersonaType, EpisodeScene } from '../types';

export async function executeAgent1_Scriptwriter(
  topic: string, 
  context: string,
  targetDurationMinutes: number,
  mood: MoodType,
  persona: PersonaType,
  engine: string,
  onChunk?: (text: string) => void
) {
  const personaContext = getPersonaInstructions(persona);
  const moodContext = getMoodContext(mood);
  const totalWords = targetDurationMinutes * 130;

  const prompt = `[Agent: Master Scriptwriter - Al Daheeh Style]
${getSystemPrompt()}
Persona: ${personaContext}
Mood: ${moodContext.scriptingStyle}

Task: Write the ENTIRE wildly engaging voiceover script for the episode: "${topic}".
Target length: ~${totalWords} words (to cover ${targetDurationMinutes} minutes).

Use the following OSINT framework context:
${context}

Rules (CRITICAL - DO NOT FAIL):
1. 100% EGYPTIAN DAHEEH STYLE: Write entirely in Egyptian slang (عامية مصرية دارجة). Use humor, extreme energy shifts ("بص يا سيدي", "تخيل معايا"), and sharp sarcasm. 
2. ANALOGIES: Explain dry/complex facts by comparing them to everyday Egyptian situations (e.g. riding a microbus, buying a shawarma, sitting at a local ahwa).
3. NO CLICHES: Never repeat identical transition phrases. Deliver new mind-blowing facts constantly.
4. NO SCENE NUMBERS: DO NOT write scene numbers or visual cues. ONLY VOICE OVER TEXT with [صمت درامي] and [🔊] where needed.
5. DEEP FACTS: Do not summarize. Make the viewer feel incredibly smart. Cite facts "زي ما بتقول دراسة كذا...".
6. PACING: Start with an earth-shattering hook. End with a philosophical mic-drop. 
7. Spell out numbers format.

Output strict JSON:
{
  "master_script": "The full voiceover text..."
}
`;

  return callWithRetry(async () => {
    const rawContent = await generateAIContentRaw(prompt, null, engine, onChunk);
    return safeJsonParse(rawContent, { master_script: "" }).master_script;
  });
}

export async function executeAgent2_Director(
  masterScript: string,
  engine: string,
  onChunk?: (text: string) => void
) {
  // Split master script into chunks of max 500 words to avoid JSON token limits
  const words = masterScript.split(/\s+/);
  const CHUNK_SIZE = 500;
  const scriptChunks = [];
  
  for (let i = 0; i < words.length; i += CHUNK_SIZE) {
    scriptChunks.push(words.slice(i, i + CHUNK_SIZE).join(" "));
  }

  let allScenes: any[] = [];
  
  for (let i = 0; i < scriptChunks.length; i++) {
    const prompt = `[Agent: Director/Editor]
Task: Receive a segment of the master script and divide it into logical, sequential scenes.
Account for exact 'estimated_duration_seconds' for each scene (approx 2 words per second).
Continue numbering scenes starting from index ${allScenes.length + 1}.

Master Script Segment (${i + 1}/${scriptChunks.length}):
"""
${scriptChunks[i]}
"""

Rules:
1. Divide this script segment into scenes based on narrative beats.
2. For each scene, estimate the duration in seconds.

Output strict JSON:
{
  "scenes": [
    {
      "scene_id": "string (e.g. '[Scene ${String(allScenes.length + 1).padStart(2, "0")}]')",
      "voiceover_text": "string (the exact segment from master script)",
      "voiceover_notes": "string (notes for VO artist: tone, speed, emotion)",
      "estimated_duration_seconds": number
    }
  ]
}
`;

    try {
      const rawContent = await callWithRetry(async () => {
        return await generateAIContentRaw(prompt, null, engine, onChunk);
      });
      
      const parsed = safeJsonParse(rawContent, { scenes: [] });
      // Filter out invalid/truncated scenes
      const validScenes = (parsed?.scenes || []).filter((s:any) => s && s.voiceover_text && String(s.voiceover_text).trim().length > 0);
      allScenes = [...allScenes, ...validScenes];
    } catch (err) {
      console.warn("Failed to process script chunk", i, err);
    }
  }
  
  return allScenes;
}

export async function executeAgent3_ArtDirector(
  sceneSegment: any,
  mood: MoodType,
  engine: string,
  onChunk?: (text: string) => void
) {
  const moodContext = getMoodContext(mood);
  
  const prompt = `[Agent: Art Director]
Task: Add visual directions, camera movements, and English AI Prompts to the scene.

Scene segment:
${JSON.stringify(sceneSegment, null, 2)}

Rules:
1. AI Generation Prompts MUST be in strict English.
2. NO HUMAN FACES. Apply negative prompts automatically based on the visual context:
   - For Archive/Historical: MUST append "--no people, characters, text, letters, typography, Arabic, words, clones, duplicates"
   - For Realistic/Modern: MUST append "--no illustration, cartoon, CGI look, fake plastic textures, humans, faces"
3. Mood instructions: ${moodContext.visualAudioStyle}

Output strict JSON:
{
  "camera_and_vision": "string (Arabic: description of camera and shadows, abstract)",
  "cinematic_movement": "string (Arabic: e.g. Dolly In, Parallax)",
  "visual_motif": "string (Arabic: e.g. Microfilm, glowing light)",
  "montage_instructions": "string (Arabic: speed, transitions)",
  "sound_and_sfx": "string (Arabic: ambient soundscape, ASMR)",
  "image_prompt_nano_banana": "string (ENGLISH ONLY: highly detailed prompt covering all negative rules)",
  "ai_video_prompt": "string (ENGLISH ONLY: cinematic motion prompt for Kling/Runway)",
  "b_roll_keywords": "string (ENGLISH ONLY: comma separated)"
}
`;

  return callWithRetry(async () => {
    const rawContent = await generateAIContentRaw(prompt, null, engine, onChunk);
    return safeJsonParse(rawContent, {});
  });
}
