import fs from 'fs';
let content = fs.readFileSync('src/pages/ContentCreationPage.tsx', 'utf8');

content = content.replace(
  `                               <div className="flex justify-between items-start w-full relative z-10 mb-2">
                                  <div className="flex flex-col items-start max-w-[70%]">
                                      <h3 className={\`text-lg font-arabic font-black block transition-colors \${persona === p.id ? "text-[#fafafa] drop-shadow-sm" : "text-[#e4e4e7]"}\`}>{p.label}</h3>
                                      {p.quote && (
                                        <p className="text-[10px] text-[#71717a] font-arabic mt-1 italic opacity-80 group-hover:text-[#a1a1aa] transition-colors line-clamp-1">
                                            "{p.quote}"
                                        </p>
                                      )}
                                  </div>`,
  `                               <div className="flex justify-between items-start w-full relative z-10 mb-2 gap-3">
                                  {p.avatar && (
                                     <img src={p.avatar} alt={p.label} className={\`w-12 h-12 rounded-full object-cover shrink-0 border-2 transition-colors \${persona === p.id ? "border-[#4f46e5] shadow-[0_0_15px_rgba(79,70,229,0.3)]" : "border-[#27272a] grayscale group-hover:grayscale-0"}\`} />
                                  )}
                                  <div className="flex flex-col items-start flex-1">
                                      <h3 className={\`text-lg font-arabic font-black block transition-colors \${persona === p.id ? "text-[#fafafa] drop-shadow-sm" : "text-[#e4e4e7]"}\`}>{p.label}</h3>
                                      {p.quote && (
                                        <p className="text-[10px] text-[#71717a] font-arabic mt-1 italic opacity-80 group-hover:text-[#a1a1aa] transition-colors line-clamp-1">
                                            "{p.quote}"
                                        </p>
                                      )}
                                  </div>`
);

fs.writeFileSync('src/pages/ContentCreationPage.tsx', content);
