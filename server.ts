import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API route to proxy requests
  app.post("/api/generate", async (req, res) => {
    let heartbeat: any = null;
    const controller = new AbortController();
    
    // Listen for actual connection disconnect
    req.socket.on("close", (hadError) => {
       // Also check if response is finished to avoid aborting valid completed requests
       if (!res.writableEnded) {
           controller.abort();
       }
    });

    try {
      const { model, messages, stream, format, options } = req.body;
      
      const requestBody: any = {
        model: model,
        messages: messages,
        stream: stream !== undefined ? stream : true,
      };
      
      if (options) requestBody.options = options;
      if (format) requestBody.format = format;

      if (requestBody.stream) {
        res.setHeader("Content-Type", "application/x-ndjson");
        res.setHeader("Transfer-Encoding", "chunked");
        res.flushHeaders();

        heartbeat = setInterval(() => { res.write("\n"); }, 5000);

        // Provider implementations
        const tryGemini = async () => {
            console.log("[Backend] process.env keys:", Object.keys(process.env).filter(k => k.includes("GEMINI")));
            console.log("[Backend] GEMINI_API_KEY prefix:", process.env.GEMINI_API_KEY?.substring(0, 10));
            if (!process.env.GEMINI_API_KEY) {
                throw new Error("GEMINI_API_KEY is not configured. Please check your project settings.");
            }

            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            const systemInstruction = messages.find((m: any) => m.role === "system")?.content || "";
            const userContent = messages.filter((m: any) => m.role !== "system").map((m: any) => m.content).join("\n");
            
            const isJsonRequired = format === "json" || systemInstruction.toLowerCase().includes("json");
            
            const responseStream = await ai.models.generateContentStream({
                model: "gemini-2.5-flash",
                contents: userContent,
                config: {
                systemInstruction: systemInstruction,
                responseModalities: ["TEXT"],
                responseMimeType: isJsonRequired ? "application/json" : "text/plain",
                tools: req.body.useGrounding ? [{ googleSearch: {} }] : undefined,
                }
            });

            for await (const chunk of responseStream) {
                if (chunk.text && chunk.text.trim()) {
                    res.write(JSON.stringify({ message: { content: chunk.text } }) + "\n");
                }
            }
            res.end();
        };

        const tryPollinations = async () => {
            console.log("[Backend] Using Pollinations AI (Free)...");
            
            const systemInstruction = messages.find((m: any) => m.role === "system")?.content || "";
            const userContent = messages.filter((m: any) => m.role !== "system").map((m: any) => m.content).join("\n");
            
            const reqMessages = [];
            if (systemInstruction) reqMessages.push({ role: "system", content: systemInstruction });
            reqMessages.push({ role: "user", content: userContent });

            const isJsonRequired = format === "json" || systemInstruction.toLowerCase().includes("json");
            
            const pollController = new AbortController();
            const timeoutId = setTimeout(() => pollController.abort("POLLINATIONS_TIMEOUT"), 180000); // 180 seconds timeout
            
            const abortHandler = () => {
                pollController.abort("CLIENT_ABORT");
            };
            controller.signal.addEventListener("abort", abortHandler);

            let pollResponse;
            try {
                pollResponse = await fetch("https://text.pollinations.ai/openai/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: "openai",
                        messages: reqMessages,
                        stream: true
                    }),
                    signal: pollController.signal
                });
            } finally {
                clearTimeout(timeoutId);
                controller.signal.removeEventListener("abort", abortHandler);
            }

            if (!pollResponse.ok) {
                const errText = await pollResponse.text();
                throw new Error(`Pollinations API Error: ${pollResponse.status} - ${errText}`);
            }

            const reader = pollResponse.body?.getReader();
            if (!reader) return res.end();

            const decoder = new TextDecoder("utf-8");
            let buffer = "";
            let firstChunkReceived = false;

            while (true) {
                // If it hangs while reading chunks, we also might want a timeout. But let's assume TTFB is the issue.
                const { done, value } = await reader.read();
                if (done) break;
                firstChunkReceived = true;
                
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (line.trim() === "data: [DONE]") continue;
                    if (line.startsWith("data: ")) {
                        try {
                            const parsed = JSON.parse(line.slice(6));
                            const content = parsed.choices?.[0]?.delta?.content;
                            const reasoning = parsed.choices?.[0]?.delta?.reasoning;
                            if (content) {
                                res.write(JSON.stringify({ message: { content } }) + "\n");
                            } else if (reasoning) {
                                res.write(JSON.stringify({ _heartbeat: true }) + "\n");
                            }
                        } catch (e: any) {
                            console.log("PARSE ERR:", e.message, line);
                        }
                    }
                }
            }
            res.end();
        };

        const providers = [
            { name: "Gemini", execute: tryGemini },
            { name: "Pollinations (Free)", execute: tryPollinations }
        ];

        let errorMessages = [];
        let success = false;

        for (let i = 0; i < providers.length; i++) {
            const provider = providers[i];
            console.log(`[Backend] Attempting generation using ${provider.name}...`);
            
            try {
                await provider.execute();
                success = true;
                break; // Stop trying if successful
            } catch (err: any) {
                const isClientAbort = controller.signal.aborted || err === "CLIENT_ABORT";
                if (isClientAbort) {
                    console.log(`[Backend] Request aborted by client during ${provider.name}`);
                    return; // exit the loop and route
                }

                let friendlyMessage = err.message || err;
                if (err.message?.includes("API key not valid") || err.message?.includes("API_KEY_INVALID")) {
                    friendlyMessage = "يبدو أنك قمت بإضافة مفتاح غير صالح يدوياً في الإعدادات. ليعمل التطبيق طبيعياً وبدون أي مفاتيح، يرجى فتح الإعدادات ومسح المفتاح بالكامل وسيعمل تلقائياً.";
                } else if (err.status === 429 || err.message?.includes("429") || err.message?.includes("quota")) {
                    friendlyMessage = "استنفاد الحصة المجانية أو الضغط الزائد.";
                } else if (err.message?.includes("is not configured")) {
                    friendlyMessage = "المفتاح غير معدّ. يرجى إضافته في إعدادات البيئة أدناه.";
                }

                console.error(`[Backend] ${provider.name} failed:`, friendlyMessage);
                errorMessages.push(`• ${provider.name}: ${friendlyMessage}`);
                
                if (i < providers.length - 1) {
                    const isAuthError = err.message?.includes("API key not valid") || err.message?.includes("not configured") || err.message?.includes("API_KEY_INVALID");
                    if (!isAuthError) {
                        console.log(`[Backend] Waiting 3 seconds before trying next provider fallback...`);
                        await new Promise(resolve => setTimeout(resolve, 3000));
                    }
                }
            }
        }

        if (!success) {
            clearInterval(heartbeat);
            res.write(JSON.stringify({ 
                _proxy_error: true, 
                status: 500, 
                error: `عذراً، تشغيل المزود فشل:\n\n${errorMessages.join("\n")}` 
            }) + "\n");
            res.end();
        } else {
            clearInterval(heartbeat);
        }
      } else {
         // We handle Non-streaming similarly...
         if (!res.headersSent) {
             return res.status(500).json({ _proxy_error: true, error: "Only streaming is supported currently for dual fallback." });
         }
      }
    } catch (error: any) {
      if (heartbeat) clearInterval(heartbeat);
      
      const isAbortError = 
        error.name === "AbortError" || 
        error.message?.toLowerCase().includes("abort") ||
        error.message?.includes("premature close");
        
      if (isAbortError) {
        console.log("Proxy: Client aborted the request gracefully.");
        return res.end();
      }
      
      console.error("Proxy error wrapper:", error);
      if (!res.headersSent) {
        res.status(200).json({ _proxy_error: true, status: 500, error: error.message || "Unknown error" });
      } else {
        res.write(JSON.stringify({ _proxy_error: true, status: 500, error: error.message || "Unknown error" }) + "\n");
        res.end();
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
