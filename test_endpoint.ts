fetch("http://localhost:3000/api/ai/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: "hello" }) })
  .then(res => res.json())
  .then(data => console.log("Success:", data))
  .catch(err => console.error("Error:", err.message));
