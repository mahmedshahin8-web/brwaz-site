const tryPollinations = async () => {
    const reqMessages = [
        { role: "system", content: "You MUST return a JSON array." },
        { role: "user", content: "Three colors" }
    ];

    const pollResponse = await fetch("https://text.pollinations.ai/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: reqMessages, stream: false, jsonMode: true, model: "openai" })
    });

    console.log(await pollResponse.text());
};
tryPollinations().catch(console.error);
