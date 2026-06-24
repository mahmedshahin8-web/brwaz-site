const fs = require('fs');

let content = fs.readFileSync('src/lib/gemini.ts', 'utf8');

content = content.replace(
  'export async function callWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000, signal?: AbortSignal): Promise<T> {',
  'export async function callWithRetry<T>(fn: () => Promise<T>, retries = 5, delay = 2500, signal?: AbortSignal): Promise<T> {'
);

content = content.replace(
  `} catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, delay));`,
  `} catch (e) {
      if (i === retries - 1) throw e;
      // Exponential backoff for 503s
      await new Promise(r => setTimeout(r, delay * Math.pow(1.5, i)));`
);

fs.writeFileSync('src/lib/gemini.ts', content);
