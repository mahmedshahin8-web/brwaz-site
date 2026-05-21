import { useEffect, useRef } from 'react';

export function useTacticalSound() {
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize audio context on first user interaction if needed, 
    // but we'll try to get it ready.
    const init = () => {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };
    window.addEventListener('mousedown', init);
    return () => window.removeEventListener('mousedown', init);
  }, []);

  const playClick = () => {
    if (!audioContext.current) return;
    const ctx = audioContext.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(1500, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.05);

    gainNode.gain.setValueAtTime(0.02, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.05);
  };

  const playHover = () => {
    if (!audioContext.current) return;
    const ctx = audioContext.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.02);

    gainNode.gain.setValueAtTime(0.005, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.02);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.02);
  };

  const startHum = () => {
    if (!audioContext.current) return;
    const ctx = audioContext.current;

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.5, ctx.currentTime);
    lfoGain.gain.setValueAtTime(2, ctx.currentTime);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(50, ctx.currentTime);

    gain.gain.setValueAtTime(0.002, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    lfo.start();
    
    return () => {
      osc.stop();
      lfo.stop();
    };
  };

  const startFilmReel = () => {
    if (!audioContext.current) return;
    const ctx = audioContext.current;
    
    // Simulate film reel ticking
    const bufferSize = ctx.sampleRate * 0.05; // 50ms buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.01));
    }

    const interval = setInterval(() => {
        if (!audioContext.current) return;
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.015, ctx.currentTime);
        source.connect(gain);
        gain.connect(ctx.destination);
        source.start();
    }, 120); // 120ms between ticks roughly 8fps sound

    // Add some background vinyl noise
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const nData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < nData.length; i++) {
        nData[i] = (Math.random() * 2 - 1);
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 800;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.003, ctx.currentTime);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSource.start();

    return () => {
        clearInterval(interval);
        noiseSource.stop();
    };
  };

  return { playClick, playHover, startHum, startFilmReel };
}
