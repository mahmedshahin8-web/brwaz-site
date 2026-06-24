const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');
content = content.replace(
  `} catch (e: any) {
        console.error("[GEMINI_STREAM_ERROR]", e);
        if (!res.headersSent) res.status(500).json({ error: parseApiError(e) });
    }`,
  `} catch (e: any) {
        console.error("[GEMINI_STREAM_ERROR]", e);
        if (!res.headersSent) {
             res.status(500).json({ error: parseApiError(e) });
        } else {
             res.write(\`data: \${JSON.stringify({ error: parseApiError(e) })}\\n\\n\`);
             res.end();
        }
    }`
);

fs.writeFileSync('server.ts', content);
