const fetch = global.fetch;

async function run() {
    const pollResponse = await fetch("https://text.pollinations.ai/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            messages: [{role: "user", content: "hello"}],
            jsonMode: false
        })
    });
    console.log("Got response:", pollResponse.ok);
    const text = await pollResponse.text();
    console.log("Text:", text.substring(0, 100));
}

run().catch(console.error);
