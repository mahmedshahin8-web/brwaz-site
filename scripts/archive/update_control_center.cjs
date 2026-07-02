const fs = require("fs");
let content = fs.readFileSync("src/pages/ContentCreationPage.tsx", "utf-8");

const oldTarget = `                             <span className="text-[9px] font-mono text-white/20 uppercase">نواة_الذكاء</span>
                             <div className="flex items-center gap-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                <span className="text-micro font-mono text-white/60 tracking-tighter uppercase font-bold text-right">الوضع_الأصيل</span>
                             </div>`;

const newReplacement = `                             <span className="text-[9px] font-mono text-white/20 uppercase">نواة_الذكاء</span>
                             <div className="flex flex-col items-end gap-1">
                                 <div className="flex items-center gap-4">
                                     <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                     <span className="text-micro font-mono text-white/60 tracking-tighter uppercase font-bold text-right">الوضع_الأصيل</span>
                                 </div>
                                 <span className="text-[9px] text-white/40 font-mono">المحرك المسؤول عن السرد</span>
                             </div>`;

if (!content.includes(oldTarget)) {
    console.error("Target NOT found!");
    process.exit(1);
}

content = content.replace(oldTarget, newReplacement);
fs.writeFileSync("src/pages/ContentCreationPage.tsx", content);
console.log("Successfully replaced!");
