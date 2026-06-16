export class TaskQueue {
  private queue: Array<() => Promise<void>> = [];
  private isProcessing: boolean = false;
  private currentAbortController: AbortController | null = null;
  
  constructor(private delayBetweenTasksMs: number = 0) {}

  public async add<T>(task: () => Promise<T>, signal?: AbortSignal): Promise<T> {
    return new Promise((resolve, reject) => {
      
      const execute = async () => {
        if (signal?.aborted) {
          reject(new DOMException("Task aborted before execution", "AbortError"));
          return;
        }

        const abortListener = () => {
           reject(new DOMException("Task aborted", "AbortError"));
        };
        
        if (signal) {
          signal.addEventListener("abort", abortListener);
        }

        try {
          const result = await task();
          if (signal?.aborted) {
              reject(new DOMException("Task aborted during execution", "AbortError"));
          } else {
              resolve(result);
          }
        } catch (error) {
          reject(error);
        } finally {
          if (signal) {
            signal.removeEventListener("abort", abortListener);
          }
        }
      };

      this.queue.push(execute);
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        try {
          await task();
        } catch (error) {
          console.error("Queue task failed:", error);
        }
        
        if (this.queue.length > 0 && this.delayBetweenTasksMs > 0) {
          await new Promise(r => setTimeout(r, this.delayBetweenTasksMs));
        }
      }
    }

    this.isProcessing = false;
  }

  public clear() {
    this.queue = [];
  }
}

// Global queue for ollama to prevent overloading the GPU
// Set to strict sequential (concurrency: 1) mode
// Delay of 2000ms between typical tasks to flush VRAM
export const ollamaQueue = new TaskQueue(2000);
