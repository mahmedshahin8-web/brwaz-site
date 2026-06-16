
import * as Comlink from 'comlink';

type AudioWorkerType = typeof import('../workers/audioWorker').audioWorkerMethods;

const worker = new Worker(new URL('../workers/audioWorker.ts', import.meta.url), { type: 'module' });
const audioWorker = Comlink.wrap<AudioWorkerType>(worker);

export async function convertToEgyptian(text: string): Promise<string> {
  return await audioWorker.convertToEgyptian(text);
}

export async function extractAndCleanScript(rawText: string): Promise<string> {
  return await audioWorker.extractAndCleanScript(rawText);
}

