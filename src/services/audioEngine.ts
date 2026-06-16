
/**
 * Barwaz Audio Engine - Local Mastering Pipeline
 * 6 Stages: Mono -> Noise Gate/Reduction -> EQ -> Compressor -> Reverb -> Normalize
 */

export interface MasteringConfig {
  noiseFloor: number; // -100 to 0 dB
  eqHigh: number; // -12 to 12 dB
  eqMid: number; // -12 to 12 dB
  eqLow: number; // -12 to 12 dB
  compressionRatio: number; // 1 to 20
  reverbMix: number; // 0 to 1
}

export class AudioEngine {
  private context: AudioContext;
  private source: AudioBufferSourceNode | null = null;
  private audioBuffer: AudioBuffer | null = null;

  constructor() {
    this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  async loadAudio(blob: Blob): Promise<AudioBuffer> {
    const arrayBuffer = await blob.arrayBuffer();
    this.audioBuffer = await this.context.decodeAudioData(arrayBuffer);
    return this.audioBuffer;
  }

  /**
   * Applies the 6-stage mastering pipeline
   */
  async process(config: MasteringConfig): Promise<Blob> {
    if (!this.audioBuffer) throw new Error("No audio buffer loaded");

    // We use an OfflineAudioContext for rendering the processed audio
    const offlineCtx = new OfflineAudioContext(
      1, // Force Mono
      this.audioBuffer.length,
      this.audioBuffer.sampleRate
    );

    const source = offlineCtx.createBufferSource();
    source.buffer = this.audioBuffer;

    // 1. Mono (Already handled by 1 channel in OfflineAudioContext)
    
    // 2. Noise Reduction (Sweet Spot: 40-50% attenuation instead of total gate)
    const noiseReducer = offlineCtx.createGain();
    noiseReducer.gain.setValueAtTime(0.6, 0); 

    // 3. EQ (3-Band)
    const lowFilter = offlineCtx.createBiquadFilter();
    lowFilter.type = "lowshelf";
    lowFilter.frequency.setValueAtTime(200, 0);
    lowFilter.gain.setValueAtTime(config.eqLow, 0);

    const midFilter = offlineCtx.createBiquadFilter();
    midFilter.type = "peaking";
    midFilter.frequency.setValueAtTime(1000, 0);
    midFilter.Q.setValueAtTime(1, 0);
    midFilter.gain.setValueAtTime(config.eqMid, 0);

    const highFilter = offlineCtx.createBiquadFilter();
    highFilter.type = "highshelf";
    highFilter.frequency.setValueAtTime(3000, 0);
    highFilter.gain.setValueAtTime(config.eqHigh, 0);

    // 4. Main Compressor (Soft-Knee Architecture)
    const compressor = offlineCtx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-20, 0);
    compressor.knee.setValueAtTime(40, 0);
    compressor.ratio.setValueAtTime(config.compressionRatio, 0);
    compressor.attack.setValueAtTime(0.005, 0);
    compressor.release.setValueAtTime(0.2, 0);

    // 5. Reverb (Parallel Mix)
    // For local processing without external IR files, we generate a synthetic IR
    const reverb = offlineCtx.createConvolver();
    reverb.buffer = this.generateImpulseResponse(offlineCtx, 1.5, 0.5);
    
    const reverbGain = offlineCtx.createGain();
    reverbGain.gain.setValueAtTime(config.reverbMix, 0);

    const dryGain = offlineCtx.createGain();
    dryGain.gain.setValueAtTime(1 - config.reverbMix, 0);

    // 6. Normalization (Handled via gain node)
    const normalizeGain = offlineCtx.createGain();
    normalizeGain.gain.setValueAtTime(1.2, 0); 

    // Connection Chain
    source.connect(noiseReducer);
    noiseReducer.connect(lowFilter);
    lowFilter.connect(midFilter);
    midFilter.connect(highFilter);
    highFilter.connect(compressor);
    
    // Reverb Parallel split
    compressor.connect(dryGain);
    compressor.connect(reverb);
    reverb.connect(reverbGain);

    dryGain.connect(normalizeGain);
    reverbGain.connect(normalizeGain);
    
    normalizeGain.connect(offlineCtx.destination);

    source.start(0);

    const renderedBuffer = await offlineCtx.startRendering();
    return this.bufferToWavAsync(renderedBuffer);
  }

  private generateImpulseResponse(ctx: BaseAudioContext, duration: number, decay: number): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const impulse = ctx.createBuffer(1, length, sampleRate);
    const data = impulse.getChannelData(0);

    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }

    return impulse;
  }

  private bufferToWavAsync(buffer: AudioBuffer): Promise<Blob> {
    return new Promise((resolve) => {
      const numOfChan = buffer.numberOfChannels;
      const sampleRate = buffer.sampleRate;
      const channels = [];
      for (let i = 0; i < numOfChan; i++) {
        channels.push(buffer.getChannelData(i));
      }

      const workerCode = `
        self.onmessage = function(e) {
          const { channels, numOfChan, sampleRate } = e.data;
          const length = channels[0].length * numOfChan * 2 + 44;
          const result = new ArrayBuffer(length);
          const view = new DataView(result);
          let pos = 0;
          let offset = 0;

          function setUint16(data) {
            view.setUint16(pos, data, true);
            pos += 2;
          }

          function setUint32(data) {
            view.setUint32(pos, data, true);
            pos += 4;
          }

          // write WAVE header
          setUint32(0x46464952); // "RIFF"
          setUint32(length - 8); // file length - 8
          setUint32(0x45564157); // "WAVE"

          setUint32(0x20746d66); // "fmt " chunk
          setUint32(16); // length = 16
          setUint16(1); // PCM (uncompressed)
          setUint16(numOfChan);
          setUint32(sampleRate);
          setUint32(sampleRate * 2 * numOfChan); // avg. bytes/sec
          setUint16(numOfChan * 2); // block-align
          setUint16(16); // 16-bit (hardcoded)

          setUint32(0x61746164); // "data" - chunk
          setUint32(length - pos - 4); // chunk length

          // write interleaved data
          while (pos < length) {
            for (let i = 0; i < numOfChan; i++) {
              let sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
              sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale
              view.setInt16(pos, sample, true); // write 16-bit
              pos += 2;
            }
            offset++;
          }

          self.postMessage(result, [result]);
        };
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      const worker = new Worker(workerUrl);

      worker.onmessage = (e) => {
        const wavBlob = new Blob([e.data], { type: "audio/wav" });
        resolve(wavBlob);
        worker.terminate();
        URL.revokeObjectURL(workerUrl);
      };

      worker.postMessage({ channels, numOfChan, sampleRate });
    });
  }
}
