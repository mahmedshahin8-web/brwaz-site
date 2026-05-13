async function run() {
  const models = ["openai", "mistral", "llama"];
  for (const model of models) {
     const start = Date.now();
     try {
       const res = await fetch("https://text.pollinations.ai/openai/chat/completions", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
               model: model,
               messages: [{ role: "user", content: "Tell me a short joke" }],
           })
       });
       console.log(model, res.status, Date.now() - start, "ms");
     } catch(e) {
       console.log(model, "Error", e.message);
     }
  }
}
run();
