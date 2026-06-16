const fs = require('fs');
let code = fs.readFileSync('src/pages/ScriptEditor.tsx', 'utf-8');

// Remove imports
code = code.replace(/import \{ InterrogationRoom \}[^\n]*\n/, '');
code = code.replace(/import \{ RedStringBoard \}[^\n]*\n/, '');
code = code.replace(/import \{ TacticalRadar \}[^\n]*\n/, '');
code = code.replace(/import \{ BlackPortal \}[^\n]*\n/, '');
code = code.replace(/import \{ OllamaCreativeLab \}[^\n]*\n/, '');
code = code.replace(/import \{ PropRoomPanel \}[^\n]*\n/, '');
code = code.replace(/import \{ CognitiveFatigueTracker \}[^\n]*\n/, '');
code = code.replace(/import \{ CreativeCouncilLab \}[^\n]*\n/, '');

// Remove buttons
code = code.replace(/<button onClick=\{\(\) => setActiveInspectorTab\('interrogation'\)\}[\s\S]*?<\/button>/, '');
code = code.replace(/<button onClick=\{\(\) => setActiveInspectorTab\('redString'\)\}[\s\S]*?<\/button>/, '');
code = code.replace(/<button onClick=\{\(\) => setActiveInspectorTab\('radar'\)\}[\s\S]*?<\/button>/, '');
code = code.replace(/<button onClick=\{\(\) => setActiveInspectorTab\('portal'\)\}[\s\S]*?<\/button>/, '');
code = code.replace(/<button onClick=\{\(\) => setActiveInspectorTab\('propRoom'\)\}[\s\S]*?<\/button>/, '');
code = code.replace(/<button onClick=\{\(\) => setActiveInspectorTab\('fatigue'\)\}[\s\S]*?<\/button>/, '');

code = code.replace(/<button\s*onClick=\{\(\) => setIsCouncilOpen\(true\)\}[\s\S]*?<\/button>/, '');
code = code.replace(/<button\s*onClick=\{\(\) => setIsOllamaLabOpen\(true\)\}[\s\S]*?<\/button>/, '');

// Remove tabs content
code = code.replace(/\{activeInspectorTab === 'interrogation' \&\& <InterrogationRoom[^\n]*\n/, '');
code = code.replace(/\{activeInspectorTab === 'redString' \&\& <RedStringBoard \/>\}\n/, '');
code = code.replace(/\{activeInspectorTab === 'radar' \&\& <TacticalRadar \/>\}\n/, '');
code = code.replace(/\{activeInspectorTab === 'portal' \&\& <BlackPortal \/>\}\n/, '');
code = code.replace(/\{activeInspectorTab === 'propRoom' \&\& <PropRoomPanel[\s\S]*?\}\s*\/>\}\n/, '');
code = code.replace(/\{activeInspectorTab === 'fatigue' \&\& <CognitiveFatigueTracker[\s\S]*?\}\s*\/>\}\n/, '');

// Remove external components
code = code.replace(/<OllamaCreativeLab[\s\S]*?\/>/, '');
code = code.replace(/<CreativeCouncilLab[\s\S]*?\/>/, '');

fs.writeFileSync('src/pages/ScriptEditor.tsx', code);
