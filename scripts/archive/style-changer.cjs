const fs = require('fs');
let code = fs.readFileSync('src/lib/agents.ts', 'utf8');

const targetStyleRule = `=== GLOBAL VISUAL CONDITION (MANDATORY THEME) ===
\${globalVisualCondition ? globalVisualCondition : "cinematic dark thriller, neon accents, high contrast lighting, mysterious hacker aesthetic, shadowy atmosphere, glowing digital artifacts, sharp focus, hyper-realistic details."}`;

const newStyleRule = `=== GLOBAL VISUAL CONDITION (MANDATORY THEME) ===
CRITICAL VISUAL DNA OVERRIDE: 
Regardless of any global theme, you MUST enforce the following aesthetic for ALL images:
"Authentic vintage editorial illustration, mid-century screen print style, muted earthy color palette, textured parchment paper grain, soft halftone print imperfections, dramatic chiaroscuro lighting, highly detailed historical atmosphere."
Do not use 3D render, photorealism, modern neon, or hacker vibes. Replace them with vintage archival aesthetics.`;

if (code.includes(targetStyleRule)) {
  code = code.replace(targetStyleRule, newStyleRule);
  
  const midjourneyTarget = `[Camera Angle & Shot Size] of <Exact Subject / The Masked Investigator> <Action> in <DARK, MOODY LOCATION> -- Surroundings: <Subtle contextual metaphors, scattered case files, glowing screens> -- Style: <cinematic dark thriller, neon accents, high contrast lighting, mysterious hacker aesthetic, shadowy atmosphere, glowing digital artifacts, sharp focus, anamorphic lens flare> --ar 16:9 --style raw --v 6.0 --no text, typography, letters, words, watermark, cartoon, bright daylight, flat colors, low quality`;
  
  const midjourneyNew = `[Camera Angle & Shot Size] of <Exact Subject / The Narrator> <Action> in <HISTORICAL/VINTAGE SETTING> -- Surroundings: <Subtle contextual metaphors, scattered archival documents> -- Style: Authentic vintage editorial illustration, mid-century screen print style, muted earthy color palette, textured parchment paper grain, soft halftone print imperfections, dramatic chiaroscuro lighting, highly detailed historical atmosphere --ar 16:9 --v 6.0 --no photorealism, 3d render, modern technology, neon, text, typography, letters, words, watermark, cartoon, bright daylight, flat colors`;
  
  code = code.replace(midjourneyTarget, midjourneyNew);
  
  fs.writeFileSync('src/lib/agents.ts', code);
  console.log("Vintage visual style injected successfully!");
} else {
  console.log("Could not find the target string.");
}
