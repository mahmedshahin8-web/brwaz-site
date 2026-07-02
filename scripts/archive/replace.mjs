import fs from 'fs';
let content = fs.readFileSync('src/pages/ContentCreationPage.tsx', 'utf8');

// Replace Documentary Background HTML
content = content.replace(
  `{/* Background Pattern */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#121214] via-transparent to-transparent pointer-events-none" />
                      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#4f46e5]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />`,
  `{/* Real Image Background */}
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.03]"
                        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=2070&auto=format&fit=crop')" }}
                      />
                      <div className="absolute inset-0 bg-[#070709]/80 group-hover:bg-[#070709]/60 transition-colors duration-500 mix-blend-multiply" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-[#070709]/80 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-l from-[#070709] via-[#070709]/40 to-transparent" />
                      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#4f46e5]/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />`
);

// Replace Reel Background HTML
content = content.replace(
  `<div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />`,
  `{/* Real Image Background */}
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.03]"
                        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1616851609137-fc2cefc27351?q=80&w=1500&auto=format&fit=crop')" }}
                      />
                      <div className="absolute inset-0 bg-[#070709]/80 group-hover:bg-[#070709]/60 transition-colors duration-500 mix-blend-multiply" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-[#070709]/80 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-l from-[#070709] via-transparent to-transparent opacity-80" />
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-500/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />`
);

// Replace Text - Doc
content = content.replace('الفيلم الوثائقي الطويل', 'الفيلم الوثائقي (الشغل المتعوب عليه)');
content = content.replace('البرنامج الرئيسي (النظام المعتاد): أفلام استقصائية سينمائية عميقة ثرية بالحقائق التاريخية، الأدلة الموثقة، والتحاليل الأكاديمية الشاملة. مصممة لمنصة يوتيوب بتركيز عالي.', 'المحتوى التقيل اللي بياخد مجهود في البحث. أرشيف عميق ومصادر موثقة علشان تطلع حلقة الدحيح اللي المشاهدين بيحبوها.');

// Replace Text - Reels
content = content.replace('الريلز والشورتس', 'الريلز والشورتس (الخلاصة)');
content = content.replace('محتوى رأسي فائق السرعة وجاذب للانتباه. إيقاع متسارع، معالجة فورية للمشهد، وخطاف بصري ਫوري 3 ثوانٍ لمنع التمرير مع لوب نهائي ذكي وتأثيرات بصرية عالية الكثافة.', 'الخلاصة اللي بتخطف العين في أول 3 ثواني. إيقاع طيارة، خطاف بصري قوي ومعلومة خفيفة تمنع التمرير وتكسر التريند وتأثيرات بصرية سريعة.');

// Rewrite classes
content = content.replace('className="md:col-span-8 group relative text-right bg-[#121214] hover:bg-[#161619] border border-[#27272a] hover:border-[#4f46e5]/50 rounded-3xl transition-all duration-500 overflow-hidden focus:outline-none flex flex-col justify-between p-0 cursor-pointer min-h-[400px]"', 'className="md:col-span-8 group relative text-right border border-white/5 hover:border-[#4f46e5]/50 rounded-3xl transition-all duration-500 overflow-hidden focus:outline-none flex flex-col justify-between p-0 cursor-pointer min-h-[450px]"');

content = content.replace('className="md:col-span-4 group relative text-right p-8 bg-[#121214] hover:bg-[#161619] border border-[#27272a] hover:border-amber-500/50 rounded-3xl transition-all duration-500 overflow-hidden focus:outline-none flex flex-col justify-between min-h-[400px] cursor-pointer"', 'className="md:col-span-4 group relative text-right p-8 border border-white/5 hover:border-amber-500/50 rounded-3xl transition-all duration-500 overflow-hidden focus:outline-none flex flex-col justify-between min-h-[450px] cursor-pointer"');

fs.writeFileSync('src/pages/ContentCreationPage.tsx', content);
