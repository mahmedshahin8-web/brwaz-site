async function run() {
  const start = Date.now();
  console.log("Starting fetch at", start);
  try {
     const res = await fetch("https://text.pollinations.ai/openai/chat/completions", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
             model: "openai",
             messages: [{ role: "user", content: "Tell me a joke" }],
             stream: true
         }),
         signal: AbortSignal.timeout(120000)
     });
     console.log("Status:", res.status, "in", Date.now() - start, "ms");
     const reader = res.body.getReader();
     while(true) {
         const {done, value} = await reader.read();
         if(done) break;
         console.log("Chunk:", new TextDecoder().decode(value));
     }
  } catch(e) {
     console.log("Error:", e.message);
  }
}
run();
