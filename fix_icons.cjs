const fs = require('fs');
let content = fs.readFileSync('src/pages/ContentCreationPage.tsx', 'utf8');

// Add new imports to lucide-react
if (!content.includes('Search,') && content.includes('AudioLines,')) {
    content = content.replace('AudioLines,', 'AudioLines, Search, Moon, TrendingUp, Book, Crown, ');
}

// Replace the avatar block
const oldAvatarBlock = `{p.avatar && (
                                     <img src={p.avatar} alt={p.label} className={\`w-12 h-12 rounded-full object-cover shrink-0 border-2 transition-colors \${persona === p.id ? "border-[#4f46e5] shadow-[0_0_15px_rgba(79,70,229,0.3)]" : "border-[#27272a] grayscale group-hover:grayscale-0"}\`} />
                                  )}`;

const newIconBlock = `{
                                     (() => {
                                         let Icon = AudioLines;
                                         if (p.id.includes("المحقق")) Icon = Search;
                                         else if (p.id.includes("ليل")) Icon = Moon;
                                         else if (p.id.includes("اقتصاد")) Icon = TrendingUp;
                                         else if (p.id.includes("مشاهد")) Icon = Book;
                                         else if (p.id.includes("هرم")) Icon = Crown;

                                         return (
                                            <div className={\`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all duration-300 \${persona === p.id ? "border-[#4f46e5]/40 bg-[#4f46e5]/10 text-[#a5b4fc] shadow-[0_0_15px_rgba(79,70,229,0.2)]" : "border-[#27272a] bg-[#18181b] text-[#71717a] group-hover:text-[#a1a1aa] group-hover:bg-[#27272a]/50"}\`}>
                                                <Icon size={24} />
                                            </div>
                                         )
                                     })()
                                  }`;

content = content.replace(oldAvatarBlock, newIconBlock);

fs.writeFileSync('src/pages/ContentCreationPage.tsx', content);
