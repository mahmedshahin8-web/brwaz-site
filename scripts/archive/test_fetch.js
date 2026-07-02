import fetch from "node-fetch";

async function test() {
  const apiKey = "DUMMY"; // We will just see if we get 400 Bad Request due to API Key
  const body = {
    contents: [{parts: [{text: "hello"}]}],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            id: { type: "NUMBER" },
            title: { type: "STRING" },
            hook: { type: "STRING" },
            angle: { type: "STRING" }
          },
          required: ["id", "title", "hook", "angle"]
        }
      }
    }
  };

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-preview:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(body)
  });
  console.log("STATUS:", res.status);
  console.log("RESPONSE:", await res.text());
}
test();
