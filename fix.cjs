const fs = require('fs');
let content = fs.readFileSync('src/pages/ContentCreationPage.tsx', 'utf8');

// Fix line 271
content = content.replace(/const \[mood,\s+data\.scenes \|\| \[\],\s+setMood\]/, 'const [mood, setMood]');

// Fix all other messed up mood, \n data.scenes || []
content = content.replace(/mood,\s+data\.scenes \|\| \[\],/g, 'mood,');

// Then apply the proper generatePackaging fix
content = content.replace(/generatePackaging\(\s*data\.video_title,\s*script,\s*mood,\s*useOllama \? "ollama" : "gemini"\s*\);/g, `generatePackaging(
                                             data.video_title, 
                                             script, 
                                             mood,
                                             data.scenes || [],
                                             useOllama ? "ollama" : "gemini"
                                           );`);

fs.writeFileSync('src/pages/ContentCreationPage.tsx', content);
