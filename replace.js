const fs = require('fs');
let c = fs.readFileSync('src/lib/gemini.ts', 'utf8');

c = c.replace(/if \(config\.provider === 'ollama'\) {\s*const response = await fetch\(`\$\{config\.ollamaUrl\}\/v1\/chat\/completions`, \{\s*method: 'POST', headers: \{ 'Content-Type': 'application\/json' \},\s*body: JSON\.stringify\(\{ model: config\.ollamaModel, messages: \[\{ role: "user", content: prompt \}\] \}\)\s*\}\);\s*const data = await response\.json\(\);/g, `if (config.provider === 'ollama' || config.provider === 'groq') {
      const url = config.provider === 'groq' ? 'https://api.groq.com/openai/v1/chat/completions' : \`\${config.ollamaUrl}/v1/chat/completions\`;
      const hdrs = { 'Content-Type': 'application/json' };
      if (config.provider === 'groq') hdrs['Authorization'] = \`Bearer \${config.groqApiKey}\`;
      const mdl = config.provider === 'groq' ? 'llama-3.3-70b-versatile' : config.ollamaModel;
      const response = await fetch(url, {
        method: 'POST', headers: hdrs as any,
        body: JSON.stringify({ model: mdl, messages: [{ role: 'user', content: prompt }] })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message || 'API Error');`);

c = c.replace(/if \(config\.provider === 'ollama'\) {\s*const response = await fetch\(`\$\{config\.ollamaUrl\}\/v1\/chat\/completions`, \{\s*method: 'POST', headers: \{ 'Content-Type': 'application\/json' \},\s*body: JSON\.stringify\(\{ model: config\.ollamaModel, messages: \[\{ role: "user", content: prompt \}\], response_format: \{ type: "json_object" \} \}\)\s*\}\);\s*const data = await response\.json\(\);/g, `if (config.provider === 'ollama' || config.provider === 'groq') {
      const url = config.provider === 'groq' ? 'https://api.groq.com/openai/v1/chat/completions' : \`\${config.ollamaUrl}/v1/chat/completions\`;
      const hdrs = { 'Content-Type': 'application/json' };
      if (config.provider === 'groq') hdrs['Authorization'] = \`Bearer \${config.groqApiKey}\`;
      const mdl = config.provider === 'groq' ? 'llama-3.3-70b-versatile' : config.ollamaModel;
      const response = await fetch(url, {
        method: 'POST', headers: hdrs as any,
        body: JSON.stringify({ model: mdl, messages: [{ role: 'user', content: prompt }], response_format: { type: 'json_object' } })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message || 'API Error');`);

fs.writeFileSync('src/lib/gemini.ts', c);
