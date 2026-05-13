async function run() {
  try {
     const res = await fetch("https://text.pollinations.ai/openai/chat/completions", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
             model: "openai",
             messages: [{ role: "user", content: "Tell me a joke in json format" }],
             stream: true
         })
     });
     console.log("Status:", res.status);
     const text = await res.text();
     console.log("Text length:", text.length, "content:", text.substring(0, 100));
  } catch(e) {
     console.log("Error:", e.message);
  }
}
run();
