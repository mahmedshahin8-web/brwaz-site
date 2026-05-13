const tryPollinations = async () => {
    console.log("[Backend] Using Pollinations AI (Free)...");
    
    const reqMessages = [
        { role: "user", content: "hello" }
    ];

    const pollResponse = await fetch("https://text.pollinations.ai/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            messages: reqMessages,
            stream: true,
            jsonMode: false,
            model: "openai"
        })
    });

    if (!pollResponse.ok) {
        const errText = await pollResponse.text();
        throw new Error(`Pollinations API Error: ${pollResponse.status} - ${errText}`);
    }

    const reader = pollResponse.body?.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
        if (!reader) break;
        const { done, value } = await reader.read();
        console.log("Chunk:", value ? decoder.decode(value) : "DONE");
        if (done) break;
    }
};
tryPollinations().catch(console.error);
