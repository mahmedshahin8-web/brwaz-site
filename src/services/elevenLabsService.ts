export async function generateElevenLabsAudio(
  text: string, 
  apiKey: string, 
  voiceId: string
): Promise<Blob> {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId || 'JBFqnCBsd6RMkjVDRZzb'}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.35,
        similarity_boost: 0.85,
        style: 0.80,
        use_speaker_boost: true
      }
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail?.message || err.detail || 'Failed to generate audio from ElevenLabs');
  }

  return await response.blob();
}
